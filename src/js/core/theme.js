(function () {
  const STORAGE_KEY = "kivo_theme_mode";
  const VALID_MODES = new Set(["light", "dark", "system", "auto"]);
  const LIGHT_THEME_COLOR = "#EFF1F0";
  const DARK_THEME_COLOR = "#121712";
  const AUTO_LIGHT_START_HOUR = 7;
  const AUTO_DARK_START_HOUR = 19;
  const LOGO_LIGHT = "assets/logo_light.png";
  const LOGO_DARK = "assets/logo_dark.png";
  const GITHUB_BLACK = "assets/GitHub_Logos/SVG/GitHub_Invertocat_Black_Clearspace.svg";
  const GITHUB_WHITE = "assets/GitHub_Logos/SVG/GitHub_Invertocat_White_Clearspace.svg";

  let currentMode = "system";
  let currentEffective = "light";
  let mediaQueryList = null;
  let mediaChangeHandler = null;
  let autoTimer = null;

  function isValidMode(mode) {
    return VALID_MODES.has(mode);
  }

  function normalizeMode(mode) {
    return isValidMode(mode) ? mode : "system";
  }

  function readStoredMode() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return "system";
      const parsed = JSON.parse(raw);
      return normalizeMode(parsed);
    } catch (error) {
      return "system";
    }
  }

  function writeStoredMode(mode) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeMode(mode)));
    } catch (error) {}
  }

  function getSystemTheme() {
    if (typeof window.matchMedia !== "function") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function getAutoTheme() {
    const hour = new Date().getHours();
    return hour >= AUTO_LIGHT_START_HOUR && hour < AUTO_DARK_START_HOUR ? "light" : "dark";
  }

  function resolveEffectiveTheme(mode) {
    const m = normalizeMode(mode);
    if (m === "light") return "light";
    if (m === "dark") return "dark";
    if (m === "auto") return getAutoTheme();
    return getSystemTheme();
  }

  function updateThemeColorMeta(effectiveTheme) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    meta.setAttribute("content", effectiveTheme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
  }

  function getLogoPathByTheme(effectiveTheme) {
    return effectiveTheme === "dark" ? LOGO_DARK : LOGO_LIGHT;
  }

  function getGitHubIconPathByTheme(effectiveTheme) {
    return effectiveTheme === "dark" ? GITHUB_WHITE : GITHUB_BLACK;
  }

  function updateThemeAssets(effectiveTheme) {
    const logoPath = getLogoPathByTheme(effectiveTheme);
    const githubPath = getGitHubIconPathByTheme(effectiveTheme);

    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) favicon.setAttribute("href", logoPath);

    const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (appleTouchIcon) appleTouchIcon.setAttribute("href", logoPath);

    const railGitHubIcon = document.getElementById("github-rail-icon");
    if (railGitHubIcon) railGitHubIcon.setAttribute("src", githubPath);

    const profileGitHubIcon = document.getElementById("profile-github-icon");
    if (profileGitHubIcon) profileGitHubIcon.setAttribute("src", githubPath);
  }

  function applyTheme(effectiveTheme) {
    currentEffective = effectiveTheme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = currentEffective;
    updateThemeColorMeta(currentEffective);
    updateThemeAssets(currentEffective);
  }

  function clearSystemListener() {
    if (!mediaQueryList || !mediaChangeHandler) return;
    try {
      mediaQueryList.removeEventListener("change", mediaChangeHandler);
    } catch (error) {
      mediaQueryList.removeListener(mediaChangeHandler);
    }
    mediaQueryList = null;
    mediaChangeHandler = null;
  }

  function clearAutoTimer() {
    if (!autoTimer) return;
    clearTimeout(autoTimer);
    autoTimer = null;
  }

  function scheduleAutoTick() {
    clearAutoTimer();
    const now = new Date();
    const next = new Date(now);
    next.setMinutes(now.getMinutes() + 1, 0, 0);
    autoTimer = setTimeout(() => {
      if (currentMode !== "auto") return;
      applyTheme(resolveEffectiveTheme("auto"));
      scheduleAutoTick();
    }, Math.max(1000, next.getTime() - now.getTime()));
  }

  function installDynamicListeners(mode) {
    clearSystemListener();
    clearAutoTimer();
    if (mode === "system" && typeof window.matchMedia === "function") {
      mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
      mediaChangeHandler = () => applyTheme(resolveEffectiveTheme("system"));
      try {
        mediaQueryList.addEventListener("change", mediaChangeHandler);
      } catch (error) {
        mediaQueryList.addListener(mediaChangeHandler);
      }
      return;
    }
    if (mode === "auto") {
      scheduleAutoTick();
    }
  }

  function setThemeMode(mode, options = {}) {
    const nextMode = normalizeMode(mode);
    const shouldPersist = options.persist !== false;
    currentMode = nextMode;
    if (shouldPersist) writeStoredMode(nextMode);
    applyTheme(resolveEffectiveTheme(nextMode));
    installDynamicListeners(nextMode);
    return { mode: currentMode, effective: currentEffective };
  }

  function initTheme() {
    const initialMode = readStoredMode();
    setThemeMode(initialMode, { persist: false });
  }

  function getThemeMode() {
    return currentMode;
  }

  function getEffectiveTheme() {
    return currentEffective;
  }

  window.KivoTheme = {
    initTheme,
    setThemeMode,
    getThemeMode,
    getEffectiveTheme,
    resolveEffectiveTheme,
    normalizeMode,
    getLogoPathByTheme,
    getGitHubIconPathByTheme,
  };
})();
