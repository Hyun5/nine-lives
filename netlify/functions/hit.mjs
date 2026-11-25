// Visitor counter: POST /api/hit {u:1 on a browser's first load of the NY day}.
// Counts page views on every call and unique visits (browser-days) when u=1.
import { getStore } from "@netlify/blobs";

function nyDay(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

async function bump(store, key) {
  const cur = Number((await store.get(key)) || 0) || 0;
  await store.set(key, String(cur + 1));
}

export default async (req) => {
  if (req.method !== "POST") return new Response("", { status: 405 });
  let body = {};
  try { body = await req.json(); } catch (e) {}
  const store = getStore({ name: "visits", consistency: "strong" });
  const day = nyDay();
  const jobs = [bump(store, "views:total"), bump(store, "views:" + day)];
  if (body && body.u) jobs.push(bump(store, "visits:total"), bump(store, "visits:" + day));
  await Promise.all(jobs);
  return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
};

export const config = { path: "/api/hit" };
