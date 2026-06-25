/* ============================================================
   voice.js — shared Cantonese voice picker for the whole site
   Include on any page with:  <script src="voice.js"></script>
   - Adds a floating "Voice" button + panel
   - Lets the user pick which installed voice to use
   - Saves the choice in localStorage (shared across every page
     on the same domain, so it stays consistent everywhere)
   - Intercepts speechSynthesis.speak() and forces the chosen
     voice on every Chinese utterance — no per-app changes needed
============================================================ */
(function () {
  if (!('speechSynthesis' in window)) return;
  var KEY = 'canto:voiceURI';
  var synth = window.speechSynthesis;
  var chosen = null;

  function ls(get, k, v) {
    try { return get ? localStorage.getItem(k) : localStorage.setItem(k, v); }
    catch (e) { return null; }
  }
  function score(v) {
    var t = (v.lang + ' ' + v.name).toLowerCase(), s = 0;
    if (/zh-hk|yue|cantonese|粵|廣/.test(t)) s += 10;
    if (/zh-hant|zh-tw/.test(t)) s += 3;
    if (/^zh/.test(v.lang)) s += 1;
    return s;
  }
  function chineseVoices() {
    var all = synth.getVoices() || [];
    var zh = all.filter(function (v) { return score(v) > 0; });
    zh.sort(function (a, b) { return score(b) - score(a) || a.name.localeCompare(b.name); });
    return zh.length ? zh : all; // fall back to all voices if none match
  }
  function pickChosen() {
    var list = chineseVoices();
    if (!list.length) { chosen = null; return; }
    var saved = ls(true, KEY);
    chosen = (saved && list.filter(function (v) { return v.voiceURI === saved; })[0]) || list[0] || null;
  }

  /* --- force the chosen voice on every Chinese utterance --- */
  if (!synth.__cantoPatched) {
    var orig = synth.speak.bind(synth);
    synth.speak = function (u) {
      try { if (u && /^zh|yue/i.test(u.lang || '') && chosen) u.voice = chosen; } catch (e) {}
      return orig(u);
    };
    synth.__cantoPatched = true;
  }

  window.CantoVoice = { get: function () { return chosen; }, refresh: function () { pickChosen(); } };

  /* --- floating picker UI (self-contained styles) --- */
  function buildUI() {
    if (document.getElementById('cv-root')) return;
    var css = document.createElement('style');
    css.textContent =
      '#cv-root{position:fixed;right:14px;bottom:14px;z-index:99999;font-family:Inter,system-ui,sans-serif}' +
      '#cv-btn{display:flex;align-items:center;gap:7px;border:none;border-radius:999px;padding:10px 14px;cursor:pointer;' +
        'background:#1d1d2e;color:#eef0fb;font-weight:600;font-size:13px;box-shadow:0 8px 22px -10px rgba(0,0,0,.6)}' +
      '#cv-btn:hover{background:#2a2a42}#cv-btn svg{width:16px;height:16px}' +
      '#cv-panel{position:absolute;right:0;bottom:52px;width:270px;background:#1d1d2e;color:#eef0fb;border:1px solid rgba(238,240,251,.14);' +
        'border-radius:16px;padding:15px;box-shadow:0 18px 44px -18px rgba(0,0,0,.75);display:none}' +
      '#cv-panel.open{display:block}' +
      '#cv-panel h4{font-size:13px;font-weight:700;margin:0 0 4px}' +
      '#cv-panel .cv-sub{font-size:11px;color:#a6a8c4;margin-bottom:10px;line-height:1.4}' +
      '#cv-sel{width:100%;background:#262640;color:#eef0fb;border:1px solid rgba(238,240,251,.18);border-radius:9px;' +
        'padding:9px;font-family:inherit;font-size:13px;margin-bottom:9px}' +
      '#cv-row{display:flex;gap:8px}' +
      '#cv-row button{flex:1;border:1px solid rgba(238,240,251,.18);background:#262640;color:#eef0fb;border-radius:9px;' +
        'padding:9px;font-family:inherit;font-weight:600;font-size:12.5px;cursor:pointer}' +
      '#cv-row button:hover{border-color:#5fb0ff}' +
      '#cv-note{font-size:11px;color:#74769a;margin-top:9px;line-height:1.4}';
    document.head.appendChild(css);

    var root = document.createElement('div');
    root.id = 'cv-root';
    root.innerHTML =
      '<div id="cv-panel" role="dialog" aria-label="Choose Cantonese voice">' +
        '<h4>Cantonese voice</h4>' +
        '<div class="cv-sub">Pick the voice used across every app. Your choice is saved on this device.</div>' +
        '<select id="cv-sel" aria-label="Voice"></select>' +
        '<div id="cv-row"><button id="cv-test">▶ Test</button><button id="cv-close">Done</button></div>' +
        '<div id="cv-note"></div>' +
      '</div>' +
      '<button id="cv-btn" aria-label="Choose Cantonese voice">' +
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9v6h4l5 5V4L8 9H4z"/><path d="M16 8a5 5 0 0 1 0 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
        'Voice</button>';
    document.body.appendChild(root);

    var panel = document.getElementById('cv-panel');
    var sel = document.getElementById('cv-sel');
    var note = document.getElementById('cv-note');

    function populate() {
      var list = chineseVoices();
      sel.innerHTML = '';
      if (!list.length) {
        var o = document.createElement('option');
        o.textContent = 'No voice found on this device';
        sel.appendChild(o); sel.disabled = true;
        note.textContent = 'Install a Chinese (Hong Kong) voice in your device settings, then reopen.';
        return;
      }
      sel.disabled = false;
      list.forEach(function (v) {
        var o = document.createElement('option');
        o.value = v.voiceURI;
        var canto = /zh-hk|yue|cantonese|粵|廣/i.test(v.lang + ' ' + v.name);
        o.textContent = v.name + ' (' + v.lang + ')' + (canto ? '  ✓ Cantonese' : '');
        if (chosen && v.voiceURI === chosen.voiceURI) o.selected = true;
        sel.appendChild(o);
      });
      var anyCanto = list.some(function (v) { return /zh-hk|yue|cantonese|粵|廣/i.test(v.lang + ' ' + v.name); });
      note.textContent = anyCanto ? 'Voices marked ✓ are true Cantonese.' :
        'No true Cantonese voice detected — these are other Chinese voices. Hong Kong / yue is best if you can install it.';
    }

    document.getElementById('cv-btn').onclick = function () { panel.classList.toggle('open'); };
    document.getElementById('cv-close').onclick = function () { panel.classList.remove('open'); };
    sel.onchange = function () { ls(false, KEY, sel.value); pickChosen(); };
    document.getElementById('cv-test').onclick = function () {
      try { synth.cancel(); var u = new SpeechSynthesisUtterance('你好,多謝!'); u.lang = 'zh-HK';
        if (chosen) u.voice = chosen; u.rate = 0.85; synth.speak(u); } catch (e) {}
    };

    populate();
    synth.addEventListener('voiceschanged', function () { pickChosen(); populate(); });
  }

  pickChosen();
  if (synth.getVoices().length === 0) { synth.onvoiceschanged = function () { pickChosen(); }; }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildUI);
  else buildUI();
})();
