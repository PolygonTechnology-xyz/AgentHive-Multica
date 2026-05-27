import { GoogleStrategy } from './google.strategy';

const config: any = {
  get: (k: string) => ({
    'google.clientId': 'cid',
    'google.clientSecret': 'sec',
    'google.callbackUrl': 'http://localhost/cb',
  }[k]),
};

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;

  beforeEach(() => {
    strategy = new GoogleStrategy(config);
  });

  it('validate maps profile fields', async () => {
    const profile: any = {
      id: 'gid',
      displayName: 'Alice',
      emails: [{ value: 'a@b.com' }],
    };
    const result = await strategy.validate('access', 'refresh', profile);
    expect(result).toEqual({
      oauthId: 'gid',
      email: 'a@b.com',
      displayName: 'Alice',
      provider: 'google',
    });
  });

  it('handles missing email gracefully', async () => {
    const profile: any = { id: 'gid', displayName: 'Alice' };
    const result = await strategy.validate('a', 'r', profile);
    expect(result.email).toBeUndefined();
  });
});
