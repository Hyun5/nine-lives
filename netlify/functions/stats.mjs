// Owner-only stats: GET /stats?key=<STATS_KEY env var>. Not linked from the site.
import { getStore } from "@netlify/blobs";

function nyDay(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export default async (req) => {
  const want = Netlify.env.get("STATS_KEY") || "";
  const key = new URL(req.url).searchParams.get("key") || "";
  if (!want || key !== want) return new Response("Not Found", { status: 404, headers: { "content-type": "text/plain" } });
  const store = getStore({ name: "visits", consistency: "strong" });
  const n = async (k) => Number((await store.get(k)) || 0) || 0;
  const today = nyDay();
  const rows = [];
  for (let i = 0; i < 14; i++) {
    const d = nyDay(new Date(Date.now() - i * 86400000));
    rows.push([d, await n("visits:" + d), await n("views:" + d)]);
  }
  const [vt, vwt, vd, vwd] = await Promise.all([n("visits:total"), n("views:total"), n("visits:" + today), n("views:" + today)]);
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Nine Lives stats</title>
<style>body{font-family:system-ui,sans-serif;background:#0b0d16;color:#e9ecff;margin:0;padding:24px}h1{font-size:1.1rem;color:#9fd0ff}.big{display:flex;gap:16px;flex-wrap:wrap}.c{background:#161a2b;border:1px solid #2a3150;border-radius:12px;padding:16px 20px;min-width:150px}.c b{display:block;font-size:2.2rem;color:#7fffd4}.c span{font-size:.8rem;color:#9aa3c7}table{margin-top:20px;border-collapse:collapse}td,th{padding:4px 12px;border-bottom:1px solid #222842;text-align:right}th:first-child,td:first-child{text-align:left}small{color:#8088aa}</style></head><body>
<h1>Nine Lives 방문자</h1><div class="big">
<div class="c"><span>오늘 방문 (뉴욕 기준 ${today})</span><b>${vd}</b><span>페이지뷰 ${vwd}</span></div>
<div class="c"><span>전체 방문</span><b>${vt}</b><span>페이지뷰 ${vwt}</span></div></div>
<table><tr><th>날짜 (ET)</th><th>방문</th><th>페이지뷰</th></tr>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</table>
<p><small>방문 = 브라우저당 하루 1회(뉴욕 시간 자정 기준), 페이지뷰 = 모든 로드. 카운트는 2026-11-26 배포부터 시작.</small></p></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
};

export const config = { path: "/stats" };
