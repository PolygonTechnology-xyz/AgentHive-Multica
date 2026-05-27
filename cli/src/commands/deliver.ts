import prompts from 'prompts';
import * as api from '../lib/api';
import { readConfig, updateConfig } from '../lib/config';
import { ui } from '../lib/ui';

export interface DeliverOptions {
  dispatchId?: string;
  message?: string;
  file?: string[]; // each item: "name=url" or "url"
  apiUrl?: string;
}

export interface DeliverDeps {
  prompt?: typeof prompts;
  submitFn?: typeof api.submitDelivery;
  readCfg?: typeof readConfig;
  writeCfg?: typeof updateConfig;
  out?: typeof ui;
}

export interface Attachment {
  name: string;
  url: string;
}

export function parseAttachments(items: string[] = []): Attachment[] {
  const out: Attachment[] = [];
  for (const raw of items) {
    if (!raw || !raw.trim()) continue;
    const eq = raw.indexOf('=');
    if (eq > 0) {
      const name = raw.slice(0, eq).trim();
      const url = raw.slice(eq + 1).trim();
      if (name && url) out.push({ name, url });
    } else {
      const url = raw.trim();
      const name = deriveName(url);
      out.push({ name, url });
    }
  }
  return out;
}

function deriveName(url: string): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').filter(Boolean).pop();
    return last || u.hostname;
  } catch {
    const last = url.split('/').filter(Boolean).pop();
    return last || url;
  }
}

export function makeDeliver(deps: DeliverDeps = {}) {
  const prompt = deps.prompt ?? prompts;
  const submitFn = deps.submitFn ?? api.submitDelivery;
  const readCfg = deps.readCfg ?? readConfig;
  const writeCfg = deps.writeCfg ?? updateConfig;
  const out = deps.out ?? ui;

  return async function run(opts: DeliverOptions = {}): Promise<void> {
    const cfg = readCfg();
    if (!cfg.access_token) {
      out.error('Not logged in. Run `agenthive auth login` first.');
      throw new Error('Not authenticated');
    }

    let dispatchId = opts.dispatchId ?? cfg.active_dispatch_id;
    if (!dispatchId) {
      const a = await prompt({
        type: 'text',
        name: 'dispatchId',
        message: 'Active dispatch id',
        validate: (v: string) => (v && v.trim().length > 0 ? true : 'Dispatch id required'),
      });
      dispatchId = (a as { dispatchId?: string }).dispatchId;
    }

    if (!dispatchId) {
      out.error('Cancelled — no dispatch id provided.');
      throw new Error('Missing dispatch id');
    }

    let message = opts.message;
    if (message === undefined) {
      const a = await prompt({
        type: 'text',
        name: 'message',
        message: 'Delivery message (optional)',
      });
      message = (a as { message?: string }).message;
    }

    let attachments = parseAttachments(opts.file ?? []);
    if (attachments.length === 0) {
      const a = await prompt({
        type: 'text',
        name: 'files',
        message: 'Attachment URLs (comma-separated, blank to skip)',
      });
      const raw = ((a as { files?: string }).files ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      attachments = parseAttachments(raw);
    }

    const body: api.DeliverPayload = {};
    if (message) body.message = message;
    if (attachments.length > 0) body.attachments = attachments;

    const result = await submitFn(dispatchId, body, { apiUrl: opts.apiUrl });

    // Cache the dispatch id so re-running without args targets the same job.
    writeCfg({ active_dispatch_id: dispatchId });

    out.success(`Delivery submitted for dispatch ${out.bold(dispatchId)}.`);
    if (attachments.length > 0) {
      out.info(`Attachments: ${attachments.map((a) => a.name).join(', ')}`);
    }
    out.plain(out.dim(JSON.stringify(result, null, 2)));
  };
}

export const deliver = makeDeliver();
