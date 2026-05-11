// â”€â”€ GAP FILL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function renderOfflineGapText() {
  const fallback = gapVocab
    .map(v => `Die Ãœbersetzung fÃ¼r "${v.en}" ist [[${v.de}]].`)
    .join(' ');
  renderGapUI(fallback);
}

async function generateGapText() {
  document.getElementById('gap-content').innerHTML =
    `<div id="gap-output"></div>`;

  const outEl = document.getElementById('gap-output');
  if (!outEl) return;

  const flat = flattenPool(getPoolObj(activeKey));
  gapVocab = shuf(flat).slice(0, Math.min(6, flat.length));
  const poolName = spKey(activeKey).p;

  // 1ï¸âƒ£ Einmal HTML erstellen (mit IDs!)
  outEl.innerHTML = makeLoadingHTML('KI startet... (0%)', 0, 'loading');

  const updateProgress = (pct, phase) => {
    const p = Math.max(0, Math.min(100, Number(pct) || 0));
    const labelEl = document.getElementById('loading-label');
    const barEl = document.getElementById('loading-bar');

    const text =
      phase === 'connected'
        ? `KI verbindet... (${p}%)`
        : phase === 'generating'
        ? `KI generiert Text... (${p}%)`
        : phase === 'start'
        ? `KI startet... (${p}%)`
        : phase === 'done'
        ? `Text erfolgreich generiert`
        : phase === 'error'
        ? `Fehler beim Generieren`
        : `KI generiert Text... (${p}%)`;

    if (labelEl) labelEl.textContent = text;
    if (barEl) barEl.style.width = `${p}%`;
  };

  try {
    const resp = await fetch(
      SUPABASE_URL + '/functions/v1/kivo-ai',
      {
        method: 'POST',
        headers: await edgeHeaders(),
        body: JSON.stringify({
          mode: 'gap',
          poolName,
          words: gapVocab.map(v => v.de),
        }),
      }
    );

    if (!resp.ok || !resp.body) {
      throw new Error(`KI-Dienst nicht erreichbar (Status: ${resp.status})`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      let idx = buffer.indexOf('\n\n');

      while (idx !== -1) {
        const eventBlock = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const lines = eventBlock.split(/\r?\n/);

        let eventName = 'message';
        let dataLine = '';

        for (const line of lines) {
          if (line.startsWith('event:')) eventName = line.slice(6).trim();
          if (line.startsWith('data:')) dataLine += line.slice(5).trim();
        }

        if (dataLine) {
          try {
            const data = JSON.parse(dataLine);
            if (eventName === 'meta' || eventName === 'progress') {
              updateProgress(data.progress, data.phase);
            }
            else if (eventName === 'done') {
              finalText = data.text || '';
              updateProgress(100, 'done');
            }
            else if (eventName === 'error') {
              throw new Error(data.message || 'Unbekannter Fehler');
            }
          } catch (_) {}
        }
        idx = buffer.indexOf('\n\n');
      }
    }

    if (!finalText.trim()) {
      throw new Error('Keine Antwort erhalten');
    }

    renderGapUI(finalText);

  } catch (error) {
    const errorMsg = error.message || 'Unbekannter Fehler';
    outEl.innerHTML = makeLoadingHTML(
      'Fehler beim Generieren',
      100,
      'error',
      `
        <button class="btn btn-lime btn-sm" onclick="renderOfflineGapText()">
          Offline-Modus starten
        </button>
        <button class="btn btn-ghost btn-sm" onclick="generateGapText()">
          â†º Erneut generieren
        </button>
      `,
      errorMsg
    );
  }
}

function renderGapUI(raw) {
  const outEl = document.getElementById('gap-output');
  if (!outEl) return;

  let idx = 0;
  const html = raw.replace(/\[\[([^\]]+)\]\]/g, (_, word) => {
    const i = idx++;
    const v = gapVocab.find(v => v.de.toLowerCase() === word.toLowerCase()) || { de: word, en: '?' };
    return `<input class="gap-blank" id="gb-${i}" data-answer="${v.de}" size="${Math.max(8, word.length + 2)}" autocomplete="off" spellcheck="false" onkeyup="checkGapLive(this)">`;
  });

  // StandardmÃ¤ÃŸig werden alle Buttons angezeigt
  let buttonsHtml = `
    <button class="btn btn-lime btn-sm" onclick="checkAllGaps()">âœ“ ÃœberprÃ¼fen</button>
    <button class="btn btn-ghost btn-sm" onclick="generateGapText()">â†º Neu</button>
  `;

  outEl.innerHTML = `
    <div id="gap-result"></div>

    <div class="k-card" style="margin-bottom:12px">
      <div class="gap-text">${html}</div>
      <div style="display:flex;gap:7px;flex-wrap:wrap" id="gap-buttons">
        ${buttonsHtml}
      </div>
    </div>

    <div class="k-card-sm">
      <div class="k-section-title">Gesucht</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${gapVocab.map(v => `<span style="padding:3px 9px;background:var(--panel-2);border:1px solid var(--line);border-radius:999px;font-size:10px;color:var(--muted)">${v.en}</span>`).join('')}
      </div>
    </div>
  `;
}

