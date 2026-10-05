(function () {
  "use strict";

  var EVENTS = window.CRISIS_EVENTS || [];
  var PAGE = 150;

  var ERAS = [];
  EVENTS.forEach(function (e) {
    if (ERAS.indexOf(e.era) === -1) ERAS.push(e.era);
  });

  var state = { era: "", q: "", minSev: 0, category: "", limit: PAGE };

  // Calendar span of each era (from the workbook legend), used for "% of years with an event".
  var ERA_YEARS = {
    "Pre-market (800-1299)": [800, 1299],
    "Medieval-Renaissance": [1300, 1600],
    "Joint-stock era": [1601, 1720],
    "Industrial / classical": [1721, 1913],
    "Wars & Bretton Woods": [1914, 1971],
    "Modern floating-rate": [1972, 2026]
  };

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
    var span = ERA_YEARS[era];
    if (span) return span[0] + "–" + span[1];
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
      var hits = EVENTS.filter(function (e) { return e.era === era; }).length;
      var span = ERA_YEARS[era];
      var share = span ? (hits / (span[1] - span[0] + 1)) * 100 : 100;
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
    $("count").textContent = rows.length + (rows.length === 1 ? " event" : " events");
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
  }

  // ---- Eras tab: half-century summary (mirrors the workbook's Period Summary sheet) ----
  function buildPeriods() {
    var first = EVENTS[0].year;
    var last = EVENTS[EVENTS.length - 1].year;
    var periods = [];
    for (var from = Math.floor(first / 50) * 50; from <= last; from += 50) {
      var to = Math.min(from + 49, last);
      var rows = EVENTS.filter(function (e) { return e.year >= from && e.year <= to; });
      if (!rows.length) continue;
      var hits = rows.filter(function (e) { return e.severity > 0; });
      var total = rows.reduce(function (s, e) { return s + e.severity; }, 0);
      var worst = rows.reduce(function (w, e) { return !w || e.severity > w.severity ? e : w; }, null);
      periods.push({ label: from + "–" + Math.min(from + 49, 2026), years: Math.min(from + 49, 2026) - from + 1, hits: hits.length, total: total, worst: worst });
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

  // ---- Crashes tab: pre/post charts from key index levels (data/crashes.js) ----
  var CRASHES = window.CRISIS_CRASHES || [];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function parseDate(s) {
    var p = s.split("-");
    return Date.UTC(+p[0], +p[1] - 1, +p[2]);
  }

  function fmtDate(t) {
    var d = new Date(t);
    return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear();
  }

  function fmtNum(v) {
    return v.toLocaleString("en-US", { maximumFractionDigits: v < 1000 ? 2 : 0 });
  }

  function fmtSpan(ms) {
    var days = Math.round(ms / 864e5);
    if (days < 60) return days + " days";
    var months = Math.round(days / 30.44);
    if (months < 24) return months + " months";
    return (months / 12).toFixed(1).replace(/\.0$/, "") + " years";
  }

  function crashStats(c) {
    var pts = c.points;
    var peakIdx = 0;
    var crashT = parseDate(c.crash);
    pts.forEach(function (p, i) {
      if (p.t <= crashT && p.value > pts[peakIdx].value) peakIdx = i;
    });
    var peak = pts[peakIdx];
    var trough = peak;
    pts.forEach(function (p, i) { if (i > peakIdx && p.value < trough.value) trough = p; });
    var recovered = null;
    pts.forEach(function (p) { if (!recovered && p.t > trough.t && p.value >= peak.value) recovered = p; });
    return { peak: peak, trough: trough, recovered: recovered, drawdown: (trough.value / peak.value - 1) * 100 };
  }

  function chartSvg(c, st) {
    var W = 760, H = 240, L = 56, R = 16, T = 16, B = 30;
    var pts = c.points;
    var t0 = pts[0].t, t1 = pts[pts.length - 1].t;
    var span = t1 - t0 || 1;
    var vmax = Math.max.apply(null, pts.map(function (p) { return p.value; }));
    var step = Math.pow(10, Math.floor(Math.log10(vmax / 4)));
    [1, 2, 2.5, 5, 10].some(function (m) { if (vmax / (step * m) <= 5) { step *= m; return true; } return false; });
    var ymax = Math.ceil((vmax * 1.04) / step) * step;
    var x = function (t) { return L + ((t - t0) / span) * (W - L - R); };
    var y = function (v) { return T + (1 - v / ymax) * (H - T - B); };
    var crashX = x(parseDate(c.crash));
    var out = ['<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(c.series + " around the " + c.name) + '">'];
    out.push('<rect class="zone-pre" x="' + L + '" y="' + T + '" width="' + Math.max(0, crashX - L) + '" height="' + (H - T - B) + '"/>');
    out.push('<rect class="zone-post" x="' + crashX + '" y="' + T + '" width="' + Math.max(0, W - R - crashX) + '" height="' + (H - T - B) + '"/>');
    for (var v = 0; v <= ymax + 1e-9; v += step) {
      out.push('<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/>');
      out.push('<text class="axis" x="' + (L - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + fmtNum(v) + "</text>");
    }
    var y0 = new Date(t0).getUTCFullYear(), y1 = new Date(t1).getUTCFullYear();
    var yearStep = Math.max(1, Math.ceil((y1 - y0) / 6));
    if (y1 - y0 < 2) {
      for (var m = 0; m < 30; m += 2) {
        var d = new Date(t0); var tm = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + m, 1);
        if (tm < t0 || tm > t1) continue;
        var dd = new Date(tm);
        out.push('<text class="axis" x="' + x(tm) + '" y="' + (H - 10) + '" text-anchor="middle">' + MONTHS[dd.getUTCMonth()] + " " + String(dd.getUTCFullYear()).slice(2) + "</text>");
      }
    } else {
      for (var yr = y0 + 1; yr <= y1; yr += yearStep) {
        out.push('<text class="axis" x="' + x(Date.UTC(yr, 0, 1)) + '" y="' + (H - 10) + '" text-anchor="middle">' + yr + "</text>");
      }
    }
    out.push('<line class="crash-line" x1="' + crashX + '" x2="' + crashX + '" y1="' + T + '" y2="' + (H - B) + '"/>');
    out.push('<text class="zone-label" x="' + (crashX - 6) + '" y="' + (H - B - 8) + '" text-anchor="end">BEFORE</text>');
    out.push('<text class="zone-label post" x="' + (crashX + 6) + '" y="' + (H - B - 8) + '">AFTER</text>');
    out.push('<polyline class="series" points="' + pts.map(function (p) { return x(p.t).toFixed(1) + "," + y(p.value).toFixed(1); }).join(" ") + '"/>');
    pts.forEach(function (p, i) {
      var key = p === st.peak ? "peak" : p === st.trough ? "trough" : "";
      out.push('<circle class="pt ' + key + '" cx="' + x(p.t) + '" cy="' + y(p.value) + '" r="4"/>');
      if (key) {
        var lx = Math.min(Math.max(x(p.t), L + 30), W - R - 30);
        var ly = key === "peak" ? y(p.value) - 10 : y(p.value) + 18;
        if (ly > H - B - 4) ly = y(p.value) - 10;
        out.push('<text class="pt-label" x="' + lx + '" y="' + ly + '" text-anchor="middle">' + fmtNum(p.value) + "</text>");
      }
      out.push('<circle class="hit" data-i="' + i + '" cx="' + x(p.t) + '" cy="' + y(p.value) + '" r="14"/>');
    });
    out.push("</svg>");
    return out.join("");
  }

  function buildCrashes() {
    if (!CRASHES.length) return;
    var html = CRASHES.map(function (c, ci) {
      c.points.forEach(function (p) { p.t = parseDate(p.date); });
      var st = crashStats(c);
      var tiles = [
        ["Peak", fmtNum(st.peak.value), fmtDate(st.peak.t)],
        ["Trough", fmtNum(st.trough.value), fmtDate(st.trough.t)],
        ["Drawdown", '<span class="down">' + st.drawdown.toFixed(1) + "%</span>", "peak to trough"],
        ["Fall lasted", fmtSpan(st.trough.t - st.peak.t), "peak to trough"],
        ["Recovery", st.recovered ? fmtSpan(st.recovered.t - st.peak.t) : '<span class="down">Not regained</span>',
          st.recovered ? "back to peak by " + new Date(st.recovered.t).getUTCFullYear() : "as of the last point shown"]
      ].map(function (tt) {
        return '<div class="tile"><div class="tile-k">' + tt[0] + '</div><div class="tile-v">' + tt[1] + '</div><div class="tile-s">' + tt[2] + "</div></div>";
      }).join("");
      var rows = c.points.map(function (p) {
        return "<tr><td>" + fmtDate(p.t) + '</td><td class="num">' + fmtNum(p.value) + "</td><td>" + esc(p.note) + "</td></tr>";
      }).join("");
      var heads = c.headlines.map(function (h) {
        return '<li><span class="hl-date">' + esc(h.date) + "</span>" + esc(h.text) + "</li>";
      }).join("");
      return '<article class="crash" data-ci="' + ci + '">' +
        '<header class="crash-head"><span class="crash-year">' + c.year + "</span><div><h2>" + esc(c.name) + "</h2>" +
        '<div class="crash-sub">' + esc(c.market) + " &middot; " + esc(c.series) + "</div></div>" +
        '<a class="crash-link" href="#events" data-year="' + c.year + '">In the register &rarr;</a></header>' +
        '<div class="tiles">' + tiles + "</div>" +
        '<div class="chart-wrap">' + chartSvg(c, st) + "</div>" +
        '<details class="levels"><summary>Key levels table</summary><table class="grid"><thead><tr><th>Date</th><th class="num">Level</th><th>Note</th></tr></thead><tbody>' + rows + "</tbody></table></details>" +
        '<div class="crash-body"><div><h3>Crash report</h3><p>' + esc(c.report) + "</p></div>" +
        '<div><h3>Headlines</h3><ul class="headlines">' + heads + "</ul></div></div></article>";
    }).join("");
    var list = $("crash-list");
    list.innerHTML = html;

    var tip = $("chart-tip");
    list.addEventListener("mouseover", function (ev) {
      var hit = ev.target.closest(".hit");
      if (!hit) return;
      var c = CRASHES[+hit.closest(".crash").getAttribute("data-ci")];
      var p = c.points[+hit.getAttribute("data-i")];
      tip.innerHTML = '<div class="tip-v">' + fmtNum(p.value) + '</div><div>' + fmtDate(p.t) + '</div><div class="tip-n">' + esc(p.note) + "</div>";
      tip.hidden = false;
      var r = hit.getBoundingClientRect();
      tip.style.left = Math.min(window.innerWidth - tip.offsetWidth - 8, Math.max(8, r.left + r.width / 2 - tip.offsetWidth / 2)) + "px";
      tip.style.top = (r.top - tip.offsetHeight - 6) + "px";
    });
    list.addEventListener("mouseout", function (ev) { if (ev.target.closest(".hit")) tip.hidden = true; });
    window.addEventListener("scroll", function () { tip.hidden = true; }, { passive: true });
    list.addEventListener("click", function (ev) {
      var a = ev.target.closest(".crash-link");
      if (!a) return;
      state.era = "";
      state.q = a.getAttribute("data-year");
      $("search").value = state.q;
      state.limit = PAGE;
      render();
    });
  }

  // ---- Tabs, clock, status bar ----
  function route() {
    var tab = (location.hash || "#events").slice(1);
    if (["events", "crashes", "eras", "method"].indexOf(tab) === -1) tab = "events";
    ["events", "crashes", "eras", "method"].forEach(function (t) {
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
      hits + " events",
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
  buildCrashes();
  buildStatus();
  window.addEventListener("hashchange", route);
  route();
  render();
})();
