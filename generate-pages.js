const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SITE = 'https://aitoolsdash.com';
const GA = 'G-8W5SPBB961';

const LANG_CONFIG = {
  en: {
    dir: 'en',
    dataFile: 'data/reviews-en.json',
    htmlLang: 'en',
    skipLink: 'Skip to main content',
    navReviews: 'Reviews',
    navComparisons: 'Comparisons',
    comparisonsFile: 'comparisons.html',
    home: './',
    heroTitleSuffix: 'Review',
    metaTitleSuffix: ' - AI Tools Dash',
    metaDescTemplate: (name) => `Honest review of ${name}. We tested its pros, cons, hidden trade-offs, free plan, and updated 2026 pricing. Read our verdict and compare top alternatives.`,
    titleTemplate: (name) => `${name} Review: Prices, Alternatives & Verdict (2026) - AI Tools Dash`,
    catTitle: 'Category',
    ratingTitle: 'Rating',
    priceTitle: 'Price',
    bestForTitle: 'Best For',
    featuresTitle: 'Key Features',
    pricingTitle: 'Pricing',
    prosTitle: 'Pros',
    consTitle: 'Cons',
    visitBtn: 'Visit Website',
    backToReviews: 'All AI Tool Reviews',
    relatedTitle: 'Related AI Tools',
    relatedCta: 'Read the full review',
    faqTitle: 'FAQ',
    breadcrumbHome: 'Home',
    breadcrumbHomeUrl: SITE + '/en/',
    ogTitle: (name) => `${name} Review: Prices, Alternatives & Verdict (2026) - AI Tools Dash`,
    ogDesc: (name) => `Honest review of ${name}. We tested its pros, cons, hidden trade-offs, free plan, and updated 2026 pricing. Read our verdict and compare top alternatives.`,
    copyright: '© 2026 AI Tools Dash. All rights reserved.',
    affiliateNote: 'Some links on this page are affiliate links. We may earn a commission at no extra cost to you.'
  },
  es: {
    dir: 'es',
    dataFile: 'data/reviews-es.json',
    htmlLang: 'es',
    skipLink: 'Saltar al contenido principal',
    navReviews: 'Reseñas',
    navComparisons: 'Comparativas',
    comparisonsFile: 'comparaciones.html',
    home: './',
    heroTitleSuffix: 'Reseña',
    metaTitleSuffix: ' - AI Tools Dash',
    metaDescTemplate: (name) => `Reseña honesta de ${name}. Probamos sus pros, contras ocultos, plan gratis y precios actualizados en 2026. Lee nuestro veredicto y compara las mejores alternativas.`,
    titleTemplate: (name) => `${name} Reseña: Precios, Alternativas y Veredicto (2026) - AI Tools Dash`,
    catTitle: 'Categoría',
    ratingTitle: 'Puntuación',
    priceTitle: 'Precio',
    bestForTitle: 'Ideal para',
    featuresTitle: 'Características',
    pricingTitle: 'Precios',
    prosTitle: 'Pros',
    consTitle: 'Contras',
    visitBtn: 'Visitar Sitio',
    backToReviews: 'Todas las reseñas de herramientas IA',
    relatedTitle: 'Herramientas IA Relacionadas',
    relatedCta: 'Leer la reseña completa',
    faqTitle: 'Preguntas Frecuentes',
    breadcrumbHome: 'Inicio',
    breadcrumbHomeUrl: SITE + '/es/',
    ogTitle: (name) => `${name} Reseña: Precios, Alternativas y Veredicto (2026) - AI Tools Dash`,
    ogDesc: (name) => `Reseña honesta de ${name}. Probamos sus pros, contras ocultos, plan gratis y precios actualizados en 2026. Lee nuestro veredicto y compara las mejores alternativas.`,
    copyright: '© 2026 AI Tools Dash. Todos los derechos reservados.',
    affiliateNote: 'Algunos enlaces en esta página son de afiliados. Podemos ganar una comisión sin costo adicional para ti.'
  }
};

const CATEGORIES = {
  en: {
    music: 'AI for Music', writing: 'AI Writing', images: 'AI Images',
    video: 'AI Video', productivity: 'AI Productivity', audio: 'AI Audio',
    coding: 'AI Coding', marketing: 'AI Marketing', assistant: 'AI Assistant'
  },
  es: {
    music: 'IA para Música', writing: 'Escritura IA', images: 'Imágenes IA',
    video: 'Video IA', productivity: 'Productividad IA', audio: 'Audio IA',
    coding: 'Programación IA', marketing: 'Marketing IA', assistant: 'Asistente IA'
  }
};

