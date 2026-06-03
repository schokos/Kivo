const SCREEN_TITLES = {
  home: "Dashboard",
  courses: "Fächer",
  challenges: "Challenges",
  community: "Community",
  overview: "Pool-Verwaltung",
  stats: "Statistiken",
  gap: "KI-Lückentext",
  aibot: "KI-Assistent",
  profile: "Profil",
  shop: "Belohnungen",
  pass: "Lern-Pass",
};

let navCursor = 0;
let navMaxCursor = 0;
let navInitialized = false;

function updateUniversalNavButtons() {
  const backBtn = document.getElementById("universal-back-btn");
  const forwardBtn = document.getElementById("universal-forward-btn");
  const canGoBack = navCursor > 0;
  const canGoForward = navCursor < navMaxCursor;

  if (backBtn) backBtn.style.display = canGoBack ? "inline-flex" : "none";
  if (forwardBtn) forwardBtn.style.display = canGoForward ? "inline-flex" : "none";
}

function ensureNavInitialized(activeScreen = "home") {
  if (navInitialized) return;

  const state = window.history.state;
  if (state && Number.isInteger(state.kivoNavCursor) && state.kivoScreen) {
    navCursor = state.kivoNavCursor;
    navMaxCursor = navCursor;
  } else {
    window.history.replaceState(
      { ...(state || {}), kivoScreen: activeScreen, kivoNavCursor: 0 },
      "",
    );
    navCursor = 0;
    navMaxCursor = 0;
  }

  window.addEventListener("popstate", (event) => {
    const screen = event.state?.kivoScreen;
    if (!screen) {
      updateUniversalNavButtons();
      return;
    }
    navCursor = Number.isInteger(event.state.kivoNavCursor) ? event.state.kivoNavCursor : 0;
    goTo(screen, { fromHistory: true });
  });

  navInitialized = true;
  updateUniversalNavButtons();
}

function getCurrentScreenName() {
  const activeScreen = document.querySelector(".screen.active")?.id || "";
  return activeScreen.startsWith("screen-") ? activeScreen.slice(7) : "home";
}

function universalBack() {
  if (navCursor > 0) window.history.back();
}

function universalForward() {
  if (navCursor < navMaxCursor) window.history.forward();
}

function refreshCurrentScreen(opts = {}) {
  goTo(getCurrentScreenName(), { fromHistory: true, ...opts });
}

function goTo(name, opts = {}) {
  ensureNavInitialized(getCurrentScreenName());

  if (!opts.fromHistory) {
    navCursor = Math.max(0, Number(navCursor) || 0);
    if (opts.replaceHistory) {
      window.history.replaceState(
        { ...(window.history.state || {}), kivoScreen: name, kivoNavCursor: navCursor },
        "",
      );
    } else {
      navCursor += 1;
      navMaxCursor = navCursor;
      window.history.pushState(
        { ...(window.history.state || {}), kivoScreen: name, kivoNavCursor: navCursor },
        "",
      );
    }
  }

  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.querySelectorAll(".rail-btn[data-s]").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".bn-item[data-s]").forEach((b) => b.classList.remove("active"));
  document.getElementById("screen-" + name)?.classList.add("active");
  document.getElementById("rb-" + name)?.classList.add("active");
  document.querySelector(`.bn-item[data-s="${name}"]`)?.classList.add("active");
  const titleEl = document.getElementById("tb-title");
  const coursesBackBtn = document.getElementById("courses-topbar-back");
  const aiHistoryBtn = document.getElementById("aibot-history-btn");
  const hideTopbarTitleOn = new Set();
  titleEl.textContent = SCREEN_TITLES[name] || name.toUpperCase();
  titleEl.style.display = hideTopbarTitleOn.has(name) ? "none" : "";
  if (aiHistoryBtn) aiHistoryBtn.style.display = name === "aibot" ? "inline-flex" : "none";
  if (coursesBackBtn && name !== "courses") coursesBackBtn.classList.remove("show");
  closeUserMenu();

  if (name === "courses") renderCourses();
  else if (name === "challenges") renderChallenges();
  else if (name === "community") renderCommunity();
  else if (name === "overview") renderOverview();
  else if (name === "stats") renderStats();
  else if (name === "gap") generateGapText();
  else if (name === "aibot") renderAiBot();
  else if (name === "profile" && !opts.keepProfileContent) renderProfile();
  else if (name === "shop") renderShop();
  else if (name === "pass") renderPass();
  else if (name === "home") updateHomeStats();

  updateUniversalNavButtons();
}
