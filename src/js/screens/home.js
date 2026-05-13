function homeDaysUntil(dateStr) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return Number.POSITIVE_INFINITY;
  return Math.ceil((target.getTime() - start.getTime()) / 86400000);
}

function homeFormatDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }).format(date);
}

function renderHomeAggregatedTasks() {
  const examsHost = document.getElementById("home-aggregated-exams");
  const homeworkHost = document.getElementById("home-aggregated-homework");
  if (!examsHost || !homeworkHost) return;

  if (!Array.isArray(subjectsCatalog) && typeof loadSubjectsCatalog === "function") {
    const loadingHtml = `<div style="font-size:11px;color:var(--muted)">Lade Daten...</div>`;
    examsHost.innerHTML = loadingHtml;
    homeworkHost.innerHTML = loadingHtml;
    loadSubjectsCatalog()
      .then(() => renderHomeAggregatedTasks())
      .catch(() => {
        const errorHtml = `<div style="font-size:11px;color:var(--muted)">Daten konnten nicht geladen werden.</div>`;
        examsHost.innerHTML = errorHtml;
        homeworkHost.innerHTML = errorHtml;
      });
    return;
  }

  if (typeof getSubjectDemo !== "function" || !Array.isArray(subjectsCatalog)) {
    const emptyHtml = `<div style="font-size:11px;color:var(--muted)">Noch keine Daten verfügbar.</div>`;
    examsHost.innerHTML = emptyHtml;
    homeworkHost.innerHTML = emptyHtml;
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exams = [];
  const homework = [];

  for (const subject of subjectsCatalog) {
    const demo = getSubjectDemo(subject.id);

    for (const exam of (demo.exams || [])) {
      const inDays = homeDaysUntil(exam.date);
      if (!Number.isFinite(inDays) || inDays < 0) continue;
      exams.push({
        subjectTitle: subject.title,
        topic: `${exam.type} · ${exam.topic}`,
        meta: `${homeFormatDate(exam.date)} · in ${inDays} Tag${inDays === 1 ? "" : "en"}`,
        linkLabel: exam.linkLabel || "Klausur",
        linkUrl: exam.linkUrl || "",
        sortDate: exam.date,
      });
    }

    for (const hw of (demo.homework || [])) {
      const due = new Date(`${hw.dueDate}T00:00:00`);
      if (Number.isNaN(due.getTime()) || due < today) continue;
      homework.push({
        subjectTitle: subject.title,
        topic: hw.topic,
        meta: `Fällig: ${homeFormatDate(hw.dueDate)}`,
        linkLabel: hw.linkLabel || "",
        linkUrl: hw.linkUrl || "",
        sortDate: hw.dueDate,
      });
    }
  }

  const renderRows = (items) => items.map((item) => `
    <div class="overview-exam-row overview-linkable-row ${item.linkUrl ? "is-clickable" : ""}"
      ${item.linkUrl ? `onclick="window.open('${item.linkUrl}', '_blank', 'noopener,noreferrer')"` : ""}>
      <div>
        <div class="overview-task-topic">${item.subjectTitle} · ${item.topic}</div>
        <div class="overview-meta">${item.meta}${item.linkLabel ? ` · ${item.linkLabel}` : ""}</div>
      </div>
      <div class="overview-external-icon" aria-hidden="true" style="${item.linkUrl ? "" : "display:none"}">↗</div>
    </div>
  `).join("");

  exams.sort((a, b) => String(a.sortDate).localeCompare(String(b.sortDate)));
  homework.sort((a, b) => String(a.sortDate).localeCompare(String(b.sortDate)));

  const nextExams = exams.slice(0, 3);
  const nextHomework = homework.slice(0, 3);

  examsHost.innerHTML = nextExams.length
    ? renderRows(nextExams)
    : `<div style="font-size:11px;color:var(--muted)">Keine anstehenden Klausuren.</div>`;

  homeworkHost.innerHTML = nextHomework.length
    ? renderRows(nextHomework)
    : `<div style="font-size:11px;color:var(--muted)">Keine anstehenden Hausaufgaben.</div>`;
}

function updateHomeStats() {
  const t = vocab.length;
  const k = vocab.filter(v => v.known).length;

  const dDone = dailyQuestsDone();
  const dTotal = DAILY_QUESTS.length;
  const hmK = document.getElementById('hm-k');
  const hmT = document.getElementById('hm-t');
  const hmBar = document.getElementById('hm-bar');
  if (hmK) hmK.textContent = dDone;
  if (hmT) hmT.textContent = dTotal;
  if (hmBar) hmBar.style.width = Math.round(dDone / Math.max(1, dTotal) * 100) + '%';

  const s = calcStreak();
  const xpTotal = getTotalXp();
  const level = Math.max(1, Math.floor(xpTotal / 500) + 1);
  const levelStart = (level - 1) * 500;
  const next = level * 500;
  const levelPct = Math.round((xpTotal - levelStart) / Math.max(1, (next - levelStart)) * 100);

  const topbarStreak = document.getElementById('topbar-streak');
  if (topbarStreak) topbarStreak.textContent = s;

  const hmXp = document.getElementById('hm-xp');
  const hmLevel = document.getElementById('hm-level');
  const hmNextXp = document.getElementById('hm-next-xp');
  const hmRing = document.getElementById('hm-ring');
  const homeUserName = document.getElementById('home-user-name');

  if (hmXp) hmXp.textContent = xpTotal.toLocaleString();
  if (hmLevel) hmLevel.textContent = level;
  if (hmNextXp) hmNextXp.textContent = next.toLocaleString();
  if (hmRing) hmRing.style.setProperty('--ring-pct', Math.max(4, levelPct) + '%');
  if (homeUserName) homeUserName.textContent = currentUser?.username || 'Lerner';

  const today = new Date().toISOString().slice(0, 10);
  const xpData = lsGet('kivo_xp', '{}');
  const todayXp = xpData[today] || 0;
  const lbl = document.getElementById('hm-goal-lbl');
  if (lbl) lbl.textContent = todayXp + ' XP heute';

  const poolPct = t > 0 ? Math.round(k / t * 100) : 0;
  const poolBar = document.getElementById('daily-goal-fill');
  if (poolBar) poolBar.style.width = poolPct + '%';

  const rec = sessions.slice(-5);
  const hmSessions = document.getElementById('hm-sessions');
  if (hmSessions) {
    hmSessions.innerHTML = rec.length
      ? rec.map(ses => `<span style="margin-right:6px">${ses.pct}% (${ses.ok}✓)</span>`).join('')
      : 'Noch keine Sessions';
  }

  renderHomeAggregatedTasks();
}

function saveDailyGoal(){ /* deprecated */ }
