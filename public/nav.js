/* nav.js — shared bottom navigation, shown on every lesson page.
   Mirrors the app shell's Today / Line / Practice bar; the shell
   (index.html) opens the matching tab via the URL hash. */
(function () {
  if (document.getElementById("cn-nav")) return;
  var isPractice = /listening-dojo/.test(location.pathname);

  var css = document.createElement("style");
  css.textContent =
    "#cn-nav{position:fixed;left:0;right:0;bottom:0;z-index:99990;display:flex;justify-content:center;" +
    "background:rgba(7,11,20,.92);border-top:1px solid #1d2842;" +
    "padding:8px 10px calc(10px + env(safe-area-inset-bottom));backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}" +
    "#cn-nav .in{display:flex;width:100%;max-width:560px}" +
    "#cn-nav a{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;color:#5f6b8c;text-decoration:none;" +
    'font-family:"Archivo","Inter",system-ui,sans-serif;font-weight:600;font-size:10.5px;letter-spacing:.05em;padding:6px 0 2px;border-radius:12px}' +
    "#cn-nav a.on{color:#ff7a8a}" +
    "#cn-nav a:focus-visible{outline:2px solid #ff5468;outline-offset:2px}" +
    "#cn-nav svg{width:22px;height:22px}" +
    "body{padding-bottom:calc(78px + env(safe-area-inset-bottom))}";
  document.head.appendChild(css);

  var I = {
    today:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>',
    line:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="5" r="2.2"/><circle cx="18" cy="19" r="2.2"/><path d="M6 7.2V15a4 4 0 0 0 4 4h5.8"/></svg>',
    practice:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4M7.5 6v12M12 3v18M16.5 7v10M21 10v4"/></svg>',
  };

  var nav = document.createElement("nav");
  nav.id = "cn-nav";
  nav.setAttribute("aria-label", "App navigation");
  nav.innerHTML =
    '<div class="in">' +
    '<a href="/index.html">' + I.today + "Today</a>" +
    '<a href="/index.html#line"' + (isPractice ? "" : ' class="on"') + ">" + I.line + "Line</a>" +
    '<a href="/index.html#practice"' + (isPractice ? ' class="on"' : "") + ">" + I.practice + "Practice</a>" +
    "</div>";
  document.body.appendChild(nav);
})();
