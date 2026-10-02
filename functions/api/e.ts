// Same-origin ingest for the first-party tracker (src/scripts/track.ts).
// Validates and filters events, then forwards them to VictoriaLogs.
//
// Pages env:
//   VL_URL                      e.g. https://logs.virtualdino.com (no trailing slash)
//   CF_ACCESS_CLIENT_ID/SECRET  optional, if VictoriaLogs sits behind Cloudflare Access

interface Env {
  VL_URL?: string;
  CF_ACCESS_CLIENT_ID?: string;
  CF_ACCESS_CLIENT_SECRET?: string;
}

interface Ctx {
  request: Request & { cf?: { country?: string } };
  env: Env;
  waitUntil(p: Promise<unknown>): void;
}

const ALLOWED_HOSTS = new Set(['isdino.com', 'www.isdino.com']);
const EVENTS = new Set(['pv', 'read', 'leave', 'click']);
const CLICK_KINDS = new Set(['contact', 'resume', 'external', 'work']);
const BOT_UA = /bot|crawl|spider|headless|lighthouse|preview|curl|wget|python|go-http|java\/|scrapy|axios|node-fetch/i;

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');
const num = (v: unknown, max: number) => (typeof v === 'number' && isFinite(v) ? Math.max(0, Math.min(max, Math.round(v))) : 0);

function browser(ua: string): string {
  if (/edg\//i.test(ua)) return 'edge';
  if (/firefox|fxios/i.test(ua)) return 'firefox';
  if (/chrome|crios/i.test(ua)) return 'chrome';
  if (/safari/i.test(ua)) return 'safari';
  return 'other';
}

export const onRequestPost = async ({ request, env, waitUntil }: Ctx): Promise<Response> => {
  const noContent = new Response(null, { status: 204 });
  const ua = request.headers.get('user-agent') || '';

  const origin = request.headers.get('origin');
  if (origin && !ALLOWED_HOSTS.has(new URL(origin).hostname)) return noContent;
  if (!ua || BOT_UA.test(ua)) return noContent;
  if (Number(request.headers.get('content-length') || 0) > 1024) return noContent;

  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(await request.text());
  } catch {
    return noContent;
  }

  const e = str(raw.e, 8);
  const sid = str(raw.sid, 16);
  const path = str(raw.path, 200);
  if (!EVENTS.has(e) || !/^[0-9a-z]{4,16}$/.test(sid) || !path.startsWith('/')) return noContent;

  const record: Record<string, unknown> = {
    service: 'isdino-web',
    e,
    _msg: e,
    sid,
    path,
    country: request.cf?.country || '',
    device: /mobi|android|iphone|ipad/i.test(ua) ? 'mobile' : 'desktop',
    browser: browser(ua),
  };
  if (e === 'pv') {
    record.ref = str(raw.ref, 100);
    record.app = str(raw.app, 32);
    record.ret = raw.ret === true;
    record.vw = num(raw.vw, 10000);
  } else if (e === 'read' || e === 'leave') {
    record.active_s = num(raw.active_s, 7200);
    record.scroll = num(raw.scroll, 100);
  } else if (e === 'click') {
    const kind = str(raw.kind, 16);
    if (!CLICK_KINDS.has(kind)) return noContent;
    record.kind = kind;
    record.target = str(raw.target, 100);
  }

  if (env.VL_URL) {
    const headers: Record<string, string> = { 'content-type': 'application/stream+json' };
    if (env.CF_ACCESS_CLIENT_ID && env.CF_ACCESS_CLIENT_SECRET) {
      headers['CF-Access-Client-Id'] = env.CF_ACCESS_CLIENT_ID;
      headers['CF-Access-Client-Secret'] = env.CF_ACCESS_CLIENT_SECRET;
    }
    waitUntil(
      fetch(`${env.VL_URL}/insert/jsonline?_stream_fields=service,e&_msg_field=_msg`, {
        method: 'POST',
        headers,
        body: JSON.stringify(record) + '\n',
      })
        .then((r) => {
          if (!r.ok) console.error('victorialogs ingest failed', r.status);
        })
        .catch((err) => console.error('victorialogs ingest error', String(err))),
    );
  }
  return noContent;
};
