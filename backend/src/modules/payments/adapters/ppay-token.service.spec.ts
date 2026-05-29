import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { PpayTokenService } from './ppay-token.service';

const cfg: Record<string, any> = {
  'ppay.baseUrl': 'https://ppay.test/api',
  'ppay.mid': 'M1',
  'ppay.apiKey': 'K',
  'ppay.apiSecret': 'S',
  'ppay.timeoutMs': 30000,
};

describe('PpayTokenService', () => {
  let service: PpayTokenService;
  let fetchMock: jest.Mock;

  beforeEach(async () => {
    fetchMock = jest.fn();
    (global as any).fetch = fetchMock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PpayTokenService,
        { provide: ConfigService, useValue: { get: (k: string) => cfg[k] } },
      ],
    }).compile();
    service = module.get(PpayTokenService);
  });

  afterEach(() => jest.clearAllMocks());

  it('grants a fresh token and caches it', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ idToken: 'ID1', refreshToken: 'R1' }),
    });
    const t1 = await service.getIdToken();
    const t2 = await service.getIdToken();
    expect(t1).toBe('ID1');
    expect(t2).toBe('ID1');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://ppay.test/api/auth/grant');
  });

  it('throws ServiceUnavailableException on grant failure', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) });
    await expect(service.getIdToken()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('invalidate forces re-grant on next call', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ idToken: 'ID1', refreshToken: 'R1' }),
    });
    await service.getIdToken();

    service.invalidate();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ idToken: 'ID2', refreshToken: 'R2' }),
    });
    const t2 = await service.getIdToken();
    expect(t2).toBe('ID2');
  });

  it('uses /auth/refresh when refreshToken present and clock expired', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ idToken: 'ID1', refreshToken: 'R1' }),
    });
    await service.getIdToken();

    (service as any).refreshAfter = 0;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ idToken: 'ID2', refreshToken: 'R2' }),
    });
    const t = await service.getIdToken();
    expect(t).toBe('ID2');
    expect(fetchMock.mock.calls[1][0]).toBe('https://ppay.test/api/auth/refresh');
  });

  it('falls back to grant when refresh fails', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ idToken: 'ID1', refreshToken: 'R1' }),
    });
    await service.getIdToken();

    (service as any).refreshAfter = 0;
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ idToken: 'ID3', refreshToken: 'R3' }),
    });
    const t = await service.getIdToken();
    expect(t).toBe('ID3');
  });

  it('coalesces concurrent acquisitions into one grant', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ idToken: 'ID1', refreshToken: 'R1' }),
    });
    const [a, b, c] = await Promise.all([
      service.getIdToken(),
      service.getIdToken(),
      service.getIdToken(),
    ]);
    expect([a, b, c]).toEqual(['ID1', 'ID1', 'ID1']);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
