// ...existing code...
document.addEventListener('DOMContentLoaded', () => {
  // Helper-safe selectors
  const $ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Toggle mobile nav
  const toggleNavMenu = () => {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) navMenu.classList.toggle('visible');
  };

  const hamburgerIcon = document.getElementById('hamburger-icon');
  if (hamburgerIcon) hamburgerIcon.addEventListener('click', toggleNavMenu);

  // Smooth scrolling (use native where available)
  try { document.documentElement.style.scrollBehavior = 'smooth'; } catch (e) { /* ignore */ }
  $('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (ev) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      ev.preventDefault();
      const hadTabIndex = target.hasAttribute('tabindex');
      if (!hadTabIndex) target.setAttribute('tabindex', '-1');
      if ('scrollBehavior' in document.documentElement.style) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => { target.focus({ preventScroll: true }); if (!hadTabIndex) target.removeAttribute('tabindex'); }, 400);
      } else {
        const top = target.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top, behavior: 'auto' });
        target.focus({ preventScroll: true });
        if (!hadTabIndex) target.removeAttribute('tabindex');
      }
      const navMenu = document.getElementById('nav-menu');
      if (navMenu && navMenu.classList.contains('visible')) navMenu.classList.remove('visible');
    });
  });

  // Project filtering: event delegation if buttons container exists
  const filtersContainer = document.querySelector('.filters');
  if (filtersContainer) {
    filtersContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      const category = btn.getAttribute('data-category') || 'all';
      filterProjects(category);
    });
  } else {
    // fallback: attach directly if individual buttons exist
    $('.filter-btn').forEach(btn => btn.addEventListener('click', () => filterProjects(btn.getAttribute('data-category') || 'all')));
  }

  function filterProjects(category) {
    $('.project-item').forEach(project => {
      const projectCategory = project.getAttribute('data-category') || '';
      project.style.display = (category === 'all' || projectCategory === category) ? '' : 'none';
    });
  }

  // Lightbox
  let lightboxModal = null;
  function createLightbox() {
    lightboxModal = document.createElement('div');
    lightboxModal.id = 'lightbox-modal';
    lightboxModal.className = 'lightbox-modal';
    lightboxModal.innerHTML = `
      <div class="lightbox-inner" role="dialog" aria-modal="true">
        <button class="lightbox-close" aria-label="Close">&times;</button>
        <img class="lightbox-img" src="" alt="">
      </div>`;
    document.body.appendChild(lightboxModal);

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal || e.target.closest('.lightbox-close')) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightboxModal || lightboxModal.style.display === 'none') return;
      if (e.key === 'Escape') closeLightbox();
    }, { passive: true });
  }

  function openLightbox(src, alt = '') {
    if (!lightboxModal) createLightbox();
    const img = lightboxModal.querySelector('.lightbox-img');
    img.src = src;
    img.alt = alt;
    lightboxModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.style.display = 'none';
    document.body.style.overflow = '';
    const img = lightboxModal.querySelector('.lightbox-img');
    if (img) { img.src = ''; img.alt = ''; }
  }

  // Attach lightbox to images (if any)
  $('.project-img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openLightbox(img.src, img.alt || ''));
  });

  // Contact form validation
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      let valid = true;
      let firstInvalid = null;
      const fields = form.querySelectorAll('input[required], textarea[required], select[required]');
      fields.forEach(field => {
        const isEmpty = (field.type === 'checkbox' || field.type === 'radio') ? !field.checked : !field.value.trim();
        if (isEmpty) {
          valid = false;
          field.classList.add('input-error');
          if (!firstInvalid) firstInvalid = field;
        } else {
          field.classList.remove('input-error');
        }
      });
      if (!valid) {
        e.preventDefault();
        if (firstInvalid) firstInvalid.focus();
        let msg = form.querySelector('.form-error-message');
        if (!msg) {
          msg = document.createElement('div');
          msg.className = 'form-error-message';
          msg.style.color = 'red';
          msg.style.marginBottom = '1em';
          form.prepend(msg);
        }
        msg.textContent = 'Please fill in all required fields.';
      }
    });
  }
});
// ...existing code...