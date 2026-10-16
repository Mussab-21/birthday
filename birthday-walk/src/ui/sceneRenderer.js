// sceneRenderer.js — Renders each scene with its parallax, particles, and gift
import { audioManager } from '../core/audioManager.js';
import { WalkController } from '../core/walkController.js';
import { renderVoiceNoteGift } from '../gifts/voiceNote.js';
import { renderFogLetterGift } from '../gifts/fogReveal.js';
import { renderBenchMessageGift } from '../gifts/benchMessage.js';
import { renderConstellationGift } from '../gifts/constellation.js';
import { renderCakeGift } from '../gifts/cake.js';

export class SceneRenderer {
  constructor(app, data, callbacks) {
    this.app = app;
    this.data = data;
    this.callbacks = callbacks; // { onGiftOpened }
    this.giftOpened = false;
    this._raf = null;
    this._rainCanvas = null;
    this._rainCtx = null;
    this._particles = [];
    this.walkController = null;
  }

  render() {
    const { data, app } = this;

    // Start procedural atmosphere + mp3 audio if available
    audioManager.playAmbient(data.ambient);
    audioManager.playMusic(data.music);
    audioManager.playSceneAtmosphere(data.id);

    // Container
    const container = document.createElement('div');
    container.className = 'scene-container';
    container.id = `scene-${data.id}`;
    app.appendChild(container);

    // Background with parallax
    const bg = document.createElement('div');
    bg.className = 'scene-bg';
    bg.style.backgroundImage = `url('${data.bg}')`;
    bg.style.transform = 'scale(1.1)'; // Extra scale for parallax room
    container.appendChild(bg);

    // Scene title
    const title = document.createElement('p');
    title.className = 'scene-title';
    title.textContent = data.title;
    container.appendChild(title);

    // Fade in
    container.style.opacity = '0';
    setTimeout(() => {
      container.style.transition = 'opacity 1.2s ease';
      container.style.opacity = '1';
    }, 50);

    // Scene-specific setup
    switch (data.id) {
      case 'trailhead': this._setupTrailhead(container, bg); break;
      case 'rain-path': this._setupRain(container, bg); break;
      case 'lake':      this._setupLake(container, bg); break;
      case 'stars':     this._setupStars(container, bg); break;
      case 'cabin':     this._setupCabin(container, bg); break;
    }
  }

  // ─── Scene 1: Trailhead ──────────────────────────────────────────────────────
  _setupTrailhead(container, bg) {
    this._setupParallax(bg);

    const hint = document.createElement('div');
    hint.className = 'walk-control-hint';
    hint.innerHTML = '<span>Hold or drag to walk toward him</span> <span>→</span>';
    container.appendChild(hint);

    let reachedTarget = false;

    this.walkController = new WalkController(container, {
      sceneId: 'trailhead',
      onProgress: (p) => {
        // Shift background slightly as she walks
        const bgShift = -p * 35;
        bg.style.backgroundPosition = `calc(50% + ${bgShift}px) center`;
      },
      onReachTarget: () => {
        if (reachedTarget) return;
        reachedTarget = true;
        hint.style.opacity = '0';
        setTimeout(() => hint.remove(), 600);

        // Show glowing lantern where he is waiting
        this._showGiftGlow(container, '72%', '52%', () => {
          this._openVoiceNote();
        });
      }
    });

    // Gentle fallback if user doesn't drag/hold after 7 seconds
    setTimeout(() => {
      if (!reachedTarget && this.walkController && this.walkController.progress < 0.2) {
        hint.innerHTML = '<span>Tap anywhere to walk to him</span> <span>🤍</span>';
        container.addEventListener('click', () => {
          if (!reachedTarget) {
            let p = this.walkController.progress;
            const autoWalk = setInterval(() => {
              p += 0.04;
              this.walkController._advanceProgress(0.04);
              if (p >= 0.9) clearInterval(autoWalk);
            }, 60);
          }
        }, { once: true });
      }
    }, 7000);
  }

