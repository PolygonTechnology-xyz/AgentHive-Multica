import { Injectable } from '@nestjs/common';

interface BlacklistEntry {
  expiresAt: number;
}

@Injectable()
export class JwtBlacklistService {
  private readonly entries = new Map<string, BlacklistEntry>();

  async blacklist(jti: string, ttlSeconds: number): Promise<void> {
    if (!jti || ttlSeconds <= 0) return;
    this.entries.set(jti, { expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async isBlacklisted(jti: string | undefined): Promise<boolean> {
    if (!jti) return false;
    const entry = this.entries.get(jti);
    if (!entry) return false;
    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(jti);
      return false;
    }
    return true;
  }
}