const CATEGORY_APPLICATION = {
  music: 'Multimedia', writing: 'BusinessApplication', images: 'GraphicsApplication',
  video: 'Multimedia', productivity: 'BusinessApplication', audio: 'Multimedia',
  coding: 'DeveloperApplication', marketing: 'BusinessApplication', assistant: 'BusinessApplication'
};

function extractPriceNumber(price) {
  if (!price) return null;
  const m = String(price).match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function stars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const body = '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  return '<span class="stars">' + body + '</span>';
}

function priceLabel(tool) {
  if (tool.price_type === 'free') return 'Free';
  if (tool.price_type === 'freemium') return 'Free / ' + tool.price;
  return tool.price;
}

function priceLabelEs(tool) {
  if (tool.price_type === 'free') return 'Gratis';
  if (tool.price_type === 'freemium') return 'Gratis / ' + tool.price;
  return tool.price;
}

function logoBlock(cfg, tool) {
  const domain = tool.logo || tool.id;
  return `<div class="review-hero-logo">
    <img src="../images/logos/${domain}.png" alt="${escapeAttr(tool.name)} logo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
    <span class="card-logo-fallback">${escapeHtml(tool.name.charAt(0).toUpperCase())}</span>
  </div>`;
}

function navHTML(cfg, lang, currentFile) {
  const file = currentFile || '';
  const enHref = file ? '../en/' + file : '../en/';
  const esHref = file ? '../es/' + file : '../es/';
  return `
  <a href="#main-content" class="skip-link">${cfg.skipLink}</a>

  <nav id="navbar">
    <div class="nav-inner">
      <a href="${cfg.home}" class="logo" aria-label="AI Tools Dash home"><svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:auto;display:block" role="img" aria-label="AI Tools Dash logo"><title>AI Tools Dash logo</title>
    <rect x="0" y="0" width="40" height="40" rx="8" fill="none" stroke="var(--accent)" stroke-width="1.5"/>
    <polygon points="20,1 37,18 20,35 3,18" fill="var(--accent)" opacity="0.95"/>
    <path d="M11 23 L17 10 L23 23" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <line x1="13.5" y1="18.5" x2="20.5" y2="18.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="27" y1="10" x2="27" y2="23" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
</svg><span class="site-name"><span class="site-name-ai">AI</span> <span class="site-name-rest">TOOLS DASH</span></span></a>
      <div class="nav-links">
        <a href="${cfg.home}">${cfg.navReviews}</a>
        <a href="./${cfg.comparisonsFile}">${cfg.navComparisons}</a>
      </div>
      <div class="nav-right">
        <div class="lang-switch">
          <a href="${enHref}"${lang === 'en' ? ' class="active" aria-current="page"' : ''}>EN</a>
          <a href="${esHref}"${lang === 'es' ? ' class="active" aria-current="page"' : ''}>ES</a>
        </div>
        <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme"></button>
      </div>
    </div>
  </nav>`;
}

function footerHTML(cfg, lang) {
  const catNames = CATEGORIES[lang];
  const cats = Object.keys(catNames).map(slug => `<a href="./?cat=${slug}" data-cat="${slug}">${catNames[slug]}</a>`).join('\n        ');
  const legalLinks = lang === 'en'
    ? `<a href="./privacy.html">Privacy Policy</a>\n          <a href="./terms.html">Terms of Service</a>\n          <a href="./affiliate.html">Affiliate Disclosure</a>`
    : `<a href="./privacidad.html">Política de Privacidad</a>\n          <a href="./terminos.html">Términos de Servicio</a>\n          <a href="./divulgacion.html">Divulgación de Afiliados</a>`;
  const aboutText = lang === 'en'
    ? 'Honest, in-depth reviews of the best AI tools. We help you find what actually works.'
    : 'Reseñas honestas y profundas de las mejores herramientas IA. Te ayudamos a encontrar lo que realmente funciona.';
  const powered = lang === 'en' ? 'Powered by honest opinions' : 'Impulsado por opiniones honestas';
  return `  <footer>
    <div class="footer-inner">
      <div class="footer-categories">
        ${cats}
      </div>
      <div class="footer-grid">
        <div class="footer-col">
          <h4>AI Tools Dash</h4>
          <p>${aboutText}</p>
        </div>
        <div class="footer-col">
          <h4>${lang === 'en' ? 'Legal' : 'Legal'}</h4>
          ${legalLinks}
        </div>
        <div class="footer-col">
          <h4>${lang === 'en' ? 'Content' : 'Contenido'}</h4>
          <a href="${cfg.home}">${cfg.navReviews}</a>
          <a href="./${cfg.comparisonsFile}">${cfg.navComparisons}</a>
        </div>
      </div>
      <div class="footer-affiliate">
        <span>${cfg.affiliateNote}</span>
      </div>
      <div class="footer-bottom">
        <span>${cfg.copyright}</span>
        <span>${powered}</span>
      </div>
    </div>
  </footer>`;
}

