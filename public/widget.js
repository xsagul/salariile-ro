/*!
 * salariile.ro — script de integrare a widgetului (embed hibrid)
 * Găsește <div class="salariile-widget">, injectează iframe-ul calculatorului,
 * adaugă linkul de credit în DOM-ul paginii-gazdă (crawlable, contează pentru SEO)
 * și dimensionează iframe-ul automat prin postMessage (fără height fix).
 *
 * Cod de integrare pentru gazdă:
 *   <div class="salariile-widget"></div>
 *   <script src="https://salariile.ro/widget.js" async></script>
 *
 * Opțional pe div: data-brut="4325" (valoare inițială), data-height="790" (fallback).
 */
(function () {
  "use strict";
  var ORIGIN = "https://salariile.ro";
  var FRAME = ORIGIN + "/widget/frame";
  var MIN_HEIGHT = 360;
  var MAX_HEIGHT = 900;

  function clampHeight(height) {
    var n = Math.ceil(Number(height) || 0);
    if (n < MIN_HEIGHT) return MIN_HEIGHT;
    if (n > MAX_HEIGHT) return MAX_HEIGHT;
    return n;
  }

  function initOne(el) {
    if (el.getAttribute("data-salariile-init")) return;
    el.setAttribute("data-salariile-init", "1");

    var iframe = document.createElement("iframe");
    var brut = el.getAttribute("data-brut");
    iframe.src = FRAME + (brut ? "?brut=" + encodeURIComponent(brut) : "");
    iframe.title = "Calculator salariu net 2026";
    iframe.loading = "lazy";
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    iframe.style.cssText =
      "width:100%;max-width:420px;height:" + clampHeight(el.getAttribute("data-height") || 790) + "px;border:1px solid #e7e5e4;border-radius:8px;display:block;box-sizing:border-box";
    iframe.height = String(clampHeight(el.getAttribute("data-height") || 790));

    // Linkul de credit stă în DOM-ul GAZDEI (nu în iframe), ca să fie crawlabil.
    // Ancoră de brand, conform politicii Google anti widget-link-scheme.
    var credit = el.querySelector(".salariile-credit");
    if (credit) {
      el.insertBefore(iframe, credit);
    } else {
      el.appendChild(iframe);
      var a = document.createElement("a");
      a.className = "salariile-credit";
      a.href = ORIGIN + "?utm_source=widget";
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Calculator de salarii oferit de salariile.ro";
      a.style.cssText =
        "display:block;max-width:420px;margin-top:8px;font:14px/1.4 system-ui,sans-serif;color:#57534e";
      el.appendChild(a);
    }
  }

  function scan() {
    var nodes = document.querySelectorAll(".salariile-widget");
    for (var i = 0; i < nodes.length; i++) initOne(nodes[i]);
  }

  // Auto-resize: ascultă înălțimea trimisă de fiecare iframe și o aplică.
  // Verificăm originea (doar mesaje de la salariile.ro) și potrivim iframe-ul
  // prin contentWindow, ca un mesaj să nu poată redimensiona alt iframe.
  window.addEventListener("message", function (e) {
    if (e.origin !== ORIGIN) return;
    var d = e.data;
    if (!d || d.type !== "salariile:height" || !d.height) return;
    var height = clampHeight(d.height);
    var frames = document.getElementsByTagName("iframe");
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].contentWindow === e.source) {
        frames[i].height = String(height);
        frames[i].style.height = height + "px";
        break;
      }
    }
  });

  // Expune init() pentru pagini care randează placeholderul după încărcarea scriptului
  // (SPA-uri, React). Rulează automat acum și la DOMContentLoaded.
  window.SalariileWidget = { init: scan };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scan);
  } else {
    scan();
  }
})();
