const SCREEN_TITLES = {
  home: "Dashboard",
  courses: "FÃ¤cher",
  challenges: "Challenges",
  community: "Community",
  cards: "Karteikarten",
  quiz: "Quiz",
  typing: "Tippen",
  matching: "Zuordnen",
  overview: "Pool-Verwaltung",
  stats: "Statistiken",
  gap: "KI-LÃ¼ckentext",
  aibot: "KI-Assistent",
  profile: "Profil",
  shop: "Belohnungen",
  pass: "Lern-Pass",
};

function goTo(name, opts = {}) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.querySelectorAll(".rail-btn[data-s]").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".bn-item[data-s]").forEach((b) => b.classList.remove("active"));
  document.getElementById("screen-" + name)?.classList.add("active");
  document.getElementById("rb-" + name)?.classList.add("active");
  document.querySelector(`.bn-item[data-s="${name}"]`)?.classList.add("active");
  const titleEl = document.getElementById("tb-title");
  const hideTopbarTitleOn = new Set(["courses", "challenges", "community", "aibot", "profile", "shop", "pass", "overview", "stats", "gap"]);
  titleEl.textContent = SCREEN_TITLES[name] || name.toUpperCase();
  titleEl.style.display = hideTopbarTitleOn.has(name) ? "none" : "";
  closeUserMenu();
  if (name === "cards") initCards();
  else if (name === "quiz") startQuiz();
  else if (name === "typing") startTyping();
  else if (name === "matching") startMatch();
  else if (name === "courses") renderCourses();
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
}

