import prompts from 'prompts';
import * as api from '../lib/api';
import { updateConfig } from '../lib/config';
import { ui } from '../lib/ui';

export interface AuthLoginOptions {
  email?: string;
  password?: string;
  apiUrl?: string;
}

export interface AuthLoginDeps {
  prompt?: typeof prompts;
  loginFn?: typeof api.login;
  writeConfig?: typeof updateConfig;
  out?: typeof ui;
}

export function makeAuthLogin(deps: AuthLoginDeps = {}) {
  const prompt = deps.prompt ?? prompts;
  const loginFn = deps.loginFn ?? api.login;
  const writeConfig = deps.writeConfig ?? updateConfig;
  const out = deps.out ?? ui;

  return async function run(opts: AuthLoginOptions = {}): Promise<void> {
    const answers = await prompt(
      [
        opts.email
          ? null
          : {
              type: 'text',
              name: 'email',
              message: 'Email',
              validate: (v: string) => (v && v.includes('@') ? true : 'Enter a valid email'),
            },
        opts.password
          ? null
          : {
              type: 'password',
              name: 'password',
              message: 'Password',
              validate: (v: string) => (v && v.length >= 1 ? true : 'Password required'),
            },
      ].filter(Boolean) as prompts.PromptObject[],
    );

    const email = opts.email ?? (answers as { email?: string }).email;
    const password = opts.password ?? (answers as { password?: string }).password;

    if (!email || !password) {
      out.error('Login cancelled.');
      throw new Error('Missing credentials');
    }

    const result = await loginFn(email, password, { apiUrl: opts.apiUrl });

    writeConfig({
      api_url: api.resolveApiUrl(opts.apiUrl),
      access_token: result.accessToken,
      user_email: result.user.email,
      user_id: result.user.id,
    });

    out.success(`Logged in as ${out.bold(result.user.email)}`);
  };
}

export const authLogin = makeAuthLogin();