// Aktualisierte checkAllGaps-Funktion, um die Buttons anzupassen
function checkAllGaps() {
  let ok = 0, tot = 0;
  document.querySelectorAll('.gap-blank').forEach(inp => {
    tot++;
    const ans = (inp.dataset.answer || '').toLowerCase().trim();
    const val = inp.value.toLowerCase().trim();
    if (val === ans) {
      inp.className = 'gap-blank gb-ok';
      ok++;
    } else {
      inp.className = 'gap-blank gb-no';
    }
  });

  const pct = tot ? Math.round(ok / tot * 100) : 0;
  const res = document.getElementById('gap-result');
  if (res) {
    res.innerHTML = `<div class="k-card-sm" style="margin-bottom:12px">${ok === tot ? 'ðŸŽ‰' : 'ðŸ“'} <strong>${ok}/${tot}</strong> richtig (${pct}%)${ok === tot ? ` <span style="color:var(--lime)">+${ok * 3} XP!</span>` : ''}</div>`;
  }

  // Buttons anpassen
  const buttonsContainer = document.getElementById('gap-buttons');
  if (buttonsContainer) {
    if (ok === tot) {
      buttonsContainer.innerHTML = `
        <button class="btn btn-ghost btn-sm" onclick="generateGapText()">â†º Neu</button>
      `;
    } else if (res) {
      buttonsContainer.innerHTML = `
        <button class="btn btn-lime btn-sm" onclick="checkAllGaps()">âœ“ ÃœberprÃ¼fen</button>
        <button class="btn btn-ghost btn-sm" onclick="revealGaps()">ðŸ‘ LÃ¶sung</button>
        <button class="btn btn-ghost btn-sm" onclick="generateGapText()">â†º Neu</button>
      `;
    }
  }

  if (ok === tot) addXp(ok * 3);
}

// Aktualisierte revealGaps-Funktion, um die Buttons anzupassen
function revealGaps() {
  document.querySelectorAll('.gap-blank').forEach(inp => {
    inp.value = inp.dataset.answer || '';
    inp.className = 'gap-blank gb-ok';
    inp.disabled = true;
  });

  // Buttons anpassen: Nur "Neu" anzeigen
  const buttonsContainer = document.getElementById('gap-buttons');
  if (buttonsContainer) {
    buttonsContainer.innerHTML = `
      <button class="btn btn-ghost btn-sm" onclick="generateGapText()">â†º Neu</button>
    `;
  }
}

function checkGapLive(inp) {
  const ans=(inp.dataset.answer||'').toLowerCase().trim(), val=inp.value.toLowerCase().trim();
  if(!val){inp.className='gap-blank';return;}
  if(val===ans) {
    inp.className='gap-blank gb-ok';
  }
}



