// cake.js — Scene 5 birthday cake: blow mic or tap to extinguish candles + birthday voice message
import { audioManager } from '../core/audioManager.js';

export function renderCakeGift(container, app, giftData, onClose) {
  let candlesOut = false;

  // Realistic Candle scene UI
  const cakeScene = document.createElement('div');
  cakeScene.className = 'candle-scene';
  cakeScene.innerHTML = `
    <div class="cake-interactive-wrap" id="cakeWrap">
      <div class="cake-stand">
        <div class="candle-flame" id="candleFlame"></div>
        <div class="candle-stick"></div>
        <div class="cake-body">
          <div class="cake-frosting"></div>
        </div>
      </div>
      <p class="blow-hint" id="blowHint">Make a wish and blow…</p>
      <button class="tap-blow-btn" id="tapBlow">Tap to blow 🌬️</button>
    </div>
  `;
  container.appendChild(cakeScene);

  // Try microphone first
  initMic();

  const tapBtn = document.getElementById('tapBlow');
  if (tapBtn) {
    tapBtn.addEventListener('click', () => {
      if (!candlesOut) blowOut();
    });
  }

  async function initMic() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      let loudFrames = 0;

      function loop() {
        if (candlesOut) {
          try { stream.getTracks().forEach(t => t.stop()); ctx.close(); } catch(e){}
          return;
        }
        analyser.getByteTimeDomainData(data);
        const rms = Math.sqrt(data.reduce((s, v) => s + (v - 128) ** 2, 0) / data.length);
        loudFrames = rms > 22 ? loudFrames + 1 : 0;
        if (loudFrames > 6) {
          blowOut();
          try { stream.getTracks().forEach(t => t.stop()); ctx.close(); } catch(e){}
          return;
        }
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
    } catch {
      // Mic not allowed — tap button is already prominently available
    }
  }

  function blowOut() {
    if (candlesOut) return;
    candlesOut = true;

    audioManager.playCandleBlow();

    const flame = document.getElementById('candleFlame');
    const hint = document.getElementById('blowHint');
    const tap = document.getElementById('tapBlow');
    const cakeStand = document.querySelector('.cake-stand');

    if (flame) flame.classList.add('extinguished');
    if (tap) tap.remove();
    if (hint) {
      hint.textContent = '✨ Wish made ✨';
      hint.style.color = '#F5E9B8';
    }

    // Add rising smoke puff
    if (cakeStand) {
      const smoke = document.createElement('div');
      smoke.className = 'smoke-puff';
      cakeStand.appendChild(smoke);
      setTimeout(() => smoke.remove(), 2000);
    }

    // Launch celebratory confetti & floating fireflies
    spawnConfetti();
    setTimeout(() => spawnFireflies(), 700);

    // Show final letter + voice note modal
    setTimeout(() => showFinalGift(), 1600);
  }

  function showFinalGift() {
    const overlay = document.createElement('div');
    overlay.className = 'gift-modal-overlay';

    const voiceSection = giftData.voiceAudio ? `
      <div class="voice-note-card" style="margin-bottom:24px;border-bottom:1px solid rgba(255,154,60,0.2);padding-bottom:20px;width:100%;">
        <div class="voice-icon" style="font-size:36px;">🎂</div>
        <p style="font-family:var(--font-serif);font-size:20px;font-style:italic;color:var(--color-fire);margin-bottom:2px;">
          Mussab's Birthday Message
        </p>
        <p style="font-family:var(--font-sans);font-size:12px;color:rgba(255,154,60,0.7);letter-spacing:0.08em;text-transform:uppercase;">
          Cabin at Midnight • 1:20
        </p>
        <button class="voice-play-btn" id="finalVoiceBtn" aria-label="Play birthday voice message">
          ▶
        </button>
        <div class="voice-waveform" id="finalWaveform">
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
          <div class="voice-wave-bar"></div>
        </div>
      </div>
    ` : '';

    overlay.innerHTML = `
      <div class="gift-modal" style="max-height:88vh;">
        <div class="gift-modal-handle"></div>
        ${voiceSection}
        <div class="letter-text" style="font-size:17.5px;line-height:2;text-align:left;">
          ${giftData.letter.replace(/\n/g, '<br>')}
        </div>
        <button id="finalDone" style="margin-top:36px;padding:14px 36px;background:rgba(255,154,60,0.18);border:1px solid rgba(255,154,60,0.45);border-radius:100px;color:rgba(255,175,80,0.95);font-family:var(--font-serif);font-size:17px;font-style:italic;display:block;margin-left:auto;margin-right:auto;cursor:pointer;transition:all 0.3s ease;box-shadow:0 0 24px rgba(255,154,60,0.2);">
          🤍 Thank you for being here
        </button>
      </div>
    `;

    app.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    const voiceBtn = overlay.querySelector('#finalVoiceBtn');
    const finalWaveform = overlay.querySelector('#finalWaveform');

    if (voiceBtn) {
      function setFinalPlaying(playing) {
        if (playing) {
          voiceBtn.textContent = '❚❚';
          finalWaveform?.classList.add('playing');
        } else {
          voiceBtn.textContent = '▶';
          finalWaveform?.classList.remove('playing');
        }
      }

      voiceBtn.addEventListener('click', () => {
        audioManager.toggleVoice(
          giftData.voiceAudio,
          () => setFinalPlaying(false),
          (active) => setFinalPlaying(active)
        );
      });
    }

    overlay.querySelector('#finalDone').addEventListener('click', () => {
      audioManager.stopVoice();
      overlay.classList.remove('visible');
      setTimeout(() => { overlay.remove(); onClose(); }, 700);
    });
  }
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
function spawnConfetti() {
  const colors = ['#FF9A3C','#C9B6FF','#F5E9B8','#9ED8D0','#FFD9A0','#FF6B9D'];
  for (let i = 0; i < 70; i++) {
    setTimeout(() => {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      const duration = Math.random() * 2 + 2.5;
      piece.style.animationDuration = duration + 's';
      piece.style.animationDelay = Math.random() * 0.4 + 's';
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), (duration + 1) * 1000);
    }, i * 25);
  }
}

// ─── Fireflies ────────────────────────────────────────────────────────────────
function spawnFireflies() {
  for (let i = 0; i < 20; i++) {
    const fly = document.createElement('div');
    fly.className = 'firefly';
    fly.style.left = Math.random() * 90 + 'vw';
    fly.style.bottom = Math.random() * 50 + 'vh';
    const dur = Math.random() * 4 + 3;
    fly.style.animationDuration = dur + 's';
    fly.style.animationDelay = Math.random() * 2 + 's';
    document.body.appendChild(fly);
    setTimeout(() => fly.remove(), (dur + 3) * 1000);
  }
}
