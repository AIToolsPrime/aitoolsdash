(function () {
  'use strict';

  var LANG = window.LANG || 'en';
  var reviews = [];
  var filteredResults = [];

  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return document.querySelectorAll(sel); };

  var navbar = $('#navbar');
  var searchInput = $('#searchInput');
  var searchBtn = $('#searchBtn');
  var filterCategory = $('#filterCategory');
  var reviewGrid = $('#reviewGrid');
  var resultsSection = $('#results');
  var resultsGrid = $('#resultsGrid');
  var resultsTitle = $('#resultsTitle');
  var resultsCount = $('#resultsCount');
  var filterRating = $('#filterRating');
  var filterPrice = $('#filterPrice');
  var themeToggle = $('#themeToggle');
  var scrollTop = $('#scrollTop');
  var clearSearch = $('#clearSearch');
  var navSearchLink = $('#navSearchLink');

  var CATEGORIES = {
    'music': { en: 'AI for Music', es: 'IA para Música' },
    'writing': { en: 'AI Writing', es: 'Escritura IA' },
    'images': { en: 'AI Images', es: 'Imágenes IA' },
    'video': { en: 'AI Video', es: 'Video IA' },
    'productivity': { en: 'AI Productivity', es: 'Productividad IA' },
    'audio': { en: 'AI Audio', es: 'Audio IA' },
    'coding': { en: 'AI Coding', es: 'Programación IA' },
    'marketing': { en: 'AI Marketing', es: 'Marketing IA' },
    'assistant': { en: 'AI Assistant', es: 'Asistente IA' }
  };

  function loadTheme() {
    var saved = localStorage.getItem('ai-reviews-theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
      if (themeToggle) themeToggle.textContent = saved === 'dark' ? '🌙' : '☀️';
    } else {
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      if (themeToggle) themeToggle.textContent = prefersDark ? '🌙' : '☀️';
    }
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    if (themeToggle) themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('ai-reviews-theme', next);
  }

  function handleScroll() {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
    if (scrollTop) scrollTop.classList.toggle('visible', window.scrollY > 400);
  }

  function starsHTML(rating) {
    var full = Math.floor(rating);
    var half = rating % 1 >= 0.5 ? 1 : 0;
    var empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  function priceLabel(price, type) {
    if (type === 'free') return 'Free';
    if (type === 'freemium') return 'Free / ' + price;
    return price;
  }

  function priceLabelES(price, type) {
    if (type === 'free') return 'Gratis';
    if (type === 'freemium') return 'Gratis / ' + price;
    return price;
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function logoHTML(domain, name) {
    return '<div class="card-logo">'
      + '<img src="../images/logos/' + domain + '.png" alt="' + name + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'
      + '<span class="card-logo-fallback">' + name.charAt(0).toUpperCase() + '</span>'
      + '</div>';
  }

  function currentMonthYear() {
    var s = new Date().toLocaleDateString(LANG === 'en' ? 'en-US' : 'es-ES', { year: 'numeric', month: 'short' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function renderReviews(data) {
    if (!data || data.length === 0) {
      reviewGrid.innerHTML = '<div class="no-results"><h3>' + (LANG === 'en' ? 'No reviews found' : 'No se encontraron reseñas') + '</h3><p>' + (LANG === 'en' ? 'Try adjusting your filters' : 'Ajusta los filtros') + '</p></div>';
      return;
    }

    reviewGrid.innerHTML = data.map(function (r, i) {
      var catName = CATEGORIES[r.category_slug] ? CATEGORIES[r.category_slug][LANG] || CATEGORIES[r.category_slug].en : r.category_en;
      var dateStr = currentMonthYear();
      return '<div class="review-card" data-cat="' + r.category_slug + '" data-index="' + i + '">'
        + '<div class="card-image">'
        + logoHTML(r.logo, r.name)
        + '<span class="category-badge">' + catName + '</span>'
        + '<span class="rating-badge">' + starsHTML(r.rating) + ' ' + r.rating + '</span>'
        + '</div>'
        + '<a class="card-visit" href="' + escapeAttr(r.affiliate_url || r.url) + '" target="_blank" rel="nofollow noopener noreferrer" onclick="event.stopPropagation();">' + (LANG === 'en' ? 'Visit' : 'Visitar') + '</a>'
        + '<div class="card-body">'
        + '<div class="tool-name">' + highlightMatch(r.name) + '</div>'
        + '<div class="tool-tagline">' + r.tagline + '</div>'
        + '<div class="excerpt">' + r.excerpt + '</div>'
        + '<div class="pros-cons">'
        + '<ul class="pros">' + r.pros.slice(0, 3).map(function (p) { return '<li>✓ ' + p + '</li>'; }).join('') + '</ul>'
        + '<ul class="cons">' + r.cons.slice(0, 3).map(function (c) { return '<li>✗ ' + c + '</li>'; }).join('') + '</ul>'
        + '</div>'
        + '<div class="meta">'
        + '<span class="price' + (r.price_type === 'free' ? ' free' : '') + '">' + (LANG === 'en' ? priceLabel(r.price, r.price_type) : priceLabelES(r.price, r.price_type)) + '</span>'
        + (dateStr ? '<span class="review-date">' + dateStr + '</span>' : '')
        + '<span class="read-more">' + (LANG === 'en' ? 'Read review' : 'Leer reseña') + '</span>'
        + '</div>'
        + '</div></div>';
    }).join('');

    reviewGrid.querySelectorAll('.review-card').forEach(function (el) {
      el.addEventListener('click', function () {
        var idx = parseInt(this.dataset.index);
        window.location.href = './' + data[idx].id + '.html';
      });
    });
  }

  function renderResults(data) {
    if (!data || data.length === 0) {
      resultsGrid.innerHTML = '<div class="no-results"><h3>' + (LANG === 'en' ? 'No results found' : 'Sin resultados') + '</h3><p>' + (LANG === 'en' ? 'Try different search terms or filters' : 'Prueba otros términos o filtros') + '</p></div>';
      return;
    }

    resultsGrid.innerHTML = data.map(function (r, i) {
      var catName = CATEGORIES[r.category_slug] ? CATEGORIES[r.category_slug][LANG] || CATEGORIES[r.category_slug].en : r.category_en;
      var dateStr = currentMonthYear();
      return '<div class="review-card" data-cat="' + r.category_slug + '" data-result-index="' + i + '">'
        + '<div class="card-image">'
        + logoHTML(r.logo, r.name)
        + '<span class="category-badge">' + catName + '</span>'
        + '<span class="rating-badge">' + starsHTML(r.rating) + ' ' + r.rating + '</span>'
        + '</div>'
        + '<a class="card-visit" href="' + escapeAttr(r.affiliate_url || r.url) + '" target="_blank" rel="nofollow noopener noreferrer" onclick="event.stopPropagation();">' + (LANG === 'en' ? 'Visit' : 'Visitar') + '</a>'
        + '<div class="card-body">'
        + '<div class="tool-name">' + highlightMatch(r.name) + '</div>'
        + '<div class="tool-tagline">' + highlightMatch(r.tagline) + '</div>'
        + '<div class="excerpt">' + highlightMatch(r.excerpt) + '</div>'
        + '<div class="meta">'
        + '<span class="price' + (r.price_type === 'free' ? ' free' : '') + '">' + (LANG === 'en' ? priceLabel(r.price, r.price_type) : priceLabelES(r.price, r.price_type)) + '</span>'
        + (dateStr ? '<span class="review-date">' + dateStr + '</span>' : '')
        + '<span class="read-more">' + (LANG === 'en' ? 'Read review' : 'Leer reseña') + '</span>'
        + '</div>'
        + '</div></div>';
    }).join('');

    resultsGrid.querySelectorAll('.review-card').forEach(function (el) {
      el.addEventListener('click', function () {
        var idx = parseInt(this.dataset.resultIndex);
        window.location.href = './' + data[idx].id + '.html';
      });
    });
  }

  var currentQuery = '';

  function highlightMatch(text) {
    if (!text || !currentQuery) return text || '';
    var words = currentQuery.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return text;
    var pattern = words.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|');
    try {
      return text.replace(new RegExp('(' + pattern + ')', 'gi'), '<mark style="background:var(--accent-subtle);color:var(--accent);border-radius:2px;padding:0 2px">$1</mark>');
    } catch (e) {
      return text;
    }
  }

  function applyFilters() {
    var cat = filterCategory.value;
    var rating = parseFloat(filterRating.value);
    var price = filterPrice.value;

    var filtered = reviews.filter(function (r) {
      if (cat !== 'all' && r.category_slug !== cat) return false;
      if (!isNaN(rating) && r.rating < rating) return false;
      if (price !== 'all' && r.price_type !== price) return false;
      return true;
    });

    filteredResults = filtered;
    renderReviews(filtered);
  }

  function scrollToReviews() {
    var el = document.getElementById('reviews');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function doSearch(query) {
    currentQuery = query || '';
    var q = (query || '').trim().toLowerCase();
    var searchSection = document.getElementById('results');

    if (!q) {
      searchSection.style.display = 'none';
      return;
    }

    var matchedCat = null;
    Object.keys(CATEGORIES).forEach(function (slug) {
      var cat = CATEGORIES[slug];
      var name = (cat[LANG] || cat.en).toLowerCase();
      if (slug === q || name === q || name.indexOf(q) !== -1) {
        matchedCat = slug;
      }
    });

    var results;
    if (matchedCat) {
      results = reviews.filter(function (r) { return r.category_slug === matchedCat; });
    } else {
      results = reviews.filter(function (r) {
        var searchText = (r.name + ' ' + r.tagline + ' ' + r.excerpt + ' ' + (r.category || '') + ' ' + (r.category_slug || '') + ' ' + r.pros.join(' ') + ' ' + r.cons.join(' ')).toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        var words = q.normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s+/).filter(Boolean);
        return words.every(function (w) { return searchText.indexOf(w) !== -1; });
      });
    }

    document.getElementById('hero').style.display = 'none';
    document.getElementById('reviews').style.display = 'none';
    var navLinks = document.querySelectorAll('.nav-links a');
    if (navLinks.length >= 2) {
      navLinks[0].textContent = LANG === 'en' ? 'Home' : 'Inicio'; navLinks[0].href = './'; navLinks[0].style.display = '';
      navLinks[1].textContent = LANG === 'en' ? 'Comparisons' : 'Comparativas'; navLinks[1].href = LANG === 'en' ? './comparisons.html' : '../es/comparaciones.html'; navLinks[1].style.display = '';
    }
    searchSection.style.display = 'block';
    resultsTitle.textContent = LANG === 'en' ? 'Results for "' + query + '"' : 'Resultados para "' + query + '"';
    resultsCount.textContent = results.length + (LANG === 'en' ? ' tools found' : ' herramientas encontradas');
    renderResults(results);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function loadReviews() {
    var url = '../data/reviews-' + LANG + '.json?t=' + Date.now();
    fetch(url)
      .then(function (resp) {
        if (!resp.ok) throw new Error('Not found');
        return resp.json();
      })
      .then(function (data) {
        reviews = data;
        init();
      })
      .catch(function () {
        reviews = [];
        init();
      });
  }

  function initFilters() {
    filterCategory.innerHTML = '<option value="all">' + (LANG === 'en' ? 'All Categories' : 'Todas las Categorías') + '</option>';
    Object.keys(CATEGORIES).forEach(function (slug) {
      var opt = document.createElement('option');
      opt.value = slug;
      opt.textContent = CATEGORIES[slug][LANG] || CATEGORIES[slug].en;
      filterCategory.appendChild(opt);
    });
  }

  function init() {
    if (reviews.length === 0) return;

    initFilters();

    var sorted = reviews.slice().sort(function (a, b) {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.date) - new Date(a.date);
    });
    filteredResults = sorted;
    renderReviews(sorted);

    var urlParams = new URLSearchParams(window.location.search);
    var catParam = urlParams.get('cat');
    if (catParam && CATEGORIES[catParam]) {
      filterCategory.value = catParam;
      applyFilters();
      setTimeout(function () { scrollToReviews(); }, 100);
    }

    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    searchBtn.addEventListener('click', function () {
      doSearch(searchInput.value.trim());
    });

    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        doSearch(searchInput.value.trim());
      }
    });

    if (clearSearch) {
      clearSearch.addEventListener('click', function (e) {
        e.preventDefault();
        searchInput.value = '';
        resultsSection.style.display = 'none';
        document.getElementById('hero').style.display = '';
        document.getElementById('reviews').style.display = '';
        var navLinks = document.querySelectorAll('.nav-links a');
        if (navLinks.length >= 2) {
          navLinks[0].textContent = LANG === 'en' ? 'Reviews' : 'Reseñas'; navLinks[0].href = '#reviews'; navLinks[0].style.display = '';
          navLinks[1].textContent = LANG === 'en' ? 'Comparisons' : 'Comparativas'; navLinks[1].href = LANG === 'en' ? './comparisons.html' : '../es/comparaciones.html'; navLinks[1].style.display = '';
        }
        var sorted = reviews.slice().sort(function (a, b) {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.date) - new Date(a.date);
        });
        renderReviews(sorted);
        scrollToReviews();
      });
    }

    if (navSearchLink) {
      navSearchLink.addEventListener('click', function (e) {
        e.preventDefault();
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (filterCategory) filterCategory.addEventListener('change', applyFilters);
    if (filterRating) filterRating.addEventListener('change', applyFilters);
    if (filterPrice) filterPrice.addEventListener('change', applyFilters);

    if (scrollTop) scrollTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', handleScroll);

    if (window.location.hash === '#reviews') {
      var hero = document.getElementById('hero');
      if (hero) hero.style.display = 'none';
      var navLinks = document.querySelectorAll('.nav-links a');
      if (navLinks.length >= 2) {
        navLinks[0].textContent = LANG === 'en' ? 'Home' : 'Inicio'; navLinks[0].href = './'; navLinks[0].style.display = '';
        navLinks[1].textContent = LANG === 'en' ? 'Comparisons' : 'Comparativas'; navLinks[1].href = LANG === 'en' ? './comparisons.html' : '../es/comparaciones.html'; navLinks[1].style.display = '';
      }
      scrollToReviews();
      window.scrollTo({ top: 0 });
      history.replaceState(null, '', window.location.pathname);
    }
  }

  loadTheme();
  handleScroll();
  loadReviews();
  initCookieBanner();

})();

function initCookieBanner() {
  var stored = localStorage.getItem('aitoolsdash-cookies');
  if (stored) return;

  var lang = typeof LANG !== 'undefined' ? LANG : 'en';
  var texts = {
    en: {
      msg: 'We use cookies to improve your experience and analyze site traffic.',
      accept: 'Accept All', reject: 'Reject All', prefs: 'Preferences',
      link: 'Learn more', href: './privacy.html', title: 'Cookie Preferences',
      essential: 'Essential cookies', essentialDesc: 'Required for basic site functionality',
      analytics: 'Analytics cookies', analyticsDesc: 'Help us understand how visitors use our site',
      preferences: 'Preference cookies', preferencesDesc: 'Remember your settings (like dark/light mode)',
      save: 'Save Preferences', cancel: 'Cancel'
    },
    es: {
      msg: 'Usamos cookies para mejorar tu experiencia y analizar el tráfico del sitio.',
      accept: 'Aceptar Todas', reject: 'Rechazar Todas', prefs: 'Preferencias',
      link: 'Más información', href: './privacidad.html', title: 'Preferencias de Cookies',
      essential: 'Cookies esenciales', essentialDesc: 'Necesarias para el funcionamiento básico del sitio',
      analytics: 'Cookies analíticas', analyticsDesc: 'Nos ayudan a entender cómo los visitantes usan el sitio',
      preferences: 'Cookies de preferencias', preferencesDesc: 'Recuerdan tus ajustes (como modo oscuro/claro)',
      save: 'Guardar Preferencias', cancel: 'Cancelar'
    }
  };
  var t = texts[lang] || texts.en;

  var banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML = '<p>' + t.msg + ' <a href="' + t.href + '">' + t.link + '</a></p>'
    + '<div class="cookie-btns">'
    + '<button class="cookie-btn prefs" id="cookie-prefs">' + t.prefs + '</button>'
    + '<button class="cookie-btn reject" id="cookie-reject">' + t.reject + '</button>'
    + '<button class="cookie-btn accept" id="cookie-accept">' + t.accept + '</button>'
    + '</div>';

  document.body.appendChild(banner);
  setTimeout(function () { banner.classList.add('show'); }, 100);

  function saveAndDismiss(prefs) {
    localStorage.setItem('aitoolsdash-cookies', JSON.stringify(prefs));
    banner.classList.remove('show');
    setTimeout(function () { banner.remove(); }, 300);
  }

  document.getElementById('cookie-accept').addEventListener('click', function () {
    saveAndDismiss({ essential: true, analytics: true, preferences: true });
  });
  document.getElementById('cookie-reject').addEventListener('click', function () {
    saveAndDismiss({ essential: true, analytics: false, preferences: false });
  });
  document.getElementById('cookie-prefs').addEventListener('click', function () {
    showPrefsModal(t, saveAndDismiss);
  });
}

function showPrefsModal(t, saveAndDismiss) {
  var overlay = document.createElement('div');
  overlay.className = 'cookie-modal-overlay';
  overlay.innerHTML = '<div class="cookie-modal">'
    + '<h3>' + t.title + '</h3>'
    + '<div class="cookie-option"><div class="cookie-option-info"><strong>' + t.essential + '</strong><span>' + t.essentialDesc + '</span></div><label class="cookie-toggle disabled"><input type="checkbox" checked disabled><span class="slider"></span></label></div>'
    + '<div class="cookie-option"><div class="cookie-option-info"><strong>' + t.analytics + '</strong><span>' + t.analyticsDesc + '</span></div><label class="cookie-toggle"><input type="checkbox" id="ck-analytics" checked><span class="slider"></span></label></div>'
    + '<div class="cookie-option"><div class="cookie-option-info"><strong>' + t.preferences + '</strong><span>' + t.preferencesDesc + '</span></div><label class="cookie-toggle"><input type="checkbox" id="ck-preferences" checked><span class="slider"></span></label></div>'
    + '<div class="cookie-modal-btns">'
    + '<button class="cookie-modal-btn secondary" id="ck-cancel">' + t.cancel + '</button>'
    + '<button class="cookie-modal-btn primary" id="ck-save">' + t.save + '</button>'
    + '</div></div>';

  document.body.appendChild(overlay);
  setTimeout(function () { overlay.classList.add('active'); }, 10);

  document.getElementById('ck-cancel').addEventListener('click', function () {
    overlay.classList.remove('active');
    setTimeout(function () { overlay.remove(); }, 200);
  });
  document.getElementById('ck-save').addEventListener('click', function () {
    saveAndDismiss({ essential: true, analytics: document.getElementById('ck-analytics').checked, preferences: document.getElementById('ck-preferences').checked });
    overlay.classList.remove('active');
    setTimeout(function () { overlay.remove(); }, 200);
  });
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      setTimeout(function () { overlay.remove(); }, 200);
    }
  });
}
