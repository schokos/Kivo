// -- SUBJECT HUB ------------------------------------------------
let subjectsCatalog = null;
let selectedSubjectId = null;

function poolCountForLang(lang) {
  return Object.keys(POOLS[lang] || {}).length;
}

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

function lessonCountForCourse(course) {
  return Array.isArray(course && course.lessons) ? course.lessons.length : 0;
}

function getSubjectPools(subjectTitle) {
  return Object.entries(POOLS[subjectTitle] || {});
}

function getSubjectById(subjectId) {
  if (!Array.isArray(subjectsCatalog)) return null;
  return subjectsCatalog.find((subject) => subject.id === subjectId) || null;
}

function setSubjectAndOpenPool(subjectId, key, targetScreen) {
  selectedSubjectId = subjectId;
  setActivePool(key);
  goTo(targetScreen);
}

function renderPoolActions(subjectId, key) {
  return `<div class="btn-row">
    <button class="btn btn-lime btn-sm" onclick="setSubjectAndOpenPool('${subjectId}', '${key}', 'cards')">Karteikarten</button>
    <button class="btn btn-sm" onclick="setSubjectAndOpenPool('${subjectId}', '${key}', 'quiz')">Quiz</button>
    <button class="btn btn-sm" onclick="setSubjectAndOpenPool('${subjectId}', '${key}', 'typing')">Tippen</button>
    <button class="btn btn-sm" onclick="setSubjectAndOpenPool('${subjectId}', '${key}', 'matching')">Zuordnen</button>
    <button class="btn btn-ghost btn-sm" onclick="setSubjectAndOpenPool('${subjectId}', '${key}', 'gap')">KI</button>
  </div>`;
}

function renderStandaloneLessons(course) {
  const lessons = Array.isArray(course && course.lessons) ? course.lessons : [];
  if (!lessons.length) {
    return `<div style="font-size:10px;color:var(--muted);margin-top:10px">Noch keine Lektionen hinterlegt.</div>`;
  }

  const lessonButtons = lessons.map((lesson) => {
    const href = lesson.path;
    return `<a class="btn btn-sm" href="${href}" target="_self">${lesson.title}</a>`;
  }).join("");

  return `<div style="margin-top:12px">
    <div style="font-size:10px;color:var(--muted);margin-bottom:8px">Vorbereitete Lektionen</div>
    <div class="btn-row">${lessonButtons}</div>
  </div>`;
}

function renderPoolCourseSection(subject, course) {
  const entries = getSubjectPools(subject.title);
  const escapedTitle = subject.title.replace(/'/g, "\\'");
  const createButton = `<button class="btn btn-lime btn-sm" onclick="openNewPoolModal('${escapedTitle}')">+ Kurs hinzufuegen</button>`;

  const starterLessons = renderStandaloneLessons(course);

  if (!entries.length) {
    return `<div style="margin-top:14px;padding:14px;border:1px dashed var(--line);border-radius:14px">
      <div style="font-size:11px;color:var(--muted);margin-bottom:10px">In diesem Fach gibt es noch keine eigenen Vokabel-Kurse. Du kannst direkt einen anlegen oder mit einer vorbereiteten Lektion starten.</div>
      <div class="btn-row" style="margin-bottom:12px">${createButton}</div>
      ${starterLessons}
    </div>`;
  }

  const cards = entries.map(([poolName, poolObj]) => {
    const key = mkKey(subject.title, poolName);
    const flat = flattenPool(poolObj);
    const pct = flat.length ? Math.round(getKnownIds(key).length / flat.length * 100) : 0;
    return `<div style="margin-top:14px;padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--panel-2)">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;margin-bottom:10px">
        <div>
          <div style="font-size:13px;font-weight:800">${poolName}</div>
          <div class="tile-sub">${flat.length} Vokabeln &middot; ${pct}% gelernt</div>
        </div>
        ${key === activeKey ? '<span class="tag lime">Aktiv</span>' : ""}
      </div>
      <div class="daily-goal-bar"><div class="daily-goal-fill" style="width:${pct}%"></div></div>
      ${renderPoolActions(subject.id, key)}
      <div class="btn-row" style="margin-top:10px">
        <button class="btn btn-blue btn-sm" onclick="openEditPoolModal('${key}')">Bearbeiten</button>
        <button class="btn btn-danger btn-sm" onclick="deletePool('${key}')">Loeschen</button>
      </div>
    </div>`;
  }).join("");

  return `<div style="margin-top:14px">
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap">
      <div style="font-size:10px;color:var(--muted)">Deine Vokabel-Kurse in ${subject.title}</div>
      ${createButton}
    </div>
    ${cards}
    ${starterLessons}
  </div>`;
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
    const courses = await Promise.all((subject.courses || []).map(async (courseRef) => {
      const course = await fetchJson(courseRef.path);
      return { ...courseRef, ...course };
    }));
    return { ...subject, courses };
  }));

  subjectsCatalog = subjects;
  return subjectsCatalog;
}

