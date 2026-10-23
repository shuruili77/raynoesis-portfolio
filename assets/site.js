(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const config = window.RAYNOESIS_CONFIG || {};
  let language = config.defaultLanguage === 'zh' ? 'zh' : 'en';
  try { const saved = localStorage.getItem('raynoesis-language'); if (saved === 'en' || saved === 'zh') language = saved; } catch (_) {}
  let refreshGallery = () => {};
  const setLanguage = (next) => {
    language = next;
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en';
    $$('[data-en][data-zh]').forEach(el => { el.textContent = el.dataset[next]; });
    $$('[data-alt-en]').forEach(el => { el.alt = next === 'zh' ? el.dataset.altZh : el.dataset.altEn; });
    $$('[data-label-en]').forEach(el => el.setAttribute('aria-label', next === 'zh' ? el.dataset.labelZh : el.dataset.labelEn));
    const toggle = $('[data-language-toggle]');
    if (toggle) { toggle.textContent = next === 'zh' ? 'EN ↗' : '中文 ↗'; toggle.setAttribute('aria-label', next === 'zh' ? 'Switch to English' : '切换至中文'); }
    if ($('.menu-toggle')?.getAttribute('aria-expanded') === 'true') $('.menu-toggle').setAttribute('aria-label', next === 'zh' ? '收起导航' : 'Close navigation');
    updateFilterStatus();
    refreshGallery();
    try { localStorage.setItem('raynoesis-language', next); } catch (_) {}
  };
  $('[data-language-toggle]')?.addEventListener('click', () => setLanguage(language === 'en' ? 'zh' : 'en'));
  const menu = $('.menu-toggle');
  const nav = $('#main-nav');
  const closeMenu = () => { nav?.classList.remove('is-open'); menu?.setAttribute('aria-expanded', 'false'); menu?.setAttribute('aria-label', language === 'zh' ? '展开导航' : 'Open navigation'); };
  menu?.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('is-open', open); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? (language === 'zh' ? '收起导航' : 'Close navigation') : (language === 'zh' ? '展开导航' : 'Open navigation')); });
  $$('#main-nav a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  let activeFilter = 'all';
  function updateFilterStatus() {
    const status = $('#filter-status');
    if (!status) return;
    const count = $$('.work-card').filter(el => !el.hidden).length;
    status.textContent = language === 'zh' ? `显示 ${count} 个项目` : `${count} ${count === 1 ? 'project' : 'projects'} shown`;
  }
  if ($('.filters')) {
    $('.filters').hidden = false;
    $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      $$('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      $$('.work-card').forEach(card => card.hidden = activeFilter !== 'all' && card.dataset.category !== activeFilter);
      updateFilterStatus();
    }));
  }
  const email = String(config.contactEmail || '').trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    $$('[data-contact-unavailable]').forEach(el => el.hidden = true);
    $$('[data-contact-available]').forEach(el => el.hidden = false);
    $$('[data-contact-link]').forEach(el => {
      el.textContent = email;
      const project = new URLSearchParams(location.search).get('project');
      const safeProject = project && /^[a-z-]{1,50}$/.test(project) ? ` — ${project}` : '';
      el.href = `mailto:${email}?subject=${encodeURIComponent('raynoesis project support' + safeProject)}`;
    });
  } else {
    $$('[data-contact-unavailable]').forEach(el => el.hidden = false);
    $$('[data-contact-available]').forEach(el => el.hidden = true);
  }
  const dialog = $('.image-dialog');
  if (dialog && typeof dialog.showModal === 'function') {
    let images = [];
    try { images = JSON.parse($('#gallery-data').textContent); } catch (_) {}
    if (images.length) {
      $('.gallery-hint').hidden = false;
      let current = 0, opener = null;
      const render = () => {
        const item = images[current];
        $('.viewer-image').src = item.variants[item.variants.length - 1].path;
        $('.viewer-image').alt = item.caption[language === 'zh' ? 1 : 0];
        $('.viewer-caption').textContent = item.caption[language === 'zh' ? 1 : 0];
        $('.viewer-count').textContent = `${String(current+1).padStart(2,'0')} / ${String(images.length).padStart(2,'0')}`;
      };
      refreshGallery = () => { if (dialog.open) render(); };
      const open = (i, el) => { current = i; opener = el; render(); dialog.showModal(); document.body.classList.add('modal-open'); $('.viewer-close').focus(); };
      const close = () => dialog.close();
      const step = d => { current = (current + d + images.length) % images.length; render(); };
      $$('.gallery-open').forEach(el => el.addEventListener('click', e => { e.preventDefault(); open(Number(el.dataset.galleryIndex), el); }));
      $('.viewer-close').addEventListener('click', close);
      $('.viewer-prev').addEventListener('click', () => step(-1));
      $('.viewer-next').addEventListener('click', () => step(1));
      dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); opener?.focus(); });
      dialog.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); step(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); } });
    }
  }
  setLanguage(language);
})();
