'use strict';
// ---------------------------------------------------------------------------
// Auto reload: when a new version is deployed, reload the page so the game
// that is currently open picks it up. The deploy workflow stamps the commit
// SHA into <meta name="version"> and into version.json; locally the meta
// stays "dev" and nothing happens.
// ---------------------------------------------------------------------------
(function () {
  const meta = document.querySelector('meta[name="version"]');
  const current = meta && meta.content;
  if (!current || current === 'dev') return;

  const INTERVAL = 10000;
  let checking = false;

  async function check() {
    if (checking || document.hidden) return;
    checking = true;
    try {
      const res = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const { version } = await res.json();
        if (version && version !== current) location.reload();
      }
    } catch (e) { /* offline or deploy in progress; try again later */ }
    checking = false;
  }

  setInterval(check, INTERVAL);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
})();
