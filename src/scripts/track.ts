// First-party, cookieless visit tracking. Events go to same-origin /api/e,
// which filters and forwards them to VictoriaLogs. No IPs or persistent IDs.

const ENDPOINT = '/api/e';
const IDLE_MS = 30_000; // no input for this long => not "actively reading"
const READ_ACTIVE_MS = 10_000;
const READ_SCROLL_PCT = 25;

const isBot =
  navigator.webdriver ||
  /bot|crawl|spider|headless|lighthouse|preview|curl|wget/i.test(navigator.userAgent);
const isLocal = /^(localhost|127\.|\[::1\])/.test(location.hostname);

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

function sessionId(): string {
  return safe(() => {
    let id = sessionStorage.getItem('sid');
    if (!id) {
      id = Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(16).padStart(2, '0')).join('');
      sessionStorage.setItem('sid', id);
    }
    return id;
  }, 'nostore');
}

// Whether this browser has been seen before; a boolean, not an identifier.
function returning(): boolean {
  return safe(() => {
    const seen = localStorage.getItem('seen') === '1';
    localStorage.setItem('seen', '1');
    return seen;
  }, false);
}

function send(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  const ok = safe(() => navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'text/plain' })), false);
  if (!ok) {
    safe(() => fetch(ENDPOINT, { method: 'POST', body, keepalive: true, headers: { 'content-type': 'text/plain' } }), null);
  }
}

function init() {
  const sid = sessionId();
  const path = location.pathname;
  const ret = returning();

  let activeMs = 0;
  let maxScroll = 0;
  let lastInput = Date.now();
  let readSent = false;
  let leaveSent = false;

  const scrollPct = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 8) return 100; // page fits on screen
    return Math.min(100, Math.round(((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100));
  };
  const bump = () => {
    lastInput = Date.now();
    maxScroll = Math.max(maxScroll, scrollPct());
  };
  const base = () => ({ sid, path });
  const metrics = () => ({ active_s: Math.round(activeMs / 1000), scroll: maxScroll });

  const refHost = safe(() => (document.referrer ? new URL(document.referrer).hostname : ''), '');
  send({
    ...base(),
    e: 'pv',
    ref: refHost === location.hostname ? '' : refHost,
    app: new URLSearchParams(location.search).get('application') || undefined,
    ret,
    vw: window.innerWidth,
  });
  bump();

  for (const ev of ['scroll', 'mousemove', 'keydown', 'touchstart', 'click'] as const) {
    window.addEventListener(ev, bump, { passive: true });
  }

  // 1s tick: accumulate active time only while visible and recently used.
  setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    if (Date.now() - lastInput < IDLE_MS) activeMs += 1000;
    if (!readSent && activeMs >= READ_ACTIVE_MS && maxScroll >= READ_SCROLL_PCT) {
      readSent = true;
      send({ ...base(), e: 'read', ...metrics() });
    }
  }, 1000);

  const leave = () => {
    if (leaveSent) return;
    leaveSent = true;
    send({ ...base(), e: 'leave', ...metrics() });
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') leave();
    else leaveSent = false; // tab came back; report again on next hide
  });
  window.addEventListener('pagehide', leave);

  document.addEventListener(
    'click',
    (event) => {
      const a = (event.target as Element | null)?.closest?.('a');
      if (!a || !a.href) return;
      const url = new URL(a.href, location.href);
      let kind = '';
      if (url.protocol === 'mailto:') kind = 'contact';
      else if (/resume|cv|\.pdf$/i.test(url.pathname)) kind = 'resume';
      else if (url.hostname !== location.hostname) kind = 'external';
      else if (url.pathname.startsWith('/work/') && url.pathname !== '/work/') kind = 'work';
      else if (url.pathname.startsWith('/contact')) kind = 'contact';
      if (!kind) return;
      send({ ...base(), e: 'click', kind, target: url.protocol === 'mailto:' ? 'mailto' : url.hostname + url.pathname });
    },
    { capture: true },
  );
}

if (!isBot && !isLocal) init();
