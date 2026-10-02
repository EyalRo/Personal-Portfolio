# Visit analytics

First-party, cookieless tracking: `src/scripts/track.ts` → `POST /api/e`
(`functions/api/e.ts`) → VictoriaLogs (`service=isdino-web`, 30d retention).

Events: `pv` (page view), `read`, `leave` (final active time and scroll), `click`.
A "read" is at least 10s of active time and at least 25% scroll, once per page view.
A session is one `sid` (sessionStorage), so "humans" are distinct sessions, not people.

## Ingest path

Pages Function → `https://isdino-ingest.virtualdino.com/insert/jsonline`
→ Cloudflare Tunnel `pve2` → `http://192.168.0.39:9428`.

Needed once:

1. Tunnel `pve2` ingress, before the `http_status:404` catch-all:
   `hostname: isdino-ingest.virtualdino.com`, `path: ^/insert/jsonline$`,
   `service: http://192.168.0.39:9428`.
2. Proxied DNS CNAME `isdino-ingest` → `7be1c5eb-f738-407b-9168-994938e14af5.cfargotunnel.com`.
3. Access app on `isdino-ingest.virtualdino.com` with a single Service Auth policy
   for service token `isdino-web-ingest`.
4. Pages project `personal-portfolio`: variable `VL_URL=https://isdino-ingest.virtualdino.com`,
   secrets `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET`.

Only the write path is exposed; reads stay LAN-only (`logs.virtualdino.com`).

## Queries (LogsQL, run against `http://192.168.0.39:9428/select/logsql/...`)

Humans per day (distinct sessions with a page view):

    service:=isdino-web e:=pv | stats by (_time:1d) count_uniq(sid) as humans

Readers per day (sessions that read at least some of a page), and the share:

    service:=isdino-web e:=read | stats by (_time:1d) count_uniq(sid) as readers

Median active time and scroll for page views that ended (per path):

    service:=isdino-web e:=leave | stats by (path) median(active_s) as active_s, median(scroll) as scroll, count() as leaves

Where humans come from:

    service:=isdino-web e:=pv | stats by (ref) count_uniq(sid) as humans | sort by (humans desc)

What people care about (clicks):

    service:=isdino-web e:=click | stats by (kind, target) count() as clicks | sort by (clicks desc)

Attributed applications (`?application=<id>`):

    service:=isdino-web e:=pv app:!"" | stats by (app) count_uniq(sid) as humans