  // ─── Scene 2: Rain Path ──────────────────────────────────────────────────────
  _setupRain(container, bg) {
    // Rain canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'rain-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    container.appendChild(canvas);
    this._startRain(canvas);

    const hint = document.createElement('div');
    hint.className = 'walk-control-hint';
    hint.innerHTML = '<span>Hold or drag to walk in the rain together</span> <span>🌧️</span>';
    container.appendChild(hint);

    let reachedPathEnd = false;

    this.walkController = new WalkController(container, {
      sceneId: 'rain-path',
      onProgress: (p) => {
        const bgShift = -p * 30;
        bg.style.backgroundPosition = `calc(50% + ${bgShift}px) center`;
      },
      onReachTarget: () => {
        if (reachedPathEnd) return;
        reachedPathEnd = true;
        hint.style.opacity = '0';
        setTimeout(() => {
          hint.remove();
          this._openFogLetter(container);
        }, 700);
      }
    });

    // Fallback if idle
    setTimeout(() => {
      if (!reachedPathEnd && this.walkController && this.walkController.progress < 0.2) {
        container.addEventListener('click', () => {
          if (!reachedPathEnd) {
            const autoWalk = setInterval(() => {
              this.walkController._advanceProgress(0.05);
              if (this.walkController.reached) clearInterval(autoWalk);
            }, 60);
          }
        }, { once: true });
      }
    }, 7000);
  }

  // ─── Scene 3: Lake ──────────────────────────────────────────────────────────
  _setupLake(container, bg) {
    this._setupParallax(bg);

    this.walkController = new WalkController(container, {
      sceneId: 'lake'
    });

    const sitHint = document.createElement('div');
    sitHint.className = 'walk-control-hint';
    sitHint.innerHTML = '<span>Sit on the bench beside the water</span> <span>🌊</span>';
    container.appendChild(sitHint);

    const onSit = () => {
      if (this.giftOpened) return;
      sitHint.style.opacity = '0';
      setTimeout(() => sitHint.remove(), 500);

      // His silhouette gently fades in sitting next to her
      this.walkController.fadeSittingCompanion();

      // Brief moment of peaceful silence before showing message
      setTimeout(() => {
        this._openBenchMessage(container);
      }, 1600);
    };

    container.addEventListener('click', onSit, { once: true });
    container.addEventListener('touchend', onSit, { once: true });
  }

  // ─── Scene 4: Stars ─────────────────────────────────────────────────────────
  _setupStars(container, bg) {
    // Twinkling particle canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'rain-canvas'; // reuse positioning class
    canvas.style.zIndex = '3';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    container.appendChild(canvas);
    this._startStarParticles(canvas);

    this._openConstellation(container);
  }

  // ─── Scene 5: Cabin ─────────────────────────────────────────────────────────
  _setupCabin(container, bg) {
    this._openCake(container);
  }

  // ─── Parallax ────────────────────────────────────────────────────────────────
  _setupParallax(bg) {
    const move = (dx, dy) => {
      const x = dx * 15;
      const y = dy * 8;
      bg.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
    };

    // Mouse
    window.addEventListener('mousemove', (e) => {
      const dx = (e.clientX / window.innerWidth - 0.5);
      const dy = (e.clientY / window.innerHeight - 0.5);
      move(dx, dy);
    });

    // Device orientation (mobile)
    window.addEventListener('deviceorientation', (e) => {
      const dx = (e.gamma || 0) / 45;
      const dy = (e.beta  || 0) / 45;
      move(Math.max(-0.5, Math.min(0.5, dx)), Math.max(-0.5, Math.min(0.5, dy)));
    });
  }

