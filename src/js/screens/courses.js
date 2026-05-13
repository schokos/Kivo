// -- SUBJECT HUB: Setup Assistant -------------------------------------------
let subjectsCatalog = null;
let selectedSubjectId = null;
let activeEmbeddedCourse = null;
let coursesFlowStep = "subject-select";
let activeCategory = null;
let coursesViewMode = "sections";
let previousFlowStep = "course-categories";
let isCourseClosing = false;
let lastCourseTriggerMotion = null;

const EXAM_CTA_WINDOW_DAYS = 7;
const COURSE_TRANSITION_MS = 360;

const CATEGORY_DEFS = [
  { id: "recent", title: "Zuletzt verwendet", icon: "🕒", description: "Direkt da weitermachen, wo du aufgehört hast." },
  { id: "popular", title: "Beliebte Kurse", icon: "🔥", description: "Die aktuell meistgewählten Lernmodule." },
  { id: "updates", title: "Neues Update", icon: "✨", description: "Frisch aktualisierte Inhalte mit neuen Aufgaben." },
  { id: "recommended", title: "Empfohlen", icon: "⭐", description: "Passend zu deinem Lernstand ausgewählt." },
  { id: "newest", title: "Zuletzt hinzugefügt", icon: "🆕", description: "Die neuesten Kurse in diesem Fach." },
  { id: "exam-boost", title: "Prüfungsvorbereitung", icon: "🎯", description: "Speziallektionen für den nächsten Test." },
  { id: "quick-win", title: "Schnelle Erfolge", icon: "⚡", description: "Kompakte Sessions mit großem Lernertrag." },
  { id: "deep-dive", title: "Deep Dive", icon: "🧠", description: "Vertiefungen für schwierige Themen." },
  { id: "creative", title: "Kreativ lernen", icon: "🎨", description: "Abwechslungsreiche Methoden für mehr Spaß." },
  { id: "team-ready", title: "Moodle & Teams ready", icon: "💬", description: "Direkt verknüpft mit deinen Aufgabenräumen." },
  { id: "misc", title: "Sonstiges", icon: "📦", description: "Alles, was in keine andere Box passt." },
];

