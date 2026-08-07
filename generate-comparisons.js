const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SITE = 'https://aitoolsdash.com';
const GA = 'G-8W5SPBB961';

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

const LANG = {
  en: {
    dir: 'en', htmlLang: 'en',
    navReviews: 'Reviews', navComparisons: 'Comparisons',
    skipLink: 'Skip to main content',
    heroSuffix: 'Which is Better?',
    comparisonsHub: 'All AI Tool Comparisons',
    hubTitle: 'Compare any two AI tools: ratings, pricing, pros and cons, verdicts and real user feedback.',
    readReview: 'Read the full review',
    verdict: 'Verdict',
    winner: 'Winner',
    visit: 'Visit',
    category: 'Category', rating: 'Rating', price: 'Price',
    proLabel: 'Pros', conLabel: 'Cons',
    faqTitle: 'Frequently Asked Questions',
    relatedTitle: 'Compare More AI Tools',
    backToHub: 'Back to all comparisons',
    breadcrumbHome: 'Home',
    breadcrumbHomeUrl: SITE + '/en/',
    copyright: '© 2026 AI Tools Dash. All rights reserved.',
    affiliateNote: 'Some links on this page are affiliate links. We may earn a commission at no extra cost to you.',
    intro: (a, b, catName, winnerName) => `Choosing between ${a} and ${b} in 2026? We compared both ${catName} tools head-to-head: ratings, pricing, pros and cons, and real user feedback. In short, ${winnerName} is our pick for most people — but the right choice depends on what you need. Keep reading for the full ${a} vs ${b} breakdown.`,
    metaDesc: (a, b) => `We compared ${a} and ${b} side-by-side in 2026: rating, pricing, pros, cons and real user feedback. See which AI tool wins for your use case.`,
    title: (a, b) => `${a} vs ${b} (2026): Which is Better? - AI Tools Dash`
  },
  es: {
    dir: 'es', htmlLang: 'es',
    navReviews: 'Reseñas', navComparisons: 'Comparativas',
    skipLink: 'Saltar al contenido principal',
    heroSuffix: '¿Cuál es mejor?',
    comparisonsHub: 'Todas las comparativas de herramientas IA',
    hubTitle: 'Compara dos herramientas IA: puntuaciones, precios, pros y contras, veredictos y opiniones reales de usuarios.',
    readReview: 'Leer la reseña completa',
    verdict: 'Veredicto',
    winner: 'Ganador',
    visit: 'Visitar',
    category: 'Categoría', rating: 'Puntuación', price: 'Precio',
    proLabel: 'Pros', conLabel: 'Contras',
    faqTitle: 'Preguntas Frecuentes',
    relatedTitle: 'Comparar Más Herramientas IA',
    backToHub: 'Volver a todas las comparativas',
    breadcrumbHome: 'Inicio',
    breadcrumbHomeUrl: SITE + '/es/',
    copyright: '© 2026 AI Tools Dash. Todos los derechos reservados.',
    affiliateNote: 'Algunos enlaces en esta página son de afiliados. Podemos ganar una comisión sin costo adicional para ti.',
    intro: (a, b, catName, winnerName) => `¿Eligiendo entre ${a} y ${b} en 2026? Comparamos ambas herramientas de ${catName} cara a cara: puntuaciones, precios, pros y contras, y opiniones reales de usuarios. En resumen, ${winnerName} es nuestra elección para la mayoría — pero la opción correcta depende de lo que necesites. Sigue leyendo para el análisis completo de ${a} vs ${b}.`,
    metaDesc: (a, b) => `Comparamos ${a} y ${b} cara a cara en 2026: puntuación, precios, pros, contras y opiniones reales de usuarios. Descubre cuál gana para tu caso de uso.`,
    title: (a, b) => `${a} vs ${b} (2026): ¿Cuál es mejor? - AI Tools Dash`
  }
};

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
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function priceLabel(tool, lang) {
  if (tool.price_type === 'free') return lang === 'en' ? 'Free' : 'Gratis';
  if (tool.price_type === 'freemium') return (lang === 'en' ? 'Free / ' : 'Gratis / ') + tool.price;
  return tool.price;
}

