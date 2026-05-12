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

// ── PWA MANIFEST ──────────────────────────────────────────────
(function () {
  const manifest = {
    name: "Kivo",
    short_name: "Kivo",
    description: "Kivo Lernplattform",
    start_url: ".",
    display: "standalone",
    background_color: "#1E1E1E",
    theme_color: "#1E1E1E",
    icons: [
      {
        src:
          "data:image/svg+xml," +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="32" fill="#1E1E1E"/><circle cx="96" cy="88" r="44" fill="#6AC28A"/><text x="96" y="104" font-size="44" text-anchor="middle" fill="#1E1E1E" font-family="sans-serif" font-weight="900">K</text></svg>'
          ),
        sizes: "192x192",
        type: "image/svg+xml",
      },
    ],
  };
  const link = document.createElement("link");
  link.rel = "manifest";
  link.href = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: "application/json" }));
  document.head.appendChild(link);
})();

window.addEventListener("DOMContentLoaded", () => {
  userCurrency = parseInt(lsGet("kivo_currency", "0")) || 0;
  loadState();
  initAuth();
  checkShareUrl();
  updateNavIcons();
  initAiChatPersistence();
});