const SUBJECT_DEMO = {
  english: {
    nextLesson: {
      date: "2026-05-15",
      start: "08:10",
      room: "R-203",
      topic: "Argumentative Writing",
      onlineLabel: "Stunde findet online statt (Teams)",
      onlineUrl: "https://teams.example.com/l/english-live-lesson",
    },
    homework: [
      { topic: "Essay outline zu Climate Debate", dueDate: "2026-05-16", linkLabel: "Moodle", linkUrl: "https://moodle.example.com/english/essay-outline" },
      { topic: "Irregular verbs quiz vorbereiten", dueDate: "2026-05-17", linkLabel: "Teams", linkUrl: "https://teams.example.com/l/english-irregular-verbs" },
      { topic: "Listening notes Unit 8", dueDate: "2026-05-18", linkLabel: "Moodle", linkUrl: "https://moodle.example.com/english/listening-notes" },
    ],
    exams: [
      {
        type: "Klausur",
        topic: "Comment + Mediation",
        date: "2026-05-19",
        linkLabel: "Klausur",
        linkUrl: "https://webuntis.example.com/exams/english-comment-mediation",
      },
      { type: "Test", topic: "Grammar Check: Conditionals", date: "2026-05-27" },
    ],
    categoriesPool: {
      recent: ["vocabulary", "grammar", "debate-lab", "listening-lounge"],
      popular: ["vocabulary", "grammar", "exam-booster", "debate-lab", "writing-studio"],
      updates: ["grammar", "vocabulary", "writing-studio", "speaking-sprint"],
      recommended: ["exam-booster", "vocabulary", "grammar", "reading-radar", "speaking-sprint"],
      newest: ["writing-studio", "reading-radar", "listening-lounge", "exam-booster"],
      "exam-boost": ["exam-booster", "grammar", "writing-studio", "reading-radar"],
      "quick-win": ["speaking-sprint", "vocabulary", "listening-lounge", "grammar"],
      "deep-dive": ["grammar", "writing-studio", "exam-booster", "debate-lab"],
      creative: ["debate-lab", "speaking-sprint", "listening-lounge", "reading-radar"],
      "team-ready": ["exam-booster", "writing-studio", "vocabulary", "grammar"],
      misc: ["culture-bites", "debate-lab", "reading-radar"],
    },
    courseMeta: {
      vocabulary: { tags: ["Empfohlen"], lastUsedAt: "2026-05-12", isRecommended: true },
      grammar: { tags: ["Neues Update", "Klausur-Fokus"], lastUsedAt: "2026-05-11", hasRecentUpdate: true, examFocus: true },
      "exam-booster": { title: "Exam Booster", description: "Fokuslektionen mit Musterlösungen für die Klausur.", tags: ["Neues Update", "Klausur-Fokus"], isRecommended: true, hasRecentUpdate: true, examFocus: true, path: "src/data/subjects/english/courses/grammar/index.html" },
      "debate-lab": { title: "Debate Lab", description: "Sprechtraining mit Pro/Contra-Framework.", tags: ["Empfohlen"], path: "src/data/subjects/english/courses/vocabulary/index.html" },
      "writing-studio": { title: "Writing Studio", description: "Von Einleitung bis Conclusion mit Vorlagen.", tags: ["Neu", "Neues Update"], isNew: true, hasRecentUpdate: true, path: "src/data/subjects/english/courses/grammar/index.html" },
      "listening-lounge": { title: "Listening Lounge", description: "Audio-Drills mit Verständnisfragen.", tags: ["Neu"], isNew: true, path: "src/data/subjects/english/courses/vocabulary/index.html" },
      "reading-radar": { title: "Reading Radar", description: "Strategien für schnelle Textanalyse.", tags: ["Empfohlen"], isRecommended: true, path: "src/data/subjects/english/courses/grammar/index.html" },
      "speaking-sprint": { title: "Speaking Sprint", description: "Kurze tägliche Speaking-Challenges.", tags: ["Neu"], isNew: true, path: "src/data/subjects/english/courses/vocabulary/index.html" },
      "culture-bites": { title: "Culture Bites", description: "Landeskunde in kleinen Lernhappen.", tags: [], path: "src/data/subjects/english/courses/vocabulary/index.html" },
    },
  },
  mathematics: {
    nextLesson: {
      date: "2026-05-14",
      start: "10:25",
      room: "R-109",
      topic: "Quadratische Funktionen",
    },
    homework: [
      { topic: "Aufgabenblatt 7, Nr. 2-8", dueDate: "2026-05-15", linkLabel: "Moodle", linkUrl: "https://moodle.example.com/math/worksheet-7" },
      { topic: "GeoGebra Konstruktion hochladen", dueDate: "2026-05-18", linkLabel: "Teams", linkUrl: "https://teams.example.com/l/math-geogebra" },
    ],
    exams: [
      {
        type: "Test",
        topic: "Lineare Gleichungssysteme",
        date: "2026-05-20",
        linkLabel: "Klausur (WebUntis)",
        linkUrl: "https://webuntis.example.com/exams/math-linear-systems",
      },
    ],
    categoriesPool: {
      recent: ["algebra", "geometrie", "exam-rocket", "mental-math"],
      popular: ["algebra", "geometrie", "proof-lab", "exam-rocket"],
      updates: ["algebra", "proof-lab", "function-maps", "exam-rocket"],
      recommended: ["exam-rocket", "algebra", "function-maps", "mental-math"],
      newest: ["proof-lab", "function-maps", "exam-rocket", "mental-math"],
      "exam-boost": ["exam-rocket", "algebra", "proof-lab", "geometrie"],
      "quick-win": ["mental-math", "algebra", "function-maps", "geometrie"],
      "deep-dive": ["proof-lab", "algebra", "geometrie", "exam-rocket"],
      creative: ["geometrie", "function-maps", "proof-lab", "mental-math"],
      "team-ready": ["exam-rocket", "proof-lab", "algebra", "geometrie"],
      misc: ["math-history", "function-maps", "mental-math"],
    },
    courseMeta: {
      algebra: { tags: ["Empfohlen"], lastUsedAt: "2026-05-13", isRecommended: true },
      geometrie: { tags: ["Neues Update"], hasRecentUpdate: true, lastUsedAt: "2026-05-10" },
      "exam-rocket": { title: "Exam Rocket", description: "Klausurmodus mit Zeittraining und Fehleranalyse.", tags: ["Klausur-Fokus", "Neues Update"], examFocus: true, hasRecentUpdate: true, path: "src/data/subjects/mathematics/courses/algebra/index.html" },
      "proof-lab": { title: "Proof Lab", description: "Beweisstrategien in klaren Mustern.", tags: ["Empfohlen"], isRecommended: true, path: "src/data/subjects/mathematics/courses/geometrie/index.html" },
      "function-maps": { title: "Function Maps", description: "Funktionen lesen, zeichnen und vergleichen.", tags: ["Neu"], isNew: true, path: "src/data/subjects/mathematics/courses/algebra/index.html" },
      "mental-math": { title: "Mental Math", description: "Schnelle Rechenroutinen für den Alltag.", tags: ["Neu"], isNew: true, path: "src/data/subjects/mathematics/courses/algebra/index.html" },
      "math-history": { title: "Math History", description: "Mathe-Ideen und ihre Storys.", tags: [], path: "src/data/subjects/mathematics/courses/geometrie/index.html" },
    },
  },
};