function priceTypeLabel(tool, lang) {
  if (tool.price_type === 'free') return lang === 'en' ? 'Free' : 'Gratuito';
  if (tool.price_type === 'freemium') return 'Freemium';
  return lang === 'en' ? 'Paid' : 'Pago';
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

function navHTML(cfg, lang, file) {
  const enHref = '../en/' + file;
  const esHref = '../es/' + file;
  return `
  <a href="#main-content" class="skip-link">${cfg.skipLink}</a>

  <nav id="navbar">
    <div class="nav-inner">
      <a href="../${lang === 'en' ? '' : 'es/'}" class="logo" aria-label="AI Tools Dash home"><svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:auto;display:block" role="img">
    <rect x="0" y="0" width="40" height="40" rx="8" fill="none" stroke="var(--accent)" stroke-width="1.5"/>
    <polygon points="20,1 37,18 20,35 3,18" fill="var(--accent)" opacity="0.95"/>
    <path d="M11 23 L17 10 L23 23" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <line x1="13.5" y1="18.5" x2="20.5" y2="18.5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="27" y1="10" x2="27" y2="23" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
</svg><span class="site-name"><span class="site-name-ai">AI</span> <span class="site-name-rest">TOOLS DASH</span></span></a>
      <div class="nav-links">
        <a href="../${lang === 'en' ? '' : 'es/'}">${cfg.navReviews}</a>
        <a href="./${lang === 'en' ? 'comparisons.html' : 'comparaciones.html'}">${cfg.navComparisons}</a>
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
  const cats = Object.keys(catNames).map(slug => `<a href="../${lang === 'en' ? '' : 'es/'}?cat=${slug}" data-cat="${slug}">${catNames[slug]}</a>`).join('\n        ');
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
          <a href="../${lang === 'en' ? '' : 'es/'}">${cfg.navReviews}</a>
          <a href="./${lang === 'en' ? 'comparisons.html' : 'comparaciones.html'}">${cfg.navComparisons}</a>
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

function verdictReason(a, b, lang) {
  const winner = a.rating > b.rating ? a : (b.rating > a.rating ? b : (a.pros.length >= b.pros.length ? a : b));
  const loser = winner.id === a.id ? b : a;
  let reason;
  if (lang === 'en') {
    if (a.rating !== b.rating) {
      reason = winner.name + ' takes the win thanks to a higher overall rating of ' + winner.rating + '/5 compared to ' + loser.rating + '/5 for ' + loser.name + '. ';
      reason += 'Users consistently highlight ' + (winner.pros[0] ? lowerFirst(winner.pros[0]) : 'its quality') + ' and ' + (winner.pros[1] ? lowerFirst(winner.pros[1]) : 'its features') + ' as key differentiators. ';
      reason += (loser.cons[0] ? 'On the other hand, ' + loser.name + ' falls short with ' + lowerFirst(loser.cons[0]) + ', which limits its appeal for certain use cases. ' : 'Meanwhile, ' + loser.name + ', while solid, lacks the same level of polish and user satisfaction. ');
      reason += 'If you value top-rated performance and proven results, ' + winner.name + ' is the clear choice.';
    } else if (a.pros.length !== b.pros.length) {
      reason = winner.name + ' edges out ' + loser.name + ' with a more impressive list of strengths (' + winner.pros.length + ' vs ' + loser.pros.length + '). ';
      reason += 'Its standout advantages include ' + (winner.pros[0] ? lowerFirst(winner.pros[0]) : 'strong features') + ', ' + (winner.pros[1] ? lowerFirst(winner.pros[1]) : 'reliable performance') + ', and ' + (winner.pros[2] ? lowerFirst(winner.pros[2]) : 'great value') + '. ';
      reason += (loser.cons[0] ? loser.name + ' users often mention ' + lowerFirst(loser.cons[0]) + ' as a drawback, which gives ' + winner.name + ' the upper hand. ' : '');
      reason += 'For most users, ' + winner.name + ' delivers a more complete and satisfying experience.';
    } else {
      reason = 'Both tools are exceptionally well matched and it was a tough call. ';
      reason += winner.name + ' edges ahead thanks to ' + (winner.pros[0] ? lowerFirst(winner.pros[0]) : 'its overall strengths') + ', giving it a slight advantage in overall value. ';
      reason += 'Whichever you choose, both are excellent options in this category.';
    }
  } else {
    if (a.rating !== b.rating) {
      reason = winner.name + ' se lleva la victoria gracias a una puntuación más alta de ' + winner.rating + '/5 frente a ' + loser.rating + '/5 de ' + loser.name + '. ';
      reason += 'Los usuarios destacan constantemente ' + (winner.pros[0] ? lowerFirst(winner.pros[0]) : 'su calidad') + ' y ' + (winner.pros[1] ? lowerFirst(winner.pros[1]) : 'sus funciones') + ' como factores diferenciadores. ';
      reason += (loser.cons[0] ? 'Por otro lado, ' + loser.name + ' se queda atrás con ' + lowerFirst(loser.cons[0]) + ', lo que limita su atractivo en ciertos casos de uso. ' : 'Mientras tanto, ' + loser.name + ', aunque sólida, carece del mismo nivel de refinamiento. ');
      reason += 'Si valoras el rendimiento mejor valorado y los resultados probados, ' + winner.name + ' es la opción clara.';
    } else if (a.pros.length !== b.pros.length) {
      reason = winner.name + ' supera a ' + loser.name + ' con una lista más impresionante de fortalezas (' + winner.pros.length + ' frente a ' + loser.pros.length + '). ';
      reason += 'Sus ventajas principales incluyen ' + (winner.pros[0] ? lowerFirst(winner.pros[0]) : 'funciones potentes') + ', ' + (winner.pros[1] ? lowerFirst(winner.pros[1]) : 'rendimiento confiable') + ' y ' + (winner.pros[2] ? lowerFirst(winner.pros[2]) : 'gran valor') + '. ';
      reason += (loser.cons[0] ? 'Los usuarios de ' + loser.name + ' suelen mencionar ' + lowerFirst(loser.cons[0]) + ' como una desventaja, lo que da ventaja a ' + winner.name + '. ' : '');
      reason += 'Para la mayoría de los usuarios, ' + winner.name + ' ofrece una experiencia más completa y satisfactoria.';
    } else {
      reason = 'Ambas herramientas están excepcionalmente igualadas y fue una decisión difícil. ';
      reason += winner.name + ' se impone gracias a ' + (winner.pros[0] ? lowerFirst(winner.pros[0]) : 'sus fortalezas generales') + ', dándole una ligera ventaja en valor global. ';
      reason += 'Cualquiera que elijas, ambas son opciones excelentes en esta categoría.';
    }
  }
  return { winner, loser, reason };
}

function extractPriceNumber(price) {
  if (!price) return null;
  const m = String(price).match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

function faqs(a, b, winner, lang) {
  const w = winner;
  const l = winner.id === a.id ? b : a;
  const aPrice = priceLabel(a, lang);
  const bPrice = priceLabel(b, lang);
  const aNum = extractPriceNumber(a.price);
  const bNum = extractPriceNumber(b.price);
  const aBest = a.best_for || a.excerpt || a.tagline;
  const bBest = b.best_for || b.excerpt || b.tagline;
  const aFeat = (a.features || []).slice(0, 3);
  const bFeat = (b.features || []).slice(0, 3);
  const aCons = (a.cons || []).slice(0, 2);
  const bCons = (b.cons || []).slice(0, 2);

  let cheapestName = null;
  if (aNum !== null && bNum !== null && aNum !== bNum) {
    cheapestName = aNum < bNum ? a.name : b.name;
  }

  const hasFreeA = a.price_type === 'free' || a.price_type === 'freemium';
  const hasFreeB = b.price_type === 'free' || b.price_type === 'freemium';
  const anyFree = hasFreeA || hasFreeB;
  const bothFree = hasFreeA && hasFreeB;

  if (lang === 'en') {
    const priceA = cheapestName === null
      ? `Both start at ${aPrice}, so there's no real price difference.`
      : `${cheapestName} is the cheaper option on paper.`;
    const freeNote = bothFree
      ? ' Both have free tiers, so you can try each before paying.'
      : (anyFree ? (hasFreeA ? ` ${a.name} has a free tier, so you can try it before paying.` : ` ${b.name} has a free tier, so you can try it before paying.`) : '');
    const paidQ = anyFree
      ? `Start with the free tiers to test both, then upgrade when you hit a real wall.`
      : `Neither offers a free tier, so factor the subscription into your decision before you commit.`;
    return [
      { q: `Which is better, ${a.name} or ${b.name}?`, a: `In our testing, ${w.name} edges out ${l.name} with a ${w.rating}/5 rating compared to ${l.rating}/5. That said, if you care most about ${lowerFirst(bBest)}, ${l.name} may actually be the smarter pick for you.` },
      { q: `Is ${a.name} or ${b.name} cheaper?`, a: `It depends on the plan. ${a.name} starts at ${aPrice} and ${b.name} starts at ${bPrice}. ${priceA}${freeNote}` },
      { q: `What are the main differences between ${a.name} and ${b.name}?`, a: `The big differences come down to focus. ${a.name} is built for ${lowerFirst(aBest)}, and its standout feature is ${lowerFirst(aFeat[0] || 'its core functionality')}. ${b.name} targets ${lowerFirst(bBest)}, with ${lowerFirst(bFeat[0] || 'its core functionality')} as the highlight. Pick the one whose focus matches your workflow.` },
      { q: `Can you use ${a.name} and ${b.name} together?`, a: `Absolutely — a lot of teams pair them. Use ${a.name} when you need ${lowerFirst(aBest)}, and ${b.name} when you're working on ${lowerFirst(bBest)}. They overlap in places, but they handle different jobs well.` },
      { q: `What do users complain about with ${a.name} and ${b.name}?`, a: `${a.name} users most often mention ${lowerFirst(aCons[0] || 'a learning curve')}${aCons[1] ? ' and ' + lowerFirst(aCons[1]) : ''}. For ${b.name}, the recurring complaints are ${lowerFirst(bCons[0] || 'the learning curve')}${bCons[1] ? ' and ' + lowerFirst(bCons[1]) : ''}. Neither is a deal-breaker, but worth knowing before you commit.` },
      { q: `Do I need a paid plan for ${a.name} or ${b.name}?`, a: `It depends on how serious you are. ${a.name} is ${aPrice} to get started, and ${b.name} is ${bPrice}. ${paidQ}` }
    ];
  }

  const priceA = cheapestName === null
    ? `Ambas parten de ${aPrice}, así que no hay diferencia real de precio.`
    : `${cheapestName} es más barata sobre el papel.`;
  const freeNote = bothFree
    ? ' Ambas tienen planes gratis, así que puedes probarlas antes de pagar.'
    : (anyFree ? (hasFreeA ? ` ${a.name} tiene plan gratis, así que puedes probarla antes de pagar.` : ` ${b.name} tiene plan gratis, así que puedes probarla antes de pagar.`) : '');
  const paidQ = anyFree
    ? `Empieza con los planes gratis para probar ambas y mejora cuando topes con un límite real.`
    : `Ninguna ofrece plan gratis, así que ten en cuenta la suscripción en tu decisión antes de comprometerte.`;
  return [
    { q: `¿Cuál es mejor, ${a.name} o ${b.name}?`, a: `En nuestras pruebas, ${w.name} supera a ${l.name} con ${w.rating}/5 frente a ${l.rating}/5. Dicho esto, si lo que más te importa es ${lowerFirst(bBest)}, ${l.name} puede ser la opción más inteligente para ti.` },
    { q: `¿Es más barata ${a.name} o ${b.name}?`, a: `Depende del plan. ${a.name} parte de ${aPrice} y ${b.name} parte de ${bPrice}. ${priceA}${freeNote}` },
    { q: `¿Cuáles son las principales diferencias entre ${a.name} y ${b.name}?`, a: `Las grandes diferencias se reducen al enfoque. ${a.name} está pensada para ${lowerFirst(aBest)} y su función más destacada es ${lowerFirst(aFeat[0] || 'su funcionalidad principal')}. ${b.name} apunta a ${lowerFirst(bBest)}, con ${lowerFirst(bFeat[0] || 'su funcionalidad principal')} como lo más llamativo. Elige la que encaje con tu flujo de trabajo.` },
    { q: `¿Se pueden usar ${a.name} y ${b.name} juntas?`, a: `Por supuesto — muchos equipos las combinan. Usa ${a.name} cuando necesites ${lowerFirst(aBest)}, y ${b.name} cuando trabajes en ${lowerFirst(bBest)}. Se solapan en algunos puntos, pero cada una resuelve bien tareas distintas.` },
    { q: `¿Qué críticas reciben ${a.name} y ${b.name}?`, a: `Los usuarios de ${a.name} mencionan con más frecuencia ${lowerFirst(aCons[0] || 'una curva de aprendizaje')}${aCons[1] ? ' y ' + lowerFirst(aCons[1]) : ''}. En cuanto a ${b.name}, las quejas habituales son ${lowerFirst(bCons[0] || 'la curva de aprendizaje')}${bCons[1] ? ' y ' + lowerFirst(bCons[1]) : ''}. Nada que te eche para atrás, pero conviene saberlo antes de comprometerte.` },
    { q: `¿Necesito un plan de pago para ${a.name} o ${b.name}?`, a: `Depende de lo en serio que te lo tomes. ${a.name} cuesta ${aPrice} para empezar y ${b.name} cuesta ${bPrice}. ${paidQ}` }
  ];
}

