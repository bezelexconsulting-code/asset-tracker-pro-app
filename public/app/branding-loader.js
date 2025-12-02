// branding-loader.js
(function () {
  async function fetchBranding() {
    try {
      const res = await fetch('/api/client/branding', { cache: 'no-store' });
      if (!res.ok) throw new Error('branding fetch failed');
      const data = await res.json();
      return data;
    } catch (err) {
      return null;
    }
  }

  function applyCssVars(branding) {
    if (!branding) return;
    const root = document.documentElement;
    if (branding.client_id) root.setAttribute('data-tenant', branding.client_id);
    const vars = {
      '--tenant-primary': branding.primary || branding.colors?.primary || '#2563eb',
      '--tenant-secondary': branding.secondary || branding.colors?.secondary || '#0bbf9c',
      '--tenant-accent': branding.accent || '#ffb400',
      '--tenant-bg': branding.bg || '#ffffff',
      '--tenant-surface': branding.surface || '#ffffff',
      '--tenant-text': branding.text || '#111827',
      '--tenant-muted': branding.muted || '#6b7280',
      '--tenant-border': branding.border || '#e5e7eb',
      '--tenant-font-family': branding.font || "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    };
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    if (branding.favicon_url) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = branding.favicon_url;
    }
    const logoEl = document.getElementById('brand-logo');
    if (logoEl && branding.logo_url) {
      logoEl.src = branding.logo_url;
      logoEl.alt = branding.name || 'Brand logo';
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const branding = await fetchBranding();
    if (branding) applyCssVars(branding);
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') document.documentElement.classList.add('theme-dark');
    } catch (e) {}
    try {
      const headerNav = document.querySelector('.site-header .nav');
      if (headerNav && !document.getElementById('theme-toggle-btn')) {
        const btn = document.createElement('button');
        btn.id = 'theme-toggle-btn';
        btn.className = 'button ghost';
        btn.type = 'button';
        const isDark = document.documentElement.classList.contains('theme-dark');
        btn.setAttribute('aria-pressed', String(isDark));
        btn.title = isDark ? 'Switch to light theme' : 'Switch to dark theme';
        const sunSvg = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 4V2M12 22v-2M4.22 4.22L2.81 2.81M21.19 21.19l-1.41-1.41M2 12H4m16 0h2M4.22 19.78l-1.41 1.41M21.19 2.81l-1.41 1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        const moonSvg = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        btn.innerHTML = isDark ? moonSvg : sunSvg;
        btn.addEventListener('click', () => {
          document.documentElement.classList.add('theme-transition');
          const nowDark = document.documentElement.classList.toggle('theme-dark');
          try { localStorage.setItem('theme', nowDark ? 'dark' : 'light'); } catch (e) {}
          btn.setAttribute('aria-pressed', String(nowDark));
          btn.title = nowDark ? 'Switch to light theme' : 'Switch to dark theme';
          btn.innerHTML = nowDark ? moonSvg : sunSvg;
          setTimeout(() => document.documentElement.classList.remove('theme-transition'), 300);
        });
        headerNav.appendChild(btn);
      }
    } catch (e) {}
  });
})();