function courseIconForLang(lang) {
  const key = String(lang || "").toLowerCase();
  if (key.includes("engl")) return "&#x1F1EC;&#x1F1E7;";
  if (key.includes("deut")) return "&#x1F1E9;&#x1F1EA;";
  if (key.includes("span")) return "&#x1F1EA;&#x1F1F8;";
  if (key.includes("franz")) return "&#x1F1EB;&#x1F1F7;";
  if (key.includes("ital")) return "&#x1F1EE;&#x1F1F9;";
  if (key.includes("portug")) return "&#x1F1F5;&#x1F1F9;";
  if (key.includes("japan")) return "&#x1F1EF;&#x1F1F5;";
  if (key.includes("korea")) return "&#x1F1F0;&#x1F1F7;";
  if (key.includes("china") || key.includes("mandarin")) return "&#x1F1E8;&#x1F1F3;";
  if (key.includes("mathe")) return "&#x1F4D0;";
  if (key.includes("bio")) return "&#x1F9EC;";
  if (key.includes("chem")) return "&#x2697;&#xFE0F;";
  if (key.includes("phys")) return "&#x1F52D;";
  return "&#x1F4D8;";
}

function ensureCourseHostApi() {
  if (window.KivoCourseHost) return;
  window.KivoCourseHost = {
    getContext() {
      const subject = (subjectsCatalog || []).find((s) => s.id === selectedSubjectId) || null;
      return {
        subjectId: subject?.id || null,
        subjectTitle: subject?.title || "",
        activeKey,
      };
    },
    listPools(subjectTitle) {
      const entries = Object.entries(POOLS[subjectTitle] || {});
      return entries.map(([name, poolObj]) => {
        const key = mkKey(subjectTitle, name);
        const words = flattenPool(poolObj).map((item, id) => ({
          id,
          de: item.de,
          en: item.en,
          cat: item.cat || "",
          known: getKnownIds(key).includes(id),
        }));
        return { name, key, words, isActive: key === activeKey };
      });
    },
    setActivePoolKey(key) {
      setActivePool(key);
      updateHomeStats();
      return { activeKey };
    },
    saveKnownMap(key, knownIds) {
      lsSet("kivo_kn_" + key, Array.isArray(knownIds) ? knownIds : []);
      syncProgress();
      if (key === activeKey) buildVocab();
    },
    addXp(pts) {
      return addXp(pts);
    },
    trackQuest(metric, amount = 1) {
      trackQuest(metric, amount);
    },
    trackSession(ok, no, total) {
      const pct = total ? Math.round((ok / total) * 100) : 0;
      sessions.push({ ok, no, n: total, pct });
      lsSet("kivo_sess", sessions);
      trackQuest("sessions", 1);
      updateHomeStats();
    },
    trackCardReview(key, id, isKnown) {
      const q = isKnown ? 4 : 1;
      srUpdate(key, id, q, false);
      trackQuest("focus", 1);
      updateHomeStats();
    },
  };
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Konnte ${path} nicht laden`);
  return response.json();
}

async function loadSubjectsCatalog() {
  if (subjectsCatalog) return subjectsCatalog;

  const manifest = await fetchJson("src/data/subjects/subjects.json");
  const subjects = await Promise.all((manifest.subjects || []).map(async (item) => {
    const subject = await fetchJson(item.path);
    const courses = (subject.courses || []).map((courseRef) => ({ ...courseRef }));
    return { ...subject, courses };
  }));

  subjectsCatalog = subjects;
  return subjectsCatalog;
}

function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }).format(date);
}

function daysUntil(dateStr) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const examDate = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(examDate.getTime())) return Number.POSITIVE_INFINITY;
  const diff = examDate.getTime() - start.getTime();
  return Math.ceil(diff / 86400000);
}

function getSubjectDemo(subjectId) {
  return SUBJECT_DEMO[subjectId] || {
    nextLesson: null,
    homework: [],
    exams: [],
    categoriesPool: {},
    courseMeta: {},
  };
}

function renderOptionalLinkRow(label, url) {
  if (!label) return "";
  return `<div class="overview-exam-row overview-linkable-row ${url ? "is-clickable" : ""}"
    ${url ? `onclick="window.open('${url}', '_blank', 'noopener,noreferrer')"` : ""}>
    <div class="overview-meta">${label}</div>
    <div class="overview-external-icon" aria-hidden="true" style="${url ? "" : "display:none"}">↗</div>
  </div>`;
}

function getStepIndex(step) {
  const order = ["subject-select", "subject-overview", "course-categories", "course-open"];
  const idx = order.indexOf(step);
  return idx === -1 ? 1 : idx + 1;
}

function setCoursesStep(step) {
  coursesFlowStep = step;
  renderCourses();
}

function setCoursesTopbarBackVisible(visible) {
  const btn = document.getElementById("courses-topbar-back");
  if (!btn) return;
  btn.classList.toggle("show", !!visible);
}

function setCoursesOpenMode(enabled) {
  const screen = document.getElementById("screen-courses");
  if (!screen) return;
  screen.classList.toggle("courses-open-mode", !!enabled);
}

function setCoursesTopbarTitle(subjectTitle) {
  const titleEl = document.getElementById("tb-title");
  if (!titleEl) return;
  const safeSubject = String(subjectTitle || "").trim();
  titleEl.textContent = safeSubject || "Fächer";
  titleEl.style.display = "";
}

function coursesTopbarBack() {
  if (coursesFlowStep === "course-open") {
    closeEmbeddedCourseWithAnimation();
    return;
  }
  if (coursesFlowStep === "course-categories") {
    setCoursesStep("subject-select");
    return;
  }
  if (coursesFlowStep === "subject-overview") {
    setCoursesStep("subject-select");
  }
}

function selectSubject(subjectId) {
  selectedSubjectId = subjectId;
  activeCategory = null;
  coursesViewMode = "sections";
  activeEmbeddedCourse = null;
  setCoursesStep("course-categories");
}

function moveToCourseCategories() {
  coursesViewMode = "sections";
  activeCategory = null;
  setCoursesStep("course-categories");
}

function showAllInCategory(categoryId) {
  activeCategory = categoryId;
  coursesViewMode = "all";
  setCoursesStep("course-categories");
}

function backToAllCategories() {
  coursesViewMode = "sections";
  activeCategory = null;
  setCoursesStep("course-categories");
}

function openEmbeddedCourse(subjectId, courseId, triggerEl) {
  const sourceCard = triggerEl?.closest?.(".assistant-course-card");
  if (sourceCard) {
    const rect = sourceCard.getBoundingClientRect();
    const vw = window.innerWidth || 1;
    const vh = window.innerHeight || 1;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    lastCourseTriggerMotion = {
      dx: Math.round(centerX - vw / 2),
      dy: Math.round(centerY - vh / 2),
      sx: Math.max(0.08, Math.min(1, rect.width / vw)),
      sy: Math.max(0.08, Math.min(1, rect.height / vh)),
    };
  } else {
    lastCourseTriggerMotion = null;
  }
  previousFlowStep = coursesFlowStep === "course-open" ? "course-categories" : coursesFlowStep;
  activeEmbeddedCourse = { subjectId, courseId };
  setCoursesStep("course-open");
}

function closeEmbeddedCourse() {
  activeEmbeddedCourse = null;
  setCoursesStep(previousFlowStep || "course-categories");
}

function closeEmbeddedCourseWithAnimation() {
  if (coursesFlowStep !== "course-open" || isCourseClosing) return;
  const host = document.querySelector("#courses-content .course-open-host");
  if (!host) {
    closeEmbeddedCourse();
    return;
  }
  isCourseClosing = true;
  host.classList.add("is-closing");
  window.setTimeout(() => {
    isCourseClosing = false;
    closeEmbeddedCourse();
  }, COURSE_TRANSITION_MS);
}

function triggerAiLernplan(subjectId) {
  const subject = (subjectsCatalog || []).find((entry) => entry.id === subjectId);
  const demo = getSubjectDemo(subjectId);
  const nearestExam = (demo.exams || [])
    .map((exam) => ({ ...exam, inDays: daysUntil(exam.date) }))
    .filter((exam) => exam.inDays >= 0)
    .sort((a, b) => a.inDays - b.inDays)[0];

  console.log("[KI Lernplan Demo] ICS Export vorbereitet", {
    subjectId,
    subjectTitle: subject?.title || subjectId,
    exam: nearestExam || null,
    payloadHint: {
      format: "ics",
      timezone: "Europe/Berlin",
      blocks: ["Wiederholung", "Übungsset", "Mock-Test", "Reflexion"],
    },
  });

  toast("Demo: KI Lernplan / ICS wurde in der Konsole vorbereitet.");
}

function buildCourseEmbedUrl(subject, course) {
  const params = new URLSearchParams({
    embed: "1",
    subjectId: subject.id,
    subjectTitle: subject.title,
    courseId: course.id,
    activeKey: activeKey || "",
  });
  return `${course.path}?${params.toString()}`;
}

function ensureCourseMap(subject) {
  const demo = getSubjectDemo(subject.id);
  const map = new Map((subject.courses || []).map((course) => [course.id, { ...course }]));

  Object.entries(demo.courseMeta || {}).forEach(([id, meta]) => {
    if (!map.has(id)) {
      map.set(id, {
        id,
        title: meta.title || id,
        path: meta.path || (subject.courses?.[0]?.path || "index.html"),
        description: meta.description || "Demo-Kursmodul",
      });
    }
  });

  return map;
}

function getCategoryCourseIds(subject) {
  const demo = getSubjectDemo(subject.id);
  const courseMap = ensureCourseMap(subject);
  const result = new Map();

  CATEGORY_DEFS.forEach((category) => {
    const ids = (demo.categoriesPool?.[category.id] || []).filter((id) => courseMap.has(id));
    if (ids.length >= 3) result.set(category.id, ids);
  });

  return result;
}

function getCourseCardData(subject, courseId, currentCategoryId) {
  const demo = getSubjectDemo(subject.id);
  const courseMap = ensureCourseMap(subject);
  const baseCourse = courseMap.get(courseId);
  if (!baseCourse) return null;

  const meta = demo.courseMeta?.[courseId] || {};
  const labels = new Set(meta.tags || []);
  if (meta.isNew) labels.add("Neu");
  if (meta.isRecommended) labels.add("Empfohlen");
  if (meta.hasRecentUpdate) labels.add("Neues Update");
  if (meta.examFocus) labels.add("Klausur-Fokus");

  if (currentCategoryId === "updates") labels.delete("Neues Update");

  return {
    ...baseCourse,
    description: meta.description || baseCourse.description || "Eigenständiger Kurs im neuen Subject-System.",
    labels: Array.from(labels),
  };
}

function renderSubjectSelection(subjects) {
  return `<section class="flow-panel animate-enter">
    <div class="flow-panel-head">
      <div>
        <div class="flow-section-title">Fach auswählen</div>
        <div class="flow-section-sub">Wähle ein Fach als Startpunkt für deinen Lernpfad.</div>
      </div>
    </div>
    <div class="subject-choice-grid">
      ${subjects.map((subject, index) => {
        const courseCount = Array.isArray(subject.courses) ? subject.courses.length : 0;
        return `<button class="subject-choice-card stagger-${Math.min(index + 1, 8)}" onclick="selectSubject('${subject.id}')">
          <div class="subject-choice-icon">${courseIconForLang(subject.title)}</div>
          <div class="subject-choice-title">${subject.title}</div>
          <div class="subject-choice-sub">${courseCount} Kurs${courseCount === 1 ? "" : "e"}</div>
        </button>`;
      }).join("")}
    </div>
  </section>`;
}

function renderSubjectOverviewPanel(subject, options = {}) {
  const { asStep = true, showContinueButton = true } = options;
  const demo = getSubjectDemo(subject.id);
  const nextLesson = demo.nextLesson;
  const homework = demo.homework || [];
  const exams = demo.exams || [];

  const examSoon = exams.some((exam) => {
    const inDays = daysUntil(exam.date);
    return inDays >= 0 && inDays <= EXAM_CTA_WINDOW_DAYS;
  });

  const header = `
    <div class="flow-panel-head">
      <div>
        <div class="flow-section-title">Webuntis</div>
        <div class="flow-section-sub">
          Hier ist eine Übersicht der nächsten Termine, Hausaufgaben und Prüfungen für das Fach.
        </div>
      </div>
    </div>
  `;

  const content = `
    <div class="overview-grid">

      <article class="overview-card">
        <div class="overview-card-title">Termine</div>
        ${nextLesson ? `
          <div class="overview-next-topic">${nextLesson.topic}</div>
          <div class="overview-meta">
            ${formatDate(nextLesson.date)} · ${nextLesson.start} Uhr · ${nextLesson.room}
          </div>
          ${renderOptionalLinkRow(
            nextLesson.onlineLabel || "Stunde findet online statt",
            nextLesson.onlineUrl
          )}
        ` : `
          <div class="overview-meta">Keine Stunde eingetragen.</div>
        `}
      </article>

      <article class="overview-card">
        <div class="overview-card-title">Klausuren & Tests</div>
        ${exams.length ? exams.map((exam) => {
          const inDays = daysUntil(exam.date);
          const soonClass = inDays >= 0 && inDays <= EXAM_CTA_WINDOW_DAYS ? "soon" : "";

          return `
            <div class="overview-exam-row overview-linkable-row ${soonClass} ${exam.linkUrl ? "is-clickable" : ""}"
              ${exam.linkUrl ? `onclick="window.open('${exam.linkUrl}', '_blank', 'noopener,noreferrer')"` : ""}>
              <div>
                <div class="overview-task-topic">${exam.type}: ${exam.topic}</div>
                <div class="overview-meta">
                  ${formatDate(exam.date)} · in ${inDays} Tag${inDays === 1 ? "" : "en"}
                  ${exam.linkLabel ? ` · ${exam.linkLabel}` : ""}
                </div>
              </div>
              <div class="overview-external-icon" aria-hidden="true" style="${exam.linkUrl ? "" : "display:none"}">↗</div>
            </div>
          `;
        }).join("") : `
          <div class="overview-meta">Keine Prüfungen eingetragen.</div>
        `}

        ${examSoon ? `
          <button class="btn btn-lime" style="margin-top:12px"
            onclick="triggerAiLernplan('${subject.id}')">
            KI Lernplan
          </button>` : ""}
      </article>

      <article class="overview-card">
        <div class="overview-card-title">Hausaufgaben</div>

        ${homework.length ? homework.map((item) => `
          <div class="overview-exam-row overview-homework-row ${item.linkUrl ? "is-clickable" : ""}"
            ${item.linkUrl ? `onclick="window.open('${item.linkUrl}', '_blank', 'noopener,noreferrer')"` : ""}>
            <div>
              <div class="overview-task-topic">${item.topic}</div>
              <div class="overview-meta">
                Fällig: ${formatDate(item.dueDate)}${item.linkLabel ? ` · ${item.linkLabel}` : ""}
              </div>
            </div>
            <div class="overview-external-icon" aria-hidden="true" style="${item.linkUrl ? "" : "display:none"}">↗</div>
          </div>
        `).join("") : `
          <div class="overview-meta">Aktuell keine Hausaufgaben.</div>
        `}
      </article>

    </div>
  `;

  return `
    <section class="category-section overview-section animate-enter">
      ${header}
      ${content}
    </section>
  `;
}

function renderSubjectOverview(subject) {
  return renderSubjectOverviewPanel(subject, { asStep: true, showContinueButton: true });
}

function renderCourseLabels(labels) {
  if (!labels.length) return "";
  return `<div class="course-label-row">${labels.map((label) => {
    let className = "label-neutral";
    if (label === "Neu") className = "label-new";
    if (label === "Empfohlen") className = "label-reco";
    if (label === "Neues Update") className = "label-update";
    if (label === "Klausur-Fokus") className = "label-exam";
    return `<span class="course-label ${className}">${label}</span>`;
  }).join("")}</div>`;
}

function renderCourseCard(subject, courseId, categoryId, idx) {
  const data = getCourseCardData(subject, courseId, categoryId);
  if (!data) return "";

  return `<article class="assistant-course-card stagger-${Math.min(idx + 1, 8)}">
    <div class="assistant-course-head">
      <div>
        <div class="assistant-course-title">${data.title}</div>
        <div class="assistant-course-sub">Kursmodul</div>
      </div>
      ${renderCourseLabels(data.labels)}
    </div>
    <div class="assistant-course-desc">${data.description}</div>
    <div class="btn-row" style="margin-top:12px">
      <button class="btn btn-lime btn-sm" onclick="openEmbeddedCourse('${subject.id}', '${data.id}', this)">Kurs öffnen</button>
    </div>
  </article>`;
}

function renderCategorySection(subject, categoryDef, courseIds) {
  return `<section class="category-section animate-enter" id="category-${categoryDef.id}">
    <div class="category-head">
      <div>
        <div class="category-title">${categoryDef.icon} ${categoryDef.title}</div>
        <div class="category-sub">${categoryDef.description}</div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="showAllInCategory('${categoryDef.id}')">Alle anzeigen</button>
    </div>
    <div class="assistant-courses-grid">
      ${courseIds.slice(0, 6).map((courseId, idx) => renderCourseCard(subject, courseId, categoryDef.id, idx)).join("")}
    </div>
  </section>`;
}

function renderCategoryExplorer(subject) {
  const categoryMap = getCategoryCourseIds(subject);
  const availableDefs = CATEGORY_DEFS.filter((def) => categoryMap.has(def.id));
  const isAllModeWithGrid = coursesViewMode === "all" && activeCategory && categoryMap.has(activeCategory);
  const overviewPanel = renderSubjectOverviewPanel(subject, {
    asStep: false,
    showContinueButton: false,
  });

  if (!availableDefs.length) {
    return `<div class="animate-enter">
      ${overviewPanel}
      <div class="k-card">Keine Kategorien mit mindestens 3 Kursen verfügbar.</div>
    </div>`;
  }

  if (coursesViewMode === "all" && activeCategory && categoryMap.has(activeCategory)) {
    const activeDef = CATEGORY_DEFS.find((def) => def.id === activeCategory);
    const courseIds = categoryMap.get(activeCategory) || [];
    return `<div class="animate-enter">
      ${overviewPanel}
      <section class="category-section category-mode-panel">
      <div class="flow-panel-head">
        <div>
          <div class="flow-section-title">Kurswelten</div>
          <div class="flow-section-sub">Alle Kurse aus „${activeDef?.title || "Kategorie"}“.</div>
        </div>
        <div class="btn-row">
          <button class="btn btn-blue btn-sm" onclick="backToAllCategories()">Alle Kategorien</button>
        </div>
      </div>
      <div class="category-tabs">
        ${availableDefs.map((def) => `<button class="category-tab ${def.id === activeCategory ? "active" : ""}" onclick="showAllInCategory('${def.id}')">${def.icon} ${def.title}</button>`).join("")}
      </div>
      <div class="assistant-courses-grid">
        ${courseIds.map((courseId, idx) => renderCourseCard(subject, courseId, activeCategory, idx)).join("")}
      </div>
      </section>
    </div>`;
  }

  return `<div class="animate-enter">
    ${overviewPanel}
    ${availableDefs.map((def) => renderCategorySection(subject, def, categoryMap.get(def.id))).join("")}
  </div>`;
}

function renderCourseOpenStep(subject) {
  if (!activeEmbeddedCourse || activeEmbeddedCourse.subjectId !== subject.id) {
    setCoursesStep("course-categories");
    return "";
  }

  const courseMap = ensureCourseMap(subject);
  const course = courseMap.get(activeEmbeddedCourse.courseId);
  if (!course) {
    setCoursesStep("course-categories");
    return "";
  }

  const url = buildCourseEmbedUrl(subject, course);
  const motion = lastCourseTriggerMotion || { dx: 0, dy: 18, sx: 0.28, sy: 0.2 };
  const motionVars = `--open-dx:${motion.dx}px;--open-dy:${motion.dy}px;--open-sx:${motion.sx};--open-sy:${motion.sy};`;
  return `<section class="course-open-host animate-enter">
    <div class="course-fullstage course-fullstage-open win8-tile-open" style="${motionVars}">
      <iframe title="${subject.title} ${course.title}" src="${url}" class="course-embed-frame assistant-full-frame"></iframe>
    </div>
  </section>`;
}

async function renderCourses() {
  const el = document.getElementById("courses-content");
  if (!el) return;
  const isCourseOpenStep = coursesFlowStep === "course-open";
  setCoursesTopbarBackVisible(isCourseOpenStep);
  setCoursesOpenMode(isCourseOpenStep);
  if (coursesFlowStep === "subject-select") setCoursesTopbarTitle("");

  if (!subjectsCatalog) {
    el.innerHTML = `<div class="k-card" style="padding:24px">
      <div style="font-size:13px;font-weight:800;margin-bottom:6px">Fächer werden geladen...</div>
      <div style="font-size:11px;color:var(--muted)">Daten werden vorbereitet.</div>
    </div>`;
  }

  try {
    const subjects = await loadSubjectsCatalog();
    if (!subjects.length) {
      el.innerHTML = `<div class="k-card" style="padding:24px">Keine Fächer vorhanden.</div>`;
      return;
    }

    if (!selectedSubjectId || !subjects.some((subject) => subject.id === selectedSubjectId)) {
      selectedSubjectId = subjects[0].id;
    }

    ensureCourseHostApi();

    const activeSubject = subjects.find((subject) => subject.id === selectedSubjectId) || subjects[0];
    setCoursesTopbarTitle(coursesFlowStep === "subject-select" ? "" : (activeSubject?.title || ""));

    let stepHtml = "";
    if (coursesFlowStep === "subject-select") {
      stepHtml = renderSubjectSelection(subjects);
    } else if (coursesFlowStep === "subject-overview") {
      stepHtml = renderSubjectOverview(activeSubject);
    } else if (coursesFlowStep === "course-categories") {
      stepHtml = renderCategoryExplorer(activeSubject);
    } else if (coursesFlowStep === "course-open") {
      stepHtml = renderCourseOpenStep(activeSubject);
    } else {
      coursesFlowStep = "subject-select";
      stepHtml = renderSubjectSelection(subjects);
    }

    el.innerHTML = stepHtml;
  } catch (error) {
    setCoursesOpenMode(false);
    setCoursesTopbarBackVisible(false);
    setCoursesTopbarTitle("");
    console.error("[SUBJECTS] load failed", error);
    el.innerHTML = `
      <div class="k-card" style="padding:24px">
        <div style="font-size:14px;font-weight:800;margin-bottom:8px">Fächer konnten nicht geladen werden</div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:14px">${error.message || error}</div>
      </div>
    `;
  }
}

