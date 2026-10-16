// voiceNote.js — Voice note gift modal for Scene 1
import { audioManager } from '../core/audioManager.js';

export function renderVoiceNoteGift(app, giftData, onClose) {
  const overlay = document.createElement('div');
  overlay.className = 'gift-modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Voice note gift');

  let isPlaying = false;
  let captionVisible = true;

  overlay.innerHTML = `
    <div class="gift-modal">
      <div class="gift-modal-handle"></div>
      <div class="voice-note-card">
        <div class="voice-icon">🎙️</div>
        <p style="font-family:var(--font-serif);font-size:20px;font-style:italic;color:rgba(255,255,255,0.95);margin-bottom:2px;">
          A voice note from Mussab
        </p>
        <p style="font-family:var(--font-sans);font-size:12px;color:rgba(201,182,255,0.6);letter-spacing:0.08em;text-transform:uppercase;">
          Mountain Trailhead • 0:31
        </p>
        <button class="voice-play-btn" id="voicePlayBtn" aria-label="Play voice note">
          ▶
        </button>
        <div class="voice-waveform" id="waveform">
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
        </div>
        <p class="voice-caption" id="voiceCaption" style="display:block;margin-top:14px;">
          "${giftData.caption || ''}"
        </p>
        <button id="voiceToggleCaption" style="font-family:var(--font-sans);font-size:12px;color:rgba(201,182,255,0.5);letter-spacing:0.08em;margin-top:6px;text-transform:uppercase;cursor:pointer;">
          Hide text
        </button>
      </div>
    </div>
  `;

  app.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('visible'));

  const playBtn = overlay.querySelector('#voicePlayBtn');
  const captionEl = overlay.querySelector('#voiceCaption');
  const toggleCaption = overlay.querySelector('#voiceToggleCaption');
  const waveform = overlay.querySelector('#waveform');

  function setPlayingState(playing) {
    isPlaying = playing;
    if (playing) {
      playBtn.textContent = '❚❚';
      waveform.classList.add('playing');
    } else {
      playBtn.textContent = '▶';
      waveform.classList.remove('playing');
    }
  }

  playBtn.addEventListener('click', () => {
    audioManager.toggleVoice(
      giftData.audio,
      () => {
        setPlayingState(false);
        showDone();
      },
      (active) => {
        setPlayingState(active);
        if (active) showDone();
      }
    );
  });

  toggleCaption.addEventListener('click', () => {
    captionVisible = !captionVisible;
    captionEl.style.display = captionVisible ? 'block' : 'none';
    toggleCaption.textContent = captionVisible ? 'Hide text' : 'Show text';
  });

  function showDone() {
    if (overlay.querySelector('.continue-walk-done')) return;
    const doneBtn = document.createElement('button');
    doneBtn.className = 'continue-walk-done';
    doneBtn.style.cssText = 'margin-top:24px;padding:12px 32px;background:rgba(201,182,255,0.18);border:1px solid rgba(201,182,255,0.45);border-radius:100px;color:var(--color-lavender);font-family:var(--font-serif);font-size:16px;font-style:italic;transition:all 0.3s ease;cursor:pointer;box-shadow:0 0 20px rgba(201,182,255,0.2);';
    doneBtn.textContent = 'Walk with me →';
    overlay.querySelector('.voice-note-card').appendChild(doneBtn);

    doneBtn.addEventListener('click', () => {
      audioManager.stopVoice();
      overlay.classList.remove('visible');
      setTimeout(() => { overlay.remove(); onClose(); }, 700);
    });
  }
}
