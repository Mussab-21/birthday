// walkController.js — Drag / hold-to-walk interaction with animated silhouettes
import { audioManager } from './audioManager.js';

export class WalkController {
  constructor(container, options = {}) {
    this.container = container;
    this.walkLength = options.walkLength || 1000;
    this.onProgress = options.onProgress || (() => {});
    this.onReachTarget = options.onReachTarget || (() => {});
    this.sceneId = options.sceneId || 'trailhead';

    this.progress = 0; // 0.0 to 1.0
    this.isWalking = false;
    this.reached = false;
    this._stepCounter = 0;
    this._lastStepTime = 0;
    this._raf = null;

    this._startX = 0;
    this._currentX = 0;
    this._isHolding = false;

    this._createSilhouettes();
    this._bindEvents();
  }

  _createSilhouettes() {
    this.charWrapper = document.createElement('div');
    this.charWrapper.className = `silhouette-container scene-char-${this.sceneId}`;

    if (this.sceneId === 'trailhead') {
      // Her silhouette on left, His waiting silhouette on right
      this.charWrapper.innerHTML = `
        <div class="silhouette-her" id="herChar" style="left: 12%;">
          <svg viewBox="0 0 60 120" class="char-svg">
            <!-- Girl silhouette with scarf and flowing hair -->
            <path d="M 30,12 C 37,12 41,18 41,25 C 41,32 36,37 30,37 C 24,37 19,32 19,25 C 19,18 23,12 30,12 Z" fill="#070913"/>
            <!-- Hair flow -->
            <path d="M 23,20 C 15,28 17,45 22,50 C 24,42 25,32 23,20 Z" fill="#070913"/>
            <!-- Coat / dress -->
            <path d="M 25,36 L 35,36 L 44,70 L 48,102 L 32,102 L 30,75 L 28,102 L 12,102 L 16,70 Z" fill="#070913"/>
            <!-- Scarf gentle flutter -->
            <path d="M 23,37 Q 16,42 14,52 Q 18,50 25,43 Z" fill="#151b30"/>
          </svg>
        </div>
        <div class="silhouette-him" id="himChar" style="left: 72%;">
          <svg viewBox="0 0 60 125" class="char-svg">
            <!-- Guy silhouette waiting tall with coat -->
            <path d="M 30,10 C 36,10 40,15 40,22 C 40,29 36,34 30,34 C 24,34 20,29 20,22 C 20,15 24,10 30,10 Z" fill="#070913"/>
            <!-- Coat & stance -->
            <path d="M 22,34 L 38,34 L 46,65 L 46,110 L 34,110 L 32,75 L 30,75 L 28,110 L 16,110 L 16,65 Z" fill="#070913"/>
          </svg>
        </div>
      `;
    } else if (this.sceneId === 'rain-path') {
      // Both walking close together under one shared umbrella
      this.charWrapper.innerHTML = `
        <div class="silhouette-couple-umbrella" id="coupleChar" style="left: 15%;">
          <svg viewBox="0 0 100 130" class="char-svg couple-svg">
            <!-- Shared Umbrella -->
            <path d="M 15,42 Q 50,14 85,42 Q 72,40 50,41 Q 28,40 15,42 Z" fill="#1b253b"/>
            <path d="M 50,22 L 50,75 Q 50,82 45,82" stroke="#2c3a58" stroke-width="2.5" fill="none"/>
            <!-- Her silhouette -->
            <path d="M 36,46 C 41,46 44,50 44,55 C 44,60 41,64 36,64 C 31,64 28,60 28,55 C 28,50 31,46 36,46 Z" fill="#070913"/>
            <path d="M 32,64 L 42,64 L 46,92 L 48,118 L 38,118 L 36,95 L 34,118 L 24,118 L 26,92 Z" fill="#070913"/>
            <!-- Him silhouette standing close holding umbrella -->
            <path d="M 60,42 C 65,42 69,46 69,51 C 69,56 65,60 60,60 C 55,60 51,56 51,51 C 51,46 55,42 60,42 Z" fill="#070913"/>
            <path d="M 54,60 L 68,60 L 74,90 L 73,120 L 63,120 L 61,95 L 59,120 L 49,120 L 49,90 Z" fill="#070913"/>
          </svg>
        </div>
      `;
    } else if (this.sceneId === 'lake') {
      // Lake bench scene: Her sits down, then his silhouette gently appears next to her
      this.charWrapper.innerHTML = `
        <div class="lake-bench-figures" style="left: 50%; transform: translateX(-50%);">
          <!-- Wooden bench outline -->
          <svg viewBox="0 0 140 90" class="bench-svg">
            <path d="M 15,45 L 125,45 L 125,52 L 15,52 Z" fill="#111728"/>
            <path d="M 18,30 L 122,30 L 122,36 L 18,36 Z" fill="#111728"/>
            <!-- Legs -->
            <rect x="25" y="45" width="6" height="40" fill="#0a0e1c"/>
            <rect x="109" y="45" width="6" height="40" fill="#0a0e1c"/>
          </svg>
          <div class="bench-her-seated" id="benchHer">
            <svg viewBox="0 0 50 80" class="seated-svg">
              <circle cx="25" cy="18" r="9" fill="#070913"/>
              <!-- Seated torso and coat -->
              <path d="M 17,28 L 33,28 L 37,56 L 20,56 Z" fill="#070913"/>
              <path d="M 20,56 L 37,56 L 43,76 L 34,76 L 27,65 L 18,76 L 10,76 Z" fill="#070913"/>
            </svg>
          </div>
          <div class="bench-him-seated" id="benchHim">
            <svg viewBox="0 0 50 85" class="seated-svg">
              <circle cx="25" cy="16" r="9.5" fill="#070913"/>
              <path d="M 16,26 L 34,26 L 39,56 L 19,56 Z" fill="#070913"/>
              <path d="M 19,56 L 39,56 L 45,78 L 36,78 L 29,66 L 20,78 L 11,78 Z" fill="#070913"/>
            </svg>
          </div>
        </div>
      `;
    }

    this.container.appendChild(this.charWrapper);
  }

