/* ===================== LEDGER CLIENT =====================
 * Talks to the teacher's Apps Script backend (see backend/Code.gs).
 * Writes: queued events POSTed as text/plain (no preflight) every 30 s and on page hide.
 * Reads: JSONP (script tag), which works from any origin including file://.
 */
var Ledger = (function () {
  var url = (window.LORE_CONFIG && LORE_CONFIG.backend) || '';
  var ident = null, queue = [], flushing = false, lastInput = Date.now(), cbN = 0, status = 'unknown'; // unknown | ok | offline
  function enabled() { return !!url; }
  function identify(klass, name) { ident = { klass: String(klass || '').trim(), name: String(name || '').trim() }; }
  function identity() { return ident; }
  function push(ev) { if (!enabled() || !ident || !ident.klass) return; ev.at = ev.at || Date.now(); queue.push(ev); if (queue.length > 400) queue.splice(0, queue.length - 400); if (queue.length >= 25) flush(); }
  function flush(useBeacon) {
    if (!enabled() || !ident || !queue.length || (flushing && !useBeacon)) return;
    if (status !== 'ok') return; // hold events until the ledger is reachable (sign-in), then send them all
    var body = JSON.stringify({ v: 1, 'class': ident.klass, name: ident.name, events: queue.splice(0, queue.length) });
    if (useBeacon && navigator.sendBeacon) { try { navigator.sendBeacon(url, body); return; } catch (e) {} }
    flushing = true;
    try {
      fetch(url, { method: 'POST', mode: 'no-cors', credentials: 'include', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body, keepalive: !!useBeacon })
        .then(function () { flushing = false; }, function () { flushing = false; });
    } catch (e) { flushing = false; }
  }
  function jsonp(params, cb, timeoutMs) {
    if (!enabled()) { cb({ ok: false, error: 'no backend' }); return; }
    var name = '__lore_cb' + (++cbN), done = false, s = document.createElement('script');
    var qs = Object.keys(params).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
    window[name] = function (data) { if (done) return; done = true; try { delete window[name]; } catch (e) { window[name] = undefined; } s.remove(); cb(data || { ok: false }); };
    s.onerror = function () { if (done) return; done = true; s.remove(); cb({ ok: false, error: 'network' }); };
    s.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + qs + '&callback=' + name + '&_=' + Date.now();
    document.head.appendChild(s);
    setTimeout(function () { if (!done) { done = true; s.remove(); cb({ ok: false, error: 'timeout' }); } }, timeoutMs || 20000);
  }
  function hello(klass, name, cb) { jsonp({ action: 'hello', 'class': klass, name: name }, function (res) { status = res && res.ok ? 'ok' : 'offline'; cb(res); }, 12000); }
  function lands(klass, cb) { jsonp({ action: 'lands', 'class': klass }, function (res) { status = res && (res.ok || res.error === 'unknown action') ? 'ok' : 'offline'; cb(res || { ok: false }); }, 12000); }
  function setLands(key, klass, list, cb) { jsonp({ action: 'setlands', key: key, 'class': klass, lands: list.join(',') }, cb, 30000); }
  function setClasses(key, list, cb) { jsonp({ action: 'setclasses', key: key, classes: list.join(',') }, cb, 30000); }
  function ping(cb) { jsonp({ action: 'ping' }, function (res) { status = res && res.ok ? 'ok' : 'offline'; if (cb) cb(status); }, 12000); }
  function getStatus() { return status; }
  function ledger(key, cb) { jsonp({ action: 'ledger', key: key }, cb, 40000); }
  function player(key, id, cb) { jsonp({ action: 'player', key: key, id: id }, cb, 30000); }
  function purge(key, klass, cb) { jsonp({ action: 'purge', key: key, 'class': klass }, cb, 40000); }
  function active() { return document.visibilityState === 'visible' && (Date.now() - lastInput) < 90000; }
  ['keydown', 'pointerdown', 'touchstart'].forEach(function (evn) { try { window.addEventListener(evn, function () { lastInput = Date.now(); }, { passive: true }); } catch (e) {} });
  setInterval(function () { flush(); }, 30000);
  setInterval(function () { if (ident && status !== 'ok' && document.visibilityState === 'visible') ping(function (st) { if (st === 'ok') { flush(); try { window.dispatchEvent(new CustomEvent('ledger-online')); } catch (e) {} } }); }, 60000);
  try { window.addEventListener('pagehide', function () { flush(true); }); document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') flush(true); }); } catch (e) {}
  return { enabled: enabled, identify: identify, identity: identity, push: push, flush: flush, hello: hello, lands: lands, setLands: setLands, setClasses: setClasses, ping: ping, status: getStatus, ledger: ledger, player: player, purge: purge, active: active };
})();
