// loading.js — Loading screen shown while assets load
export function renderLoading(app, onReady) {
  app.innerHTML = `
    <div class="loading-screen" id="loadingScreen">
      <p class="loading-text">Packing for our trip…</p>
      <div class="loading-dots">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    </div>
  `;

  // Give it a minimum display time so it doesn't flash
  const MIN_SHOW = 1800;
  const start = Date.now();

  // Signal ready - onReady should load assets and call back when done
  setTimeout(async () => {
    await onReady();
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, MIN_SHOW - elapsed);
    setTimeout(() => {
      const el = document.getElementById('loadingScreen');
      if (el) {
        el.style.transition = 'opacity 0.6s ease';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 700);
      }
    }, remaining);
  }, 100);
}