function gaHTML() {
  return `
<link rel="preconnect" href="https://www.googletagmanager.com">
<link rel="preconnect" href="https://www.google-analytics.com">
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA}');
</script>`;
}

function reviewJsonLd(cfg, tool) {
  const priceNum = extractPriceNumber(tool.price);
  const low = (tool.price_type === 'free' || tool.price_type === 'freemium') ? 0 : (priceNum || 0);
  const high = priceNum || 0;
  const catSlug = tool.category_slug;
  const appCategory = CATEGORY_APPLICATION[catSlug] || 'BusinessApplication';
  const url = tool.url || '';

  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    '@id': SITE + '/' + cfg.dir + '/' + tool.id + '.html#review',
    'name': cfg.titleTemplate(tool.name),
    'itemReviewed': {
      '@type': 'SoftwareApplication',
      '@id': SITE + '/' + cfg.dir + '/' + tool.id + '.html#software',
      'name': tool.name,
      'operatingSystem': 'All',
      'applicationCategory': appCategory,
      'url': url,
      'description': tool.excerpt,
      'offers': {
        '@type': 'AggregateOffer',
        'priceCurrency': 'USD',
        'lowPrice': String(low),
        'highPrice': String(high > 0 ? high : low)
      }
    },
    'reviewRating': {
      '@type': 'Rating',
      'ratingValue': String(tool.rating),
      'bestRating': '5'
    },
    'author': { '@type': 'Organization', 'name': 'AI Tools Dash', 'url': SITE + '/en/' },
    'publisher': { '@type': 'Organization', 'name': 'AI Tools Dash', 'logo': SITE + '/images/favicon.svg' },
    'datePublished': tool.date || '2026-01-01'
  };
}

function breadcrumbJsonLd(cfg, tool) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': cfg.breadcrumbHome, 'item': cfg.breadcrumbHomeUrl },
      { '@type': 'ListItem', 'position': 2, 'name': tool.name, 'item': SITE + '/' + cfg.dir + '/' + tool.id + '.html' }
    ]
  };
}

