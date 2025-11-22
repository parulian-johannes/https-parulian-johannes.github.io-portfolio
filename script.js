// Interactivity: nav toggle, dark mode, smooth scroll, accessible modal, form handling
(function(){
  const htmlEl = document.documentElement;
  const navToggle = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
  const modal = document.getElementById('project-modal');
  const modalClose = document.getElementById('modal-close');
  const modalImage = document.getElementById('modal-image');
  const modalDesc = document.getElementById('modal-desc');
  const modalTags = document.getElementById('modal-tags');
  const modalLive = document.getElementById('modal-live');
  const modalCode = document.getElementById('modal-code');
  const projectCards = document.querySelectorAll('[data-project]');
  const contactForm = document.getElementById('contact-form');

  // Theme handling with aria updates
  function updateThemeAria(isDark){
    if(themeToggle) themeToggle.setAttribute('aria-pressed', String(!!isDark));
    if(themeToggleMobile) themeToggleMobile.setAttribute('aria-pressed', String(!!isDark));
  }

  function setTheme(dark){
    if(dark){
      htmlEl.classList.add('dark');
      localStorage.setItem('theme','dark');
      updateThemeAria(true);
    } else {
      htmlEl.classList.remove('dark');
      localStorage.setItem('theme','light');
      updateThemeAria(false);
    }
  }

  // initialize theme
  const stored = localStorage.getItem('theme');
  if(stored === 'dark' || (!stored && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)){
    setTheme(true);
  } else {
    setTheme(false);
  }

  // Nav toggle (mobile)
  if(navToggle && mobileNav){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mobileNav.classList.toggle('hidden');
      mobileNav.setAttribute('aria-hidden', String(expanded));
    });
  }

  // Theme toggles
  [themeToggle, themeToggleMobile].forEach(btn=>{
    if(!btn) return;
    btn.addEventListener('click', ()=>{
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(!isDark);
    });
  });

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
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
      projects.scrollIntoView({behavior:'smooth', block:'start'});
      // close mobile nav if open
      if(mobileNav && !mobileNav.classList.contains('hidden')){
        mobileNav.classList.add('hidden');
        if(navToggle) navToggle.setAttribute('aria-expanded','false');
        mobileNav.setAttribute('aria-hidden','true');
      }
    });
    cta.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); projects.scrollIntoView({behavior:'smooth', block:'start'}); }
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
    // set links (if provided)
    if(data.live) modalLive.href = data.live; else modalLive.removeAttribute('href');
    if(data.code) modalCode.href = data.code; else modalCode.removeAttribute('href');

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

    // Update project cards: titles & descriptions (match by existing dataset title)
    projectCards.forEach((card, idx)=>{
      try{
        const data = JSON.parse(card.dataset.project);
        const key = data.title;
        if(c.projects && c.projects.items && c.projects.items[key]){
          const item = c.projects.items[key];
          // update dataset
          data.title = item.title || data.title;
          data.description = item.description || data.description;
          // if a translated image is provided, update it
          if(item.image) data.image = item.image;
          card.dataset.project = JSON.stringify(data);
          // update visible title & description
          const h3 = card.querySelector('h3'); if(h3) h3.textContent = item.title || h3.textContent;
          const p = card.querySelector('p'); if(p) p.textContent = item.description || p.textContent;
          // update thumbnail image if available
          const img = card.querySelector('img'); if(img && data.image) img.src = data.image;
        }
      } catch(e){ /* ignore malformed data */ }
    });

    // Update language UI
    updateLangUI(lang);
    // --- NAV & CTA updates
    try{
      if(c.nav){
        const navAbout = document.getElementById('nav-about'); if(navAbout && c.nav.about) navAbout.textContent = c.nav.about;
        const navProjects = document.getElementById('nav-projects'); if(navProjects && c.nav.projects) navProjects.textContent = c.nav.projects;
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

    // --- Contact & form
    try{
      if(c.contact){
        const ch = document.getElementById('contact-heading'); if(ch && c.contact.heading) ch.textContent = c.contact.heading;
        const ci = document.getElementById('contact-intro'); if(ci && c.contact.intro) ci.textContent = c.contact.intro;
        const emailBtn = document.getElementById('contact-email-btn'); if(emailBtn && c.contact.email_label) emailBtn.textContent = c.contact.email_label;
        const linkedinBtn = document.getElementById('contact-linkedin-btn'); if(linkedinBtn && c.contact.linkedin_label) linkedinBtn.textContent = c.contact.linkedin_label;
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
  }).catch(()=>{
    // silent fallback if content.json missing
  });

  if(langToggle) langToggle.addEventListener('click', ()=> setLang(currentLang === 'id' ? 'en' : 'id'));
  if(langToggleMobile) langToggleMobile.addEventListener('click', ()=> setLang(currentLang === 'id' ? 'en' : 'id'));

})();