// gate.js — Password entry gate screen
export function renderGate(app, onPasswordSubmit) {
  app.innerHTML = `
    <div class="gate-screen" id="gateScreen">
      <div class="gate-stars" id="gateStars"></div>
      <div class="gate-content">
        <p class="gate-tagline-urdu" id="gTagUrdu">آج رات کوئی تمہارے لیے ایک راستہ چھوڑ گیا ہے۔</p>
        <p class="gate-tagline-en" id="gTagEn">"Someone left a path for you tonight."</p>
        <div class="gate-divider" id="gDiv"></div>
        <p class="gate-label" id="gLabel">Enter your birthday</p>
        <div class="gate-input-wrap" id="gInputWrap">
          <input
            class="gate-input"
            id="gateInput"
            type="password"
            inputmode="numeric"
            placeholder="••••••••"
            maxlength="12"
            autocomplete="off"
            aria-label="Enter your birthday as password"
          />
        </div>
        <button class="gate-submit" id="gateSubmit">Begin the walk →</button>
        <p class="gate-error" id="gateError">That's not quite right. Try again, Ninu.</p>
      </div>
    </div>
  `;

  // Generate background stars
  generateStars('gateStars', 120);

  // Animate in elements with stagger
  setTimeout(() => {
    ['gTagUrdu', 'gTagEn', 'gDiv', 'gLabel', 'gInputWrap', 'gateSubmit'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('visible');
    });
  }, 200);

  const input = document.getElementById('gateInput');
  const submitBtn = document.getElementById('gateSubmit');
  const errorMsg = document.getElementById('gateError');

  async function trySubmit() {
    const pw = input.value;
    if (!pw) return;
    submitBtn.textContent = '...';
    submitBtn.disabled = true;
    const ok = await onPasswordSubmit(pw);
    if (ok) {
      // Success — flash then proceed
      input.style.borderColor = 'rgba(100,255,150,0.5)';
    } else {
      input.classList.add('error');
      errorMsg.classList.add('visible');
      setTimeout(() => { input.classList.remove('error'); }, 500);
      submitBtn.textContent = 'Begin the walk →';
      submitBtn.disabled = false;
    }
  }

  submitBtn.addEventListener('click', trySubmit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') trySubmit(); });
}

function generateStars(containerId, count) {
  const container = document.getElementById(containerId);
  if (!container) return;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'bg-star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    const size = Math.random() * 2.5 + 0.5;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.animationDelay = Math.random() * 5 + 's';
    star.style.animationDuration = (Math.random() * 3 + 2) + 's';
    container.appendChild(star);
  }
}