function relatedJsonLd(cfg, related) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Related AI Tools',
    'itemListElement': related.map((t, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'url': SITE + '/' + cfg.dir + '/' + t.id + '.html'
    }))
  };
}

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function lowerFirst(s) {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function pick(arr, seed) {
  return arr[seed % arr.length];
}

function humanFaqs(tool, lang) {
  const seed = hashStr(tool.id);
  const name = tool.name;
  const rating = tool.rating;
  const bestFor = tool.best_for || tool.excerpt;
  const priceTxt = lang === 'en' ? priceLabel(tool) : priceLabelEs(tool);
  const pricingNote = tool.pricing_note || priceTxt;
  const url = tool.url || '';
  const pros = tool.pros || [];
  const cons = tool.cons || [];
  const features = tool.features || [];

  if (lang === 'en') {
    const verdictQ = pick([
      `Is ${name} actually worth it?`,
      `Should you pay for ${name} in 2026?`,
      `We tested ${name} — is it any good?`,
      `Does ${name} live up to the hype?`,
      `Is ${name} a smart buy?`
    ], seed);
    const verdictA = pick([
      `Short answer: yes, for the right person. ${name} earned ${rating} out of 5 in our testing. It's at its best for ${lowerFirst(bestFor)} — if that matches your workflow, it's an easy recommendation.`,
      `Honestly? It depends on your use case. We gave ${name} ${rating}/5. It's excellent for ${lowerFirst(bestFor)}, but it's not the right tool for everyone.`,
      `For most people, yes. Our verdict is ${rating}/5 — ${name} is a strong pick for ${lowerFirst(bestFor)}, and the trade-offs are easy to live with if that's what you need.`,
      `We'd say so. ${name} scored ${rating}/5 in our review, and it's one of the more solid options we've tested in its category.`
    ], seed + 1);

    const bestQ = pick([
      `Who is ${name} for?`,
      `What kind of user gets the most out of ${name}?`,
      `Is ${name} right for you?`,
      `Where does ${name} fit best?`
    ], seed + 2);
    const bestA = pick([
      `${name} is aimed at ${lowerFirst(bestFor)}. If you recognise yourself in that description, you'll probably get real value out of it.`,
      `In our experience, ${name} works best for ${lowerFirst(bestFor)}. It's a specialist tool, not a generalist.`,
      `${bestFor} — that's the sweet spot. ${name} is designed for exactly that, and it shows in the day-to-day use.`
    ], seed + 3);

    const priceQ = pick([
      `How much does ${name} cost?`,
      `Is there a free tier for ${name}?`,
      `What should you budget for ${name}?`,
      `Is ${name} free or paid?`
    ], seed + 4);
    const priceA = pick([
      `${name} costs ${priceTxt}. ${pricingNote}`,
      `It's ${priceTxt} to get started. ${pricingNote}`,
      `Budget-wise, you're looking at ${priceTxt}. ${pricingNote}`
    ], seed + 5);

    const conQ = pick([
      `What are ${name}'s weak spots?`,
      `Where does ${name} fall short?`,
      `What should you watch out for with ${name}?`,
      `Any real downsides to ${name}?`
    ], seed + 6);
    const conA = cons.length
      ? pick([
          `It's not perfect. The biggest complaints we've seen (and agree with): ${lowerFirst(cons.slice(0, 2).join('; '))}.`,
          `The main things holding it back are ${lowerFirst(cons.slice(0, 2).join(' and '))}.`,
          `Our main gripes: ${lowerFirst(cons.slice(0, 2).join('; '))}. Nothing deal-breaking, but worth knowing before you commit.`
        ], seed + 7)
      : `For most users, not much. It's a well-rounded tool.`;

    const featQ = pick([
      `What does ${name} do best?`,
      `Which ${name} features actually matter?`,
      `Why did ${name} make our list?`,
      `What can ${name} do that others can't?`
    ], seed + 8);
    const featA = features.length
      ? pick([
          `The standouts for us: ${features.slice(0, 3).join('; ')}. That's why it earned its spot.`,
          `${name} really delivers on ${features.slice(0, 2).join(' and ')}. Those are the features we'd miss most if we had to switch.`,
          `Its edge comes from ${features.slice(0, 3).join('; ')}.`
        ], seed + 9)
      : `It's consistent where it matters most for its niche.`;

    const trialQ = pick([
      `Can you try ${name} before buying?`,
      `How do I get started with ${name}?`,
      `Where can I try ${name}?`
    ], seed + 10);
    const trialA = url
      ? pick([
          `Yes — head to ${url} and you can sign up and start testing it yourself. That's the best way to judge it.`,
          `You can start right away at ${url}. We always suggest trying it before committing.`,
          `Just go to ${url}. It's the fastest way to see if ${name} fits what you need.`
        ], seed + 11)
      : `You can usually start with a free trial and see how it feels.`;

    return [
      { q: verdictQ, a: verdictA },
      { q: bestQ, a: bestA },
      { q: priceQ, a: priceA },
      { q: conQ, a: conA },
      { q: featQ, a: featA },
      { q: trialQ, a: trialA }
    ];
  }

  const verdictQ = pick([
    `¿Vale la pena ${name}?`,
    `¿Deberías pagar por ${name} en 2026?`,
    `Probamos ${name} — ¿es bueno de verdad?`,
    `¿${name} cumple lo que promete?`,
    `¿Es ${name} una buena compra?`
  ], seed);
  const verdictA = pick([
    `Respuesta corta: sí, para la persona adecuada. ${name} obtuvo ${rating} sobre 5 en nuestras pruebas. Está en su mejor momento para ${lowerFirst(bestFor)} — si eso encaja con tu flujo de trabajo, es una recomendación fácil.`,
    `Si te soy honesto: depende de tu caso. Le dimos a ${name} un ${rating}/5. Es excelente para ${lowerFirst(bestFor)}, pero no es la herramienta para todos.`,
    `Para la mayoría de la gente, sí. Nuestro veredicto es ${rating}/5 — ${name} es una gran opción para ${lowerFirst(bestFor)} y los contras se llevan bien si es lo que necesitas.`,
    `Nosotros diríamos que sí. ${name} sacó ${rating}/5 en nuestra reseña y es una de las opciones más sólidas de su categoría.`
  ], seed + 1);

  const bestQ = pick([
    `¿Para quién es ${name}?`,
    `¿Qué tipo de usuario saca más partido a ${name}?`,
    `¿Es ${name} para ti?`,
    `¿Dónde encaja mejor ${name}?`
  ], seed + 2);
  const bestA = pick([
    `${name} está pensada para ${bestFor}. Si te reconoces en esa descripción, seguro que le sacas valor real.`,
    `En nuestra experiencia, ${name} funciona mejor para ${lowerFirst(bestFor)}. Es una herramienta especializada, no una todoterreno.`,
    `${bestFor} — ese es su punto dulce. ${name} está diseñada justo para eso y se nota en el uso diario.`
  ], seed + 3);

  const priceQ = pick([
    `¿Cuánto cuesta ${name}?`,
    `¿${name} tiene versión gratis?`,
    `¿Cuánto deberías presupuestar para ${name}?`,
    `¿Es ${name} gratis o de pago?`
  ], seed + 4);
  const priceA = pick([
    `${name} cuesta ${priceTxt}. ${pricingNote}`,
    `Cuesta ${priceTxt} para empezar. ${pricingNote}`,
    `En cuanto a presupuesto, estás mirando ${priceTxt}. ${pricingNote}`
  ], seed + 5);

  const conQ = pick([
    `¿Cuáles son los puntos débiles de ${name}?`,
    `¿Dónde flojea ${name}?`,
    `¿Con qué hay que tener cuidado en ${name}?`,
    `¿Tiene ${name} desventajas reales?`
  ], seed + 6);
  const conA = cons.length
    ? pick([
        `No es perfecta. Las quejas más habituales que hemos visto (y compartimos): ${lowerFirst(cons.slice(0, 2).join('; '))}.`,
        `Lo que más la frena es ${lowerFirst(cons.slice(0, 2).join(' y '))}.`,
        `Nuestras principales pegas: ${lowerFirst(cons.slice(0, 2).join('; '))}. Nada que te eche para atrás, pero conviene saberlo antes de comprometerte.`
      ], seed + 7)
    : `Para la mayoría de usuarios, poco. Es una herramienta muy completa.`;

  const featQ = pick([
    `¿Qué hace ${name} mejor?`,
    `¿Qué funciones de ${name} importan de verdad?`,
    `¿Por qué ${name} está en nuestra lista?`,
    `¿Qué puede hacer ${name} que otras no?`
  ], seed + 8);
  const featA = features.length
    ? pick([
        `Lo que más nos destaca: ${features.slice(0, 3).join('; ')}. Por eso se ganó su hueco.`,
        `${name} cumple de verdad en ${features.slice(0, 2).join(' y ')}. Son las funciones que más echaríamos de menos si tuviéramos que cambiarnos.`,
        `Su ventaja viene de ${features.slice(0, 3).join('; ')}.`
      ], seed + 9)
    : `Es constante donde más importa para su nicho.`;

  const trialQ = pick([
    `¿Puedes probar ${name} antes de comprarla?`,
    `¿Cómo empiezo con ${name}?`,
    `¿Dónde puedo probar ${name}?`
  ], seed + 10);
  const trialA = url
    ? pick([
        `Sí — entra en ${url} y puedes registrarte y probarla tú mismo. Es la mejor forma de juzgarla.`,
        `Puedes empezar ahora mismo en ${url}. Siempre recomendamos probarla antes de comprometerte.`,
        `Solo ve a ${url}. Es la forma más rápida de ver si ${name} encaja con lo que necesitas.`
      ], seed + 11)
    : `Normalmente puedes empezar con una prueba gratis y ver qué tal se siente.`;

  return [
    { q: verdictQ, a: verdictA },
    { q: bestQ, a: bestA },
    { q: priceQ, a: priceA },
    { q: conQ, a: conA },
    { q: featQ, a: featA },
    { q: trialQ, a: trialA }
  ];
}

function faqJsonLd(cfg, tool, lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': humanFaqs(tool, lang).map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': { '@type': 'Answer', 'text': f.a }
    }))
  };
}