function cardHTML(tool, rank, slug, winner, lang) {
  const cfg = LANG[lang];
  const logoDomain = tool.logo || tool.id;
  return `<div class="vs-card" data-cat="${slug}">
    ${winner.id === tool.id ? `<span class="vs-winner">${cfg.winner}</span>` : ''}
    <div class="vs-card-top">
      <div class="vs-logo"><img src="../images/logos/${logoDomain}.png" alt="${escapeAttr(tool.name)} logo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span class="vs-logo-fallback">${escapeHtml(tool.name.charAt(0).toUpperCase())}</span></div>
      <div class="vs-rank">#${rank} ${lang === 'en' ? 'Top Rated' : 'Mejor Calificado'}</div>
      <div class="vs-name">${escapeHtml(tool.name)}</div>
      <div class="vs-rating">${stars(tool.rating)} ${tool.rating}</div>
    </div>
    <div class="vs-tagline">${escapeHtml(tool.tagline)}</div>
    <div class="vs-price">${escapeHtml(priceLabel(tool, lang))}</div>
    <span class="vs-type">${priceTypeLabel(tool, lang)}</span>
    <div class="vs-table">
      <div class="vs-table-row"><span class="label">${cfg.category}</span><span class="value">${escapeHtml(CATEGORIES[lang][slug])}</span></div>
      <div class="vs-table-row"><span class="label">${cfg.rating}</span><span class="value">${tool.rating}/5</span></div>
      <div class="vs-table-row"><span class="label">${cfg.price}</span><span class="value">${escapeHtml(priceLabel(tool, lang))}</span></div>
    </div>
    <div class="vs-pros-cons">
      <ul class="pc-list">${tool.pros.slice(0, 3).map(p => `<li class="pc-pro">✓ ${escapeHtml(p)}</li>`).join('')}</ul>
      <ul class="pc-list">${tool.cons.slice(0, 3).map(c => `<li class="pc-con">✗ ${escapeHtml(c)}</li>`).join('')}</ul>
    </div>
    <div class="vs-actions">
      <a href="./${tool.id}.html" class="vs-btn vs-btn-review">${cfg.readReview}</a>
      <a href="${escapeAttr(tool.url)}" class="vs-btn" target="_blank" rel="nofollow noopener noreferrer">${cfg.visit} ${escapeHtml(tool.name)}</a>
    </div>
  </div>`;
}

