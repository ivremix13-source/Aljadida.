/* ==========================================================================
   مدرسة الجديدة النموذجية بنين | Main interaction layer
   Works on the home page and all stream pages.
   ========================================================================== */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const config = window.schoolConfig || {};
  const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
  const PLANNER_KEY = 'al_jadida_planner_v2';
  const THEME_KEY = 'al_jadida_theme';

  document.addEventListener('DOMContentLoaded', () => {
    initSplashScreen();
    initTheme();
    initNavigation();
    initCountdownTimer();
    initStudyPlanner();
    initFooterYear();
    initRevealAnimations();
    initGlobalSearch();
    initBackToTop();
    initStreamPage();
    updateHomeStats();
  });

  function toArabicDigits(value) {
    return String(value).replace(/[0-9]/g, digit => AR_DIGITS[Number(digit)]);
  }

  function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }

  function safeStorageSet(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (_) { return false; }
  }

  function normalizeText(value) {
    return String(value || '')
      .toLocaleLowerCase('ar')
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = text;
    return element;
  }

  /* Splash screen — shown once per tab session, with a working skip button. */
  function initSplashScreen() {
    const splash = $('#splash-screen');
    if (!splash) return;

    let alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem('al_jadida_splash_seen') === '1'; } catch (_) { /* storage may be blocked */ }
    if (alreadySeen) {
      splash.classList.add('splash-hidden');
      return;
    }

    const progressBar = $('#splash-progress');
    const loadingText = $('#loading-text');
    const skipButton = $('#skip-splash');
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const duration = reducedMotion ? 450 : 1900;
    const messages = ['نُهيّئ لك مساحة دراسة أكثر تنظيمًا...', 'نرتّب المسارات والمواد الدراسية...', 'أنت جاهز للبدء!'];

    requestAnimationFrame(() => {
      if (progressBar) {
        progressBar.style.transition = `width ${duration}ms linear`;
        progressBar.style.width = '100%';
      }
    });
    const messageTimers = [
      window.setTimeout(() => { if (loadingText) loadingText.textContent = messages[1]; }, duration * .35),
      window.setTimeout(() => { if (loadingText) loadingText.textContent = messages[2]; }, duration * .72)
    ];

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      messageTimers.forEach(window.clearTimeout);
      try { sessionStorage.setItem('al_jadida_splash_seen', '1'); } catch (_) { /* ignore */ }
      splash.classList.add('splash-hidden');
    };

    const timer = window.setTimeout(finish, duration + 120);
    if (skipButton) {
      skipButton.addEventListener('click', () => {
        window.clearTimeout(timer);
        finish();
      });
    }
  }

  /* Theme button */
  function initTheme() {
    const savedTheme = safeStorageGet(THEME_KEY);
    const theme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
    applyTheme(theme);

    const button = $('#theme-toggle');
    if (!button) return;
    button.addEventListener('click', () => {
      const next = document.body.dataset.theme === 'light' ? 'dark' : 'light';
      applyTheme(next);
      safeStorageSet(THEME_KEY, next);
      showToast(next === 'light' ? 'تم تفعيل المظهر الفاتح.' : 'تم تفعيل المظهر الداكن.', 'fa-palette');
    });
  }

  function applyTheme(theme) {
    document.body.dataset.theme = theme;
    const button = $('#theme-toggle');
    if (button) {
      button.innerHTML = theme === 'light' ? '<i class="fa-solid fa-moon" aria-hidden="true"></i>' : '<i class="fa-solid fa-sun" aria-hidden="true"></i>';
      button.setAttribute('aria-label', theme === 'light' ? 'تفعيل المظهر الداكن' : 'تفعيل المظهر الفاتح');
      button.title = theme === 'light' ? 'تفعيل المظهر الداكن' : 'تفعيل المظهر الفاتح';
    }
    const themeMeta = $('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#f4f6fa' : '#08111f');
  }

  /* Responsive navigation and active section indicator */
  function initNavigation() {
    const menuButton = $('#menu-toggle');
    const nav = $('#main-nav');
    if (menuButton && nav) {
      menuButton.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
        menuButton.innerHTML = open ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>' : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
      });
      $$('.nav-link', nav).forEach(link => link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'فتح القائمة');
        menuButton.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
      }));
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          menuButton.setAttribute('aria-expanded', 'false');
          menuButton.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
          menuButton.focus();
        }
      });
    }

    const sectionLinks = $$('.main-nav a[href^="#"]');
    const sections = sectionLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window && sections.length) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          sectionLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        });
      }, { rootMargin: '-28% 0px -62% 0px' });
      sections.forEach(section => observer.observe(section));
    }
  }

  /* Countdown clock */
  function initCountdownTimer() {
    const ids = ['days', 'hours', 'minutes', 'seconds'];
    const elements = ids.map(id => document.getElementById(id));
    if (elements.some(element => !element)) return;

    const targetTimestamp = new Date(config.examTargetDate || '').getTime();
    const note = $('#timer-note');
    if (!Number.isFinite(targetTimestamp)) {
      elements.forEach(element => { element.textContent = '—'; });
      if (note) note.textContent = 'يرجى ضبط تاريخ الامتحان في ملف data.js.';
      return;
    }
    if (note && config.examDateLabel) {
      note.textContent = `الموعد المبدئي: ${config.examDateLabel} — قابل للتعديل من ملف البيانات.`;
    }

    let intervalId = null;
    const update = () => {
      const difference = targetTimestamp - Date.now();
      if (difference <= 0) {
        elements.forEach(element => { element.textContent = '٠٠'; });
        if (note) note.textContent = 'وصل الموعد المحدد في إعدادات المنصة. راجع الإعلان الرسمي للتأكد من مواعيد الامتحانات.';
        if (intervalId) window.clearInterval(intervalId);
        return;
      }
      const days = Math.floor(difference / 86400000);
      const hours = Math.floor((difference % 86400000) / 3600000);
      const minutes = Math.floor((difference % 3600000) / 60000);
      const seconds = Math.floor((difference % 60000) / 1000);
      elements[0].textContent = toArabicDigits(String(days).padStart(3, '0'));
      elements[1].textContent = toArabicDigits(String(hours).padStart(2, '0'));
      elements[2].textContent = toArabicDigits(String(minutes).padStart(2, '0'));
      elements[3].textContent = toArabicDigits(String(seconds).padStart(2, '0'));
    };
    update();
    if (targetTimestamp > Date.now()) intervalId = window.setInterval(update, 1000);
  }

  /* Daily study planner. Progress resets automatically when local date changes. */
  function initStudyPlanner() {
    const container = $('#planner-items');
    if (!container || !Array.isArray(config.plannerSubjects)) return;

    const today = getLocalDateKey();
    const dateLabel = $('#planner-date');
    if (dateLabel) {
      try {
        dateLabel.textContent = new Intl.DateTimeFormat('ar-SD', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
      } catch (_) { dateLabel.textContent = 'خطة اليوم'; }
    }

    let savedState = readPlannerState();
    if (savedState.date !== today) savedState = { date: today, items: {} };
    let items = savedState.items && typeof savedState.items === 'object' ? savedState.items : {};
    container.replaceChildren();

    config.plannerSubjects.forEach(subject => {
      const label = createElement('label', 'planner-item');
      const checkbox = createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `planner-${subject.id}`;
      checkbox.checked = items[subject.id] === true;
      checkbox.setAttribute('aria-label', `تم إنجاز ${subject.label}`);
      const subjectText = createElement('span', '', subject.label);
      label.htmlFor = checkbox.id;
      if (checkbox.checked) label.classList.add('is-complete');
      label.append(checkbox, subjectText);
      checkbox.addEventListener('change', () => {
        items[subject.id] = checkbox.checked;
        if (checkbox.checked) label.classList.add('is-complete');
        else label.classList.remove('is-complete');
        const ok = safeStorageSet(PLANNER_KEY, JSON.stringify({ date: today, items }));
        updatePlannerProgress(container, config.plannerSubjects, items);
        if (!ok) showToast('المتصفح منع الحفظ المحلي؛ ستبقى العلامات حتى إغلاق الصفحة.', 'fa-triangle-exclamation');
      });
      container.appendChild(label);
    });

    safeStorageSet(PLANNER_KEY, JSON.stringify({ date: today, items }));
    updatePlannerProgress(container, config.plannerSubjects, items);

    const resetButton = $('#reset-planner');
    if (resetButton) resetButton.addEventListener('click', () => {
      const confirmed = window.confirm('هل تريد إزالة علامات الإنجاز لهذا اليوم؟');
      if (!confirmed) return;
      items = {};
      $$('.planner-item input[type="checkbox"]', container).forEach(input => {
        input.checked = false;
        input.closest('.planner-item')?.classList.remove('is-complete');
      });
      safeStorageSet(PLANNER_KEY, JSON.stringify({ date: today, items }));
      updatePlannerProgress(container, config.plannerSubjects, items);
      showToast('تمت إعادة ضبط قائمة اليوم.', 'fa-rotate-left');
    });
  }

  function readPlannerState() {
    try {
      const stored = safeStorageGet(PLANNER_KEY);
      if (!stored) return { date: '', items: {} };
      const parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== 'object') return { date: '', items: {} };
      return { date: String(parsed.date || ''), items: parsed.items && typeof parsed.items === 'object' ? parsed.items : {} };
    } catch (_) {
      return { date: '', items: {} };
    }
  }

  function getLocalDateKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  function updatePlannerProgress(container, subjects, items) {
    const total = subjects.length;
    const complete = subjects.filter(subject => items[subject.id] === true).length;
    const percentage = total ? Math.round((complete / total) * 100) : 0;
    const label = $('#planner-progress-label');
    const percent = $('#planner-progress-percent');
    const bar = $('#planner-progress-bar');
    if (label) label.textContent = `${toArabicDigits(complete)} من ${toArabicDigits(total)} مواد مكتملة`;
    if (percent) percent.textContent = `${toArabicDigits(percentage)}٪`;
    if (bar) bar.style.width = `${percentage}%`;
    if (container) container.setAttribute('aria-label', `اكتمل ${percentage} بالمئة من خطة اليوم`);
  }

  function initFooterYear() {
    const year = $('#year');
    if (year) year.textContent = toArabicDigits(new Date().getFullYear());
  }

  /* Section entrance animations */
  function initRevealAnimations() {
    const elements = $$('.reveal');
    if (!elements.length) return;
    if (!('IntersectionObserver' in window) || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach(element => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -35px 0px' });
    elements.forEach(element => observer.observe(element));
  }

  /* Global subject / stream / resource search */
  function initGlobalSearch() {
    const form = $('#global-search-form');
    const input = $('#global-search-input');
    const results = $('#global-search-results');
    if (!form || !input || !results) return;

    const runSearch = () => {
      const query = normalizeText(input.value);
      results.replaceChildren();
      if (!query) {
        const note = createElement('div', 'search-empty');
        const icon = createElement('i', 'fa-solid fa-lightbulb');
        const title = createElement('strong', '', 'ابدأ بكتابة اسم مادة أو مسار.');
        const detail = createElement('p', '', 'ستظهر هنا النتائج المطابقة لما هو مُسجّل في ملف بيانات المكتبة.');
        note.append(icon, title, detail);
        results.appendChild(note);
        return;
      }

      const hits = [];
      const streams = Array.isArray(config.streams) ? config.streams : [];
      const subjectsData = config.subjectsData || {};
      const resourceWords = ['كتاب', 'كتب', 'مرجع', 'مراجع', 'ملخص', 'ملخصات', 'ورقه', 'اوراق', 'عمل', 'امتحان', 'امتحانات', 'اختبار', 'اختبارات', 'ملفات', 'مورد'];
      const isResourceQuery = resourceWords.some(word => query.includes(normalizeText(word)));

      streams.forEach(stream => {
        const streamText = normalizeText(`${stream.title} ${stream.shortTitle} ${stream.description}`);
        if (streamText.includes(query) || query.includes(normalizeText(stream.shortTitle))) {
          hits.push({ title: stream.title, subtitle: 'افتح المسار وتصفّح مواده وملفاته المتاحة', href: stream.href, icon: stream.icon || 'fa-graduation-cap', kind: 'stream' });
        }
        (subjectsData[stream.id] || []).forEach(subject => {
          const subjectText = normalizeText(subject.subjectName);
          const resources = [
            ...(Array.isArray(subject.books) ? subject.books.map(item => ({ ...item, group: 'الكتب والمراجع' })) : []),
            ...(Array.isArray(subject.worksheets) ? subject.worksheets.map(item => ({ ...item, group: 'أوراق العمل والملخصات' })) : []),
            ...(Array.isArray(subject.exams) ? subject.exams.map(item => ({ ...item, group: 'الامتحانات' })) : [])
          ];
          if (subjectText.includes(query)) {
            hits.push({ title: subject.subjectName, subtitle: `${stream.shortTitle} · ${resources.length ? `${toArabicDigits(resources.length)} ملفات متاحة` : 'صفحة المادة وتفاصيل الموارد'}`, href: stream.href, icon: subject.icon || stream.icon, kind: 'subject' });
          } else {
            resources.forEach(resource => {
              if (normalizeText(`${resource.name} ${resource.group}`).includes(query)) {
                hits.push({ title: resource.name, subtitle: `${subject.subjectName} · ${resource.group}`, href: safeResourceUrl(resource.url) || stream.href, icon: 'fa-file-pdf', kind: 'resource' });
              }
            });
          }
        });
      });

      // Resource-category searches lead to a stream index, but never pretend that a file exists.
      if (!hits.length && isResourceQuery) {
        streams.forEach(stream => hits.push({ title: stream.title, subtitle: 'افتح المسار لمعاينة أقسام الموارد؛ الملفات تُعرض عند إضافتها فعليًا', href: stream.href, icon: stream.icon || 'fa-book-open', kind: 'stream' }));
      }

      const uniqueHits = [];
      const seen = new Set();
      hits.forEach(hit => {
        const key = `${hit.title}|${hit.href}`;
        if (!seen.has(key)) { seen.add(key); uniqueHits.push(hit); }
      });

      if (!uniqueHits.length) {
        const empty = createElement('div', 'search-empty');
        empty.append(createElement('i', 'fa-solid fa-magnifying-glass'), createElement('strong', '', 'لم نعثر على نتيجة مطابقة.'), createElement('p', '', 'جرّب اسم المادة أو المسار بكلمات أبسط.'));
        results.appendChild(empty);
        return;
      }

      uniqueHits.slice(0, 10).forEach(hit => {
        const a = createElement('a', 'search-result');
        a.href = hit.href;
        if (/^https?:\/\//i.test(hit.href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
        const icon = createElement('span', 'result-icon');
        const iconElement = createElement('i', `fa-solid ${hit.icon || 'fa-book-open'}`);
        icon.appendChild(iconElement);
        const copy = createElement('span', 'result-copy');
        copy.append(createElement('strong', '', hit.title), createElement('small', '', hit.subtitle));
        const arrow = createElement('i', 'fa-solid fa-arrow-left result-arrow');
        arrow.setAttribute('aria-hidden', 'true');
        a.append(icon, copy, arrow);
        results.appendChild(a);
      });
    };

    form.addEventListener('submit', event => { event.preventDefault(); runSearch(); });
    input.addEventListener('input', () => { if (input.value.trim().length >= 2) runSearch(); else results.replaceChildren(); });
    $$('[data-search-suggestion]').forEach(button => button.addEventListener('click', () => {
      input.value = button.dataset.searchSuggestion || '';
      runSearch();
      input.focus();
    }));
  }

  function updateHomeStats() {
    const streamCount = $('#stream-count');
    const subjectCount = $('#subject-count');
    if (streamCount) streamCount.textContent = toArabicDigits((config.streams || []).length);
    if (subjectCount) {
      const count = Object.values(config.subjectsData || {}).reduce((total, subjects) => total + (Array.isArray(subjects) ? subjects.length : 0), 0);
      subjectCount.textContent = toArabicDigits(count);
    }
  }

  /* Back-to-top affordance */
  function initBackToTop() {
    const button = $('#back-to-top');
    if (!button) return;
    const toggle = () => button.classList.toggle('is-visible', window.scrollY > 460);
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* Stream page builder */
  function initStreamPage() {
    if (document.body.dataset.page !== 'stream') return;
    const streamId = document.body.dataset.stream;
    const stream = (config.streams || []).find(item => item.id === streamId);
    const subjects = (config.subjectsData || {})[streamId] || [];
    const container = $('#subjects-container');
    if (!container || !stream) {
      if (container) container.innerHTML = '<div class="no-data"><i class="fa-solid fa-triangle-exclamation"></i><h3>تعذر تحميل المسار</h3><p>راجع قيمة data-stream في ملف الصفحة وتأكد من وجود بيانات المسار داخل data.js.</p></div>';
      return;
    }

    document.title = `${stream.title} | ${config.schoolName || 'مدرسة الجديدة النموذجية بنين'}`;
    const title = $('#stream-page-title');
    const description = $('#stream-page-description');
    const icon = $('#stream-page-icon');
    if (title) title.textContent = stream.title;
    if (description) description.textContent = `تصفّح المواد والكتب والمراجع وأوراق العمل والامتحانات المتاحة ضمن ${stream.title}. تُحدّث القائمة عند إضافة ملفات فعلية إلى بيانات الموقع.`;
    if (icon) icon.innerHTML = `<i class="fa-solid ${escapeHTML(stream.icon || 'fa-book-open')}" aria-hidden="true"></i>`;

    const subjectCount = $('#stream-subject-count');
    const resourceCount = $('#stream-resource-count');
    const bookCount = $('#stream-book-count');
    if (subjectCount) subjectCount.textContent = toArabicDigits(subjects.length);
    const totals = countResources(subjects);
    if (resourceCount) resourceCount.textContent = toArabicDigits(totals.all);
    if (bookCount) bookCount.textContent = toArabicDigits(totals.books);

    let selectedFilter = 'all';
    const searchInput = $('#subject-search-input');
    const render = () => {
      const query = normalizeText(searchInput?.value || '');
      container.replaceChildren();
      const filteredSubjects = subjects.filter(subject => {
        const resourceText = ['books', 'worksheets', 'exams'].flatMap(type => subject[type] || []).map(item => item.name).join(' ');
        return normalizeText(`${subject.subjectName} ${resourceText}`).includes(query);
      });

      if (!filteredSubjects.length) {
        const empty = createElement('div', 'no-data');
        empty.append(createElement('i', 'fa-solid fa-magnifying-glass'), createElement('h3', '', 'لا توجد مواد مطابقة'), createElement('p', '', 'جرّب حذف جزء من عبارة البحث أو كتابة اسم المادة بطريقة مختلفة.'));
        container.appendChild(empty);
        return;
      }

      filteredSubjects.forEach(subject => {
        container.appendChild(buildSubjectCard(subject, selectedFilter));
      });
    };

    if (searchInput) searchInput.addEventListener('input', render);
    $$('.filter-chip').forEach(button => button.addEventListener('click', () => {
      selectedFilter = button.dataset.filter || 'all';
      $$('.filter-chip').forEach(chip => {
        const active = chip === button;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', String(active));
      });
      render();
    }));
    render();
  }

  function countResources(subjects) {
    return subjects.reduce((total, subject) => {
      const books = validResources(subject.books).length;
      const worksheets = validResources(subject.worksheets).length;
      const exams = validResources(subject.exams).length;
      return { all: total.all + books + worksheets + exams, books: total.books + books, worksheets: total.worksheets + worksheets, exams: total.exams + exams };
    }, { all: 0, books: 0, worksheets: 0, exams: 0 });
  }

  function validResources(resources) {
    return Array.isArray(resources) ? resources.filter(item => item && typeof item.name === 'string' && typeof item.url === 'string' && safeResourceUrl(item.url)) : [];
  }

  function safeResourceUrl(url) {
    const value = String(url || '').trim();
    if (!value || /^(javascript|data|vbscript):/i.test(value)) return '';
    if (/^https?:\/\//i.test(value) || /^\.\.?\//.test(value) || /^[a-z0-9_./-]+$/i.test(value) || value.startsWith('/')) return value;
    return '';
  }

  function buildSubjectCard(subject, selectedFilter) {
    const card = createElement('article', 'subject-card');
    const heading = createElement('div', 'subject-header');
    const iconWrap = createElement('span');
    const icon = createElement('i', `fa-solid ${subject.icon || 'fa-book-open'}`);
    icon.setAttribute('aria-hidden', 'true');
    iconWrap.appendChild(icon);
    const headingCopy = createElement('div');
    headingCopy.append(createElement('h3', '', subject.subjectName), createElement('small', '', 'مصادر المادة التعليمية'));
    heading.append(iconWrap, headingCopy);
    card.appendChild(heading);

    const categories = [
      { key: 'books', title: 'الكتب والمراجع الأساسية', icon: 'fa-book-bookmark', emptyText: 'ستظهر الكتب والمراجع هنا عند إضافتها.' },
      { key: 'worksheets', title: 'أوراق العمل والملخصات', icon: 'fa-file-lines', emptyText: 'ستظهر أوراق العمل والملخصات هنا عند إضافتها.' },
      { key: 'exams', title: 'امتحانات الشهادة السودانية', icon: 'fa-file-pen', emptyText: 'ستظهر الامتحانات السابقة هنا عند إضافتها.' }
    ];

    categories.forEach(category => {
      const section = createElement('section', 'subject-category');
      section.dataset.resourceCategory = category.key;
      if (selectedFilter !== 'all' && selectedFilter !== category.key) section.hidden = true;
      const title = createElement('h4');
      const titleIcon = createElement('i', `fa-solid ${category.icon}`);
      titleIcon.setAttribute('aria-hidden', 'true');
      title.append(titleIcon, document.createTextNode(category.title));
      section.appendChild(title);
      const resourceList = createElement('ul', 'resource-list');
      const resources = validResources(subject[category.key]);
      if (resources.length) {
        resources.forEach(resource => {
          const listItem = createElement('li');
          const url = safeResourceUrl(resource.url);
          const link = createElement('a', 'resource-link');
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          if (resource.download === true && !/^https?:\/\//i.test(url)) link.download = '';
          const fileIcon = createElement('i', `fa-solid ${resource.icon || (category.key === 'books' ? 'fa-book' : category.key === 'exams' ? 'fa-file-circle-check' : 'fa-file-lines')}`);
          fileIcon.setAttribute('aria-hidden', 'true');
          const name = createElement('span', 'resource-name', resource.name);
          const action = createElement('i', `fa-solid ${resource.download === true ? 'fa-download' : 'fa-arrow-up-right-from-square'} resource-action`);
          action.setAttribute('aria-hidden', 'true');
          link.append(fileIcon, name, action);
          listItem.appendChild(link);
          resourceList.appendChild(listItem);
        });
      } else {
        const listItem = createElement('li');
        const empty = createElement('div', 'resource-empty');
        const emptyIcon = createElement('i', 'fa-regular fa-folder-open');
        empty.append(emptyIcon, createElement('span', '', category.emptyText));
        listItem.appendChild(empty);
        resourceList.appendChild(listItem);
      }
      section.appendChild(resourceList);
      card.appendChild(section);
    });
    return card;
  }

  /* Small accessible toast for meaningful actions */
  function showToast(message, iconClass = 'fa-circle-check') {
    const region = $('#toast-region');
    if (!region) return;
    const toast = createElement('div', 'toast');
    const icon = createElement('i', `fa-solid ${iconClass}`);
    icon.setAttribute('aria-hidden', 'true');
    toast.append(icon, createElement('span', '', message));
    region.appendChild(toast);
    window.setTimeout(() => {
      toast.classList.add('is-leaving');
      window.setTimeout(() => toast.remove(), 280);
    }, 3200);
  }
})();
