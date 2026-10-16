// closing.js — Final closing screen
export function renderClosing(app, onReplay) {
  app.innerHTML = `
    <div class="closing-screen" id="closingScreen">
      <div class="closing-stars" id="closingStars"></div>
      <p class="closing-main">"Next time, this will be real."</p>
      <p class="closing-urdu" dir="rtl">وہ دن ضرور آئے گا۔</p>
      <p class="closing-footer">Made by hand, for you. 🤍</p>
      <button class="closing-replay" id="closingReplay">Replay the journey ↺</button>
    </div>
  `;

  generateStars('closingStars', 150);

  document.getElementById('closingReplay').addEventListener('click', onReplay);

  // Animate in
  const el = document.getElementById('closingScreen');
  el.style.opacity = '0';
  setTimeout(() => {
    el.style.transition = 'opacity 1.2s ease';
    el.style.opacity = '1';
  }, 50);
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