function renderSubjectCards(subjects) {
  return subjects.map((subject) => {
    const courseCount = Array.isArray(subject.courses) ? subject.courses.length : 0;
    return `<div class="language-card ${subject.id === selectedSubjectId ? "active" : ""}" onclick="selectSubject('${subject.id}')">
      <div style="font-size:30px;margin-bottom:18px">${courseIconForLang(subject.title)}</div>
      <div class="tile-title">${subject.title}</div>
      <div class="tile-sub">${courseCount} Kurs${courseCount === 1 ? "" : "e"}</div>
    </div>`;
  }).join("");
}

function renderSubjectCourses(subject) {
  const courses = Array.isArray(subject && subject.courses) ? subject.courses : [];
  if (!courses.length) {
    return `<div class="k-card" style="text-align:center;padding:32px">
      <div style="font-size:14px;font-weight:800;margin-bottom:8px">Noch keine Kurse</div>
      <div style="font-size:11px;color:var(--muted)">In diesem Fach sind noch keine Kurse definiert.</div>
    </div>`;
  }

  return courses.map((course) => {
    const lessonCount = lessonCountForCourse(course);
    const description = course.description || "Eigenstaendiger Kurs mit separaten Lektionen.";
    const isPoolCourse = course.id === "vokabeln";
    const body = isPoolCourse
      ? renderPoolCourseSection(subject, course)
      : renderStandaloneLessons(course);

    return `<div class="learn-card">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;margin-bottom:10px">
        <div>
          <div style="font-size:14px;font-weight:850">${course.title}</div>
          <div class="tile-sub">${lessonCount} Lektion${lessonCount === 1 ? "" : "en"}</div>
        </div>
        <span class="tag blue">Kurs</span>
      </div>
      <div style="font-size:11px;color:var(--muted);line-height:1.6">${description}</div>
      ${body}
    </div>`;
  }).join("");
}

