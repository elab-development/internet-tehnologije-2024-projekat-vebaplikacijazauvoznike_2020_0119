// intro.js
// === FAVICON BY THEME ===
(function () {
  function setFavicon(theme) {
    var favicon = document.getElementById("dynamic-favicon");
    if (!favicon) return; // nema <link id="dynamic-favicon"> u head-u
    favicon.href =
      theme === "dark"
        ? "../images/transio_favicon_01.02.png"
        : "../images/transio_favicon_01.01.png";
  }

  try {
    var mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    // inicijalno stanje
    setFavicon(mq && mq.matches ? "dark" : "light");

    // slušaj promenu system theme-a (Safari stariji nema addEventListener na mq)
    if (mq && typeof mq.addEventListener === "function") {
      mq.addEventListener("change", function (e) {
        setFavicon(e.matches ? "dark" : "light");
      });
    } else if (mq && typeof mq.addListener === "function") {
      mq.addListener(function (e) {
        setFavicon(e.matches ? "dark" : "light");
      });
    }
  } catch (_) {
    // fallback – samo postavi svetlu varijantu
    setFavicon("light");
  }
})();