  // ─── Gift Glow Object ────────────────────────────────────────────────────────
  _showGiftGlow(container, left, top, onClick) {
    const glow = document.createElement('div');
    glow.className = 'gift-glow';
    glow.style.left = left;
    glow.style.top = top;
    glow.setAttribute('role', 'button');
    glow.setAttribute('aria-label', 'Something is waiting here');
    glow.innerHTML = `<div class="gift-dot"></div>`;
    container.appendChild(glow);

    const hint = document.createElement('p');
    hint.className = 'walk-hint';
    hint.style.bottom = '90px';
    hint.textContent = 'Something is waiting here…';
    container.appendChild(hint);

    glow.addEventListener('click', () => {
      if (this.giftOpened) return;
      hint.remove();
      glow.remove();
      onClick();
    });
    glow.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (this.giftOpened) return;
      hint.remove();
      glow.remove();
      onClick();
    });
  }

  // ─── Gift: Voice Note ────────────────────────────────────────────────────────
  _openVoiceNote() {
    renderVoiceNoteGift(this.app, this.data.gift, () => this._giftDone());
  }

  // ─── Gift: Fog Letter ────────────────────────────────────────────────────────
  _openFogLetter(container) {
    renderFogLetterGift(container, this.app, this.data.gift, () => this._giftDone());
  }

  // ─── Gift: Bench Message ─────────────────────────────────────────────────────
  _openBenchMessage(container) {
    renderBenchMessageGift(this.app, this.data.gift, () => this._giftDone());
  }

  // ─── Gift: Constellation ─────────────────────────────────────────────────────
  _openConstellation(container) {
    renderConstellationGift(container, this.app, this.data.gift, () => this._giftDone());
  }

  // ─── Gift: Cake ──────────────────────────────────────────────────────────────
  _openCake(container) {
    renderCakeGift(container, this.app, this.data.gift, () => this._giftDone());
  }

  // ─── Gift Done → show Continue ───────────────────────────────────────────────
  _giftDone() {
    if (this.giftOpened) return;
    this.giftOpened = true;

    const continueBtn = document.createElement('button');
    continueBtn.className = 'continue-btn';
    continueBtn.id = 'continueBtn';
    continueBtn.innerHTML = 'Continue <span>→</span>';
    this.app.appendChild(continueBtn);

    setTimeout(() => continueBtn.classList.add('visible'), 100);

    continueBtn.addEventListener('click', () => {
      continueBtn.remove();
      this.callbacks.onGiftOpened();
    });
  }

  // ─── Rain Animation ──────────────────────────────────────────────────────────
  _startRain(canvas) {
    const ctx = canvas.getContext('2d');
    const drops = [];
    const COUNT = 300;

    for (let i = 0; i < COUNT; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len: Math.random() * 15 + 8,
        speed: Math.random() * 4 + 4,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(127,163,199,0.6)';
      ctx.lineWidth = 0.8;

      drops.forEach(d => {
        ctx.globalAlpha = d.opacity;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * 0.25, d.y + d.len);
        ctx.stroke();

        d.y += d.speed;
        d.x -= d.speed * 0.25;

        if (d.y > canvas.height + d.len) {
          d.y = -d.len;
          d.x = Math.random() * canvas.width;
        }
      });

      ctx.globalAlpha = 1;
      this._raf = requestAnimationFrame(animate);
    };
    animate();
  }

  // ─── Twinkling Star Particles ─────────────────────────────────────────────────
  _startStarParticles(canvas) {
    const ctx = canvas.getContext('2d');
    const stars = [];
    const COUNT = 150;

    for (let i = 0; i < COUNT; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.7,
        r: Math.random() * 1.5 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.008,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.phase += s.speed;
        const alpha = (Math.sin(s.phase) + 1) / 2 * 0.6 + 0.2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,233,184,${alpha})`;
        ctx.fill();
      });
      this._raf = requestAnimationFrame(animate);
    };
    animate();
  }

  destroy() {
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this.walkController) this.walkController.destroy();
  }
}

