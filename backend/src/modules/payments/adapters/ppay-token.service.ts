import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Ppay token lifecycle per integration spec §2:
 * - idToken / refreshToken lifetime 3600s
 * - Refresh at 50-55min mark; re-grant on cache miss/expiry
 * - Tokens never persisted to DB; never logged
 *
 * In-memory cache is fine for a single instance. Swap for Redis if
 * horizontally scaled — interface stays the same.
 */
@Injectable()
export class PpayTokenService {
  private readonly logger = new Logger(PpayTokenService.name);
  private idToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshAfter = 0;
  private inflight: Promise<string> | null = null;

  constructor(private readonly config: ConfigService) {}

  /** Returns a valid idToken, refreshing or re-granting as needed. */
  async getIdToken(): Promise<string> {
    if (this.idToken && Date.now() < this.refreshAfter) {
      return this.idToken;
    }
    if (this.inflight) return this.inflight;
    this.inflight = this.acquire().finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  /** Invalidate cache — next call re-grants. Used on 401 response. */
  invalidate(): void {
    this.idToken = null;
    this.refreshToken = null;
    this.refreshAfter = 0;
  }

  private async acquire(): Promise<string> {
    if (this.refreshToken) {
      try {
        return await this.refresh();
      } catch (err) {
        this.logger.warn(`Ppay refresh failed, falling back to grant: ${(err as Error).message}`);
      }
    }
    return this.grant();
  }

  private async grant(): Promise<string> {
    const baseUrl = this.config.get<string>('ppay.baseUrl');
    const mid = this.config.get<string>('ppay.mid');
    const apiKey = this.config.get<string>('ppay.apiKey');
    const apiSecret = this.config.get<string>('ppay.apiSecret');

    const res = await this.post(`${baseUrl}/auth/grant`, { mid, apiKey, apiSecret });
    this.store(res);
    return this.idToken!;
  }

  private async refresh(): Promise<string> {
    const baseUrl = this.config.get<string>('ppay.baseUrl');
    const res = await this.post(`${baseUrl}/auth/refresh`, { token: this.refreshToken });
    this.store(res);
    return this.idToken!;
  }

  private store(res: { idToken: string; refreshToken: string }): void {
    this.idToken = res.idToken;
    this.refreshToken = res.refreshToken;
    // Refresh at 52 min (per spec recommendation)
    this.refreshAfter = Date.now() + 52 * 60 * 1000;
  }

  private async post(url: string, body: Record<string, unknown>): Promise<{ idToken: string; refreshToken: string }> {
    const timeoutMs = this.config.get<number>('ppay.timeoutMs') ?? 30000;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new ServiceUnavailableException(`Ppay auth failed: ${res.status}`);
      }
      return (await res.json()) as { idToken: string; refreshToken: string };
    } finally {
      clearTimeout(t);
    }
  }
}
