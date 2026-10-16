// benchMessage.js — Scene 3 lonely lake bench message + voice note + keepsake card
import { audioManager } from '../core/audioManager.js';

export function renderBenchMessageGift(app, giftData, onClose) {
  const overlay = document.createElement('div');
  overlay.className = 'gift-modal-overlay';

  // Build photo slideshow or keepsake card HTML
  let mediaHTML = '';
  if (giftData.photos && giftData.photos.length > 0) {
    const slides = giftData.photos.map((p, i) =>
      `<div class="photo-slide ${i === 0 ? 'active' : ''}" style="background-image:url('./assets/photos/${p}')"></div>`
    ).join('');
    mediaHTML = `<div class="photo-slideshow" id="photoSlideshow">${slides}</div>`;
  } else {
    // Elegant keepsake card instead of debug text
    mediaHTML = `
      <div class="polaroid-card" style="margin:16px auto;">
        <div class="polaroid-img">
          <span>🌊 🌙</span>
        </div>
        <p class="polaroid-caption">"Close enough to feel you are not alone."</p>
      </div>
    `;
  }

  overlay.innerHTML = `
    <div class="gift-modal">
      <div class="gift-modal-handle"></div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:18px;text-align:center;">
        <div class="voice-icon" style="font-size:36px;">🌊</div>
        <p style="font-family:var(--font-serif);font-size:20px;font-style:italic;color:rgba(255,255,255,0.95);margin-bottom:2px;">
          A voice note from Mussab
        </p>
        <p style="font-family:var(--font-sans);font-size:12px;color:rgba(158,216,208,0.7);letter-spacing:0.08em;text-transform:uppercase;">
          Lonely Lake Bench • 0:35
        </p>
        <button class="voice-play-btn" id="benchVoicePlayBtn" aria-label="Play voice note">
          ▶
        </button>
        <div class="voice-waveform" id="benchWaveform">
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
        </div>

        <div class="letter-text" style="font-size:17px;text-align:left;border-top:1px solid rgba(158,216,208,0.2);padding-top:20px;width:100%;">
          ${giftData.message.replace(/\n/g, '<br>')}
        </div>

        ${mediaHTML}

        <button id="benchContinue" style="padding:12px 32px;background:rgba(158,216,208,0.15);border:1px solid rgba(158,216,208,0.35);border-radius:100px;color:rgba(158,216,208,0.95);font-family:var(--font-serif);font-size:16px;font-style:italic;margin-top:12px;cursor:pointer;transition:all 0.3s ease;">
          I feel it →
        </button>
      </div>
    </div>
  `;

  app.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));

  const benchPlayBtn = overlay.querySelector('#benchVoicePlayBtn');
  const benchWaveform = overlay.querySelector('#benchWaveform');

  function setBenchPlaying(playing) {
    if (playing) {
      benchPlayBtn.textContent = '❚❚';
      benchWaveform.classList.add('playing');
    } else {
      benchPlayBtn.textContent = '▶';
      benchWaveform.classList.remove('playing');
    }
  }

  benchPlayBtn.addEventListener('click', () => {
    audioManager.toggleVoice(
      giftData.audio,
      () => setBenchPlaying(false),
      (active) => setBenchPlaying(active)
    );
  });

  // Start slideshow auto-advance if multiple photos
  if (giftData.photos && giftData.photos.length > 1) {
    let currentSlide = 0;
    const slides = overlay.querySelectorAll('.photo-slide');
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 3000);
  }

  overlay.querySelector('#benchContinue').addEventListener('click', () => {
    audioManager.stopVoice();
    overlay.classList.remove('visible');
    setTimeout(() => { overlay.remove(); onClose(); }, 700);
  });
}
