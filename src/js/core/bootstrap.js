function checkShareUrl() {
  const params = new URLSearchParams(location.search);
  const shareKey = params.get("share");
  if (!shareKey) return;
  const { l, p } = spKey(decodeURIComponent(shareKey));
  if (POOLS[l]?.[p]) {
    setActivePool(decodeURIComponent(shareKey));
    toast('Pool "' + p + '" aktiviert!');
  }
}

(function () {
  const eff = window.KivoTheme?.getEffectiveTheme?.() || "dark";
  const iconPath = eff === "dark" ? "assets/logo_dark.png" : "assets/logo_light.png";
  const themeColor = eff === "dark" ? "#121712" : "#EFF1F0";
  const manifest = {
    name: "Kivo",
    short_name: "Kivo",
    description: "Kivo Lernplattform",
    start_url: ".",
    display: "standalone",
    background_color: themeColor,
    theme_color: themeColor,
    icons: [
      {
        src: iconPath,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: iconPath,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
  const link = document.createElement("link");
  link.rel = "manifest";
  link.href = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: "application/json" }));
  document.head.appendChild(link);
})();

window.addEventListener("DOMContentLoaded", () => {
  if (typeof marked !== "undefined" && !marked.__kivoReady) {
    marked.setOptions({
      gfm: true,
      breaks: true,
      mangle: false,
      headerIds: false
    });
    marked.__kivoReady = true;
  }
  window.KivoTheme?.initTheme?.();
  userCurrency = parseInt(lsGet("kivo_currency", "0")) || 0;
  loadState();
  initAuth();
  checkShareUrl();
  updateNavIcons();
  initAiChatPersistence();
});


