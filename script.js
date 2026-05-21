// Interactivity: nav toggle, dark mode, smooth scroll, accessible modal, form handling
(function(){
  const htmlEl = document.documentElement;
  const navToggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close');
  const modalImage = document.getElementById('modal-image');
  const modalDesc = document.getElementById('modal-desc');
  const modalTags = document.getElementById('modal-tags');
  const modalLive = document.getElementById('modal-live');
  const modalCode = document.getElementById('modal-code');
  const projectCards = document.querySelectorAll('[data-project]');
  const projectGrid = document.getElementById('projects-grid');
  const contactForm = document.getElementById('contact-form');
  const mediaGrid = document.getElementById('media-grid');
  const mediaEmpty = document.getElementById('media-empty');

  function createProjectCardMarkup(project){
    const title = project.title || '';
    const description = project.description || '';
    const image = project.image || '';
    const code = project.code || '';
    const live = project.live || '';
    const tags = Array.isArray(project.tags) ? project.tags : [];
    const data = {
      title,
      description,
      image,
      code,
      live,
      tags
    };

    const card = document.createElement('div');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.className = 'p-4 rounded-xl bg-white dark:bg-slate-900 shadow hover:shadow-lg transition cursor-pointer project-card reveal';
    card.dataset.project = JSON.stringify(data);
    // normalize display title: replace underscores/dashes with spaces
    let displayTitle = String(title).replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();
    // if input was ALL CAPS, convert to Title Case for readability
    if(displayTitle && displayTitle === displayTitle.toUpperCase()){
      displayTitle = displayTitle.toLowerCase().split(' ').map(w=> w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
    }

    card.innerHTML = `
      <div class="project-media w-full h-36 object-cover rounded-md overflow-hidden">
        <img loading="lazy" src="${image}" alt="${title}" class="w-full h-full object-cover" />
      </div>
      <div class="project-content mt-3">
        <h3 class="font-semibold project-title">${displayTitle}</h3>
        <div class="mt-2 flex flex-wrap gap-2">
          ${(tags.length ? tags : ['Project']).map(tag => `<span class="px-2 py-1 text-xs rounded-full border text-slate-600 dark:text-slate-300">${tag}</span>`).join('')}
        </div>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400 project-desc">${description}</p>
      </div>
    `;
    return card;
  }

  function renderProjectsGallery(items){
    if(!projectGrid) return false;
    const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
    // fallback to admin stored projects if none provided
    if(!safeItems.length){
      const admin = getAdminData();
      if(admin && Array.isArray(admin.projects) && admin.projects.length) safeItems.push(...admin.projects);
    }
    if(!safeItems.length) {
      projectGrid.innerHTML = '';
      return false;
    }
    projectGrid.innerHTML = '';
    safeItems.forEach(project => {
      const card = createProjectCardMarkup(project);
      card.classList.add('in-view');
      projectGrid.appendChild(card);
    });
    return true;
  }

  function normalizeProjectItems(source){
    if(Array.isArray(source)) return source;
    if(source && typeof source === 'object'){
      return Object.entries(source).map(([key, value]) => ({
        key,
        title: value && value.title ? value.title : key,
        description: value && value.description ? value.description : '',
        image: value && value.image ? value.image : '',
        code: value && value.code ? value.code : '',
        live: value && value.live ? value.live : '',
        tags: Array.isArray(value && value.tags) ? value.tags : []
      }));
    }
    return [];
  }

  function projectItemKey(project){
    if(!project || typeof project !== 'object') return '';
    return String(project.key || project.code || project.title || '').trim().toLowerCase();
  }

  function mergeProjectItems(baseItems, extraItems){
    const merged = [];
    const seen = new Set();
    [...normalizeProjectItems(baseItems), ...normalizeProjectItems(extraItems)].forEach((item)=>{
      const key = projectItemKey(item);
      if(key && seen.has(key)) return;
      if(key) seen.add(key);
      merged.push(item);
    });
    return merged;
  }

  function renderDetailCards(gridId, emptyId, items, buildCard){
    const grid = document.getElementById(gridId);
    const empty = document.getElementById(emptyId);
    if(!grid || !empty) return false;
    const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
    grid.innerHTML = '';
    if(!safeItems.length){
      empty.classList.remove('hidden');
      return true;
    }
    empty.classList.add('hidden');
    safeItems.forEach((item, index) => grid.appendChild(buildCard(item, index)));
    return true;
  }

  function createOrgCard(item){
    const card = document.createElement('article');
    card.className = 'rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/80 p-5 shadow-sm';
    const role = item.role || item.title || '';
    const organization = item.organization || item.company || '';
    const period = item.period || item.time || '';
    const description = item.description || '';
    card.innerHTML = `
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 class="text-lg font-semibold">${role}</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">${organization}</p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">${period}</span>
      </div>
      <p class="mt-3 text-slate-600 dark:text-slate-300">${description}</p>
    `;
    return card;
  }

  function createExperienceCard(item){
    const card = document.createElement('article');
    card.className = 'rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/80 overflow-hidden shadow-sm';
    const role = item.role || item.title || '';
    const company = item.company || item.organization || '';
    const period = item.period || item.time || '';
    const description = item.description || '';
    const image = (Array.isArray(item.images) && item.images.length) ? item.images[0] : (item.image || '');
    
    let html = '';
    if(image) {
      html += `<img src="${image}" alt="${role}" class="w-full h-40 object-cover" />`;
    }
    html += `
      <div class="p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold">${role}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">${company}</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">${period}</span>
        </div>
        <p class="mt-3 text-slate-600 dark:text-slate-300">${description}</p>
      </div>
    `;
    card.innerHTML = html;
    // make card interactive: expose data for modal
    const expData = {
      title: role,
      company,
      period,
      description,
      images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : [])
    };
    card.tabIndex = 0;
    card.setAttribute('role','button');
    card.dataset.experience = JSON.stringify(expData);
    return card;
  }

  // click handler to open experience in the same modal used by projects
  function openExperience(card){
    const data = card.dataset.experience && JSON.parse(card.dataset.experience);
    if(!data) return;
    document.getElementById('modal-title').textContent = data.title || '';
    modalDesc.textContent = data.description || '';
    const img = (Array.isArray(data.images) && data.images.length) ? data.images[0] : '';
    if(img) modalImage.src = img; else modalImage.removeAttribute('src');
    modalTags.innerHTML = '';
    // show company and period as tags
    (data.company ? [data.company] : []).concat(data.period ? [data.period] : []).forEach(t=>{
      const span = document.createElement('span');
      span.className = 'px-2 py-1 text-sm rounded-full border text-slate-600 dark:text-slate-300';
      span.textContent = t;
      modalTags.appendChild(span);
    });
    // no live/code links for experience — hide buttons
    modalLive.removeAttribute('href'); modalLive.classList.add('hidden');
    modalCode.removeAttribute('href'); modalCode.classList.add('hidden');

    lastFocused = document.activeElement;
    modal.classList.remove('hidden');
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
    const focusable = focusablesWithin(modal);
    if(focusable.length) focusable[0].focus();
    trapHandler = function(e){
      if(e.key === 'Tab'){
        const focusable = focusablesWithin(modal);
        if(focusable.length === 0) { e.preventDefault(); return; }
        const first = focusable[0];
        const last = focusable[focusable.length-1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      } else if(e.key === 'Escape'){
        closeModal();
      }
    };
    document.addEventListener('keydown', trapHandler);
  }

  function bindExperienceGridInteractions(){
    const expGrid = document.getElementById('projects-grid') ? null : document.getElementById('exp-grid');
    const grid = document.getElementById('exp-grid');
    if(!grid) return;
    grid.addEventListener('click', (e)=>{
      const card = e.target.closest('[data-experience]');
      if(!card) return;
      openExperience(card);
    });
    grid.addEventListener('keydown', (e)=>{
      const card = e.target.closest('[data-experience]');
      if(!card) return;
      if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){
        e.preventDefault(); openExperience(card);
      }
    });
  }

  function renderOrganizationsSection(items){
    return renderDetailCards('org-grid', 'org-empty', items, createOrgCard);
  }

  function renderExperienceSection(items){
    const grid = document.getElementById('exp-grid');
    const empty = document.getElementById('exp-empty');
    if(!grid || !empty) return false;
    const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
    grid.innerHTML = '';
    if(!safeItems.length){ empty.classList.remove('hidden'); return true; }
    empty.classList.add('hidden');
    safeItems.forEach((item) => {
      const card = createExperienceCard(item);
      // ensure dataset.project exists so we can reuse project modal
      const firstImg = (Array.isArray(item.images) && item.images.length) ? item.images[0] : (item.image || '');
      const dataForModal = { title: item.role || item.title || '', description: item.description || '', image: firstImg, tags: Array.isArray(item.tags)?item.tags:[] };
      // attach click to open project modal using existing global openProject
      card.addEventListener('click', () => {
        const fake = document.createElement('div');
        fake.dataset.project = JSON.stringify(dataForModal);
        if(window.openProject) window.openProject(fake);
      });
      card.tabIndex = 0;
      card.addEventListener('keydown', (e) => { if(e.key === 'Enter') card.click(); });
      grid.appendChild(card);
    });
    return true;
  }

  let projectGridBound = false;
  function bindProjectGridInteractions(){
    if(!projectGrid || projectGridBound) return;
    projectGridBound = true;
    projectGrid.addEventListener('click', (e)=>{
      const card = e.target.closest('[data-project]');
      if(!card || e.target.closest('a')) return;
      openProject(card);
    });
    projectGrid.addEventListener('keydown', (e)=>{
      const card = e.target.closest('[data-project]');
      if(!card) return;
      if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){
        e.preventDefault();
        openProject(card);
      }
    });
  }

  function renderMediaGallery(items){
    if(!mediaGrid || !mediaEmpty) return;
    let safeItems = Array.isArray(items) ? items.filter(it => it && it.src) : [];
    // fallback to admin stored mediaItems
    if(!safeItems.length){
      const admin = getAdminData();
      if(admin && Array.isArray(admin.mediaItems) && admin.mediaItems.length) safeItems = admin.mediaItems.filter(it => it && it.src);
    }
    mediaGrid.innerHTML = '';

    if(safeItems.length === 0){
      mediaEmpty.classList.remove('hidden');
      return;
    }

    mediaEmpty.classList.add('hidden');
    safeItems.forEach((item, idx)=>{
      const figure = document.createElement('figure');
      figure.className = 'rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-700/70 bg-white/60 dark:bg-slate-900/70';

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.src = item.src;
      img.alt = item.caption || `Media ${idx + 1}`;
      img.className = 'w-full h-56 object-cover';
      figure.appendChild(img);

      if(item.caption){
        const cap = document.createElement('figcaption');
        cap.className = 'px-3 py-2 text-sm text-slate-600 dark:text-slate-300';
        cap.textContent = item.caption;
        figure.appendChild(cap);
      }

      mediaGrid.appendChild(figure);
    });
  }

  // Single light theme: no runtime theme toggles or stored preference

  // Nav toggle (mobile)
  if(navToggle && mobileNav){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mobileNav.classList.toggle('hidden');
      mobileNav.setAttribute('aria-hidden', String(expanded));
    });
  }

  // Removed theme toggle handlers (single light theme enforced)

  // Smooth scroll for internal links
  // helper: smooth scroll with offset to account for fixed header
  function scrollToWithOffset(target){
    if(!target) return;
    const header = document.querySelector('header');
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const rect = target.getBoundingClientRect();
    const top = window.scrollY + rect.top - headerHeight - 12; // small gap
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if(target){
        e.preventDefault();
        scrollToWithOffset(target);
        // close mobile nav after clicking
        if(mobileNav && !mobileNav.classList.contains('hidden')){
          mobileNav.classList.add('hidden');
          if(navToggle) navToggle.setAttribute('aria-expanded','false');
          mobileNav.setAttribute('aria-hidden','true');
        }
      }
    });
  });

  // Ensure CTA projects button works even if overlay exists: force smooth scroll and keyboard activation
  (function(){
    const cta = document.getElementById('cta-projects-btn');
    const projects = document.getElementById('projects');
    if(!cta || !projects) return;
    cta.addEventListener('click', (e)=>{
      e.preventDefault();
      scrollToWithOffset(projects);
      // close mobile nav if open
      if(mobileNav && !mobileNav.classList.contains('hidden')){
        mobileNav.classList.add('hidden');
        if(navToggle) navToggle.setAttribute('aria-expanded','false');
        mobileNav.setAttribute('aria-hidden','true');
      }
    });
    cta.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); scrollToWithOffset(projects); }
    });
  })();



  // Accessible project modal
  let lastFocused = null;
  let trapHandler = null;

  function focusablesWithin(el){
    return Array.from(el.querySelectorAll('a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])'))
      .filter(n=>n.offsetParent !== null);
  }

  function openProject(card){
    const data = card.dataset.project && JSON.parse(card.dataset.project);
    if(!data) return;
    document.getElementById('modal-title').textContent = data.title || '';
    modalDesc.textContent = data.description || '';
    if(data.image) modalImage.src = data.image;
    modalTags.innerHTML = '';
    (data.tags||[]).forEach(t=>{
      const span = document.createElement('span');
      span.className = 'px-2 py-1 text-sm rounded-full border text-slate-600 dark:text-slate-300';
      span.textContent = t;
      modalTags.appendChild(span);
    });
    // set links (if provided) and hide buttons when empty
    if(data.live){ modalLive.href = data.live; modalLive.classList.remove('hidden'); } else { modalLive.removeAttribute('href'); modalLive.classList.add('hidden'); }
    if(data.code){ modalCode.href = data.code; modalCode.classList.remove('hidden'); } else { modalCode.removeAttribute('href'); modalCode.classList.add('hidden'); }

  lastFocused = document.activeElement;
  // ensure modal is visible (remove Tailwind 'hidden' if present)
  modal.classList.remove('hidden');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');

    // focus management
    const focusable = focusablesWithin(modal);
    if(focusable.length) focusable[0].focus();

    // trap tab
    trapHandler = function(e){
      if(e.key === 'Tab'){
        const focusable = focusablesWithin(modal);
        if(focusable.length === 0) { e.preventDefault(); return; }
        const first = focusable[0];
        const last = focusable[focusable.length-1];
        if(e.shiftKey && document.activeElement === first){
          e.preventDefault(); last.focus();
        } else if(!e.shiftKey && document.activeElement === last){
          e.preventDefault(); first.focus();
        }
      } else if(e.key === 'Escape'){
        closeModal();
      }
    };
    document.addEventListener('keydown', trapHandler);
  }

  function closeModal(){
    modal.classList.remove('show');
    // hide modal (re-add hidden class)
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
    if(trapHandler) document.removeEventListener('keydown', trapHandler);
    trapHandler = null;
    if(lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  // expose globally for onclick handlers in markup
  window.openProject = openProject;

  // make project cards keyboard-activatable
  projectCards.forEach(card=>{
    card.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){
        e.preventDefault(); openProject(card);
      }
    });
    // also add pointer click handler in JS in case inline onclick missing
    card.addEventListener('click', (e)=>{
      // ignore clicks on links inside the card
      if(e.target && (e.target.closest && e.target.closest('a'))) return;
      openProject(card);
    });
  });

  // Reveal on scroll using IntersectionObserver
  const revealEls = document.querySelectorAll('.reveal, .project-card');
  if('IntersectionObserver' in window){
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(en=>{
        if(en.isIntersecting){
          en.target.classList.add('in-view');
          obs.unobserve(en.target);
        }
      });
    },{threshold:0.12});
    revealEls.forEach(el => obs.observe(el));
  } else {
    // fallback: simply show
    revealEls.forEach(el=> el.classList.add('in-view'));
  }

  if(modalClose){
    modalClose.addEventListener('click', closeModal);
  }
  // close when clicking backdrop
  if(modal){
    modal.addEventListener('click', (e)=>{
      if(e.target === modal) closeModal();
    });
  }

  // contact form handling (simple validation + simulated submit)
  if(contactForm){
    const statusEl = document.getElementById('form-status');
    contactForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const form = e.target;
      const fm = new FormData(form);
      const name = fm.get('name')?.toString().trim();
      const email = fm.get('email')?.toString().trim();
      const message = fm.get('message')?.toString().trim();
      if(!name){ statusEl.textContent = 'Isi nama.'; form.querySelector('[name="name"]').focus(); return; }
      if(!email || !email.includes('@')){ statusEl.textContent = 'Masukkan email valid.'; form.querySelector('[name="email"]').focus(); return; }
      if(!message){ statusEl.textContent = 'Isi pesan.'; form.querySelector('[name="message"]').focus(); return; }

      // simulate success
      statusEl.textContent = 'Mengirim...';
      setTimeout(()=>{
        statusEl.textContent = 'Terima kasih — pesan berhasil dikirim (simulasi).';
        form.reset();
      }, 800);
    });
  }

  // ensure modal close via global Escape when open (redundant with trap)
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && modal && modal.classList.contains('show')){
      closeModal();
    }
  });

  // Header motion on scroll: add classes based on scroll direction
  (function(){
    const headerEl = document.querySelector('header');
    if(!headerEl) return;
    let lastY = window.scrollY || 0;
    let ticking = false;

    function onScrollFrame(){
      const currentY = window.scrollY || 0;
      const delta = currentY - lastY;

      // small threshold to avoid jitter
      if(currentY <= 8){
        headerEl.classList.remove('scrolled','scroll-down','scroll-up');
      } else {
        headerEl.classList.add('scrolled');
        if(delta > 6){
          // scrolling down
          headerEl.classList.add('scroll-down');
          headerEl.classList.remove('scroll-up');
        } else if(delta < -6){
          // scrolling up
          headerEl.classList.add('scroll-up');
          headerEl.classList.remove('scroll-down');
        }
      }

      lastY = currentY;
      ticking = false;
    }

    window.addEventListener('scroll', ()=>{
      if(!ticking){
        window.requestAnimationFrame(onScrollFrame);
        ticking = true;
      }
    }, {passive:true});
  })();

  // --- Bilingual content loader (content.json) -----------------
  const langToggle = document.getElementById('lang-toggle');
  const langToggleMobile = document.getElementById('lang-toggle-mobile');
  let siteContent = null;
  // default language (use saved or 'id')
  let currentLang = localStorage.getItem('lang') || 'id';
  const ADMIN_STORAGE_KEY = 'portfolioAdminDataV1';

  function getAdminData(){
    try{
      const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
      if(!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch(e){
      return null;
    }
  }

  function applyAdminOverrides(){
    const admin = getAdminData();
    if(!admin) return;

    const brand = document.getElementById('site-brand');
    const headerCta = document.getElementById('header-contact-cta');
    const aboutHeading = document.getElementById('about-heading');
    const skillsHeading = document.getElementById('skills-heading');
    const projectsHeading = document.getElementById('projects-heading');
    const mediaHeading = document.getElementById('media-heading');
    const mediaIntro = document.getElementById('media-intro');
    const contactHeading = document.getElementById('contact-heading');
    const contactIntro = document.getElementById('contact-intro');
    const footerText = document.getElementById('footer-text');

    if(brand && admin.siteBrand){
      brand.innerHTML = `${admin.siteBrand}<span class="text-primary">.</span>`;
    }
    if(headerCta && admin.headerContactCta) headerCta.textContent = admin.headerContactCta;
    if(aboutHeading && admin.aboutHeading) aboutHeading.textContent = admin.aboutHeading;
    if(skillsHeading && admin.skillsHeading) skillsHeading.textContent = admin.skillsHeading;
    if(projectsHeading && admin.projectsHeading) projectsHeading.textContent = admin.projectsHeading;
    if(mediaHeading && admin.mediaHeading) mediaHeading.textContent = admin.mediaHeading;
    if(mediaIntro && admin.mediaIntro) mediaIntro.textContent = admin.mediaIntro;
    if(contactHeading && admin.contactHeading) contactHeading.textContent = admin.contactHeading;
    if(contactIntro && admin.contactIntro) contactIntro.textContent = admin.contactIntro;
    if(footerText && admin.footerText) footerText.innerHTML = admin.footerText;

    // Hero + about + profile image
    const heroName = document.getElementById('hero-name');
    const heroSub = document.getElementById('hero-sub');
    const aboutText = document.getElementById('about-text');
    const profileImg = document.querySelector('img[alt="Parulian Johannes"]');
    if(heroName && admin.heroName) heroName.textContent = admin.heroName;
    if(heroSub && admin.heroSubtitle) heroSub.textContent = admin.heroSubtitle;
    if(aboutText && admin.aboutText) aboutText.textContent = admin.aboutText;
    if(profileImg && admin.profileImage) profileImg.src = admin.profileImage;

    const ctaProjects = document.getElementById('cta-projects-btn');
    const ctaContact = document.getElementById('cta-contact-btn');
    const ctaDownload = document.getElementById('cta-download-btn');
    const headerContactCta = document.getElementById('header-contact-cta');
    if(ctaProjects && admin.ctaProjects) ctaProjects.textContent = admin.ctaProjects;
    if(ctaContact && admin.ctaContact) ctaContact.textContent = admin.ctaContact === 'Contact' ? 'Hubungi Saya' : admin.ctaContact;
    if(ctaDownload && admin.ctaDownload) ctaDownload.textContent = admin.ctaDownload;
    if(headerContactCta && admin.headerContactCta) headerContactCta.textContent = admin.headerContactCta === 'Contact' ? 'Hubungi Saya' : admin.headerContactCta;

    // Contact links + labels
    const emailBtn = document.getElementById('contact-email-btn');
    const linkedinBtn = document.getElementById('contact-linkedin-btn');
    const phoneBtn = document.getElementById('contact-phone-btn');
    const emailDirect = document.getElementById('email-direct');
    if(emailBtn && admin.contactEmail){
      emailBtn.textContent = admin.contactEmail;
      emailBtn.href = `mailto:${admin.contactEmail}`;
    }
    if(emailDirect && admin.contactEmail){
      emailDirect.href = `mailto:${admin.contactEmail}`;
    }
    if(linkedinBtn && admin.contactLinkedin){
      linkedinBtn.href = admin.contactLinkedin;
    }
    if(phoneBtn){
      if(admin.contactPhone){
        phoneBtn.textContent = admin.contactPhone;
        phoneBtn.href = `tel:${admin.contactPhone.replace(/\s+/g, '')}`;
        phoneBtn.classList.remove('hidden');
      } else {
        phoneBtn.classList.add('hidden');
      }
    }

    const navAbout = document.getElementById('nav-about');
    const navProjects = document.getElementById('nav-projects');
    const navOrganizations = document.getElementById('nav-organizations');
    const navExperience = document.getElementById('nav-experience');
    const navMedia = document.getElementById('nav-media');
    const navSkills = document.getElementById('nav-skills');
    const navContact = document.getElementById('nav-contact');
    if(navAbout && admin.navAbout) navAbout.textContent = admin.navAbout;
    if(navProjects && admin.navProjects) navProjects.textContent = admin.navProjects;
    if(navOrganizations && admin.navOrganizations) navOrganizations.textContent = admin.navOrganizations;
    if(navExperience && admin.navExperience) navExperience.textContent = admin.navExperience;
    if(navMedia && admin.navMedia) navMedia.textContent = admin.navMedia;
    if(navSkills && admin.navSkills) navSkills.textContent = admin.navSkills;
    if(navContact && admin.navContact) navContact.textContent = admin.navContact;

    // Header quick links
    const emailQuick = document.querySelector('a[aria-label^="Email:"]');
    const linkedinQuick = document.querySelector('a[title="LinkedIn"]');
    if(emailQuick && admin.contactEmail){
      emailQuick.href = `mailto:${admin.contactEmail}`;
      emailQuick.setAttribute('aria-label', `Email: ${admin.contactEmail}`);
    }
    if(linkedinQuick && admin.contactLinkedin){
      linkedinQuick.href = admin.contactLinkedin;
    }

    // Skills lists
    const s1 = document.getElementById('skills-list-1');
    const s2 = document.getElementById('skills-list-2');
    if(s1 && Array.isArray(admin.skillsLeft) && admin.skillsLeft.length){
      s1.innerHTML = admin.skillsLeft.map(it=>`<li>${it}</li>`).join('');
    }
    if(s2 && Array.isArray(admin.skillsRight) && admin.skillsRight.length){
      s2.innerHTML = admin.skillsRight.map(it=>`<li>${it}</li>`).join('');
    }

    // Dynamic project gallery from admin data
    if(Array.isArray(admin.projects) && admin.projects.length){
      const contentProjects = siteContent && siteContent[currentLang] && siteContent[currentLang].projects && siteContent[currentLang].projects.items
        ? siteContent[currentLang].projects.items
        : [];
      renderProjectsGallery(mergeProjectItems(contentProjects, admin.projects));
    }

    const orgHeading = document.getElementById('org-heading');
    const orgIntro = document.getElementById('org-intro');
    const expHeading = document.getElementById('exp-heading');
    const expIntro = document.getElementById('exp-intro');
    if(orgHeading && admin.organizationsHeading) orgHeading.textContent = admin.organizationsHeading;
    if(orgIntro && admin.organizationsIntro) orgIntro.textContent = admin.organizationsIntro;
    if(expHeading && admin.experienceHeading) expHeading.textContent = admin.experienceHeading;
    if(expIntro && admin.experienceIntro) expIntro.textContent = admin.experienceIntro;

    if(Array.isArray(admin.organizations)){
      renderOrganizationsSection(admin.organizations);
    }
    if(Array.isArray(admin.workExperience)){
      renderExperienceSection(admin.workExperience);
    }

    if(Array.isArray(admin.mediaItems) && admin.mediaItems.length){
      renderMediaGallery(admin.mediaItems);
    }
  }

  function applyContent(lang){
    if(!siteContent || !siteContent[lang]) return;
    const c = siteContent[lang];
    // Hero
    const heroName = document.getElementById('hero-name');
    const heroSub = document.getElementById('hero-sub');
    if(heroName && c.hero && c.hero.name) heroName.textContent = c.hero.name;
    if(heroSub && c.hero && c.hero.subtitle) heroSub.textContent = c.hero.subtitle;

    // About
    const about = document.getElementById('about-text');
    if(about && c.about) about.textContent = c.about;

    // Projects heading
    const projectsHeading = document.getElementById('projects-heading');
    if(projectsHeading && c.projects && c.projects.heading) projectsHeading.textContent = c.projects.heading;

    // Media heading and intro
    const mediaHeading = document.getElementById('media-heading');
    const mediaIntro = document.getElementById('media-intro');
    if(mediaHeading && c.media && c.media.heading) mediaHeading.textContent = c.media.heading;
    if(mediaIntro && c.media && c.media.intro) mediaIntro.textContent = c.media.intro;

    // Render projects from content.json when available
    if(c.projects && c.projects.items){
      renderProjectsGallery(normalizeProjectItems(c.projects.items));
    }

    // Render media from content.json if available
    if(c.media && Array.isArray(c.media.items) && c.media.items.length){
      renderMediaGallery(c.media.items);
    }

    // Update language UI
    updateLangUI(lang);
    // --- NAV & CTA updates
    try{
      if(c.nav){
        const navAbout = document.getElementById('nav-about'); if(navAbout && c.nav.about) navAbout.textContent = c.nav.about;
        const navProjects = document.getElementById('nav-projects'); if(navProjects && c.nav.projects) navProjects.textContent = c.nav.projects;
        const navOrganizations = document.getElementById('nav-organizations'); if(navOrganizations && c.nav.organizations) navOrganizations.textContent = c.nav.organizations;
        const navExperience = document.getElementById('nav-experience'); if(navExperience && c.nav.experience) navExperience.textContent = c.nav.experience;
        const navMedia = document.getElementById('nav-media'); if(navMedia && c.nav.media) navMedia.textContent = c.nav.media;
        const navSkills = document.getElementById('nav-skills'); if(navSkills && c.nav.skills) navSkills.textContent = c.nav.skills;
        const navContact = document.getElementById('nav-contact'); if(navContact && c.nav.contact) navContact.textContent = c.nav.contact;
        const ctaProjects = document.getElementById('cta-projects-btn'); if(ctaProjects && c.cta && c.cta.projects) ctaProjects.textContent = c.cta.projects;
        const ctaContact = document.getElementById('cta-contact-btn'); if(ctaContact && c.cta && c.cta.contact) ctaContact.textContent = c.cta.contact;
        const ctaDownload = document.getElementById('cta-download-btn'); if(ctaDownload && c.cta && c.cta.download) ctaDownload.textContent = c.cta.download;
        const cvBtn = document.getElementById('cv-download-btn'); if(cvBtn && c.nav && c.nav.download_cv) cvBtn.textContent = c.nav.download_cv;
      }
    }catch(e){/* ignore */}

    // --- Skills
    try{
      if(c.skills){
        const s1 = document.getElementById('skills-list-1');
        const s2 = document.getElementById('skills-list-2');
        if(s1 && Array.isArray(c.skills.left)){
          s1.innerHTML = c.skills.left.map(it=>`<li>${it}</li>`).join('');
        }
        if(s2 && Array.isArray(c.skills.right)){
          s2.innerHTML = c.skills.right.map(it=>`<li>${it}</li>`).join('');
        }
      }
    }catch(e){/* ignore */}

    // --- Organizations and work experience
    try{
      if(c.organizations){
        const oh = document.getElementById('org-heading'); if(oh && c.organizations.heading) oh.textContent = c.organizations.heading;
        const oi = document.getElementById('org-intro'); if(oi && c.organizations.intro) oi.textContent = c.organizations.intro;
        renderOrganizationsSection(Array.isArray(c.organizations.items) ? c.organizations.items : []);
      }
      if(c.workExperience){
        const eh = document.getElementById('exp-heading'); if(eh && c.workExperience.heading) eh.textContent = c.workExperience.heading;
        const ei = document.getElementById('exp-intro'); if(ei && c.workExperience.intro) ei.textContent = c.workExperience.intro;
        renderExperienceSection(Array.isArray(c.workExperience.items) ? c.workExperience.items : []);
      }
    }catch(e){/* ignore */}

    // --- Contact & form
    try{
      if(c.contact){
        const ch = document.getElementById('contact-heading'); if(ch && c.contact.heading) ch.textContent = c.contact.heading;
        const ci = document.getElementById('contact-intro'); if(ci && c.contact.intro) ci.textContent = c.contact.intro;
        const emailBtn = document.getElementById('contact-email-btn'); if(emailBtn && c.contact.email_label) emailBtn.textContent = c.contact.email_label;
        const linkedinBtn = document.getElementById('contact-linkedin-btn'); if(linkedinBtn && c.contact.linkedin_label) linkedinBtn.textContent = c.contact.linkedin_label;
        const phoneBtn = document.getElementById('contact-phone-btn');
        if(phoneBtn && c.contact.phone_label){
          phoneBtn.textContent = c.contact.phone_label;
          phoneBtn.href = `tel:${String(c.contact.phone_label).replace(/\s+/g, '')}`;
          phoneBtn.classList.remove('hidden');
        }
        const inputName = document.getElementById('input-name'); if(inputName && c.contact.form && c.contact.form.name_placeholder) inputName.placeholder = c.contact.form.name_placeholder;
        const inputEmail = document.getElementById('input-email'); if(inputEmail && c.contact.form && c.contact.form.email_placeholder) inputEmail.placeholder = c.contact.form.email_placeholder;
        const inputMessage = document.getElementById('input-message'); if(inputMessage && c.contact.form && c.contact.form.message_placeholder) inputMessage.placeholder = c.contact.form.message_placeholder;
        const submitBtn = document.getElementById('submit-btn'); if(submitBtn && c.contact.form && c.contact.form.submit) submitBtn.textContent = c.contact.form.submit;
        const emailDirect = document.getElementById('email-direct'); if(emailDirect && c.contact.form && c.contact.form.email_direct) emailDirect.textContent = c.contact.form.email_direct;
      }
    }catch(e){/* ignore */}

    // --- Footer
    try{
      if(c.footer && c.footer.text){
        const f = document.getElementById('footer-text'); if(f) f.innerHTML = c.footer.text;
      }
    }catch(e){/* ignore */}

    // Apply admin overrides last so manual admin edits always win.
    applyAdminOverrides();
  }

  function updateLangUI(lang){
    if(langToggle) langToggle.textContent = (lang === 'id' ? 'ID' : 'EN');
    if(langToggleMobile) langToggleMobile.textContent = (lang === 'id' ? 'ID' : 'EN');
  }

  function setLang(lang){
    currentLang = lang;
    localStorage.setItem('lang', lang);
    if(siteContent) applyContent(lang);
  }

  // load content.json and apply
  fetch('content.json').then(r=> r.ok ? r.json() : Promise.reject('no content.json')).then(j=>{
    siteContent = j;
    applyContent(currentLang);
    bindProjectGridInteractions();
    bindExperienceGridInteractions();
  }).catch(()=>{
    // fallback to admin overrides if content.json is unavailable
    applyAdminOverrides();
    bindProjectGridInteractions();
    bindExperienceGridInteractions();
  });

  // Listen for admin changes in other tabs (live-reload admin edits)
  window.addEventListener('storage', (e) => {
    if(e.key === ADMIN_STORAGE_KEY){
      try{ applyAdminOverrides(); }catch(_){}
    }
  });

  if(langToggle) langToggle.addEventListener('click', ()=> setLang(currentLang === 'id' ? 'en' : 'id'));
  if(langToggleMobile) langToggleMobile.addEventListener('click', ()=> setLang(currentLang === 'id' ? 'en' : 'id'));

  // Prevent scrolling past the document bounds (clamp scroll)
  (function(){
    let ticking = false;
    function clampScroll(){
      const doc = document.documentElement;
      const max = Math.max(0, doc.scrollHeight - window.innerHeight);
      if(window.scrollY < 0) window.scrollTo(0,0);
      else if(window.scrollY > max) window.scrollTo(0, max);
      ticking = false;
    }

    // Smooth programmatic scroll helper (soft interpolation)
    const scrollAnimator = { raf: null, from: 0, to: 0, start: 0, duration: 200 };
    function smoothScrollTo(target, duration = 200){
      const doc = document.documentElement;
      const max = Math.max(0, doc.scrollHeight - window.innerHeight);
      const dest = Math.max(0, Math.min(max, Math.round(target)));
      if(scrollAnimator.raf) cancelAnimationFrame(scrollAnimator.raf);
      scrollAnimator.from = window.scrollY;
      scrollAnimator.to = dest;
      scrollAnimator.start = performance.now();
      scrollAnimator.duration = duration;

      function easeInOut(t){ return t<0.5 ? 2*t*t : -1 + (4-2*t)*t; }

      function step(now){
        const elapsed = Math.max(0, now - scrollAnimator.start);
        const t = Math.min(1, elapsed / scrollAnimator.duration);
        const eased = easeInOut(t);
        const cur = Math.round(scrollAnimator.from + (scrollAnimator.to - scrollAnimator.from) * eased);
        window.scrollTo(0, cur);
        if(t < 1){ scrollAnimator.raf = requestAnimationFrame(step); }
        else { scrollAnimator.raf = null; }
      }
      scrollAnimator.raf = requestAnimationFrame(step);
    }
    window.addEventListener('scroll', ()=>{
      if(!ticking){ window.requestAnimationFrame(clampScroll); ticking = true; }
    }, {passive:true});
    window.addEventListener('resize', clampScroll);
    window.addEventListener('load', clampScroll);

    // stronger prevention: stop wheel/touch/keyboard from moving past bounds
    let touchStartY = null;
    function preventOverscroll(e){
      const doc = document.documentElement;
      const max = Math.max(0, doc.scrollHeight - window.innerHeight);
      let y = window.scrollY;
      const threshold = 8; // px tolerance near edges
      if(e.type === 'wheel'){
        // allow native wheel scrolling except when trying to go past edges
        const dy = e.deltaY || 0;
        if(y >= max - threshold && dy > 0){ smoothScrollTo(max, 180); e.preventDefault(); return false; }
        if(y <= threshold && dy < 0){ smoothScrollTo(0, 180); e.preventDefault(); return false; }
        // otherwise, do nothing and let browser handle scrolling
        return;
      } else if(e.type === 'touchmove'){
        if(touchStartY == null) return;
        const touch = e.touches && e.touches[0];
        if(!touch) return;
        const dy = touchStartY - touch.clientY; // positive => swipe up => scroll down
        if(y >= max - threshold && dy > 0){ smoothScrollTo(max, 200); e.preventDefault(); return false; }
        if(y <= threshold && dy < 0){ smoothScrollTo(0, 200); e.preventDefault(); return false; }
        // otherwise update touchStartY and allow native behavior
        touchStartY = touch.clientY;
        return;
      } else if(e.type === 'keydown'){
        const kc = e.keyCode || e.which;
        let newY = y;
        if(kc === 40) newY = Math.min(max, y + 40); // ArrowDown
        else if(kc === 38) newY = Math.max(0, y - 40); // ArrowUp
        else if(kc === 32 || kc === 34) newY = Math.min(max, y + Math.round(window.innerHeight * 0.9)); // Space / PageDown
        else if(kc === 33) newY = Math.max(0, y - Math.round(window.innerHeight * 0.9)); // PageUp
        else if(kc === 35) newY = max; // End
        else if(kc === 36) newY = 0; // Home
        // only intercept if the key would move past document bounds
        if(newY > max && (kc === 32 || kc === 34 || kc === 40 || kc === 35)){
          smoothScrollTo(max, 200); e.preventDefault(); return false;
        }
        if(newY < 0 && (kc === 33 || kc === 36 || kc === 38)){
          smoothScrollTo(0, 200); e.preventDefault(); return false;
        }
        // otherwise allow native key handling
      }
    }

    // NOTE: removed active wheel/touch/keydown interception to allow native scrolling.
    // We rely on clampScroll (above) and CSS `overscroll-behavior-y: none` to prevent overscroll visual.
  })();

})();