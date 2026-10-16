// fogReveal.js — Scene 2 fog-wipe letter gift with voice note integration
import { audioManager } from '../core/audioManager.js';

export function renderFogLetterGift(sceneContainer, app, giftData, onClose) {
  // Create canvas covering full screen as fog
  const canvas = document.createElement('canvas');
  canvas.className = 'fog-canvas';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.setAttribute('aria-label', 'Wipe the glass to reveal the message');
  sceneContainer.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // Draw fog layer (frosted glass effect)
  const grd = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, canvas.width * 0.8
  );
  grd.addColorStop(0, 'rgba(100,130,160,0.92)');
  grd.addColorStop(1, 'rgba(20,40,60,0.98)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Hint text on canvas
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = `italic 19px 'Cormorant Garamond', Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Wipe the glass…', canvas.width / 2, canvas.height / 2);

  // Underlying letter preview
  const letterEl = document.createElement('div');
  letterEl.style.cssText = `
    position: absolute; inset: 0; z-index: 18;
    display: flex; align-items: center; justify-content: center;
    padding: 32px; pointer-events: none;
  `;
  letterEl.innerHTML = `
    <div style="max-width:380px;background:rgba(10,12,30,0.85);border:1px solid rgba(127,163,199,0.25);border-radius:20px;padding:32px 28px;">
      <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;line-height:1.9;color:rgba(255,255,255,0.92);font-style:italic;white-space:pre-line;">${giftData.content.en}</p>
    </div>
  `;
  sceneContainer.insertBefore(letterEl, canvas);

  // Wipe logic
  const totalPixels = canvas.width * canvas.height;
  let revealed = false;

  function wipeAt(x, y) {
    const radius = 45;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    if (!revealed) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let clearedCount = 0;
      for (let i = 3; i < imgData.data.length; i += 4) {
        if (imgData.data[i] < 50) clearedCount++;
      }
      if (clearedCount / totalPixels > 0.45) {
        revealed = true;
        onFogCleared();
      }
    }
  }

  let drawing = false;
  canvas.addEventListener('mousedown', () => drawing = true);
  window.addEventListener('mouseup', () => drawing = false);
  canvas.addEventListener('mousemove', (e) => { if (drawing) wipeAt(e.clientX, e.clientY); });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    wipeAt(t.clientX - rect.left, t.clientY - rect.top);
  }, { passive: false });
  canvas.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    wipeAt(t.clientX - rect.left, t.clientY - rect.top);
  });

  function onFogCleared() {
    canvas.style.transition = 'opacity 1s ease';
    canvas.style.opacity = '0';
    setTimeout(() => canvas.remove(), 1100);

    // Show modal with voice player and formatted letter
    setTimeout(() => {
      const modal = document.createElement('div');
      modal.className = 'gift-modal-overlay';
      modal.innerHTML = `
        <div class="gift-modal">
          <div class="gift-modal-handle"></div>
          <div class="voice-note-card" style="margin-bottom:20px;">
            <div class="voice-icon" style="font-size:36px;">🌧️</div>
            <p style="font-family:var(--font-serif);font-size:19px;font-style:italic;color:rgba(255,255,255,0.95);margin-bottom:2px;">
              Listen to Mussab read this
            </p>
            <p style="font-family:var(--font-sans);font-size:12px;color:rgba(127,163,199,0.7);letter-spacing:0.08em;text-transform:uppercase;">
              Rainy Path • 0:42
            </p>
            <button class="voice-play-btn" id="fogVoicePlayBtn" aria-label="Play voice note">
              ▶
            </button>
            <div class="voice-waveform" id="fogWaveform">
              <div class="voice-wave-bar"></div>
              <div class="voice-wave-bar"></div>
              <div class="voice-wave-bar"></div>
              <div class="voice-wave-bar"></div>
              <div class="voice-wave-bar"></div>
              <div class="voice-wave-bar"></div>
            </div>
          </div>
          <div class="letter-text" style="text-align:left;border-top:1px solid rgba(127,163,199,0.2);padding-top:20px;">
            ${giftData.content.en.replace(/\n/g, '<br>')}
          </div>
          <button id="fogContinue" style="margin-top:28px;padding:12px 32px;background:rgba(127,163,199,0.15);border:1px solid rgba(127,163,199,0.4);border-radius:100px;color:rgba(165,200,230,0.95);font-family:var(--font-serif);font-size:16px;font-style:italic;display:block;margin-left:auto;margin-right:auto;cursor:pointer;transition:all 0.3s ease;">
            I'll remember this →
          </button>
        </div>
      `;
      app.appendChild(modal);
      requestAnimationFrame(() => modal.classList.add('visible'));

      const fogPlayBtn = modal.querySelector('#fogVoicePlayBtn');
      const fogWaveform = modal.querySelector('#fogWaveform');

      function setFogPlaying(playing) {
        if (playing) {
          fogPlayBtn.textContent = '❚❚';
          fogWaveform.classList.add('playing');
        } else {
          fogPlayBtn.textContent = '▶';
          fogWaveform.classList.remove('playing');
        }
      }

      fogPlayBtn.addEventListener('click', () => {
        audioManager.toggleVoice(
          giftData.audio,
          () => setFogPlaying(false),
          (active) => setFogPlaying(active)
        );
      });

      modal.querySelector('#fogContinue').addEventListener('click', () => {
        audioManager.stopVoice();
        modal.classList.remove('visible');
        setTimeout(() => { modal.remove(); onClose(); }, 700);
      });
    }, 1200);
  }
}
