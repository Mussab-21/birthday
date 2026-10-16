// constellation.js — Scene 4 stars gift: tap stars to reveal memories + voice note
import { audioManager } from '../core/audioManager.js';

export function renderConstellationGift(container, app, giftData, onClose) {
  const { stars, voiceAudio, voiceCaption } = giftData;
  let openedCount = 0;
  let voiceTriggered = false;

  // Place tap hint
  const tapHint = document.createElement('p');
  tapHint.className = 'stars-tap-hint';
  tapHint.textContent = 'Tap a star to uncover a memory…';
  container.appendChild(tapHint);

  // Render interactive stars
  stars.forEach((starData, i) => {
    const star = document.createElement('div');
    star.className = `interactive-star size-${starData.size}`;
    star.style.left = starData.x + '%';
    star.style.top = starData.y + '%';
    star.style.animationDelay = (i * 0.4) + 's';
    star.setAttribute('role', 'button');
    star.setAttribute('aria-label', `Star: ${starData.title}`);

    const body = document.createElement('div');
    body.className = 'star-body';
    star.appendChild(body);

    container.appendChild(star);

    star.addEventListener('click', () => openStar(starData, star));
    star.addEventListener('touchend', (e) => { e.preventDefault(); openStar(starData, star); });
  });

  // Play voice note after first star tap
  function maybePlayVoice() {
    if (voiceTriggered) return;
    voiceTriggered = true;
    if (voiceAudio) {
      audioManager.playVoice(voiceAudio, null);
    }
  }

  function openStar(starData, starEl) {
    tapHint.style.display = 'none';
    audioManager.playStarChime(starData.special ? 880 : 660);
    maybePlayVoice();

    // Mark star as opened
    starEl.style.pointerEvents = 'none';
    starEl.querySelector('.star-body').style.boxShadow = '0 0 32px rgba(201,182,255,0.95)';

    // Show memory card
    const card = document.createElement('div');
    card.className = 'star-memory-card';
    card.innerHTML = `
      <div class="star-memory-inner">
        <div class="star-memory-icon">${starData.special ? '✨' : '⭐'}</div>
        <p class="star-memory-title">${starData.title}</p>
        <p class="star-memory-text">${starData.memory}</p>
        <button class="star-close-btn" id="starClose">close</button>
      </div>
    `;
    app.appendChild(card);
    requestAnimationFrame(() => card.classList.add('visible'));

    card.querySelector('#starClose').addEventListener('click', () => {
      card.classList.remove('visible');
      setTimeout(() => {
        card.remove();
        openedCount++;
        checkAllOpened();
      }, 500);
    });
  }

  function checkAllOpened() {
    if (openedCount >= stars.length) {
      // All stars opened — show completed constellation modal with voice note replay
      const doneOverlay = document.createElement('div');
      doneOverlay.className = 'gift-modal-overlay';
      doneOverlay.innerHTML = `
        <div class="gift-modal">
          <div class="gift-modal-handle"></div>
          <div class="voice-note-card">
            <div class="voice-icon" style="font-size:36px;">🌌</div>
            <p style="font-family:var(--font-serif);font-size:20px;font-style:italic;color:rgba(255,255,255,0.95);">
              You've touched every star in your sky tonight
            </p>
            <p style="font-family:var(--font-sans);font-size:12px;color:rgba(245,233,184,0.7);letter-spacing:0.08em;text-transform:uppercase;">
              March 19th • Stargazing Peak • 0:33
            </p>
            <button class="voice-play-btn" id="starVoicePlayBtn" aria-label="Replay voice note">
              ${audioManager.isPlayingVoice() ? '❚❚' : '▶'}
            </button>
            <div class="voice-waveform ${audioManager.isPlayingVoice() ? 'playing' : ''}" id="starWaveform">
              <div class="voice-wave-bar"></div>
              <div class="voice-wave-bar"></div>
              <div class="voice-wave-bar"></div>
              <div class="voice-wave-bar"></div>
              <div class="voice-wave-bar"></div>
              <div class="voice-wave-bar"></div>
            </div>
            ${voiceCaption ? `
              <p style="font-family:var(--font-serif);font-size:15px;font-style:italic;color:rgba(255,255,255,0.7);text-align:center;line-height:1.7;max-width:320px;margin-top:10px;">
                "${voiceCaption}"
              </p>` : ''}
            <button id="starsDone" style="padding:12px 32px;background:rgba(245,233,184,0.15);border:1px solid rgba(245,233,184,0.4);border-radius:100px;color:rgba(245,233,184,0.95);font-family:var(--font-serif);font-size:16px;font-style:italic;margin-top:16px;cursor:pointer;transition:all 0.3s ease;">
              One more place →
            </button>
          </div>
        </div>
      `;
      app.appendChild(doneOverlay);
      requestAnimationFrame(() => doneOverlay.classList.add('visible'));

      const starPlayBtn = doneOverlay.querySelector('#starVoicePlayBtn');
      const starWaveform = doneOverlay.querySelector('#starWaveform');

      function setStarPlaying(playing) {
        if (playing) {
          starPlayBtn.textContent = '❚❚';
          starWaveform.classList.add('playing');
        } else {
          starPlayBtn.textContent = '▶';
          starWaveform.classList.remove('playing');
        }
      }

      starPlayBtn.addEventListener('click', () => {
        audioManager.toggleVoice(
          voiceAudio,
          () => setStarPlaying(false),
          (active) => setStarPlaying(active)
        );
      });

      doneOverlay.querySelector('#starsDone').addEventListener('click', () => {
        audioManager.stopVoice();
        doneOverlay.classList.remove('visible');
        setTimeout(() => { doneOverlay.remove(); onClose(); }, 700);
      });
    }
  }
}