function relatedLinks(others, lang) {
  const cfg = LANG[lang];
  const cards = others.map(o => {
    const file = o.file;
    const names = `${o.a.name} vs ${o.b.name}`;
    return `<a class="related-card" href="./${file}">
      <span class="related-name">${escapeHtml(names)}</span>
      <span class="related-cat">${escapeHtml(CATEGORIES[lang][o.slug])}</span>
      <span class="related-cta">${lang === 'en' ? 'Read the comparison' : 'Leer la comparativa'}</span>
    </a>`;
  }).join('');
  return `<div class="related-section">
    <h3>${cfg.relatedTitle}</h3>
    <div class="related-grid">${cards}
    </div>
  </div>`;
}

function buildPage(a, b, slug, lang, otherPairs) {
  const cfg = LANG[lang];
  const otherLang = lang === 'en' ? 'es' : 'en';
  const file = `${a.id}-vs-${b.id}.html`;
  const pageUrl = SITE + '/' + cfg.dir + '/' + file;
  const otherUrl = SITE + '/' + otherLang + '/' + file;
  const catName = CATEGORIES[lang][slug];
  const { winner, loser, reason } = verdictReason(a, b, lang);
  const title = cfg.title(a.name, b.name);
  const metaDesc = cfg.metaDesc(a.name, b.name);
  const faqItems = faqs(a, b, winner, lang);

  const jsonLd = [
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqItems.map(f => ({ '@type': 'Question', 'name': f.q, 'acceptedAnswer': { '@type': 'Answer', 'text': f.a } }))
    }),
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': cfg.breadcrumbHome, 'item': cfg.breadcrumbHomeUrl },
        { '@type': 'ListItem', 'position': 2, 'name': catName, 'item': SITE + '/' + cfg.dir + '/' + (lang === 'en' ? 'comparisons.html' : 'comparaciones.html') },
        { '@type': 'ListItem', 'position': 3, 'name': `${a.name} vs ${b.name}`, 'item': pageUrl }
      ]
    }),
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': `${a.name} vs ${b.name}`,
      'numberOfItems': 2,
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': a.name, 'url': SITE + '/' + cfg.dir + '/' + a.id + '.html' },
        { '@type': 'ListItem', 'position': 2, 'name': b.name, 'url': SITE + '/' + cfg.dir + '/' + b.id + '.html' }
      ]
    })
  ].map(j => `<script type="application/ld+json">\n${j}\n</script>`).join('\n');

  const faqHTML = faqItems.map(f => `
        <div class="faq-item">
          <h3>${escapeHtml(f.q)}</h3>
          <p>${escapeHtml(f.a)}</p>
        </div>`).join('');

  const otherPairsForCard = otherPairs.filter(o => o.file !== file);

  return `<!DOCTYPE html>
<html lang="${cfg.htmlLang}" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeAttr(metaDesc)}">
<meta property="og:title" content="${escapeAttr(title)}">
<meta property="og:description" content="${escapeAttr(metaDesc)}">
<meta property="og:url" content="${pageUrl}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="AI Tools Dash">
<meta property="og:image" content="${SITE}/images/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="AI Tools Dash — Honest AI Tool Reviews">
<meta property="og:locale" content="${lang === 'en' ? 'en_US' : 'es_ES'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(title)}">
<meta name="twitter:description" content="${escapeAttr(metaDesc)}">
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
<link rel="stylesheet" href="../css/style.css?v=20260602">
<style>
.vs-section { max-width: 1100px; margin: 0 auto; }
.vs-header { text-align: center; margin-bottom: 32px; }
.vs-header h2 { font-size: 1.6rem; font-weight: 800; }
.vs-header p { color: var(--text-secondary); }
#hero.hero-short { min-height: auto; padding: 90px 5vw 20px; }
@media (max-width: 768px) { #hero.hero-short { padding: 90px 5vw 20px; } }
@media (max-width: 480px) { #hero.hero-short { padding: 84px 4vw 16px; } }
@media (max-width: 360px) { #hero.hero-short { padding: 80px 3vw 16px; } }
.hero-short .hero-content h1 { margin-bottom: 8px; }
.hero-short .hero-content > p { margin-bottom: 0; }
.section { padding: 32px 5vw 60px; }
.hero-breadcrumb { color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 12px; }
.hero-breadcrumb a { color: var(--accent); text-decoration: none; }
.vs-intro { max-width: 760px; margin: 0 auto 36px; color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; text-align: center; }
.vs-verdict { max-width: 760px; margin: 28px auto 0; color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; }
.vs-verdict strong { color: var(--text); }
.vs-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
.vs-btn { display: block; text-align: center; padding: 11px 16px; border-radius: var(--radius-sm); font-weight: 600; font-size: 0.85rem; text-decoration: none; color: var(--bg); background: linear-gradient(90deg, var(--accent), var(--accent-2, var(--accent))); transition: all var(--transition); }
.vs-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.vs-btn-review { background: transparent; border: 1px solid var(--accent); color: var(--accent); }
.vs-btn-review:hover { background: rgba(0,0,0,0.25); }
.faq-section { max-width: 760px; margin: 48px auto 0; }
.faq-section h2 { font-size: 1.4rem; font-weight: 700; margin-bottom: 20px; }
.faq-item { margin-bottom: 20px; }
.faq-item h3 { font-size: 1.05rem; font-weight: 600; margin-bottom: 6px; color: var(--text); }
.faq-item p { color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; }
.related-section { max-width: 760px; margin: 48px auto 0; padding-top: 32px; border-top: 1px solid var(--border); }
.related-section h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 20px; }
.related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
.related-card { display: flex; flex-direction: column; gap: 6px; padding: 18px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-md); text-decoration: none; color: var(--text); transition: all var(--transition); }
.related-card:hover { border-color: var(--accent); transform: translateY(-2px); }
.related-name { font-weight: 600; }
.related-cat { color: var(--text-muted); font-size: 0.8rem; }
.related-cta { color: var(--accent); font-size: 0.8rem; margin-top: 4px; }
.vs-back { margin-top: 40px; text-align: center; }
.vs-back a { display: inline-block; color: var(--accent); text-decoration: none; font-size: 1.05rem; font-weight: 600; padding: 12px 24px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg-card); transition: all var(--transition); }
.vs-back a:hover { border-color: var(--accent); transform: translateY(-2px); }
@media (max-width: 768px) {
  .vs-grid { grid-template-columns: 1fr 1fr !important; gap: 6px; }
  .vs-divider { display: none !important; }
}
@media (max-width: 420px) {
  .vs-grid { grid-template-columns: 1fr 1fr !important; gap: 4px; }
  .vs-card { padding: 10px 6px; }
  .vs-logo { width: 36px; height: 36px; }
  .vs-logo img { width: 20px; height: 20px; }
  .vs-card .vs-name { font-size: 0.75rem; }
  .vs-card .vs-tagline { font-size: 0.6rem; }
  .vs-card .vs-rating { font-size: 0.65rem; }
  .vs-price { font-size: 0.7rem; padding: 2px 8px; }
  .vs-type { font-size: 0.5rem; padding: 1px 6px; }
  .vs-btn { font-size: 0.55rem; padding: 7px 8px; }
  .vs-table-row { font-size: 0.55rem; }
  .vs-pros-cons .pc-list { font-size: 0.55rem; }
}
</style>
</head>
<body>

${navHTML(cfg, lang, file)}

  <div class="page-bg" aria-hidden="true"></div>
  <main id="main-content">
  <section id="hero" class="hero-short">
    <div class="hero-content">
      <p class="hero-breadcrumb"><a href="${cfg.breadcrumbHomeUrl}">${cfg.breadcrumbHome}</a> › ${escapeHtml(catName)}</p>
      <h1>${escapeHtml(a.name)} vs ${escapeHtml(b.name)} <span>${cfg.heroSuffix}</span></h1>
      <p>${escapeHtml(`${a.name} — ${a.tagline}. ${b.name} — ${b.tagline}.`)}</p>
    </div>
  </section>

  <section class="section">
    <div class="vs-section">
      <div class="vs-header">
        <h2>${escapeHtml(catName)} — ${lang === 'en' ? 'Comparing the top 2 tools' : 'Comparando las 2 mejores herramientas'}</h2>
        <p>${escapeHtml(cfg.hubTitle)}</p>
      </div>

      <p class="vs-intro">${escapeHtml(cfg.intro(a.name, b.name, catName, winner.name))}</p>

      <div class="vs-grid">
        ${cardHTML(a, 1, slug, winner, lang)}
        <div class="vs-divider"><span>VS</span></div>
        ${cardHTML(b, 2, slug, winner, lang)}
      </div>

      <p class="vs-verdict"><strong>${cfg.verdict}:</strong> ${escapeHtml(reason)}</p>

      <div class="faq-section">
        <h2>${cfg.faqTitle}</h2>
        ${faqHTML}
      </div>

      ${relatedLinks(otherPairsForCard, lang)}

      <p class="vs-back"><a href="./${lang === 'en' ? 'comparisons.html' : 'comparaciones.html'}">${cfg.backToHub}</a></p>
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
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'reviews-en.json'), 'utf8'));
  const grouped = {};
  data.forEach(r => {
    if (!grouped[r.category_slug]) grouped[r.category_slug] = [];
    grouped[r.category_slug].push(r);
  });

  const pairs = [];
  Object.keys(CATEGORIES.en).forEach(slug => {
    const tools = (grouped[slug] || []).slice().sort((a, b) => b.rating - a.rating);
    if (tools.length < 2) return;
    const a = tools[0], b = tools[1];
    pairs.push({ slug, a, b, file: `${a.id}-vs-${b.id}.html` });
  });

  Object.keys(LANG).forEach(lang => {
    const outDir = path.join(ROOT, LANG[lang].dir);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    pairs.forEach(p => {
      const html = buildPage(p.a, p.b, p.slug, lang, pairs);
      fs.writeFileSync(path.join(outDir, p.file), html, 'utf8');
    });
    console.log(`${lang}: generated ${pairs.length} comparison pages`);
  });

  fs.writeFileSync(path.join(ROOT, 'admin', 'comparison-pairs.json'), JSON.stringify(pairs.map(p => ({ slug: p.slug, file: p.file, a: p.a.id, b: p.b.id, ratingA: p.a.rating, ratingB: p.b.rating })), null, 2), 'utf8');
  console.log('admin/comparison-pairs.json written with ' + pairs.length + ' pairs');
}

main();