function faqHTML(cfg, tool, lang) {
  return humanFaqs(tool, lang).map(f => `
        <div class="faq-item">
          <h3>${escapeHtml(f.q)}</h3>
          <p>${escapeHtml(f.a)}</p>
        </div>`).join('');
}

function relatedHTML(cfg, lang, related) {
  if (!related || related.length === 0) return '';
  const items = related.map(t => `
        <a class="related-card" href="${t.id}.html">
          <span class="related-name">${escapeHtml(t.name)}</span>
          <span class="related-rating">${stars(t.rating)} <span class="rating-num">${t.rating}</span></span>
          <span class="related-price">${escapeHtml(lang === 'en' ? priceLabel(t) : priceLabelEs(t))}</span>
          <span class="related-cta">${cfg.relatedCta}</span>
        </a>`).join('');
  return `
      <div class="related-section">
        <h3>${cfg.relatedTitle}</h3>
        <div class="related-grid">${items}
        </div>
      </div>`;
}

function comparisonLink(cfg, lang, tool, allReviews) {
  const same = allReviews.filter(r => r.category_slug === tool.category_slug);
  if (same.length < 2) return '';
  const top = same.slice().sort((a, b) => b.rating - a.rating).slice(0, 2);
  if (!top.some(t => t.id === tool.id)) return '';
  const rival = top[0].id === tool.id ? top[1] : top[0];
  const file = top[0].id + '-vs-' + top[1].id + '.html';
  const label = lang === 'en'
    ? `Compare ${tool.name} vs ${rival.name}`
    : `Comparar ${tool.name} vs ${rival.name}`;
  return `
      <p class="review-compare"><a href="./${file}">${escapeHtml(label)}</a></p>`;
}

