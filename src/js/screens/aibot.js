// ── AI CHATBOT ───────────────────────────────────────────────
let aiBotHistory = [];

const AI_MEMORY_MAX_ENTRIES = 20;
let aiMemoryState = { ...AI_MEMORY_DEFAULT_STATE };
const AI_TIPS = ['📚 20 Vokabeln zum Thema Essen', '🎨 Farben auf Spanisch', '✈️ Reise-Vokabeln', '💼 Business-Englisch Basics', '🏠 Zimmer & Möbel'];

function buildAiSystemPrompt() {
  const memoryContext = aiBuildMemoryContext();
  const memoryPolicy = aiBuildMemoryPolicyPrompt();
  return `Du bist der Kivo-Assistent — ein freundlicher Sprachlern-Helfer.
Du hilfst beim Vokabellernen und beantwortest Fragen. Dein Benutzer ist ${currentUser?.username || 'Gast'}.

Wenn der Benutzer eine Vokabelliste anfordert, beginne deine Antwort mit einer freundlichen, kurzen Bestätigung, gefolgt von einem Block, der die Vokabeln im JSON-Format enthält.
Das JSON-Format muss immer am Ende sein und muss folgendermaßen formatiert sein: <vocab_list>{"lang":"Englisch","name":"Listenname","length":0,"pairs":[{"de":"Wort","en":"Translation"}]}</vocab_list>.
Verwende dieses JSON-Format immer, um die tatsächliche Liste zu übermitteln. Wenn der Benutzer kein feste Anzahl von Vokabeln angibt, gib immer 20 zurück.

Tabellen müssen nicht automatisch in Vokabellisten umgewandelt werden es kommt auf die Anfrage an. Wenn der Benutzer beispielsweise nach "Vokabeln zum Thema Essen" fragt, solltest du eine Vokabelliste zurückgeben. Wenn er jedoch nach einer "Tabelle zur Stadt Essen" fragt, kannst du die Informationen in einer einfachen Tabelle zurückgeben, ohne sie in das JSON-Format zu packen.

Bei Mathefragen erkläre die Konzepte so einfach wie möglich und verwende LaTeX, um Formeln darzustellen. Alle Erklärungen sollten kurz und auf den Punkt gebracht sein.

Bei allen anderen Fragen antwirst du auf Deutsch, kurz und freundlich.${memoryPolicy}${memoryContext}`;
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stripVocabBlock(text = '') {
  const startTag = '<vocab_list>';
  const endTag = '</vocab_list>';

  const start = text.indexOf(startTag);
  if (start === -1) {
    return {
      displayText: text,
      hasVocab: false,
      complete: false,
      vocabRaw: null
    };
  }

  const end = text.indexOf(endTag, start + startTag.length);

  if (end === -1) {
    return {
      displayText: text.slice(0, start),
      hasVocab: true,
      complete: false,
      vocabRaw: null
    };
  }

  const vocabRaw = text.slice(start + startTag.length, end).trim();
  const displayText = text.slice(0, start) + text.slice(end + endTag.length);

  return {
    displayText,
    hasVocab: true,
    complete: true,
    vocabRaw
  };
}

function renderMarkdown(text) {
  const displayText = stripVocabBlock(text).displayText;
  const raw = marked.parse(displayText || '');
  const withWrappedTables = raw.replace(/<table\b[\s\S]*?<\/table>/gi, (tableHtml) => {
    return `<div class="md-table-wrap">${tableHtml}</div>`;
  });
  return DOMPurify.sanitize(withWrappedTables);
}

function renderLatex(el) {
  if (typeof renderMathInElement !== 'function') return;
  if (el && typeof el.innerHTML === 'string') {
    el.innerHTML = el.innerHTML
      .replace(/(["'“”])\s*\$\$\s*\1/g, '$$')
      .replace(/(["'“”])\s*\\\(\s*/g, '\\(')
      .replace(/\s*\\\)\s*(["'“”])/g, '\\)')
      .replace(/(["'“”])\s*\\\[\s*/g, '\\[')
      .replace(/\s*\\\]\s*(["'“”])/g, '\\]')
      .replace(/<p>\s*\$\$\s*<br>\s*/gi, '<p>$$')
      .replace(/\s*<br>\s*\$\$\s*<\/p>/gi, '$$</p>');
  }
  renderMathInElement(el, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
      { left: '\\[', right: '\\]', display: true }
    ],
    throwOnError: false
  });
}

function highlightCode(el) {
  if (typeof hljs === 'undefined') return;
  el.querySelectorAll('pre code').forEach(block => {
    hljs.highlightElement(block);
  });
}

/* =========================================================
   AI CHAT SESSIONS + LOCALSTORAGE + RESUME + CHAT MODAL
   ========================================================= */

const AI_CHAT_STORAGE_KEY = 'kivo_ai_chat_sessions_v1';
const AI_CHAT_ACTIVE_KEY = 'kivo_ai_active_session_v1';

let aiChatSessions = {};
let aiChatOrder = [];
let aiActiveChatId = null;

// Laufender Stream im aktiven Chat
// { sessionId, assistantIndex, raw, requestId, loadingDiv }
let aiCurrentStream = null;

function aiUid(prefix = 'chat') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function aiNow() {
  return Date.now();
}

function aiWelcomeText() {
  return `
# 👋 Willkommen ${currentUser?.username || ''}
Ich bin der **Kivo-Assistent**.

Ich kann:
- 📚 Vokabellisten erstellen
- 🧠 Beim Lernen helfen
- ✍️ Texte erklären
- ➗ Mathe mit LaTeX darstellen

Zum Beispiel:

$$
a^2+b^2=c^2
$$
`.trim();
}

function aiGetSession(id = aiActiveChatId) {
  return id && aiChatSessions[id] ? aiChatSessions[id] : null;
}

function aiGetActiveSession() {
  return aiGetSession(aiActiveChatId);
}

function aiEnsureSession() {
  let session = aiGetActiveSession();
  if (!session) {
    session = aiCreateChatSession('Neuer Chat', true);
  }
  return session;
}

function aiBuildMemoryContext() {
  const memory = normalizeAiMemoryState(aiMemoryState);
  if (!memory.enabled || !memory.consentAccepted || !memory.entries.length) return '';
  const lines = memory.entries
    .slice(0, 6)
    .map((entry, idx) => `${idx + 1}. ${entry.content}`);
  return `\n\nNutze die folgenden freiwillig gespeicherten Memory-Hinweise nur, wenn sie zur Antwort passen:\n${lines.join('\n')}`;
}

function aiBuildMemoryPolicyPrompt() {
  const memory = normalizeAiMemoryState(aiMemoryState);
  if (memory.enabled && memory.consentAccepted) {
    return `\n\nDie optionale Memory-Funktion ist aktuell aktiviert. Wenn der Benutzer dich ausdrücklich bittet, etwas zu merken, zu speichern oder in deine Memories zu schreiben, bestätige kurz und klar, dass Kivo diesen freiwillig freigegebenen Hinweis speichern kann. Behaupte in diesem Fall nicht, dass du grundsätzlich keine neuen Memories speichern kannst.`;
  }
  return `\n\nDie optionale Memory-Funktion ist aktuell deaktiviert. Wenn der Benutzer dich bittet, etwas zu merken oder in deine Memories zu schreiben, sage kurz, dass die Memory-Funktion derzeit aus ist und in den Einstellungen aktiviert werden kann. Behaupte nicht, dass du vorhandene Memories aktiv nutzt, solange die Funktion deaktiviert ist.`;
}

function aiUpdateMemoryState(nextState) {
  aiMemoryState = normalizeAiMemoryState({
    ...nextState,
    updatedAt: Date.now(),
  });
  aiSaveChatSessions();
}

function aiIsExplicitMemoryRequest(text = '') {
  const normalized = String(text || '').toLowerCase();
  if (!normalized) return false;
  return /(merk(?:e|en)?\s+(?:es\s+)?(?:dir|dich)|kannst\s+du\s+dir\s+merk(?:en|en,)?|speicher(?:e|n)?|erinner(?:e|n)?\s+dich|in\s+deine\s+memories|in\s+dein\s+memory|schreib(?:e|en)?\s+.*memory|ich\s+bin|mein\s+name\s+ist|ich\s+heiße|ich\s+heisse|ich\s+möchte\s+dass\s+du\s+dich|ich\s+will\s+dass\s+du|wichtig\s+für\s+mich|merke\s+dich|gmbh|我叫|je\s+m'appelle)/i.test(normalized);
}

function aiAssistantConfirmedMemory(text = '') {
  const normalized = String(text || '').toLowerCase();
  if (!normalized) return false;
  return /(ich\s+)?(merke|speichere)\s+(mir\s+)?(das|es|mir|deinen?\s+hinweis|den\s+hinweis)|habe\s+(es|das)\s+(mir\s+)?gemerkt|ist\s+(gespeichert|vermerkt)|wird\s+gespeichert/.test(normalized);
}

function aiRememberExplicitUserFact(userText, assistantText = '') {
  const memory = normalizeAiMemoryState(aiMemoryState);
  if (!memory.enabled || !memory.consentAccepted) return false;
  const user = String(userText || '').replace(/\s+/g, ' ').trim();
  if (!user) return false;
  
  // Extrahiere nur den relevanten Inhalt aus dem User-Text (entferne Trigger-Phrasen)
  const cleanUserText = user
    .replace(/^(merk(e)?\s+dir|speicher(e)?|erinner(e)?\s+dich|in\s+deine\s+memories|in\s+dein\s+memory|schreib(e)?\s+.*memory|wichtig\s+für\s+mich|merke\s+dich)[:\s]*/gi, '')
    .replace(/^(ich\s+bin|mein\s+name\s+ist|ich\s+heiße|ich\s+heisse|ich\s+möchte\s+dass\s+du\s+dich|ich\s+will\s+dass\s+du|je\s+m'appelle|我叫)[:\s]*/gi, '')
    .trim();
  
  if (!cleanUserText) return false;
  
  const cleanedAssistantText = String(assistantText || '')
    .replace(/\s+/g, ' ')
    .replace(/^(klar|okay|ok|verstanden|alles klar)[,!.\s]*/i, '')
    .replace(/^(ich\s+)?(merke|speichere)\s+(mir\s+)?/i, '')
    .replace(/^dass\s+/i, '')
    .trim();
  const assistantIsGeneric = !cleanedAssistantText
    || /explizit\s+vom\s+nutzer\s+zum\s+merken\s+freigegeben/i.test(cleanedAssistantText);
  const content = (assistantIsGeneric ? cleanUserText : cleanedAssistantText).slice(0, 320);
  if (!content) return false;

  const nextEntries = [
    {
      id: aiUid('mem'),
      createdAt: aiNow(),
      content,
    },
    ...memory.entries.filter((entry) => entry.content !== content),
  ].slice(0, AI_MEMORY_MAX_ENTRIES);
  aiUpdateMemoryState({ ...memory, entries: nextEntries });
  refreshCurrentScreen?.({ keepProfileContent: false });
  return true;
}

function aiRememberConversation(userText, assistantText) {
  const memory = normalizeAiMemoryState(aiMemoryState);
  if (!memory.enabled || !memory.consentAccepted) return;
  const user = String(userText || '').replace(/\s+/g, ' ').trim();
  const assistant = String(assistantText || '').replace(/\s+/g, ' ').trim();
  const content = (assistant || user).slice(0, 320);
  if (!content) return;
  const nextEntries = [
    {
      id: aiUid('mem'),
      createdAt: aiNow(),
      content,
    },
    ...memory.entries.filter((entry) => entry.content !== content),
  ].slice(0, AI_MEMORY_MAX_ENTRIES);
  aiUpdateMemoryState({ ...memory, entries: nextEntries });
}

function renderAiMemorySettings() {
  const memory = normalizeAiMemoryState(aiMemoryState);
  const statusText = memory.enabled
    ? 'Aktiviert: Kivo darf freiwillig freigegebene Hinweise speichern und für personalisierte Antworten nutzen.'
    : 'Deaktiviert: Es werden keine Memory-Hinweise für personalisierte Antworten verwendet.';
  const entriesHtml = memory.entries.length
    ? memory.entries.map((entry) => `
        <div class="k-card-sm" style="margin-top:8px;padding:10px 12px">
          <div style="font-size:9px;color:var(--muted);margin-bottom:6px">${new Date(entry.createdAt).toLocaleString('de-DE')}</div>
          <div style="font-size:11px;margin-bottom:8px"><strong>Gespeichert:</strong> ${escapeHtml(entry.content || '') || '&mdash;'}</div>
          <button class="btn btn-sm btn-danger" onclick="aiDeleteMemoryEntry('${entry.id}')">Eintrag löschen</button>
        </div>
      `).join('')
    : `<div style="font-size:11px;color:var(--muted);margin-top:8px">Noch keine gespeicherten Memory-Einträge.</div>`;
  return `
    <div class="k-group" style="margin-top:14px">
      <label class="k-label">Memory-Funktion (optional)</label>
      <div style="font-size:11px;color:var(--muted);line-height:1.6;margin-bottom:8px">
        ${statusText}
      </div>
      <div style="font-size:10px;color:var(--muted);line-height:1.6;margin-bottom:10px">
        Die Funktion ist freiwillig. Gespeichert werden nur Hinweise, die du ausdrücklich zum Merken freigibst.
      </div>
      <div class="btn-row" style="margin-top:0">
        <button class="btn btn-sm ${memory.enabled ? 'btn-danger' : 'btn-blue'}" onclick="toggleAiMemory()">
          ${memory.enabled ? 'Memory deaktivieren' : 'Memory aktivieren'}
        </button>
        <button class="btn btn-sm" onclick="confirmClearAiMemory()" ${memory.entries.length ? '' : 'disabled'}>
          Memory löschen
        </button>
      </div>
      ${entriesHtml}
    </div>
  `;
}

async function toggleAiMemory() {
  const memory = normalizeAiMemoryState(aiMemoryState);
  if (memory.enabled) {
    aiUpdateMemoryState({ ...memory, enabled: false });
    refreshCurrentScreen?.({ keepProfileContent: false });
    toast('Memory deaktiviert');
    return;
  }
  const ok = await confirm2(
    'Memory aktivieren?',
    'Kivo speichert dann nur Hinweise, die du ausdrücklich zum Merken freigibst, zeigt sie dir in den Einstellungen an und nutzt sie für persönlichere Antworten.'
  );
  if (!ok) return;
  aiUpdateMemoryState({ ...memory, consentAccepted: true, enabled: true });
  refreshCurrentScreen?.({ keepProfileContent: false });
  toast('Memory aktiviert');
}

function aiDeleteMemoryEntry(id) {
  const memory = normalizeAiMemoryState(aiMemoryState);
  aiUpdateMemoryState({ ...memory, entries: memory.entries.filter((entry) => entry.id !== id) });
  refreshCurrentScreen?.({ keepProfileContent: false });
  toast('Memory-Eintrag gelöscht');
}

async function confirmClearAiMemory() {
  const ok = await confirm2(
    'Memory löschen?',
    'Alle gespeicherten Memory-Hinweise werden dauerhaft entfernt.'
  );
  if (!ok) return;
  aiUpdateMemoryState({ ...normalizeAiMemoryState(aiMemoryState), entries: [] });
  refreshCurrentScreen?.({ keepProfileContent: false });
  toast('Memory gelöscht');
}

function aiSaveChatSessions() {
  try {
    const payload = {
      activeId: aiActiveChatId,
      order: aiChatOrder,
      sessions: aiChatSessions,
      memory: normalizeAiMemoryState(aiMemoryState),
    };
    lsSet(AI_CHAT_STORAGE_KEY, payload);
    lsSet(AI_CHAT_ACTIVE_KEY, aiActiveChatId || '');
    syncChats();
  } catch (e) {
    console.warn('[AI] Speicherfehler:', e);
  }
}

function aiLoadChatSessions() {
  try {
    const raw = lsGet(AI_CHAT_STORAGE_KEY, 'null');
    if (raw) {
      const parsed = raw;
      aiChatSessions = parsed.sessions && typeof parsed.sessions === 'object' ? parsed.sessions : {};
      aiMemoryState = normalizeAiMemoryState(parsed.memory);
      aiChatOrder = Array.isArray(parsed.order)
        ? parsed.order.filter(id => aiChatSessions[id])
        : Object.keys(aiChatSessions);

      const storedActive = parsed.activeId || lsGet(AI_CHAT_ACTIVE_KEY, '""');
      aiActiveChatId = storedActive && aiChatSessions[storedActive]
        ? storedActive
        : (aiChatOrder[0] || null);
    } else {
      aiMemoryState = { ...AI_MEMORY_DEFAULT_STATE };
    }

    if (!aiActiveChatId) {
      const s = aiCreateChatSession('Neuer Chat', true);
      aiActiveChatId = s.id;
    }

    return aiGetActiveSession();
  } catch (e) {
    console.warn('[AI] Sessions konnten nicht geladen werden:', e);
    aiChatSessions = {};
    aiChatOrder = [];
    aiMemoryState = { ...AI_MEMORY_DEFAULT_STATE };
    const s = aiCreateChatSession('Neuer Chat', true);
    aiActiveChatId = s.id;
    return s;
  }
}

function aiCreateChatSession(title = 'Neuer Chat', makeActive = true) {
  const id = aiUid('chat');
  const session = {
    id,
    title,
    createdAt: aiNow(),
    updatedAt: aiNow(),
    messages: [],
    streaming: {
      active: false,
      assistantIndex: null,
      raw: ''
    }
  };

  aiChatSessions[id] = session;
  aiChatOrder.unshift(id);

  if (makeActive) {
    aiActiveChatId = id;
  }

  aiSaveChatSessions();
  return session;
}

function aiTouchSession(id = aiActiveChatId) {
  const s = aiGetSession(id);
  if (!s) return;
  s.updatedAt = aiNow();
  aiSaveChatSessions();
}

function aiRenameChatSession(id, newTitle) {
  const s = aiGetSession(id);
  if (!s) return;
  const t = (newTitle || '').trim();
  if (!t) return;
  s.title = t.slice(0, 60);
  s.updatedAt = aiNow();
  aiSaveChatSessions();
  openChatModal();
  renderAiBot();
}

function aiDeleteChatSession(id) {
  const s = aiGetSession(id);
  console.log('[AI] Deleting session', id, s);
  if (!s) return;

  if (aiCurrentStream?.sessionId === id) {
    aiCurrentStream = null;
  }

  delete aiChatSessions[id];
  aiChatOrder = aiChatOrder.filter(x => x !== id);

  if (aiActiveChatId === id) {
    aiActiveChatId = aiChatOrder[0] || null;

    if (!aiActiveChatId) {
      const fresh = aiCreateChatSession('Neuer Chat', true);
      aiActiveChatId = fresh.id;
    }
  }

  aiSaveChatSessions();
  renderAiBot();

  if (document.getElementById('chat-overlay')?.classList.contains('open')) {
    openChatModal();
  }
}

function aiSwitchChatSession(id) {
  if (!aiChatSessions[id]) return;

  aiActiveChatId = id;
  aiSaveChatSessions();
  closeChatModal();
  renderAiBot();
}

function aiSessionPreview(session) {
  const last = [...(session.messages || [])].reverse().find(m => m?.content);
  if (!last) return 'Leerer Chat';

  const text = String(last.content)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text.length > 72 ? text.slice(0, 72) + '…' : text;
}

function aiFormatSessionTime(ts) {
  try {
    return new Date(ts).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}

function aiEnsureChatModal() {
  if (document.getElementById('chat-overlay') && document.getElementById('chat-panel')) return;

  const overlay = document.createElement('div');
  overlay.id = 'chat-overlay';
  overlay.className = 'fp-overlay';
  overlay.onclick = closeChatModal;

  const panel = document.createElement('div');
  panel.id = 'chat-panel';
  panel.className = 'fp-panel';
  panel.innerHTML = `
    <div class="fp-head">
      <div style="font-size:13px;font-weight:800;">Chats</div>
      <button class="btn btn-sm" onclick="closeChatModal()">✕</button>
    </div>
    <div class="fp-body" id="chat-modal-body"></div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(panel);
}

function openChatModal() {
  aiEnsureChatModal();

  const overlay = document.getElementById('chat-overlay');
  const panel = document.getElementById('chat-panel');
  const body = document.getElementById('chat-modal-body');

  if (!overlay || !panel || !body) return;

  body.innerHTML = `
    <div style="display:flex;gap:8px;margin-bottom:12px;">
      <button class="btn btn-lime btn-sm" onclick="aiCreateAndOpenNewChat()">＋ Neuer Chat</button>
    </div>

    <div style="display:flex;flex-direction:column;gap:8px;">
      ${
        aiChatOrder.length
          ? aiChatOrder.map(id => {
              const s = aiChatSessions[id];
              const active = id === aiActiveChatId;
              const preview = aiSessionPreview(s);
              const time = aiFormatSessionTime(s.updatedAt || s.createdAt);

              return `
                <div class="friend-row ${active ? 'me' : ''}"
                    style="align-items:flex-start;cursor:pointer"
                    onclick='aiSwitchChatSession("${id}")'>
                  <div class="f-info" style="min-width:0;">
                    <div class="f-name" style="display:flex;align-items:center;gap:8px;justify-content:space-between;">
                      <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        ${escapeHtml(s.title || 'Unbenannt')}
                      </span>
                    </div>
                    <div class="f-pts" style="margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                      ${escapeHtml(preview)}
                    </div>
                    <div class="f-pts" style="margin-top:4px;opacity:.75;">
                      ${escapeHtml(time)}
                    </div>
                  </div>

                  <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0;">
                    <button class="btn btn-sm"
                            onclick='event.stopPropagation();openRenameChatModal("${id}")'>
                      Umbenennen
                    </button>
                    <button class="btn btn-sm btn-danger"
                            onclick='event.stopPropagation();aiConfirmDeleteChat("${id}")'>
                      Löschen
                    </button>
                  </div>
                </div>
              `;
            }).join('')
          : `<div style="color:var(--muted);font-size:12px;padding:10px 0;">Noch keine Chats vorhanden.</div>`
      }
    </div>
  `;

  overlay.classList.add('open');
  panel.classList.add('open');
}

function closeChatModal() {
  const overlay = document.getElementById('chat-overlay');
  const panel = document.getElementById('chat-panel');
  if (overlay) overlay.classList.remove('open');
  if (panel) panel.classList.remove('open');
}

function aiCreateAndOpenNewChat() {
  aiCreateChatSession('Neuer Chat', true);
  aiSaveChatSessions();
  closeChatModal();
  renderAiBot();
}

function openRenameChatModal(id) {
  const s = aiGetSession(id);
  if (!s) return;

  document.getElementById('npm-title').textContent = 'Chat umbenennen';

  document.getElementById('new-pool-content').innerHTML = `
    <div class="k-group">
      <label class="k-label">Chat-Name</label>
      <input class="k-input" id="chat-rename-input" value="${(s.title || '').replace(/"/g,'&quot;')}">
    </div>

    <button class="btn btn-lime" style="width:100%" onclick="saveRenamedChat('${id}')">
      Speichern
    </button>
  `;

  openModal('new-pool-modal');
}

function saveRenamedChat(id) {
  const input = document.getElementById('chat-rename-input');
  if (!input) return;

  const val = input.value.trim();
  if (!val) return;

  aiRenameChatSession(id, val);
  closeModal('new-pool-modal');
}

async function aiConfirmDeleteChat(id) {
  const s = aiGetSession(id);
  if (!s) return;

  const ok = await Promise.resolve(
    confirm2(`Chat "${s.title || 'Unbenannt'}" wirklich löschen?`)
  );

  if (!ok) return;
  aiDeleteChatSession(id);
}

/* =========================================================
   UI LOCK
   ========================================================= */

function setAiInputLocked(locked) {
  const inp = document.getElementById('aibot-inp');
  const btn = document.getElementById('aibot-send-btn');

  if (inp) {
    inp.disabled = locked;
    inp.style.opacity = locked ? '0.6' : '1';
    inp.style.pointerEvents = locked ? 'none' : 'auto';
  }

  if (btn) {
    btn.disabled = locked;
    btn.innerHTML = locked
      ? `<div class="kivo-spinner"></div>`
      : `➤`;
  }
}

/* =========================================================
   RENDER
   ========================================================= */

function aiRecoverStaleStreaming(session) {
  if (!session?.streaming?.active) return;

  const idx = session.streaming.assistantIndex;
  const msg = session.messages?.[idx];

  if (msg && msg.role === 'assistant') {
    msg.content = msg.content || session.streaming.raw || '';
    msg.streaming = false;

    // Prüfe, ob die Nachricht eine Vokabelliste enthält
    const vocabBlock = stripVocabBlock(msg.content);
    if (vocabBlock.hasVocab && vocabBlock.complete) {
      msg.vocabData = vocabBlock.vocabRaw; // Speichere die JSON-Daten für die Wiederherstellung
    }
  }

  session.streaming = {
    active: false,
    assistantIndex: null,
    raw: ''
  };

  aiSaveChatSessions();
}

function renderAiBot() {
  const wrap = document.getElementById('aibot-wrap');
  if (!wrap) return;

  if (!currentUser) {
    wrap.innerHTML = `
      <div class="k-card" style="text-align:center;padding:42px">
        <div style="color:var(--lime);margin-bottom:12px">${ic('lock',42)}</div>
        <div style="font-size:14px;font-weight:800;margin-bottom:8px">Anmeldung erforderlich</div>
        <button class="btn btn-lime" onclick="openModal('auth-modal')">Anmelden</button>
      </div>`;
    return;
  }

  aiLoadChatSessions();
  const session = aiGetActiveSession();
  if (!session) return;

  aiRecoverStaleStreaming(session);

  wrap.innerHTML = `
    <div class="aibot-msgs" id="aibot-msgs">
      <div class="ai-msg bot" id="welcome-msg"></div>
    </div>

    <div class="ai-suggest-wrap" id="ai-suggests">
      ${AI_TIPS.map(s => `
        <div class="ai-suggest" data-tip="${escapeHtml(s)}" onclick="aiBotSend(this.dataset.tip)">
          ${escapeHtml(s)}
        </div>
      `).join('')}
    </div>

    <div class="ai-input-row">
      <input
        class="k-input"
        id="aibot-inp"
        placeholder="Frag mich etwas..."
        style="flex:1"
        onkeydown="if(event.key==='Enter' && !this.disabled) aiBotSend()"
      >
      <button class="btn btn-lime btn-sm" id="aibot-send-btn" onclick="aiBotSend()">➤</button>
    </div>
  `;

  const msgs = document.getElementById('aibot-msgs');
  const sug = document.getElementById('ai-suggests');

  if (!session) return;

  // Load message history from session into aiBotHistory
  aiBotHistory = (session.messages || []).map(m => ({ role: m.role, content: m.content }));

  // bestehende Chats sofort aufbauen
  if (Array.isArray(session.messages) && session.messages.length > 0) {
    if (sug) sug.style.display = 'none';
    renderAiSessionMessages(session);
    return;
  }

  // leerer Chat: Welcome direkt in den Session-Flow schreiben
  if (sug) sug.style.display = 'flex';
  streamWelcomeMessage({ noStream: false });
}

function renderAiSessionMessages(session) {
  const msgs = document.getElementById('aibot-msgs');
  const sug = document.getElementById('ai-suggests');
  if (!msgs || !session) return;

  msgs.innerHTML = '';

  for (let i = 0; i < session.messages.length; i++) {
    const m = session.messages[i];
    const div = document.createElement('div');
    div.className = `ai-msg ${m.role === 'user' ? 'user' : 'bot'}`;

    if (m.role === 'user') {
      div.textContent = m.content || '';
    } else {
      // Prüfe, ob die Nachricht eine Vokabelliste enthält
      const vocabBlock = stripVocabBlock(m.content);
      if (vocabBlock.hasVocab && vocabBlock.complete) {
        try {
          const vocabData = JSON.parse(vocabBlock.vocabRaw);
          const importEnc = encodeURIComponent(JSON.stringify(vocabData));
          const introText = (vocabBlock.displayText || '').trim();

          if (introText) {
            const introDiv = document.createElement('div');
            introDiv.className = 'ai-msg bot';
            introDiv.innerHTML = renderMarkdown(vocabBlock.displayText);
            renderLatex(introDiv);
            highlightCode(introDiv);
            msgs.appendChild(introDiv);
          }

          const cardDiv = document.createElement('div');
          cardDiv.className = 'ai-msg bot ai-vocab-result';
          const importBtnId = aiUid('import');
          cardDiv.innerHTML = makeLoadingHTML(
            `Vokabelliste: "${vocabData.name || 'Unbenannt'}" (${vocabData.pairs?.length || 0} Wörter)`,
            undefined,
            'done',
            `
              <button class="btn btn-lime btn-sm" data-import-btn="${importBtnId}">
                📥 Direkt importieren
              </button>
            `
          );
          msgs.appendChild(cardDiv);

          const importBtn = cardDiv.querySelector(`[data-import-btn="${importBtnId}"]`);
          if (importBtn) {
            importBtn.addEventListener('click', () => importAiList(importEnc));
          }
          continue;
        } catch (e) {
          console.error('[AI] Fehler beim Parsen der Vokabelliste:', e);
          div.innerHTML = renderMarkdown(m.content);
          renderLatex(div);
          highlightCode(div);
        }
      } else {
        // Normale Nachricht (ohne Vokabelliste)
        div.innerHTML = renderMarkdown(m.content);
        renderLatex(div);
        highlightCode(div);
      }

      if (m.streaming) {
        const badge = document.createElement('div');
        badge.className = 'streaming-badge';
        badge.style.cssText =
          'margin-top:8px;font-size:11px;opacity:.7;display:flex;align-items:center;gap:8px;';
        badge.innerHTML = `<div class="kivo-spinner"></div><span>Wird wiederhergestellt…</span>`;
        div.appendChild(badge);
      }
    }

    msgs.appendChild(div);
  }

  if (sug) sug.style.display = session.messages.length ? 'none' : 'flex';
  msgs.scrollTop = msgs.scrollHeight;
}
/* =========================================================
   WELCOME
   ========================================================= */

async function streamWelcomeMessage({ noStream = false } = {}) {
  const session = aiEnsureSession();
  const el = document.getElementById('welcome-msg');
  const inp = document.getElementById('aibot-inp');

  if (!session) return;

  // Wenn bereits Inhalt existiert, niemals nochmal streamen
  if (session.messages.length > 0) {
    renderAiSessionMessages(session);
    return;
  }

  const text = aiWelcomeText();

  if (noStream) {
    session.messages.push({ role: 'assistant', content: text, kind: 'welcome', streaming: false });
    aiBotHistory.push({ role: 'assistant', content: text, kind: 'welcome' });
    session.updatedAt = aiNow();
    aiSaveChatSessions();

    if (el) {
      el.innerHTML = renderMarkdown(text);
      renderLatex(el);
      highlightCode(el);
    }
    return;
  }

  if (inp) {
    inp.value = '';
    inp.disabled = true;
    inp.style.opacity = '0.6';
    inp.style.pointerEvents = 'none';
  }

  // Welcome als Stream persistent machen
  const assistantIndex = session.messages.length;
  session.messages.push({
    role: 'assistant',
    content: '',
    kind: 'welcome',
    streaming: true
  });
  aiBotHistory.push({
    role: 'assistant',
    content: '',
    kind: 'welcome'
  });
  session.streaming = {
    active: true,
    assistantIndex,
    raw: ''
  };
  aiCurrentStream = {
    sessionId: session.id,
    assistantIndex,
    raw: '',
    requestId: aiUid('stream'),
    loadingDiv: el
  };
  aiSaveChatSessions();

  await streamText(el, text);

  session.messages[assistantIndex].content = text;
  session.messages[assistantIndex].streaming = false;
  session.streaming = {
    active: false,
    assistantIndex: null,
    raw: ''
  };
  aiCurrentStream = null;
  aiSaveChatSessions();

  if (inp) {
    inp.disabled = false;
    inp.style.opacity = '1';
    inp.style.pointerEvents = 'auto';
  }
}

/* =========================================================
   SEND
   ========================================================= */

function aiBotSend(preset) {
  const session = aiEnsureSession();
  const inp = document.getElementById('aibot-inp');
  const msg = (preset || (inp?.value || '')).trim();
  if (!msg) return;

  if (inp) inp.value = '';
  setAiInputLocked(true);

  const msgs = document.getElementById('aibot-msgs');
  if (!msgs) return;

  if (document.getElementById('ai-suggests')) {
    document.getElementById('ai-suggests').style.display = 'none';
  }

  // User message - add to both aiBotHistory and session.messages
  const userMsg = { role: 'user', content: msg };
  aiBotHistory.push(userMsg);
  session.messages.push(userMsg);
  aiTouchSession(session.id);

  const userDiv = document.createElement('div');
  userDiv.className = 'ai-msg user';
  userDiv.textContent = msg;
  msgs.appendChild(userDiv);

  // Assistant placeholder
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'ai-msg bot';
  loadingDiv.innerHTML = makeLoadingHTML('KI generiert Antwort...', undefined, 'loading');
  msgs.appendChild(loadingDiv);
  msgs.scrollTop = msgs.scrollHeight;

  const assistantIndex = session.messages.length;
  const assistantMsg = {
    role: 'assistant',
    content: '',
    streaming: true,
    skipAutoMemory: false,
    isMemoryRequest: aiIsExplicitMemoryRequest(msg)
  };
  aiBotHistory.push(assistantMsg);
  session.messages.push(assistantMsg);

  session.streaming = {
    active: true,
    assistantIndex,
    raw: ''
  };

  aiCurrentStream = {
    sessionId: session.id,
    assistantIndex,
    raw: '',
    requestId: aiUid('stream'),
    loadingDiv
  };

  aiSaveChatSessions();
  fetchAiReply(loadingDiv);
}

/* =========================================================
   STREAM / FETCH
   ========================================================= */

async function fetchAiReply(loadingDiv) {
  console.log('[AI] 🚀 fetchAiReply gestartet');

  const msgs = document.getElementById('aibot-msgs');
  const inp = document.getElementById('aibot-inp');
  const session = aiGetActiveSession();

  if (!msgs || !session) {
    console.warn('[AI] ❌ msgs/session fehlt');
    setAiInputLocked(false);
    return;
  }

  function extractVocabInfo(rawText) {
    if (!rawText) return null;

    try {
      let cleanedText = rawText.trim();

      while (
        cleanedText &&
        !cleanedText.startsWith('{') &&
        !cleanedText.startsWith('[')
      ) {
        cleanedText = cleanedText.slice(1).trim();
      }

      if (!cleanedText) return null;

      let name = null;
      let pairCount = 0;
      let totalPairs = 0;

      const nameMatch = cleanedText.match(/"name"\s*:\s*"([^"]*)"/);
      if (nameMatch) name = nameMatch[1];

      const totalMatch = cleanedText.match(/"length"\s*:\s*(\d+)/);
      if (totalMatch) totalPairs = parseInt(totalMatch[1], 10);

      const pairsMatch = cleanedText.match(/"pairs"\s*:\s*\[([\s\S]*)/);

      if (pairsMatch) {
        const pairsContent = pairsMatch[1];
        pairCount = (pairsContent.match(/\{[^}]*"/g) || []).length;
      }

      return { name, pairCount, totalPairs };
    } catch {
      return null;
    }
  }

  let fullText = '';
  let vocabRawBuffer = '';
  let inVocabBlock = false;
  let vocabLoaderDiv = null;
  let hasRenderedVocab = false;
  let rafPending = false;
  let buffer = '';

  const persistStreamState = () => {
    const active = aiGetActiveSession();

    if (!active || !aiCurrentStream) return;

    const idx = aiCurrentStream.assistantIndex;

    if (active.messages[idx]) {
      active.messages[idx].content = aiCurrentStream.raw;
      active.messages[idx].streaming = true;
    }

    if (aiBotHistory[idx]) {
      aiBotHistory[idx].content = aiCurrentStream.raw;
    }

    active.streaming = {
      active: true,
      assistantIndex: idx,
      raw: aiCurrentStream.raw
    };

    aiSaveChatSessions();
  };

  const render = (text) => {
    if (!text) return;

    fullText += text;

    const startTag = '<vocab_list>';
    const endTag = '</vocab_list>';

    if (fullText.includes(startTag)) {
      inVocabBlock = true;
    }

    if (inVocabBlock && loadingDiv._streamState) {
      const cleaned = loadingDiv._streamState.fullText
        .replace(/<vocab_list[\s\S]*$/i, '')
        .replace(/<vocab[\s\S]*$/i, '')
        .replace(/<voc[\s\S]*$/i, '')
        .replace(/<vo[\s\S]*$/i, '')
        .replace(/<v[\s\S]*$/i, '')
        .replace(/<[\s\S]*$/i, '');

      loadingDiv._streamState.fullText = cleaned;
      loadingDiv._streamState.renderedLength = cleaned.length;

      loadingDiv.innerHTML = renderMarkdown(cleaned);

      renderLatex(loadingDiv);
      highlightCode(loadingDiv);
    }

    if (inVocabBlock) {
      const startIndex = fullText.indexOf(startTag);
      const endIndex = fullText.indexOf(endTag, startIndex);

      if (startIndex !== -1) {
        let jsonStart = startIndex + startTag.length;
        let jsonContent = fullText.slice(jsonStart);

        if (jsonContent.startsWith('>')) {
          jsonContent = jsonContent.slice(1);
        }

        if (endIndex === -1) {
          vocabRawBuffer = jsonContent;
        } else {
          vocabRawBuffer = fullText.slice(jsonStart, endIndex);

          if (vocabRawBuffer.startsWith('>')) {
            vocabRawBuffer = vocabRawBuffer.slice(1);
          }
        }
      }
    }

    const displayText = inVocabBlock
      ? fullText.slice(0, fullText.indexOf(startTag))
      : fullText;

    if (displayText.trim()) {
      const alreadyRendered = loadingDiv._streamState?.fullText || '';
      const newChunk = displayText.slice(alreadyRendered.length);

      if (newChunk) {
        streamText(loadingDiv, newChunk);
      }
    }

    if (inVocabBlock && !vocabLoaderDiv) {
      vocabLoaderDiv = document.createElement('div');
      vocabLoaderDiv.className = 'ai-msg bot ai-vocab-loader';

      vocabLoaderDiv.innerHTML = makeLoadingHTML(
        'KI generiert Vokabelliste...',
        undefined,
        'loading'
      );

      msgs.appendChild(vocabLoaderDiv);
      msgs.scrollTop = msgs.scrollHeight;
    }

    if (inVocabBlock && vocabLoaderDiv) {
      try {
        const labelEl = document.getElementById('loading-label');
        const barEl = document.getElementById('loading-bar');

        const vocabInfo = extractVocabInfo(vocabRawBuffer);

        if (vocabInfo && vocabInfo.pairCount > 0) {
          const name = vocabInfo.name || 'Unbenannt';

          const wordLabel =
            vocabInfo.totalPairs === 1
              ? 'Wort'
              : 'Wörter';

          const text = `Vokabelliste: "${name}" (${vocabInfo.pairCount} ${wordLabel})`;

          const progress = vocabInfo.totalPairs
            ? Math.min(
                100,
                Math.round(
                  (vocabInfo.pairCount / vocabInfo.totalPairs) * 100
                )
              )
            : undefined;

          if (!barEl) {
            vocabLoaderDiv.innerHTML = makeLoadingHTML(
              text,
              progress,
              'loading'
            );
          } else {
            if (labelEl) {
              labelEl.textContent = text;
            }

            barEl.style.width = progress + '%';
          }
        }
      } catch (e) {
        console.log('[AI] Partial JSON (ignored):', e.message);
      }
    }

    if (
      inVocabBlock &&
      fullText.includes(endTag) &&
      !hasRenderedVocab
    ) {
      hasRenderedVocab = true;

      try {
        const vocabData = JSON.parse(vocabRawBuffer);

        const importEnc = encodeURIComponent(
          JSON.stringify(vocabData)
        );

        const div = document.createElement('div');
        div.className = 'ai-msg bot ai-vocab-result';

        const label =
          `Vokabelliste: "${vocabData.name || 'Unbenannt'}" ` +
          `(${vocabData.pairs?.length || 0} Wörter)`;

        div.innerHTML = makeLoadingHTML(
          label,
          100,
          'done',
          `
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
              <button class="btn btn-lime btn-sm"
                      onclick="importAiList('${importEnc}')">
                📥 Direkt importieren
              </button>
            </div>
          `
        );

        if (vocabLoaderDiv) {
          vocabLoaderDiv.replaceWith(div);
        } else {
          msgs.appendChild(div);
        }
      } catch (e) {
        console.error('[AI] JSON error:', e);

        if (vocabLoaderDiv) {
          const errorDiv = document.createElement('div');

          errorDiv.className = 'ai-msg bot ai-vocab-result';

          errorDiv.innerHTML = makeLoadingHTML(
            'Fehler beim Verarbeiten der Vokabelliste',
            0,
            'error',
            '',
            e.message
          );

          vocabLoaderDiv.replaceWith(errorDiv);
        }
      }
    }

    msgs.scrollTop = msgs.scrollHeight;
  };

  const processStream = (chunk) => {
    if (!chunk) return;

    buffer += chunk;

    if (!rafPending) {
      rafPending = true;

      requestAnimationFrame(() => {
        const currentChunk = buffer;

        buffer = '';
        rafPending = false;

        if (!aiCurrentStream) return;

        aiCurrentStream.raw += currentChunk;

        persistStreamState();
        render(currentChunk);

        if (inVocabBlock) {
          const vocabInfo = extractVocabInfo(vocabRawBuffer);

          if (vocabInfo) {
            const name = vocabInfo.name || 'Unbenannt';

            const progressText = vocabInfo.totalPairs
              ? `[LIVE UPDATE] Vokabelliste: "${name}" (${vocabInfo.pairCount}/${vocabInfo.totalPairs} Wörter - ${Math.round((vocabInfo.pairCount / vocabInfo.totalPairs) * 100)}%)`
              : `[LIVE UPDATE] Vokabelliste: "${name}" (${vocabInfo.pairCount} Wörter)`;

            console.log(progressText);
          } else {
            console.log('[LIVE UPDATE] Warte auf gültigen JSON-Inhalt...');
          }
        }
      });
    }
  };

  try {
    console.log('[AI] 📡 sending request...');

    const resp = await fetch(
      SUPABASE_URL + '/functions/v1/kivo-ai',
      {
        method: 'POST',
        headers: await edgeHeaders(),
        body: JSON.stringify({
          mode: 'chat',
          system: buildAiSystemPrompt(),
          messages: aiBotHistory
        })
      }
    );

    if (!resp.ok || !resp.body) {
      throw new Error('No stream response');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      processStream(chunk);
    }

    const tail = decoder.decode();

    if (tail) {
      processStream(tail);
    }

    // Stream finalisieren
    const active = aiGetActiveSession();
    const responseText = aiCurrentStream?.raw || '';

    if (active && aiCurrentStream) {
      const idx = aiCurrentStream.assistantIndex;

      if (active.messages[idx]) {
        active.messages[idx].content = aiCurrentStream.raw;
        active.messages[idx].streaming = false;
      }

      if (aiBotHistory[idx]) {
        aiBotHistory[idx].content = aiCurrentStream.raw;
      }

      const shouldSaveMemory = active.messages[idx]?.isMemoryRequest
        || aiAssistantConfirmedMemory(aiCurrentStream.raw);

      // Speichere Memory-Eintrag, wenn der Nutzer explizit etwas merken lassen wollte
      // oder das Modell die Speicherung bestaetigt hat.
      if (shouldSaveMemory) {
        const userMsg = active.messages[idx - 1]?.content || '';
        aiRememberExplicitUserFact(userMsg, aiCurrentStream.raw);
      }

      active.streaming = {
        active: false,
        assistantIndex: null,
        raw: ''
      };

      aiSaveChatSessions();
    }
  } catch (e) {
    console.error('[AI] 💥 ERROR:', e);

    loadingDiv.innerHTML = makeLoadingHTML(
      'Fehler',
      0,
      'error',
      '',
      e.message
    );
  } finally {
    aiCurrentStream = null;

    if (inp) {
      inp.disabled = false;
      inp.style.opacity = '1';
      inp.style.pointerEvents = 'auto';
      inp.focus();
    }

    setAiInputLocked(false);

    aiSaveChatSessions();

    renderAiSessionMessages(aiGetActiveSession());
  }
}

/* =========================================================
   HELPER FUNCTIONS FOR AI CHAT
   ========================================================= */

function makeLoadingHTML(label = 'Lädt...', progress = undefined, status = 'loading', buttons = '', errorMsg = '') {
  let barHtml = '';
  if (progress !== undefined) {
    barHtml = `<div class="loading-bar-container" style="width:100%;height:6px;background:var(--line);border-radius:3px;margin:8px 0;overflow:hidden"><div id="loading-bar" class="loading-bar" style="height:100%;background:var(--lime);width:${Math.max(0, Math.min(100, progress))}%;transition:width 0.3s ease"></div></div>`;
  }

  let statusIcon = '⏳';
  let statusColor = 'var(--muted)';

  if (status === 'done') {
    statusIcon = '✓';
    statusColor = 'var(--lime)';
  } else if (status === 'error') {
    statusIcon = '✕';
    statusColor = 'var(--danger)';
  } else if (status === 'loading') {
    statusIcon = '<span class="kivo-spinner"></span>';
    statusColor = 'var(--lime)';
  }

  const errorHtml = errorMsg ? `<div style="margin-top:8px;padding:8px;background:var(--danger);color:white;border-radius:4px;font-size:11px">${escapeHtml(errorMsg)}</div>` : '';

  return `
    <div style="display:flex;flex-direction:column;align-items:flex-start;width:100%">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="color:${statusColor};display:flex;align-items:center">${statusIcon}</span>
        <span id="loading-label" style="font-size:13px;font-weight:600">${escapeHtml(label)}</span>
      </div>
      ${barHtml}
      ${buttons ? `<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">${buttons}</div>` : ''}
      ${errorHtml}
    </div>
  `;
}

async function streamText(el, text) {
  if (!el) return;

  // Initialize stream state if not already done
  if (!el._streamState) {
    el._streamState = {
      fullText: '',
      renderedLength: 0
    };
  }

  const chunkSize = 8;
  const delay = 15;

  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, Math.min(i + chunkSize, text.length));
    el._streamState.fullText += chunk;

    const displayed = el._streamState.fullText.slice(0, el._streamState.renderedLength + chunk.length);
    el._streamState.renderedLength = displayed.length;

    el.innerHTML = renderMarkdown(displayed);
    renderLatex(el);
    highlightCode(el);

    if (el.parentElement) {
      el.parentElement.scrollTop = el.parentElement.scrollHeight;
    }

    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

/* =========================================================
   INIT
   ========================================================= */

function initAiChatPersistence() {
  aiLoadChatSessions();
  window.addEventListener('beforeunload', () => {
    aiSaveChatSessions();
  });
}

async function importAiList(encOrRaw) {
  try {
    let raw = encOrRaw;
    try {
      raw = decodeURIComponent(encOrRaw);
    } catch (_) {
      // schon raw
    }
    const p = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const lang = p.lang || 'KI-Import';
    const name = p.name || 'KI-Liste';
    const pairs = p.pairs || [];
    if (!pairs.length) {
      toast('Keine Vokabeln');
      return;
    }
    const poolData = {
      subcats: {
        [name]: pairs.map(x => [x.en, x.de])
      }
    };
    if (!POOLS[lang]) POOLS[lang] = {};
    POOLS[lang][name] = poolData;
    saveCustom();
    if (currentUser) {
      await syncPoolToServer(lang, name);
    }
    loadState();
    if (typeof renderCourses === 'function') renderCourses();
    toast(`✓ "${name}" mit ${pairs.length} Wörtern importiert!`);
    const shouldSwitch = await confirm2(
      'Pool wechseln?',
      `Zu "${name}" wechseln und lernen?`
    );
    if (shouldSwitch) {
      setActivePool(mkKey(lang, name));
      goTo('courses');
    }
  } catch (e) {
    toast('Fehler: ' + e.message);
  }
}