  _bindEvents() {
    const onStart = (clientX) => {
      if (this.reached) return;
      this.isWalking = true;
      this._isHolding = true;
      this._startX = clientX;
      this._currentX = clientX;
      this._startWalkLoop();
    };

    const onMove = (clientX) => {
      if (!this.isWalking || this.reached) return;
      const dx = clientX - this._currentX;
      this._currentX = clientX;
      // Dragging right advances progress
      if (dx > 0) {
        this._advanceProgress(dx * 0.0035);
      }
    };

    const onEnd = () => {
      this._isHolding = false;
      this.isWalking = false;
      this._stopWalkBob();
    };

    // Touch
    this.container.addEventListener('touchstart', (e) => {
      if (e.target.closest('button') || e.target.closest('.gift-glow') || e.target.closest('.interactive-star')) return;
      onStart(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isWalking) return;
      onMove(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);

    // Mouse
    this.container.addEventListener('mousedown', (e) => {
      if (e.target.closest('button') || e.target.closest('.gift-glow') || e.target.closest('.interactive-star')) return;
      onStart(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isWalking) return;
      onMove(e.clientX);
    });

    window.addEventListener('mouseup', onEnd);
  }

  _startWalkLoop() {
    if (this._raf) return;
    const loop = () => {
      if (!this.isWalking || this.reached) {
        this._raf = null;
        return;
      }
      // Holding finger/mouse down continuously walks forward smoothly
      if (this._isHolding) {
        this._advanceProgress(0.0045);
      }
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  _advanceProgress(amount) {
    if (this.reached) return;
    this.progress = Math.min(1.0, this.progress + amount);

    // Audio footstep every 0.3s of walking
    const now = Date.now();
    if (now - this._lastStepTime > 340) {
      this._lastStepTime = now;
      audioManager.playFootstep();
    }

    this._updateVisuals();
    this.onProgress(this.progress);

    if (this.progress >= 0.88 && !this.reached) {
      this.reached = true;
      this.isWalking = false;
      this._isHolding = false;
      this._onArrive();
    }
  }

  _updateVisuals() {
    // Add walking bob animation
    const her = this.container.querySelector('#herChar');
    const couple = this.container.querySelector('#coupleChar');

    if (her) {
      // Move her across from 12% to 66%
      const leftPos = 12 + this.progress * 54;
      her.style.left = `${leftPos}%`;
      const bob = Math.sin(this.progress * 40) * 4;
      her.style.transform = `translateY(${bob}px)`;
    }

    if (couple) {
      // Couple walks from 15% to 65%
      const leftPos = 15 + this.progress * 50;
      couple.style.left = `${leftPos}%`;
      const bob = Math.sin(this.progress * 35) * 3;
      couple.style.transform = `translateY(${bob}px)`;
    }
  }

  _stopWalkBob() {
    const her = this.container.querySelector('#herChar');
    const couple = this.container.querySelector('#coupleChar');
    if (her) her.style.transform = 'translateY(0)';
    if (couple) couple.style.transform = 'translateY(0)';
  }

  _onArrive() {
    this._stopWalkBob();
    if (this.sceneId === 'trailhead') {
      const him = this.container.querySelector('#himChar');
      if (him) {
        // Him turns slightly / softly steps forward
        him.classList.add('turned-to-her');
      }
    } else if (this.sceneId === 'lake') {
      const benchHim = this.container.querySelector('#benchHim');
      if (benchHim) {
        setTimeout(() => {
          benchHim.classList.add('visible');
        }, 1000);
      }
    }
    this.onReachTarget();
  }

  fadeSittingCompanion() {
    const benchHim = this.container.querySelector('#benchHim');
    if (benchHim) {
      benchHim.classList.add('visible');
    }
  }

  destroy() {
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this.charWrapper) this.charWrapper.remove();
  }
}