function buildPage(cfg, lang, tool, allReviews) {
  const related = allReviews
    .filter(r => r.id !== tool.id && r.category_slug === tool.category_slug)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  const title = cfg.titleTemplate(tool.name);
  const metaDesc = cfg.metaDescTemplate(tool.name);
  const pageUrl = SITE + '/' + cfg.dir + '/' + tool.id + '.html';
  const otherLang = lang === 'en' ? 'es' : 'en';
  const otherUrl = SITE + '/' + otherLang + '/' + tool.id + '.html';
  const catName = (CATEGORIES[lang][tool.category_slug] || tool.category);
  const priceTxt = lang === 'en' ? priceLabel(tool) : priceLabelEs(tool);
  const proItems = tool.pros.map(p => `<li>✓ ${escapeHtml(p)}</li>`).join('');
  const conItems = tool.cons.map(c => `<li>✗ ${escapeHtml(c)}</li>`).join('');
  const featItems = tool.features.map(f => `<li>${escapeHtml(f)}</li>`).join('');

  const jsonLd = [
    JSON.stringify(reviewJsonLd(cfg, tool)),
    JSON.stringify(faqJsonLd(cfg, tool, lang)),
    JSON.stringify(breadcrumbJsonLd(cfg, tool)),
    JSON.stringify(relatedJsonLd(cfg, related))
  ].map(j => `<script type="application/ld+json">\n${j}\n</script>`).join('\n');

  return `<!DOCTYPE html>
<html lang="${cfg.htmlLang}" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeAttr(metaDesc)}">
<meta property="og:title" content="${escapeAttr(cfg.ogTitle(tool.name))}">
<meta property="og:description" content="${escapeAttr(cfg.ogDesc(tool.name))}">
<meta property="og:url" content="${pageUrl}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="AI Tools Dash">
<meta property="og:image" content="${SITE}/images/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="AI Tools Dash — Honest AI Tool Reviews">
<meta property="og:locale" content="${lang === 'en' ? 'en_US' : 'es_ES'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(cfg.ogTitle(tool.name))}">
<meta name="twitter:description" content="${escapeAttr(cfg.ogDesc(tool.name))}">
<meta name="twitter:image" content="${SITE}/images/og-image.png">
<link rel="canonical" href="${pageUrl}">
<link rel="alternate" hreflang="${lang}" href="${pageUrl}">
<link rel="alternate" hreflang="${otherLang}" href="${otherUrl}">
<link rel="alternate" hreflang="x-default" href="${SITE}/">
<link rel="icon" type="image/svg+xml" href="${SITE}/images/favicon.svg">
${jsonLd}
<meta name="google-site-verification" content="Si_Ceu5QRKmhHRTO6JQ010iuFupr9OLKkld617MIxUE">
<meta name="msvalidate.01" content="B2D1C1A5E8F9C3D7E4F5A6B7C8D9E0F1">
<meta name="author" content="AI Tools Dash">
<meta name="referrer" content="no-referrer-when-downgrade">
<meta name="theme-color" content="#09090b" media="(prefers-color-scheme:dark)">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme:light)">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
<meta name="format-detection" content="telephone=no">
${gaHTML()}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/style.css?v=20260807">
<style>
.review-article { max-width: 760px; margin: 0 auto; }
#hero.hero-short { min-height: auto; padding: 90px 5vw 20px; }
@media (max-width: 768px) { #hero.hero-short { padding: 90px 5vw 20px; } }
@media (max-width: 480px) { #hero.hero-short { padding: 84px 4vw 16px; } }
@media (max-width: 360px) { #hero.hero-short { padding: 80px 3vw 16px; } }
.hero-short .hero-content h1 { margin-bottom: 8px; }
.hero-short .hero-content > p { margin-bottom: 0; }
.section { padding: 32px 5vw 60px; }
.hero-breadcrumb { color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 12px; }
.hero-breadcrumb a { color: var(--accent); text-decoration: none; }
.review-hero-logo { display: flex; justify-content: center; margin: 0 0 24px; }
.review-hero-logo img { width: 88px; height: 88px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg-card); object-fit: cover; }
.review-hero-meta { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin: 0 0 28px; }
.review-meta-row { display: flex; gap: 8px; align-items: center; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 16px; font-size: 0.85rem; }
.review-meta-row .meta-label { color: var(--text-muted); }
.review-meta-row .meta-value { color: var(--text); font-weight: 600; }
.stars { color: #fbbf24; }
.related-rating .stars { color: #fbbf24; }
.rating-num { color: var(--text); }
.related-rating .rating-num { color: var(--text); }
.card-logo-fallback { display: none; width: 88px; height: 88px; align-items: center; justify-content: center; font-size: 1.6rem; font-weight: 700; color: var(--accent); background: linear-gradient(135deg, var(--bg-card-hover), var(--bg-card)); border-radius: 20px; border: 1px solid var(--border); }
.review-article .modal-btn { display: block; text-align: center; margin: 0 auto 40px; max-width: 320px; }
.review-section { margin: 40px 0; }
.review-section h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 16px; position: relative; display: inline-block; }
.review-section h2::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 40px; height: 3px; background: linear-gradient(90deg, var(--accent), transparent); border-radius: 2px; }
.review-section p { color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; }
.review-list { color: var(--text-secondary); line-height: 1.7; padding-left: 20px; }
.review-list li { margin-bottom: 8px; }
.review-section .pros-cons { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.review-section .pros-cons h2 { font-size: 1.15rem; }
.review-section .pros-cons ul { margin: 0; }
.review-section .pros, .review-section .cons { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08); padding: 14px 16px; border-radius: var(--radius-md); font-size: 0.82rem; }
.related-section { margin-top: 48px; padding-top: 32px; border-top: 1px solid var(--border); }
.related-section h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 20px; }
.related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
.related-card { display: flex; flex-direction: column; gap: 6px; padding: 18px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); text-decoration: none; color: var(--text); transition: all var(--transition); }
.related-card:hover { border-color: var(--accent); transform: translateY(-2px); }
.related-name { font-weight: 600; }
.related-rating { color: var(--accent); font-size: 0.8rem; }
.related-price { color: var(--text-muted); font-size: 0.8rem; }
.related-cta { color: var(--accent); font-size: 0.8rem; margin-top: 4px; }
.review-back { margin-top: 40px; text-align: center; }
.review-back a { display: inline-block; color: var(--accent); text-decoration: none; font-size: 1.05rem; font-weight: 600; padding: 12px 24px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-card); transition: all var(--transition); }
.review-back a:hover { border-color: var(--accent); transform: translateY(-2px); }
.review-compare { margin: 0 auto 40px; text-align: center; max-width: 320px; }
.review-compare a { display: inline-block; color: var(--accent); text-decoration: none; font-size: 0.95rem; font-weight: 600; padding: 11px 22px; border: 1px dashed var(--accent); border-radius: var(--radius-md); background: transparent; transition: all var(--transition); }
.review-compare a:hover { border-color: var(--accent); border-style: solid; background: rgba(0,0,0,0.2); transform: translateY(-2px); }
.faq-item { margin-bottom: 20px; }
.faq-item h3 { font-size: 1.05rem; font-weight: 600; margin-bottom: 6px; color: var(--text); }
.faq-item p { color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; }
@media (max-width: 768px) {
  .review-section .pros-cons { grid-template-columns: 1fr; }
  .review-meta-row { font-size: 0.78rem; padding: 6px 12px; }
}
</style>
</head>
<body>

${navHTML(cfg, lang, tool.id + '.html')}

  <div class="page-bg" aria-hidden="true"></div>
  <main id="main-content">
  <section id="hero" class="hero-short">
    <div class="hero-content">
      <p class="hero-breadcrumb"><a href="${cfg.home}">${cfg.breadcrumbHome}</a> › ${escapeHtml(catName)}</p>
      <h1>${escapeHtml(tool.name)} <span>${cfg.heroTitleSuffix}</span></h1>
      <p>${escapeHtml(tool.tagline)}</p>
    </div>
  </section>

  <section class="section">
    <div class="review-article">
      ${logoBlock(cfg, tool)}
      <div class="review-hero-meta">
        <div class="review-meta-row"><span class="meta-label">${cfg.catTitle}</span><span class="meta-value">${escapeHtml(catName)}</span></div>
        <div class="review-meta-row"><span class="meta-label">${cfg.ratingTitle}</span><span class="meta-value">${stars(tool.rating)} <span class="rating-num">${tool.rating}/5</span></span></div>
        <div class="review-meta-row"><span class="meta-label">${cfg.priceTitle}</span><span class="meta-value">${escapeHtml(priceTxt)}</span></div>
      </div>

      <a href="${escapeAttr(tool.url)}" class="modal-btn" target="_blank" rel="nofollow noopener noreferrer">${cfg.visitBtn}</a>

      ${comparisonLink(cfg, lang, tool, allReviews)}

      <div class="review-section">
        <h2>${escapeHtml(tool.name)} ${cfg.heroTitleSuffix}</h2>
        <p>${escapeHtml(tool.description || tool.excerpt)}</p>
      </div>

      ${tool.best_for ? `<div class="review-section"><h2>${cfg.bestForTitle}</h2><p>${escapeHtml(tool.best_for)}</p></div>` : ''}

      <div class="review-section">
        <h2>${cfg.featuresTitle}</h2>
        <ul class="review-list">${featItems}</ul>
      </div>

      <div class="review-section">
        <h2>${cfg.pricingTitle}</h2>
        <p>${escapeHtml(tool.pricing_note || priceTxt)}</p>
      </div>

      <div class="review-section">
        <div class="pros-cons">
          <div>
            <h2>${cfg.prosTitle}</h2>
            <ul class="pros">${proItems}</ul>
          </div>
          <div>
            <h2>${cfg.consTitle}</h2>
            <ul class="cons">${conItems}</ul>
          </div>
        </div>
      </div>

      <div class="review-section faq-section">
        <h2>${cfg.faqTitle}</h2>
        ${faqHTML(cfg, tool, lang)}
      </div>

      <a href="${escapeAttr(tool.url)}" class="modal-btn" target="_blank" rel="nofollow noopener noreferrer">${cfg.visitBtn} ${escapeHtml(tool.name)}</a>

      ${relatedHTML(cfg, lang, related)}

      <p class="review-back"><a href="${cfg.home}">${cfg.backToReviews}</a></p>
    </div>
  </section>

  </main>
${footerHTML(cfg, lang)}

  <button class="scroll-top" id="scrollTop" aria-label="Scroll to top">↑</button>

  <script>
  var LANG = '${lang}';
  </script>
  <script>
  (function(){
    var saved = localStorage.getItem('ai-reviews-theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
      var t = document.getElementById('themeToggle');
      if (t) t.textContent = saved === 'dark' ? '🌙' : '☀️';
    } else {
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      var tb = document.getElementById('themeToggle');
      if (tb) tb.textContent = prefersDark ? '🌙' : '☀️';
    }
    var toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', function(){
        var cur = document.documentElement.getAttribute('data-theme');
        var next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        this.textContent = next === 'dark' ? '🌙' : '☀️';
        localStorage.setItem('ai-reviews-theme', next);
      });
    }
  })();
  </script>
</body>
</html>`;
}

function main() {
  Object.keys(LANG_CONFIG).forEach(lang => {
    const cfg = LANG_CONFIG[lang];
    const data = JSON.parse(fs.readFileSync(path.join(ROOT, cfg.dataFile), 'utf8'));
    const outDir = path.join(ROOT, cfg.dir);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    data.forEach(tool => {
      const html = buildPage(cfg, lang, tool, data);
      fs.writeFileSync(path.join(outDir, tool.id + '.html'), html, 'utf8');
    });
    console.log(`${lang}: generated ${data.length} pages`);
  });
}

main();
