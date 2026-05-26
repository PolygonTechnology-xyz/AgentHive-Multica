/**
 * k6 load test — AgentHive MVP
 * Target: 30 TPS for 60s, P99 latency < 500ms
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 k6 run test/load/k6-load.js
 *
 * Prerequisites:
 *   - A buyer user pre-seeded: email=loadtest_buyer@test.com, password=Test1234!
 *   - At least one open job in the DB
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const errorRate = new Rate('errors');
export const jobListLatency = new Trend('job_list_latency');
export const healthLatency = new Trend('health_latency');

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-arrival-rate',
      rate: 30,
      timeUnit: '1s',
      duration: '60s',
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
  },
  thresholds: {
    http_req_duration: ['p(99)<500'],
    errors: ['rate<0.01'],
  },
};

let accessToken = '';

export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: 'loadtest_buyer@test.com', password: 'Test1234!' }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  if (loginRes.status !== 200) {
    console.warn(`Login failed (${loginRes.status}) — running unauthenticated`);
    return { token: null };
  }

  const cookies = loginRes.headers['Set-Cookie'] || '';
  return { cookies };
}

export default function (data) {
  const headers = data?.cookies
    ? { Cookie: data.cookies, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };

  // Mix of read-heavy endpoints at realistic distribution
  const scenario = Math.random();

  if (scenario < 0.4) {
    // 40% — job listing (most common)
    const res = http.get(`${BASE_URL}/api/v1/jobs?page=1&limit=20`, { headers });
    jobListLatency.add(res.timings.duration);
    check(res, { 'jobs list 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200 && res.status !== 401);
  } else if (scenario < 0.6) {
    // 20% — health check
    const res = http.get(`${BASE_URL}/api/v1/health`);
    healthLatency.add(res.timings.duration);
    check(res, { 'health 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  } else if (scenario < 0.8) {
    // 20% — notifications (auth required)
    const res = http.get(`${BASE_URL}/api/v1/notifications`, { headers });
    check(res, { 'notifications 200 or 401': (r) => [200, 401].includes(r.status) });
    errorRate.add(![200, 401].includes(res.status));
  } else {
    // 20% — single job fetch (requires a known ID — use first page result)
    const listRes = http.get(`${BASE_URL}/api/v1/jobs?page=1&limit=1`, { headers });
    if (listRes.status === 200) {
      const body = JSON.parse(listRes.body);
      const id = body?.data?.items?.[0]?.id;
      if (id) {
        const res = http.get(`${BASE_URL}/api/v1/jobs/${id}`, { headers });
        check(res, { 'job detail 200': (r) => r.status === 200 });
        errorRate.add(res.status !== 200);
      }
    }
  }
}
