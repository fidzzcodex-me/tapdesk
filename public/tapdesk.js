/*!
 * tapdesk.js — panel developer in-page.
 * Menempel satu tombol bulat + panel ke halaman tempat script ini dipasang.
 * Tidak mengubah tampilan atau perilaku halaman host: semua style diisolasi
 * lewat Shadow DOM, dan fetch/XHR asli tetap berjalan seperti biasa —
 * script ini cuma menyalin data untuk ditampilkan.
 *
 * Batas: hanya menangkap fetch/XHR pada halaman tempat script ini dipasang.
 * Tidak melihat trafik jaringan perangkat secara keseluruhan.
 */
(function () {
  "use strict";

  if (window.__tapdeskActive) return;
  window.__tapdeskActive = true;

  var scriptEl =
    document.currentScript ||
    (function () {
      var all = document.getElementsByTagName("script");
      return all[all.length - 1];
    })();

  var sessionId = scriptEl.getAttribute("data-session") || "local";
  var syncEnabled = scriptEl.getAttribute("data-sync") === "true";
  var apiOrigin = (function () {
    try {
      return new URL(scriptEl.src, location.href).origin;
    } catch (e) {
      return location.origin;
    }
  })();

  // ---------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------
  var state = {
    network: [],
    console: [],
    open: false,
    dark: true,
    corner: "br", // br | bl
    activeTab: "network",
    selectedNetworkId: null,
  };

  var MAX_ITEMS = 200;
  var uidCounter = 0;
  function uid() {
    uidCounter += 1;
    return "e" + Date.now().toString(36) + uidCounter;
  }

  // ---------------------------------------------------------------------
  // Keep references to originals so destroy() can restore them
  // ---------------------------------------------------------------------
  var originalFetch = window.fetch ? window.fetch.bind(window) : null;
  var originalXHROpen = XMLHttpRequest.prototype.open;
  var originalXHRSend = XMLHttpRequest.prototype.send;
  var originalSetHeader = XMLHttpRequest.prototype.setRequestHeader;
  var originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  // ---------------------------------------------------------------------
  // Shadow root — isolates panel CSS from the host page and vice versa
  // ---------------------------------------------------------------------
  var host = document.createElement("div");
  host.id = "tapdesk-host";
  host.style.all = "initial";
  document.documentElement.appendChild(host);
  var root = host.attachShadow({ mode: "open" });

  var style = document.createElement("style");
  style.textContent =
    ":host{all:initial}" +
    "*{box-sizing:border-box;font-family:ui-monospace,'IBM Plex Mono',Menlo,Consolas,monospace}" +
    ".td-fab{position:fixed;bottom:20px;width:48px;height:48px;border-radius:999px;" +
    "background:#2F6FED;border:none;cursor:grab;box-shadow:0 4px 14px rgba(0,0,0,.28);" +
    "z-index:2147483000;display:flex;align-items:center;justify-content:center;" +
    "transition:transform .15s ease;touch-action:none}" +
    ".td-fab:active{cursor:grabbing;transform:scale(0.94)}" +
    ".td-fab.br{right:20px}.td-fab.bl{left:20px}" +
    ".td-panel{position:fixed;bottom:78px;width:360px;max-width:92vw;height:440px;max-height:70vh;" +
    "border-radius:10px;overflow:hidden;display:flex;flex-direction:column;" +
    "box-shadow:0 10px 40px rgba(0,0,0,.35);z-index:2147483000;" +
    "opacity:0;transform:translateY(12px);pointer-events:none;" +
    "transition:opacity .18s ease,transform .18s ease}" +
    ".td-panel.br{right:20px}.td-panel.bl{left:20px}" +
    ".td-panel.open{opacity:1;transform:translateY(0);pointer-events:auto}" +
    ".td-panel.dark{background:#0E1116;color:#E7EBF2;border:1px solid #242A33}" +
    ".td-panel.light{background:#FFFFFF;color:#12161C;border:1px solid #DEE3EA}" +
    ".td-head{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;" +
    "border-bottom:1px solid rgba(127,127,127,.2);font-size:11px;flex-shrink:0}" +
    ".td-head b{font-weight:600}" +
    ".td-headbtns{display:flex;gap:6px}" +
    ".td-iconbtn{width:22px;height:22px;border-radius:6px;border:none;background:transparent;" +
    "color:inherit;opacity:.6;cursor:pointer;display:flex;align-items:center;justify-content:center}" +
    ".td-iconbtn:hover{opacity:1;background:rgba(127,127,127,.15)}" +
    ".td-tabs{display:flex;border-bottom:1px solid rgba(127,127,127,.2);flex-shrink:0}" +
    ".td-tab{flex:1;padding:7px 4px;background:transparent;border:none;color:inherit;opacity:.55;" +
    "font-size:10.5px;cursor:pointer;letter-spacing:.02em;border-bottom:2px solid transparent}" +
    ".td-tab.active{opacity:1;border-bottom-color:#2F6FED}" +
    ".td-body{flex:1;overflow-y:auto;font-size:11px}" +
    ".td-row{display:flex;gap:8px;padding:6px 10px;border-bottom:1px solid rgba(127,127,127,.12);cursor:pointer}" +
    ".td-row:hover{background:rgba(47,111,237,.08)}" +
    ".td-row .m{opacity:.55;width:34px;flex-shrink:0}" +
    ".td-row .u{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    ".td-row .s{width:34px;text-align:right;flex-shrink:0}" +
    ".td-row .d{width:44px;text-align:right;opacity:.55;flex-shrink:0}" +
    ".td-s2{color:#3fb950}.td-s4{color:#e3b341}.td-s5{color:#f85149}.td-s0{color:#f85149}" +
    ".td-empty{padding:20px 14px;opacity:.5;font-size:11px;line-height:1.5}" +
    ".td-detail{padding:10px;border-top:1px solid rgba(127,127,127,.2)}" +
    ".td-detail h4{margin:8px 0 3px;font-size:10px;opacity:.55;font-weight:600}" +
    ".td-detail pre{white-space:pre-wrap;word-break:break-all;margin:0;font-size:10.5px;line-height:1.5}" +
    ".td-consoleline{padding:5px 10px;border-bottom:1px solid rgba(127,127,127,.12);white-space:pre-wrap;word-break:break-word}" +
    ".td-c-log{opacity:.85}.td-c-warn{color:#e3b341}.td-c-error{color:#f85149}" +
    ".td-info{padding:12px}" +
    ".td-info .r{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(127,127,127,.12);gap:10px}" +
    ".td-info .k{opacity:.55}" +
    ".td-info .v{text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:220px}" +
    ".td-setting{padding:12px;display:flex;flex-direction:column;gap:12px}" +
    ".td-setrow{display:flex;align-items:center;justify-content:space-between}" +
    ".td-btn{background:rgba(127,127,127,.15);border:none;color:inherit;padding:6px 10px;" +
    "border-radius:6px;font-size:11px;cursor:pointer}" +
    ".td-btn:hover{background:rgba(127,127,127,.28)}" +
    ".td-btn.danger{background:rgba(248,81,73,.15);color:#f85149}" +
    ".td-btn.danger:hover{background:rgba(248,81,73,.28)}" +
    ".td-switch{width:32px;height:18px;border-radius:999px;background:rgba(127,127,127,.35);" +
    "border:none;position:relative;cursor:pointer;flex-shrink:0}" +
    ".td-switch.on{background:#2F6FED}" +
    ".td-switch i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:999px;" +
    "background:#fff;transition:transform .15s ease}" +
    ".td-switch.on i{transform:translateX(14px)}";
  root.appendChild(style);

  // ---------------------------------------------------------------------
  // Build DOM
  // ---------------------------------------------------------------------
  var fab = document.createElement("button");
  fab.className = "td-fab br";
  fab.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none">' +
    '<path d="M4 6h16M4 12h10M4 18h7" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' +
    "</svg>";
  root.appendChild(fab);

  var panel = document.createElement("div");
  panel.className = "td-panel br dark";
  panel.innerHTML =
    '<div class="td-head">' +
    "<b>tapdesk</b>" +
    '<div class="td-headbtns">' +
    '<button class="td-iconbtn" data-act="min" title="Minimize">' +
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
    "</button>" +
    "</div>" +
    "</div>" +
    '<div class="td-tabs">' +
    '<button class="td-tab" data-tab="network">Network</button>' +
    '<button class="td-tab" data-tab="console">Console</button>' +
    '<button class="td-tab" data-tab="info">Info</button>' +
    '<button class="td-tab" data-tab="setting">Setting</button>' +
    "</div>" +
    '<div class="td-body"></div>';
  root.appendChild(panel);

  var bodyEl = panel.querySelector(".td-body");
  var tabButtons = panel.querySelectorAll(".td-tab");

  // ---------------------------------------------------------------------
  // Drag logic for the FAB (distinguishes drag from click)
  // ---------------------------------------------------------------------
  (function enableDrag() {
    var dragging = false;
    var moved = false;
    var startX = 0,
      startY = 0;

    fab.addEventListener("pointerdown", function (e) {
      dragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      fab.setPointerCapture(e.pointerId);
    });

    fab.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
      if (!moved) return;
      var rect = fab.getBoundingClientRect();
      var newBottom = window.innerHeight - rect.bottom - dy;
      fab.style.bottom = Math.max(8, newBottom) + "px";
      startY = e.clientY;

      // snap left/right based on horizontal drag position
      var vw = window.innerWidth;
      var cx = rect.left + dx + rect.width / 2;
      state.corner = cx < vw / 2 ? "bl" : "br";
      applyCorner();
      startX = e.clientX;
    });

    fab.addEventListener("pointerup", function () {
      dragging = false;
      if (!moved) toggleOpen();
    });
  })();

  function applyCorner() {
    fab.classList.remove("br", "bl");
    fab.classList.add(state.corner);
    panel.classList.remove("br", "bl");
    panel.classList.add(state.corner);
  }

  function toggleOpen() {
    state.open = !state.open;
    panel.classList.toggle("open", state.open);
    if (state.open) render();
  }

  panel
    .querySelector('[data-act="min"]')
    .addEventListener("click", function () {
      state.open = false;
      panel.classList.remove("open");
    });

  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.activeTab = btn.getAttribute("data-tab");
      state.selectedNetworkId = null;
      render();
    });
  });

  // ---------------------------------------------------------------------
  // Recording
  // ---------------------------------------------------------------------
  function pushNetwork(entry) {
    entry.id = uid();
    entry.timestamp = Date.now();
    state.network.push(entry);
    if (state.network.length > MAX_ITEMS) state.network.shift();
    if (state.open && state.activeTab === "network") render();
    sync({ type: "network", method: entry.method, url: entry.url, status: entry.status, duration: entry.duration, timestamp: entry.timestamp });
  }

  function pushConsole(level, args) {
    var message = args
      .map(function (a) {
        if (typeof a === "string") return a;
        try {
          return JSON.stringify(a);
        } catch (e) {
          return String(a);
        }
      })
      .join(" ");
    var entry = { id: uid(), level: level, message: message, timestamp: Date.now() };
    state.console.push(entry);
    if (state.console.length > MAX_ITEMS) state.console.shift();
    if (state.open && state.activeTab === "console") render();
    sync({ type: "console", level: level, message: message, timestamp: entry.timestamp });
  }

  function sync(payload) {
    if (!syncEnabled) return;
    try {
      fetch(apiOrigin + "/api/tap/" + encodeURIComponent(sessionId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(function () {});
    } catch (e) {
      /* diam-diam gagal, jangan ganggu halaman host */
    }
  }

  function statusClass(status) {
    if (!status) return "td-s0";
    if (status >= 500) return "td-s5";
    if (status >= 400) return "td-s4";
    return "td-s2";
  }

  // ---------------------------------------------------------------------
  // Patch fetch
  // ---------------------------------------------------------------------
  if (originalFetch) {
    window.fetch = function (input, init) {
      var start = performance.now();
      var method = (init && init.method) || "GET";
      var url = typeof input === "string" ? input : input && input.url;
      var reqBody = init && init.body ? safeStringify(init.body) : undefined;
      var reqHeaders = extractHeaders(init && init.headers);

      return originalFetch(input, init).then(
        function (res) {
          var duration = Math.round(performance.now() - start);
          var clone = res.clone();
          clone
            .text()
            .then(function (text) {
              pushNetwork({
                method: method,
                url: url,
                status: res.status,
                duration: duration,
                requestHeaders: reqHeaders,
                requestBody: reqBody,
                responseHeaders: extractHeaders(res.headers),
                responsePreview: truncate(text, 3000),
              });
            })
            .catch(function () {
              pushNetwork({
                method: method,
                url: url,
                status: res.status,
                duration: duration,
                requestHeaders: reqHeaders,
                requestBody: reqBody,
              });
            });
          return res;
        },
        function (err) {
          var duration = Math.round(performance.now() - start);
          pushNetwork({
            method: method,
            url: url,
            status: 0,
            duration: duration,
            requestHeaders: reqHeaders,
            requestBody: reqBody,
            error: String(err),
          });
          throw err;
        }
      );
    };
  }

  // ---------------------------------------------------------------------
  // Patch XHR
  // ---------------------------------------------------------------------
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__td = { method: method, url: url, headers: {} };
    return originalXHROpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
    if (this.__td) this.__td.headers[name] = value;
    return originalSetHeader.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    var xhr = this;
    if (xhr.__td) {
      xhr.__td.start = performance.now();
      xhr.__td.body = safeStringify(body);
      xhr.addEventListener("loadend", function () {
        var duration = Math.round(performance.now() - xhr.__td.start);
        var preview;
        try {
          preview = truncate(xhr.responseText, 3000);
        } catch (e) {
          preview = undefined;
        }
        pushNetwork({
          method: xhr.__td.method,
          url: xhr.__td.url,
          status: xhr.status,
          duration: duration,
          requestHeaders: xhr.__td.headers,
          requestBody: xhr.__td.body,
          responsePreview: preview,
        });
      });
    }
    return originalXHRSend.apply(this, arguments);
  };

  // ---------------------------------------------------------------------
  // Patch console
  // ---------------------------------------------------------------------
  ["log", "warn", "error"].forEach(function (level) {
    console[level] = function () {
      pushConsole(level, Array.prototype.slice.call(arguments));
      return originalConsole[level].apply(console, arguments);
    };
  });

  // ---------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------
  function safeStringify(body) {
    if (body == null) return undefined;
    if (typeof body === "string") return truncate(body, 2000);
    try {
      return truncate(JSON.stringify(body), 2000);
    } catch (e) {
      return "[body tidak bisa dibaca]";
    }
  }

  function extractHeaders(headers) {
    var out = {};
    if (!headers) return out;
    if (typeof headers.forEach === "function") {
      headers.forEach(function (v, k) {
        out[k] = v;
      });
      return out;
    }
    if (typeof headers === "object") return headers;
    return out;
  }

  function truncate(str, n) {
    if (typeof str !== "string") return str;
    return str.length > n ? str.slice(0, n) + "…" : str;
  }

  function esc(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------
  function render() {
    tabButtons.forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === state.activeTab);
    });

    if (state.activeTab === "network") renderNetwork();
    else if (state.activeTab === "console") renderConsole();
    else if (state.activeTab === "info") renderInfo();
    else renderSetting();
  }

  function renderNetwork() {
    if (state.selectedNetworkId) {
      var entry = state.network.filter(function (e) {
        return e.id === state.selectedNetworkId;
      })[0];
      if (entry) return renderNetworkDetail(entry);
    }
    if (state.network.length === 0) {
      bodyEl.innerHTML =
        '<div class="td-empty">Belum ada request. Lakukan sesuatu di halaman ini — fetch dan XHR akan muncul di sini.</div>';
      return;
    }
    var rows = state.network
      .slice()
      .reverse()
      .map(function (e) {
        return (
          '<div class="td-row" data-id="' +
          e.id +
          '">' +
          '<span class="m">' +
          esc(e.method) +
          "</span>" +
          '<span class="u">' +
          esc(e.url) +
          "</span>" +
          '<span class="s ' +
          statusClass(e.status) +
          '">' +
          (e.status || "err") +
          "</span>" +
          '<span class="d">' +
          e.duration +
          "ms</span>" +
          "</div>"
        );
      })
      .join("");
    bodyEl.innerHTML = rows;
    bodyEl.querySelectorAll(".td-row").forEach(function (row) {
      row.addEventListener("click", function () {
        state.selectedNetworkId = row.getAttribute("data-id");
        render();
      });
    });
  }

  function renderNetworkDetail(e) {
    bodyEl.innerHTML =
      '<div class="td-row" data-back="1"><span class="u">← ' +
      esc(e.method) +
      " " +
      esc(e.url) +
      "</span></div>" +
      '<div class="td-detail">' +
      "<h4>Status</h4><pre>" +
      (e.status || "gagal") +
      " · " +
      e.duration +
      "ms</pre>" +
      "<h4>Request Headers</h4><pre>" +
      esc(JSON.stringify(e.requestHeaders || {}, null, 2)) +
      "</pre>" +
      "<h4>Request Body</h4><pre>" +
      esc(e.requestBody || "(kosong)") +
      "</pre>" +
      "<h4>Response Headers</h4><pre>" +
      esc(JSON.stringify(e.responseHeaders || {}, null, 2)) +
      "</pre>" +
      "<h4>Response Preview</h4><pre>" +
      esc(e.responsePreview || e.error || "(tidak ada preview)") +
      "</pre>" +
      "</div>";
    bodyEl.querySelector("[data-back]").addEventListener("click", function () {
      state.selectedNetworkId = null;
      render();
    });
  }

  function renderConsole() {
    if (state.console.length === 0) {
      bodyEl.innerHTML =
        '<div class="td-empty">Belum ada log. console.log/warn/error dari halaman ini akan muncul di sini.</div>';
      return;
    }
    bodyEl.innerHTML = state.console
      .slice()
      .reverse()
      .map(function (e) {
        return (
          '<div class="td-consoleline td-c-' +
          e.level +
          '">' +
          esc(e.message) +
          "</div>"
        );
      })
      .join("");
  }

  function renderInfo() {
    var rows = [
      ["URL", location.href],
      ["User Agent", navigator.userAgent],
      ["Viewport", window.innerWidth + " × " + window.innerHeight],
      ["Waktu", new Date().toLocaleString("id-ID")],
      ["Session", sessionId],
      ["Sync ke dashboard", syncEnabled ? "aktif" : "nonaktif"],
    ];
    bodyEl.innerHTML =
      '<div class="td-info">' +
      rows
        .map(function (r) {
          return (
            '<div class="r"><span class="k">' +
            esc(r[0]) +
            '</span><span class="v" title="' +
            esc(r[1]) +
            '">' +
            esc(r[1]) +
            "</span></div>"
          );
        })
        .join("") +
      "</div>";
  }

  function renderSetting() {
    bodyEl.innerHTML =
      '<div class="td-setting">' +
      '<div class="td-setrow"><span>Tema panel gelap</span><button class="td-switch ' +
      (state.dark ? "on" : "") +
      '" data-act="theme"><i></i></button></div>' +
      '<div class="td-setrow"><span>Posisi tombol</span><button class="td-btn" data-act="corner">' +
      (state.corner === "br" ? "kanan → kiri" : "kiri → kanan") +
      "</button></div>" +
      '<div class="td-setrow"><span>Bersihkan log</span><button class="td-btn" data-act="clear">Clear</button></div>' +
      '<div class="td-setrow"><span>Matikan panel</span><button class="td-btn danger" data-act="destroy">Destroy</button></div>' +
      "</div>";

    bodyEl.querySelector('[data-act="theme"]').addEventListener("click", function () {
      state.dark = !state.dark;
      panel.classList.toggle("dark", state.dark);
      panel.classList.toggle("light", !state.dark);
      render();
    });
    bodyEl.querySelector('[data-act="corner"]').addEventListener("click", function () {
      state.corner = state.corner === "br" ? "bl" : "br";
      applyCorner();
      render();
    });
    bodyEl.querySelector('[data-act="clear"]').addEventListener("click", function () {
      state.network = [];
      state.console = [];
      render();
    });
    bodyEl.querySelector('[data-act="destroy"]').addEventListener("click", destroy);
  }

  // ---------------------------------------------------------------------
  // Destroy — restores fetch/XHR/console, removes all DOM
  // ---------------------------------------------------------------------
  function destroy() {
    if (originalFetch) window.fetch = originalFetch;
    XMLHttpRequest.prototype.open = originalXHROpen;
    XMLHttpRequest.prototype.send = originalXHRSend;
    XMLHttpRequest.prototype.setRequestHeader = originalSetHeader;
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    host.remove();
    window.__tapdeskActive = false;
    delete window.tapdesk;
  }

  window.tapdesk = {
    destroy: destroy,
    sessionId: sessionId,
  };
})();
