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

// data/crashes.js: key index levels for the Crashes tab.
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "data", "crashes.js"), "utf8"), ctx);
const crashes = ctx.window.CRISIS_CRASHES;
if (!Array.isArray(crashes) || !crashes.length) fail("no crashes loaded");
for (const c of crashes) {
  if (!c.name || !c.series || !c.report) fail(`${c.id}: missing name, series or report`);
  if (!Array.isArray(c.headlines) || c.headlines.length !== 3) fail(`${c.id}: needs exactly 3 headlines`);
  if (!Array.isArray(c.points) || c.points.length < 3) fail(`${c.id}: needs at least 3 points`);
  let prevDate = "";
  for (const p of c.points) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date) || p.date <= prevDate) fail(`${c.id}: dates must be ISO and ascending (${p.date})`);
    if (!(p.value > 0)) fail(`${c.id}: bad value at ${p.date}`);
    prevDate = p.date;
  }
  if (c.crash < c.points[0].date || c.crash > prevDate) fail(`${c.id}: crash date outside the charted range`);
}
console.log(`OK: ${crashes.length} crashes`);

// data/sp500.js: monthly S&P composite used by the Market Impact tab.
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "data", "sp500.js"), "utf8"), ctx);
const sp = ctx.window.SP500_MONTHLY;
if (!sp || !/^\d{4}-\d{2}$/.test(sp.start) || !Array.isArray(sp.values) || sp.values.length < 1000) fail("bad sp500 data");
if (sp.values.some((v) => !(v > 0))) fail("sp500 has non-positive values");
console.log(`OK: ${sp.values.length} months of S&P data from ${sp.start}`);