function renderCustomPoolsSection() {
  const langs = Object.keys(POOLS);
  if (!langs.length) {
    return `<div class="k-card" style="text-align:center;padding:32px">
      <div style="font-size:14px;font-weight:800;margin-bottom:8px">Keine eigenen Faecher</div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:14px">Lege zuerst ein Fach an und erstelle darin dann deine Kurse.</div>
      <button class="btn btn-lime btn-sm" onclick="openNewPoolModal()">+ Fach erstellen</button>
    </div>`;
  }

  if (!selectedCourseLang || !POOLS[selectedCourseLang]) {
    selectedCourseLang = langs[0] || null;
  }

  const langCards = langs.map((lang) => {
    const safeLang = lang.replace(/'/g, "\\'");
    const count = poolCountForLang(lang);
    return `<div class="language-card ${lang === selectedCourseLang ? "active" : ""}" onclick="selectCourseLang('${safeLang}')">
      <div style="font-size:30px;margin-bottom:18px">${courseIconForLang(lang)}</div>
      <div class="tile-title">${lang}</div>
      <div class="tile-sub">${count} Kurs${count === 1 ? "" : "e"}</div>
    </div>`;
  }).join("");

  const pools = Object.entries(POOLS[selectedCourseLang] || {});
  const poolCards = pools.map(([poolName, poolObj]) => {
    const key = mkKey(selectedCourseLang, poolName);
    const flat = flattenPool(poolObj);
    const pct = flat.length ? Math.round(getKnownIds(key).length / flat.length * 100) : 0;
    return `<div class="learn-card">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;margin-bottom:10px">
        <div>
          <div style="font-size:14px;font-weight:850">${poolName}</div>
          <div class="tile-sub">${flat.length} Vokabeln &middot; ${pct}% gelernt</div>
        </div>
        ${key === activeKey ? '<span class="tag lime">Aktiv</span>' : ""}
      </div>
      <div class="daily-goal-bar"><div class="daily-goal-fill" style="width:${pct}%"></div></div>
      ${renderPoolActions(getSubjectById(selectedSubjectId)?.id || "", key)}
      <div class="btn-row" style="margin-top:10px">
        <button class="btn btn-blue btn-sm" onclick="openEditPoolModal('${key}')">Bearbeiten</button>
        <button class="btn btn-danger btn-sm" onclick="deletePool('${key}')">Loeschen</button>
      </div>
    </div>`;
  }).join("");

  return `<div style="margin-top:26px">
    <div class="course-grid-head">
      <div>
        <div style="font-size:18px;font-weight:900">Eigene Faecher</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px">Deine bisherigen Pools bleiben hier separat erhalten.</div>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="goTo('overview')">Pools bearbeiten</button>
    </div>
    <div class="language-grid">${langCards}</div>
    <div class="learning-grid">${poolCards}</div>
  </div>`;
}

async function renderCourses() {
  const el = document.getElementById("courses-content");
  if (!el) return;

  el.innerHTML = `<div class="k-card" style="padding:24px">
    <div style="font-size:13px;font-weight:800;margin-bottom:6px">Faecher werden geladen...</div>
    <div style="font-size:11px;color:var(--muted)">Kurse und Lektionen aus der neuen Struktur werden eingelesen.</div>
  </div>`;

  try {
    const subjects = await loadSubjectsCatalog();
    if (!selectedSubjectId || !subjects.some((subject) => subject.id === selectedSubjectId)) {
      selectedSubjectId = subjects[0] ? subjects[0].id : null;
    }

    const activeSubject = subjects.find((subject) => subject.id === selectedSubjectId) || null;
    const subjectCards = renderSubjectCards(subjects);
    const courseCards = activeSubject
      ? renderSubjectCourses(activeSubject)
      : `<div class="k-card" style="text-align:center;padding:32px">Noch keine Faecher vorhanden.</div>`;
    const subjectDescription = activeSubject && activeSubject.description
      ? activeSubject.description
      : "Waehle ein Fach und darin danach einen Kurs.";
    const addButton = activeSubject
      ? `<button class="btn btn-lime btn-sm" onclick="openNewPoolModal('${activeSubject.title.replace(/'/g, "\\'")}')">+ Kurs in ${activeSubject.title}</button>`
      : `<button class="btn btn-lime btn-sm" onclick="openNewPoolModal()">+ Eigenes Fach</button>`;

    el.innerHTML = `
      <div class="language-grid">${subjectCards}</div>
      <div class="course-grid-head">
        <div>
          <div style="font-size:18px;font-weight:900">${activeSubject ? activeSubject.title : "Faecher"} &middot; Kurse</div>
          <div style="font-size:11px;color:var(--muted);margin-top:4px">${subjectDescription}</div>
        </div>
        <div class="btn-row" style="margin-top:0">
          ${addButton}
          <a class="btn btn-ghost btn-sm" href="index.html">Struktur ansehen</a>
        </div>
      </div>
      <div class="learning-grid">${courseCards}</div>
      ${renderCustomPoolsSection()}
    `;
  } catch (error) {
    console.error("[SUBJECTS] load failed", error);
    el.innerHTML = `
      <div class="k-card" style="padding:24px">
        <div style="font-size:14px;font-weight:800;margin-bottom:8px">Faecher konnten nicht geladen werden</div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:14px">${error.message || error}</div>
      </div>
      ${renderCustomPoolsSection()}
    `;
  }
}

function selectSubject(subjectId) {
  selectedSubjectId = subjectId;
  renderCourses();
}

function selectCourseLang(lang) {
  selectedCourseLang = lang;
  renderCourses();
}

