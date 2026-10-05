// Sanity checks for data/events.js: loads it the way the browser does and validates every row.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const src = fs.readFileSync(path.join(__dirname, "..", "data", "events.js"), "utf8");
const ctx = { window: {} };
vm.runInNewContext(src, ctx);
const events = ctx.window.CRISIS_EVENTS;

const fail = (msg) => { console.error("FAIL:", msg); process.exit(1); };
if (!Array.isArray(events) || events.length === 0) fail("no events loaded");

let prev = -Infinity;
for (const e of events) {
  if (!Number.isInteger(e.year) || e.year <= prev) fail(`year out of order or duplicated: ${e.year}`);
  prev = e.year;
  if (!["event", "quiet"].includes(e.status)) fail(`${e.year}: bad status ${e.status}`);
  if (!Number.isInteger(e.severity) || e.severity < 0 || e.severity > 5) fail(`${e.year}: bad severity ${e.severity}`);
  if (!e.title || !e.era || !e.summary) fail(`${e.year}: missing title, era or summary`);
  if (e.status === "event" && e.severity === 0) fail(`${e.year}: event with severity 0`);
}
const span = events[events.length - 1].year - events[0].year + 1;
if (span !== events.length) fail(`expected one row per year, got ${events.length} rows over ${span} years`);

console.log(`OK: ${events.length} years, ${events.filter((e) => e.status === "event").length} event years`);

// data/links.js: curated research links keyed by year.
const linksSrc = fs.readFileSync(path.join(__dirname, "..", "data", "links.js"), "utf8");
vm.runInNewContext(linksSrc, ctx);
const links = ctx.window.CRISIS_LINKS;
if (!links || typeof links !== "object") fail("no links loaded");
const years = new Set(events.map((e) => String(e.year)));
const kinds = new Set(["youtube", "x", "article", "substack", "paper"]);
let nLinks = 0;
for (const [year, set] of Object.entries(links)) {
  if (!years.has(year)) fail(`links for unknown year ${year}`);
  for (const [kind, link] of Object.entries(set)) {
    if (!kinds.has(kind)) fail(`${year}: unknown link type ${kind}`);
    let url;
    try { url = new URL(link.url); } catch { fail(`${year} ${kind}: bad url ${link.url}`); }
    if (url.protocol !== "https:") fail(`${year} ${kind}: not https`);
    nLinks++;
  }
}
console.log(`OK: ${nLinks} curated links across ${Object.keys(links).length} years`);
