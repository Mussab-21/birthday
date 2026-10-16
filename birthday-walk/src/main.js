// main.js — App entry point
import './style.css';
import { isUnlocked, getTimeUntilUnlock, verifyPassword, DEV_MODE } from './core/timeLock.js';
import { audioManager } from './core/audioManager.js';
import { SCENES_DATA } from './scenes/scenes.js';
import { renderGate } from './ui/gate.js';
import { renderLoading } from './ui/loading.js';
import { renderMuteButton } from './ui/muteButton.js';
import { SceneRenderer } from './ui/sceneRenderer.js';
import { renderClosing } from './ui/closing.js';

const app = document.getElementById('app');

// ─── Boot ────────────────────────────────────────────────────────────────────
async function boot() {
  if (!isUnlocked()) {
    showLocked();
  } else {
    showGate();
  }
}

// ─── Locked Screen ───────────────────────────────────────────────────────────
function showLocked() {
  const timeData = getTimeUntilUnlock();
  app.innerHTML = `
    <div class="locked-screen">
      <div class="locked-stars" id="lockedStars"></div>
      <div class="locked-content">
        <div class="locked-moon" id="lockedMoon" title="Tap 3 times for preview">🌙</div>
        <p class="locked-urdu">ابھی نہیں، نینو۔</p>
        <p class="locked-en">Come back at midnight.</p>
        <p class="locked-sub">Something is waiting for you.</p>
        <div class="countdown" id="countdown">
          <span id="cd-h">${String(timeData?.h || 0).padStart(2,'0')}</span>
          <span class="cd-sep">:</span>
          <span id="cd-m">${String(timeData?.m || 0).padStart(2,'0')}</span>
          <span class="cd-sep">:</span>
          <span id="cd-s">${String(timeData?.s || 0).padStart(2,'0')}</span>
        </div>
        <p class="locked-hint">18 October 2026 • 12:00 AM PKT</p>
      </div>
    </div>
  `;
  generateStars('lockedStars', 80);

  let moonTaps = 0;
  const moon = document.getElementById('lockedMoon');
  if (moon) {
    moon.style.cursor = 'pointer';
    moon.addEventListener('click', () => {
      moonTaps++;
      if (moonTaps >= 3) {
        clearInterval(interval);
        showGate();
      }
    });
  }

  const interval = setInterval(() => {
    const t = getTimeUntilUnlock();
    if (!t) { clearInterval(interval); showGate(); return; }
    const hEl = document.getElementById('cd-h');
    const mEl = document.getElementById('cd-m');
    const sEl = document.getElementById('cd-s');
    if (hEl) hEl.textContent = String(t.h).padStart(2,'0');
    if (mEl) mEl.textContent = String(t.m).padStart(2,'0');
    if (sEl) sEl.textContent = String(t.s).padStart(2,'0');
  }, 1000);
}

// ─── Gate / Password Screen ──────────────────────────────────────────────────
function showGate() {
  renderGate(app, async (password) => {
    const ok = await verifyPassword(password);
    if (ok) {
      startExperience();
      return true;
    }
    return false;
  });
}

// ─── Main Experience ─────────────────────────────────────────────────────────
async function startExperience() {
  // Unlock audio on first interaction
  audioManager.start();

  // Show loading screen
  renderLoading(app, async () => {
    // Preload first scene assets
    await preloadScene(SCENES_DATA[0]);
    beginScene(0);
  });
}

async function preloadScene(sceneData) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;
    img.src = sceneData.bg;
  });
}

let currentSceneIndex = 0;
let sceneRenderer = null;

function beginScene(index) {
  currentSceneIndex = index;
  const data = SCENES_DATA[index];

  // Clear and render
  app.innerHTML = '';
  renderMuteButton(app);

  sceneRenderer = new SceneRenderer(app, data, {
    onGiftOpened: () => {
      // Show urdu quote overlay before going to next scene
      if (data.urduQuote && data.next) {
        showUrduTransition(data.urduQuote, () => goToNextScene(index));
      } else if (data.next) {
        goToNextScene(index);
      } else {
        // Last scene - show closing
        showUrduTransition(null, () => showClosing());
      }
    }
  });

  sceneRenderer.render();

  // Preload next scene in background
  if (index + 1 < SCENES_DATA.length) {
    preloadScene(SCENES_DATA[index + 1]);
  }
}

function goToNextScene(currentIndex) {
  const nextIndex = currentIndex + 1;
  if (nextIndex >= SCENES_DATA.length) {
    showClosing();
    return;
  }

  // Fade to black then render next
  const fadeEl = document.createElement('div');
  fadeEl.className = 'scene-fade';
  app.appendChild(fadeEl);
  fadeEl.style.opacity = '0';

  setTimeout(() => {
    fadeEl.style.transition = 'opacity 1.2s ease';
    fadeEl.style.opacity = '1';
    setTimeout(() => {
      audioManager.crossfade(SCENES_DATA[nextIndex].id, SCENES_DATA[nextIndex].ambient, SCENES_DATA[nextIndex].music);
      beginScene(nextIndex);
    }, 1300);
  }, 50);
}

// ─── Urdu Quote Transition ───────────────────────────────────────────────────
function showUrduTransition(quoteData, onComplete) {
  const overlay = document.createElement('div');
  overlay.className = 'quote-overlay';

  if (quoteData) {
    overlay.innerHTML = `
      <div class="quote-content">
        <p class="quote-urdu" dir="rtl">${quoteData.ur}</p>
        <p class="quote-en">${quoteData.en}</p>
        <button class="quote-continue" id="quoteContinue">continue →</button>
      </div>
    `;
  } else {
    overlay.innerHTML = `
      <div class="quote-content">
        <p class="quote-urdu" dir="rtl">وہ دن ضرور آئے گا۔</p>
        <p class="quote-en">That day will surely come.</p>
        <button class="quote-continue" id="quoteContinue">continue →</button>
      </div>
    `;
  }

  app.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));

  overlay.querySelector('#quoteContinue').addEventListener('click', () => {
    overlay.classList.remove('visible');
    setTimeout(() => { overlay.remove(); onComplete(); }, 700);
  });
}

// ─── Closing Screen ──────────────────────────────────────────────────────────
function showClosing() {
  const fadeEl = document.createElement('div');
  fadeEl.className = 'scene-fade';
  app.appendChild(fadeEl);
  fadeEl.style.opacity = '0';
  setTimeout(() => {
    fadeEl.style.transition = 'opacity 1.5s ease';
    fadeEl.style.opacity = '1';
    setTimeout(() => {
      renderClosing(app, () => {
        // Replay
        currentSceneIndex = 0;
        startExperience();
      });
    }, 1600);
  }, 50);
}

// ─── Utility ─────────────────────────────────────────────────────────────────
function generateStars(containerId, count) {
  const container = document.getElementById(containerId);
  if (!container) return;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'bg-star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    const size = Math.random() * 2 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.animationDelay = Math.random() * 4 + 's';
    star.style.animationDuration = (Math.random() * 3 + 2) + 's';
    container.appendChild(star);
  }
}

// Start the app
boot();
