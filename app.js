/* =====================================================================
 * app.js — Rooted Honor landing page logic (no dependencies).
 * - Language toggle (EN / ES / FR) via translations.js dictionary.
 * - Ofrenda, RSVP, pledge, preview, and Patch Dispatch interactions.
 * - Visitor content is stored ONLY in local browser storage.
 * ===================================================================== */
(function () {
  "use strict";

  var CONFIG = window.SITE_CONFIG || { appName: "Rooted Honor", eventMonth: 8, eventDay: 3, eventStartTime: "14:00", eventDurationHours: 2, demoRsvpBase: 12, pledgeAmounts: [10, 25, 50] };
  var DICT = window.TRANSLATIONS || {};
  var LOCALES = { en: "en-US", es: "es-ES", fr: "fr-FR" };
  var LANGS = ["en", "es", "fr"];

  /* ---------- storage helpers (local browser only) ---------- */
  function loadJSON(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (_) { return fallback; }
  }
  function saveJSON(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }

  var store = {
    offerings: loadJSON("rootedHonor.offerings", []),
    rsvps: loadJSON("rootedHonor.rsvps", []),
    pledges: loadJSON("rootedHonor.pledges", []),
    reactions: loadJSON("rootedHonor.reactions", {})
  };

  /* ---------- language state + translation ---------- */
  var savedLang = loadJSON("rootedHonor.lang", null);
  var navLang = (navigator.language || "en").slice(0, 2);
  var lang = LANGS.indexOf(savedLang) >= 0 ? savedLang : (LANGS.indexOf(navLang) >= 0 ? navLang : "en");

  function t(key, vars) {
    var dict = DICT[lang] || DICT.en || {};
    var s = dict[key];
    if (typeof s !== "string") s = (DICT.en && DICT.en[key]) || key;
    if (vars) for (var k in vars) s = s.split("{" + k + "}").join(String(vars[k]));
    return s;
  }

  function applyI18n() {
    document.documentElement.lang = lang;
    document.title = t("metaTitle", { appName: CONFIG.appName });
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    document.getElementById("brandName").textContent = CONFIG.appName;
    document.getElementById("footerNote").textContent = t("footerNote", { appName: CONFIG.appName });
    document.getElementById("langToggle").setAttribute("aria-label", t("langLabel"));
    document.querySelectorAll(".lang-btn").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false");
    });
  }

  function fmtDate(d) {
    try { return new Intl.DateTimeFormat(LOCALES[lang], { year: "numeric", month: "long", day: "numeric" }).format(d); }
    catch (_) { return d.toDateString(); }
  }

  /* ---------- dates + calendar helpers ---------- */
  function nextOccurrence(month, day) {
    var now = new Date();
    var todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var candidate = new Date(now.getFullYear(), month - 1, day);
    if (candidate < todayStart) candidate = new Date(now.getFullYear() + 1, month - 1, day);
    return candidate;
  }
  function parseLocalDate(str) {
    if (!str) return null;
    var p = str.split("-");
    if (p.length !== 3) return null;
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function startOf(d) {
    var parts = (CONFIG.eventStartTime || "14:00").split(":");
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), Number(parts[0]) || 0, Number(parts[1]) || 0, 0);
  }
  function icsDate(d) {
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "T" + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
  }
  function icsEscape(s) {
    return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  }
  function googleCalUrl(opts) {
    var start = startOf(opts.date);
    var end = new Date(start.getTime() + CONFIG.eventDurationHours * 3600 * 1000);
    var q = [
      "action=TEMPLATE",
      "text=" + encodeURIComponent(opts.title),
      "dates=" + icsDate(start) + "/" + icsDate(end),
      "details=" + encodeURIComponent(opts.description),
      "recur=RRULE:FREQ%3DYEARLY"
    ];
    if (opts.location) q.push("location=" + encodeURIComponent(opts.location));
    return "https://calendar.google.com/calendar/render?action=TEMPLATE&" + q.slice(1).join("&");
  }
  function downloadIcs(opts) {
    var start = startOf(opts.date);
    var end = new Date(start.getTime() + CONFIG.eventDurationHours * 3600 * 1000);
    var now = new Date();
    var stamp = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + "T" + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds()) + "Z";
    var lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Rooted Honor//Remembrance Day//EN",
      "BEGIN:VEVENT",
      "UID:" + Date.now() + "@rooted-honor",
      "DTSTAMP:" + stamp,
      "DTSTART:" + icsDate(start),
      "DTEND:" + icsDate(end),
      "RRULE:FREQ=YEARLY",
      "SUMMARY:" + icsEscape(opts.title),
      "DESCRIPTION:" + icsEscape(opts.description),
      "LOCATION:" + icsEscape(opts.location || ""),
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    var blob = new Blob([lines], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = opts.filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  /* ---------- share (native sheet, then copy fallback) ---------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "absolute"; ta.style.left = "-9999px";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? resolve() : reject(new Error("copy failed")); }
      catch (e) { reject(e); }
      ta.remove();
    });
  }
  async function shareAny(title, text, url) {
    if (navigator.share) {
      try { await navigator.share({ title: title, text: text, url: url }); return "shared"; }
      catch (e) { if (e && e.name === "AbortError") return "cancelled"; }
    }
    try { await copyText(url + "\n" + text); return "copied"; } catch (_) { return "failed"; }
  }
  function smoothScrollTo(el) {
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  /* ---------- digital ofrenda ---------- */
  var TYPE_ICONS = { memory: "🕯️", photo: "📷", recipe: "🍉", song: "🎶", flower: "🌸", planting: "🌱" };
  var TYPE_KEYS = { memory: "typeMemory", photo: "typePhoto", recipe: "typeRecipe", song: "typeSong", flower: "typeFlower", planting: "typePlanting" };
  function typeLabel(type) { return t(TYPE_KEYS[type] || "typeMemory"); }

  var SEEDS = [
    { id: "seed-1", type: "memory", noteKey: "seed1Note" },
    { id: "seed-2", type: "recipe", noteKey: "seed2Note" },
    { id: "seed-3", type: "song", noteKey: "seed3Note" },
    { id: "seed-4", type: "planting", noteKey: "seed4Note" }
  ];
  function displayedOfferings() {
    var seeds = SEEDS.map(function (s) { return { id: s.id, type: s.type, note: t(s.noteKey), demo: true }; });
    return seeds.concat(store.offerings.map(function (o) { return { id: o.id, type: o.type, note: o.note, demo: false }; }));
  }

  function renderOfferings() {
    var grid = document.getElementById("offeringGrid");
    var items = displayedOfferings();
    grid.textContent = "";
    document.getElementById("offeringEmpty").hidden = items.length > 0;
    items.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "keep-card";
      var head = document.createElement("div"); head.className = "keep-head";
      var icon = document.createElement("span"); icon.className = "keep-icon"; icon.setAttribute("aria-hidden", "true"); icon.textContent = TYPE_ICONS[item.type] || "🕯️";
      var typeName = document.createElement("p"); typeName.className = "keep-type"; typeName.textContent = typeLabel(item.type);
      head.appendChild(icon); head.appendChild(typeName); card.appendChild(head);
      var note = document.createElement("p"); note.className = "keep-note"; note.textContent = item.note;
      card.appendChild(note);
      if (item.demo) {
        var badge = document.createElement("p"); badge.className = "keep-demo"; badge.textContent = t("demoLabel");
        card.appendChild(badge);
      }
      var r = store.reactions[item.id] || { flower: 0, heart: 0 };
      var row = document.createElement("div"); row.className = "keep-reactions";
      [["flower", "🌸", "flowerBtn"], ["heart", "❤️", "heartBtn"]].forEach(function (cfg) {
        var btn = document.createElement("button");
        btn.type = "button"; btn.className = "react-btn";
        btn.dataset.id = item.id; btn.dataset.kind = cfg[0];
        btn.setAttribute("aria-label", t(cfg[2]));
        btn.textContent = cfg[1] + " " + (r[cfg[0]] || 0);
        row.appendChild(btn);
      });
      card.appendChild(row);
      grid.appendChild(card);
    });
  }

  document.getElementById("offeringGrid").addEventListener("click", function (ev) {
    var btn = ev.target.closest(".react-btn");
    if (!btn) return;
    var id = btn.dataset.id, kind = btn.dataset.kind;
    store.reactions[id] = store.reactions[id] || { flower: 0, heart: 0 };
    store.reactions[id][kind] = (store.reactions[id][kind] || 0) + 1;
    saveJSON("rootedHonor.reactions", store.reactions);
    renderOfferings();
    var bumped = document.querySelector('.react-btn[data-id="' + id + '"][data-kind="' + kind + '"]');
    if (bumped) bumped.classList.add("bumped");
  });

  document.getElementById("offeringForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var type = document.getElementById("offeringType").value;
    var note = document.getElementById("offeringNote").value.trim();
    var status = document.getElementById("offeringStatus");
    if (!note) { status.textContent = t("formRequired"); return; }
    store.offerings.push({ id: "u-" + Date.now(), type: type, note: note });
    saveJSON("rootedHonor.offerings", store.offerings);
    renderOfferings();
    status.textContent = t("addedMsg");
    document.getElementById("offeringNote").value = "";
  });

  /* ---------- RSVP + calendar ---------- */
  var EVENT_DATE = nextOccurrence(CONFIG.eventMonth, CONFIG.eventDay);

  function rsvpTotal() {
    return CONFIG.demoRsvpBase + store.rsvps.reduce(function (sum, r) { return sum + 1 + (Number(r.guests) || 0); }, 0);
  }
  function renderRsvp() {
    document.getElementById("eventDateDisplay").textContent = fmtDate(EVENT_DATE);
    document.getElementById("rsvpCount").textContent = t("rsvpCount", { count: rsvpTotal() });
    var block = document.getElementById("calendarBlock");
    var done = store.rsvps.length > 0;
    block.hidden = !done;
    if (done) {
      var title = t("heroEventName");
      var desc = t("calendarDesc");
      var loc = t("locationValue");
      document.getElementById("googleCalLink").href = googleCalUrl({ title: title, date: EVENT_DATE, description: desc, location: loc });
      document.getElementById("icsBtn").onclick = function () {
        downloadIcs({ title: title, description: desc, location: loc, date: EVENT_DATE, filename: "watermelon-patch-day.ics" });
      };
      var last = store.rsvps[store.rsvps.length - 1];
      document.getElementById("rsvpStatus").textContent = t("rsvpSuccess", { name: last.name });
    }
  }

  document.getElementById("rsvpForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var name = document.getElementById("rsvpName").value.trim();
    var status = document.getElementById("rsvpStatus");
    if (!name) { status.textContent = t("rsvpRequired"); return; }
    var guests = Math.min(20, Math.max(0, parseInt(document.getElementById("rsvpGuests").value || "0", 10) || 0));
    store.rsvps.push({ name: name, guests: guests, at: new Date().toISOString() });
    saveJSON("rootedHonor.rsvps", store.rsvps);
    renderRsvp();
    document.getElementById("rsvpName").value = "";
  });

  /* ---------- invite others ---------- */
  document.getElementById("inviteBtn").addEventListener("click", async function () {
    var status = document.getElementById("inviteStatus");
    var text = t("inviteShareText", { title: t("heroEventName"), date: fmtDate(EVENT_DATE) });
    var result = await shareAny(t("inviteShareTitle"), text, window.location.href);
    if (result === "copied") status.textContent = t("inviteCopied");
    if (result === "failed") status.textContent = t("inviteCopyFail");
    if (result === "shared") status.textContent = t("inviteCopied");
  });

  /* ---------- support the gathering (demo pledge only) ---------- */
  var selectedPledge = CONFIG.pledgeAmounts[1] || CONFIG.pledgeAmounts[0];

  function renderPledge() {
    var wrap = document.getElementById("pledgeAmounts");
    wrap.textContent = "";
    CONFIG.pledgeAmounts.forEach(function (amount) {
      var label = document.createElement("label");
      var input = document.createElement("input");
      input.type = "radio"; input.name = "pledgeAmount"; input.value = String(amount);
      if (amount === selectedPledge) input.checked = true;
      input.addEventListener("change", function () { selectedPledge = amount; document.getElementById("pledgeCustom").value = ""; });
      label.appendChild(input);
      label.appendChild(document.createTextNode("$" + amount));
      wrap.appendChild(label);
    });
    if (store.pledges.length > 0) document.getElementById("pledgeStatus").textContent = t("pledgeSuccess");
  }

  document.getElementById("pledgeForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var status = document.getElementById("pledgeStatus");
    var custom = parseFloat(document.getElementById("pledgeCustom").value);
    var amount = isNaN(custom) ? selectedPledge : Math.round(custom * 100) / 100;
    if (!amount || amount <= 0) { status.textContent = t("formRequired"); return; }
    // DEMO ONLY: recorded locally in this browser. No payment provider is called.
    store.pledges.push({ amount: amount, at: new Date().toISOString() });
    saveJSON("rootedHonor.pledges", store.pledges);
    status.textContent = t("pledgeSuccess");
  });

  /* ---------- create a remembrance day (preview only) ---------- */
  var previewData = null;

  function renderPreview() {
    var card = document.getElementById("preview");
    if (!previewData) { card.hidden = true; return; }
    card.hidden = false;
    document.getElementById("previewElder").textContent = previewData.elder;
    document.getElementById("previewTradition").textContent = previewData.tradition;
    document.getElementById("previewDate").textContent = fmtDate(previewData.date);
    document.getElementById("previewDetails").textContent = previewData.details || "—";
    var title = previewData.tradition + " — " + previewData.elder;
    var desc = previewData.details || t("previewRsvpInvite");
    document.getElementById("previewGoogle").href = googleCalUrl({ title: title, date: previewData.date, description: desc });
    document.getElementById("previewIcs").onclick = function () {
      downloadIcs({ title: title, description: desc, location: "", date: previewData.date, filename: "remembrance-day.ics" });
    };
    document.getElementById("previewShare").onclick = async function () {
      var st = document.getElementById("previewShareStatus");
      var text = t("previewShareText", { tradition: previewData.tradition, date: fmtDate(previewData.date), elder: previewData.elder });
      var result = await shareAny(t("previewTitle"), text, window.location.href);
      if (result === "copied" || result === "shared") st.textContent = t("inviteCopied");
      if (result === "failed") st.textContent = t("inviteCopyFail");
    };
  }

  document.getElementById("createForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var elder = document.getElementById("createElder").value.trim();
    var tradition = document.getElementById("createTradition").value.trim();
    var picked = parseLocalDate(document.getElementById("createDate").value);
    var details = document.getElementById("createDetails").value.trim();
    var status = document.getElementById("createStatus");
    if (!elder || !tradition || !picked) { status.textContent = t("formRequired"); return; }
    status.textContent = "";
    // Annual reminder: roll forward to the next occurrence if the picked date has passed.
    var now = new Date();
    var upcoming = new Date(picked.getFullYear(), picked.getMonth(), picked.getDate());
    while (upcoming < new Date(now.getFullYear(), now.getMonth(), now.getDate())) upcoming.setFullYear(upcoming.getFullYear() + 1);
    previewData = { elder: elder, tradition: tradition, date: upcoming, details: details };
    renderPreview();
    smoothScrollTo(document.getElementById("preview"));
  });

  /* ---------- Patch Dispatch (Muse Ember via OpenRouter) ---------- */
  var lastDispatch = null; // { mode: "live" | "sample", text, count, model }

  function renderDispatch() {
    var out = document.getElementById("dispatchOutput");
    if (!lastDispatch) { out.hidden = true; return; }
    out.hidden = false;
    document.getElementById("dispatchLabel").textContent = lastDispatch.mode === "sample" ? t("dispatchSampleLabel") : t("dispatchTitle");
    document.getElementById("dispatchText").textContent = lastDispatch.text;
    var meta = t("dispatchBasedOn", { count: lastDispatch.count });
    if (lastDispatch.mode === "live" && lastDispatch.model) meta += " · " + lastDispatch.model;
    document.getElementById("dispatchMeta").textContent = meta;
  }

  document.getElementById("dispatchBtn").addEventListener("click", async function () {
    var btn = this;
    var status = document.getElementById("dispatchStatus");
    var items = displayedOfferings();
    if (items.length === 0) { status.textContent = t("dispatchEmpty"); return; }
    btn.disabled = true;
    status.textContent = t("dispatchLoading");
    try {
      var res = await fetch("/api/patch-dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerings: items.map(function (o) { return { type: typeLabel(o.type), note: o.note }; }) })
      });
      var data = await res.json().catch(function () { return null; });
      if (data && data.ok) {
        status.textContent = "";
        lastDispatch = { mode: "live", text: data.dispatch, count: data.count != null ? data.count : items.length, model: data.model };
      } else if (data && data.code === "missing_config") {
        // Honest fallback: server is not configured yet — show the labeled sample.
        status.textContent = t("dispatchSetup");
        lastDispatch = { mode: "sample", text: t("dispatchSample"), count: items.length, model: null };
      } else {
        status.textContent = t("dispatchError");
        lastDispatch = null;
      }
    } catch (_) {
      status.textContent = t("dispatchError");
      lastDispatch = null;
    }
    renderDispatch();
    btn.disabled = false;
  });

  /* ---------- language toggle + init ---------- */
  function setLang(newLang) {
    if (LANGS.indexOf(newLang) < 0) return;
    lang = newLang;
    saveJSON("rootedHonor.lang", lang);
    applyI18n();
    renderOfferings();
    renderRsvp();
    renderPledge();
    renderPreview();
    renderDispatch();
  }
  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { setLang(btn.getAttribute("data-lang")); });
  });

  applyI18n();
  renderOfferings();
  renderRsvp();
  renderPledge();
  renderPreview();
  renderDispatch();
})();
