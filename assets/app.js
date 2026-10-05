(function () {
  "use strict";

  var EVENTS = window.CRISIS_EVENTS || [];
  var PAGE = 150;

  var ERAS = [];
  EVENTS.forEach(function (e) {
    if (ERAS.indexOf(e.era) === -1) ERAS.push(e.era);
  });

  var state = { era: "", q: "", minSev: 0, category: "", showQuiet: false, limit: PAGE };

  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function shortEra(era) {
    return era.replace(/\s*\(.*\)$/, "");
  }

  function eraSpan(era) {
    var years = EVENTS.filter(function (e) { return e.era === era; }).map(function (e) { return e.year; });
    return Math.min.apply(null, years) + "–" + Math.max.apply(null, years);
  }

  function categoriesOf(e) {
    if (!e.category) return [];
    return e.category.split(/\s*\/\s*/).filter(Boolean);
  }

  // ---- Ticker: one cell per era plus the most recent years ----
  function buildTicker() {
    var cells = [];
    var prevShare = null;
    ERAS.forEach(function (era) {
      var rows = EVENTS.filter(function (e) { return e.era === era; });
      var hits = rows.filter(function (e) { return e.status === "event"; }).length;
      var share = (hits / rows.length) * 100;
      var delta = prevShare === null ? null : share - prevShare;
      prevShare = share;
      var deltaHtml = delta === null
        ? '<span class="up">' + share.toFixed(1) + "%</span>"
        : '<span class="' + (delta > 0 ? "down" : "up") + '">' + (delta > 0 ? "+" : "") + delta.toFixed(2) + "%</span>";
      cells.push('<div class="tick"><span class="tick-name">' + esc(shortEra(era)) +
        '</span><span class="tick-val">' + hits + "</span>" + deltaHtml + "</div>");
    });
    EVENTS.slice(-12).forEach(function (e) {
      if (e.status !== "event") return;
      var cls = e.severity >= 3 ? "down" : "up";
      cells.push('<div class="tick"><span class="tick-name">' + e.year +
        '</span><span class="tick-val">' + esc(truncate(e.title, 34)) +
        '</span><span class="' + cls + '">SEV ' + e.severity + "</span></div>");
    });
    // Doubled so the CSS loop is seamless.
    $("ticker").innerHTML = cells.join("") + cells.join("");
  }

  function truncate(s, n) {
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  }

  // ---- Events tab ----
  function buildEraTabs() {
    var html = ['<button data-era="">All eras<span class="sub-count">' + countEvents("") + "</span></button>"];
    ERAS.forEach(function (era) {
      html.push('<button data-era="' + esc(era) + '" title="' + eraSpan(era) + '">' + esc(shortEra(era)) +
        '<span class="sub-count">' + countEvents(era) + "</span></button>");
    });
    $("era-tabs").innerHTML = html.join("");
    $("era-tabs").addEventListener("click", function (ev) {
      var btn = ev.target.closest("button");
      if (!btn) return;
      state.era = btn.getAttribute("data-era");
      state.limit = PAGE;
      render();
    });
  }

  function countEvents(era) {
    return EVENTS.filter(function (e) { return e.status === "event" && (!era || e.era === era); }).length;
  }

  function buildCategoryFilter() {
    var counts = {};
    EVENTS.forEach(function (e) {
      categoriesOf(e).forEach(function (c) { counts[c] = (counts[c] || 0) + 1; });
    });
    var names = Object.keys(counts).sort();
    $("category").insertAdjacentHTML("beforeend", names.map(function (c) {
      return '<option value="' + esc(c) + '">' + esc(c) + " (" + counts[c] + ")</option>";
    }).join(""));
  }

  function filtered() {
    var q = state.q.trim().toLowerCase();
    return EVENTS.filter(function (e) {
      if (state.era && e.era !== state.era) return false;
      if (!state.showQuiet && e.status !== "event") return false;
      if (e.severity < state.minSev) return false;
      if (state.category && categoriesOf(e).indexOf(state.category) === -1) return false;
      if (q) {
        var hay = (e.year + " " + e.title + " " + e.category + " " + e.geography + " " + e.summary).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  // ---- Research links ----
  // Curated sources live in data/links.js (window.CRISIS_LINKS, keyed by year).
  // Search links built from each episode's name and year are always offered too.
  var LINKS = window.CRISIS_LINKS || {};
  var SOURCES = [
    { key: "yt", label: "YouTube", curated: "youtube", url: "https://www.youtube.com/results?search_query=" },
    { key: "x", label: "X", curated: "x", url: "https://x.com/search?src=typed_query&q=" },
    { key: "g", label: "Google", curated: "article", curatedLabel: "Article", url: "https://www.google.com/search?q=" },
    { key: "ss", label: "Substack", curated: "substack", url: "https://substack.com/search/", suffix: "?searching=all_posts" },
    { key: "gs", label: "Scholar", curated: "paper", curatedLabel: "Paper", url: "https://scholar.google.com/scholar?q=" }
  ];

  // A year can bundle several episodes ("A; B; C"); each gets its own query.
  function researchQueries(e) {
    return e.title.split(/\s*;\s*/).map(function (seg) {
      var q = seg
        .replace(/\s+-\s+.*$/, "")
        .replace(/\b(begins|deepens)\b/gi, "")
        .replace(/[()']/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (q.indexOf(String(e.year)) === -1) q += " " + e.year;
      return { label: seg, q: q };
    }).filter(function (x) { return x.q.length > 5; });
  }

  function extLink(cls, href, inner, title) {
    return '<a class="' + cls + '" href="' + esc(href) + '"' + (title ? ' title="' + esc(title) + '"' : "") +
      ' target="_blank" rel="noopener noreferrer">' + inner + "</a>";
  }

  function linksHtml(e) {
    if (e.status !== "event" && /^No major recorded/i.test(e.title)) return "";
    var qs = researchQueries(e);
    if (!qs.length) return "";
    var curated = LINKS[e.year] || {};
    var sources = SOURCES.filter(function (src) { return curated[src.curated] && curated[src.curated].url; }).map(function (src) {
      var c = curated[src.curated];
      return '<li class="chip-' + src.key + '"><span class="src-type">' + (src.curatedLabel || src.label) + "</span>" +
        extLink("src-link", c.url, esc(c.title || c.url), c.url) + "</li>";
    });
    var html = '<div class="research">';
    if (sources.length) html += '<ul class="sources">' + sources.join("") + "</ul>";
    html += qs.map(function (x) {
      var chips = SOURCES.map(function (src) {
        return extLink("chip chip-" + src.key, src.url + encodeURIComponent(x.q) + (src.suffix || ""), src.label);
      }).join("");
      var label = qs.length > 1 ? "Search: " + esc(truncate(x.label, 40)) : "Search";
      return '<div class="research-row"><span class="research-label' + (qs.length > 1 ? "" : " single") + '" title="' + esc(x.q) + '">' + label + "</span>" + chips + "</div>";
    }).join("");
    return html + "</div>";
  }

  function rowHtml(e) {
    var meta = [];
    if (e.category) meta.push('<span class="cat">' + esc(e.category) + "</span>");
    if (e.geography) meta.push("<span>" + esc(e.geography) + "</span>");
    meta.push("<span>" + esc(shortEra(e.era)) + "</span>");
    return '<article class="row ' + e.status + '">' +
      '<div class="row-year">' + e.year + "</div>" +
      '<div class="row-sev"><span class="sev sev-' + e.severity + '" title="Severity ' + e.severity + '">' + e.severity + "</span></div>" +
      '<div class="row-body"><h3 class="row-title">' + esc(e.title) + "</h3>" +
      '<div class="row-meta">' + meta.join("") + "</div>" +
      '<p class="row-text">' + esc(e.summary) + "</p>" + linksHtml(e) + "</div></article>";
  }

  function render() {
    Array.prototype.forEach.call($("era-tabs").children, function (b) {
      b.classList.toggle("active", b.getAttribute("data-era") === state.era);
    });
    var rows = filtered();
    var shown = rows.slice(0, state.limit);
    $("count").textContent = rows.length + (rows.length === 1 ? " year" : " years");
    if (!rows.length) {
      var where = state.era ? shortEra(state.era) : "these filters";
      $("list").innerHTML = '<div class="empty">No events match ' + esc(where) + ".</div>";
      return;
    }
    var html = shown.map(rowHtml).join("");
    if (rows.length > shown.length) {
      html += '<button class="more" id="more">Show ' + Math.min(PAGE, rows.length - shown.length) +
        " more (" + (rows.length - shown.length) + " left)</button>";
    }
    $("list").innerHTML = html;
    var more = $("more");
    if (more) more.addEventListener("click", function () { state.limit += PAGE; render(); });
  }

  function bindControls() {
    $("search").addEventListener("input", function (ev) { state.q = ev.target.value; state.limit = PAGE; render(); });
    $("min-sev").addEventListener("change", function (ev) { state.minSev = +ev.target.value; state.limit = PAGE; render(); });
    $("category").addEventListener("change", function (ev) { state.category = ev.target.value; state.limit = PAGE; render(); });
    $("show-quiet").addEventListener("change", function (ev) { state.showQuiet = ev.target.checked; state.limit = PAGE; render(); });
  }

  // ---- Eras tab: half-century summary (mirrors the workbook's Period Summary sheet) ----
  function buildPeriods() {
    var first = EVENTS[0].year;
    var last = EVENTS[EVENTS.length - 1].year;
    var periods = [];
    for (var from = first; from <= last; from += 50) {
      var to = Math.min(from + 49, last);
      var rows = EVENTS.filter(function (e) { return e.year >= from && e.year <= to; });
      var hits = rows.filter(function (e) { return e.severity > 0; });
      var total = rows.reduce(function (s, e) { return s + e.severity; }, 0);
      var worst = rows.reduce(function (w, e) { return !w || e.severity > w.severity ? e : w; }, null);
      periods.push({ label: from + "–" + to, years: rows.length, hits: hits.length, total: total, worst: worst });
    }
    var maxTotal = Math.max.apply(null, periods.map(function (p) { return p.total; }));
    $("period-table").querySelector("tbody").innerHTML = periods.map(function (p) {
      var pct = p.years ? (p.hits / p.years) * 100 : 0;
      var worst = p.worst && p.worst.severity > 0
        ? p.worst.year + " · " + esc(truncate(p.worst.title, 60))
        : "—";
      return "<tr><td>" + p.label + '</td><td class="num">' + p.hits + '</td><td class="num">' + pct.toFixed(0) +
        '%</td><td class="num">' + p.total + '</td><td class="num"><span class="sev sev-' + (p.worst ? p.worst.severity : 0) + '">' +
        (p.worst ? p.worst.severity : 0) + '</span></td><td class="mono">' + worst +
        '</td><td><div class="bar"><span style="width:' + (maxTotal ? (p.total / maxTotal) * 100 : 0).toFixed(1) +
        '%"></span></div></td></tr>';
    }).join("");
  }

  // ---- Tabs, clock, status bar ----
  function route() {
    var tab = (location.hash || "#events").slice(1);
    if (["events", "eras", "method"].indexOf(tab) === -1) tab = "events";
    ["events", "eras", "method"].forEach(function (t) {
      $("panel-" + t).hidden = t !== tab;
    });
    Array.prototype.forEach.call($("tabs").children, function (a) {
      a.classList.toggle("active", a.getAttribute("data-tab") === tab);
    });
  }

  function hhmmss(d) {
    return [d.getHours(), d.getMinutes(), d.getSeconds()].map(function (n) { return String(n).padStart(2, "0"); }).join(":");
  }

  function buildStatus() {
    var hits = countEvents("");
    var systemic = EVENTS.filter(function (e) { return e.severity === 5; }).length;
    $("status-left").innerHTML = [
      EVENTS.length + " years",
      hits + " event years",
      systemic + " systemic",
      ERAS.length + " eras"
    ].map(function (s) { return "<span>" + s + "</span>"; }).join("");
    $("updated").textContent = "Loaded " + hhmmss(new Date());
    var tick = function () { $("clock").textContent = hhmmss(new Date()); };
    tick();
    setInterval(tick, 1000);
  }

  if (!EVENTS.length) {
    $("list").innerHTML = '<div class="empty">Event data failed to load.</div>';
    return;
  }

  buildTicker();
  buildEraTabs();
  buildCategoryFilter();
  bindControls();
  buildPeriods();
  buildStatus();
  window.addEventListener("hashchange", route);
  route();
  render();
})();
