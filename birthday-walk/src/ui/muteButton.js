// muteButton.js — persistent mute toggle
import { audioManager } from '../core/audioManager.js';

export function renderMuteButton(app) {
  const btn = document.createElement('button');
  btn.className = 'mute-btn';
  btn.id = 'muteBtn';
  btn.setAttribute('aria-label', 'Toggle sound');
  btn.textContent = '🔊';
  app.appendChild(btn);

  btn.addEventListener('click', () => {
    const muted = audioManager.toggle();
    btn.textContent = muted ? '🔇' : '🔊';
  });
}
