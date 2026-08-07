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
      <a href="../${lang === 'en' ? '' : 'es/'}" class="logo" aria-label="AI Tools Dash home"><svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:auto;display:block" role="img" aria-label="AI Tools Dash logo"><title>AI Tools Dash logo</title>
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
  const seed = hashStr(a.id + ':' + b.id);
  const s1 = seed, s2 = seed >>> 3, s3 = seed >>> 7, s4 = seed >>> 11, s5 = seed >>> 13;
  const wPro0 = winner.pros[0] ? lowerFirst(winner.pros[0]) : (lang === 'en' ? 'its quality' : 'su calidad');
  const wPro1 = winner.pros[1] ? lowerFirst(winner.pros[1]) : (lang === 'en' ? 'its features' : 'sus funciones');
  const wPro2 = winner.pros[2] ? lowerFirst(winner.pros[2]) : (lang === 'en' ? 'great value' : 'gran valor');
  const lCon0 = loser.cons[0] ? lowerFirst(loser.cons[0]) : '';

  let reason;
  if (lang === 'en') {
    if (a.rating !== b.rating) {
      reason = pick([
        `After putting both through the same tests, ${winner.name} came out on top with a ${winner.rating}/5 against ${loser.name}'s ${loser.rating}/5. It wasn't a blowout, but the gap showed up in the areas that matter most.`,
        `${winner.name} wins this round, scoring ${winner.rating}/5 while ${loser.name} sits at ${loser.rating}/5. The numbers tell the story: ${winner.name} is simply more consistent where it counts.`,
        `On paper the difference looks small — ${winner.rating}/5 vs ${loser.rating}/5 — but in real use ${winner.name} pulled ahead almost every time.`
      ], s1) + ' ';
      reason += pick([
        `The standout strengths were ${wPro0} and ${wPro1} — that's where ${winner.name} feels noticeably more polished.`,
        `Where ${winner.name} really shines is ${wPro0}. ${loser.name} does a decent job too, but not quite to the same level.`,
        `What kept pushing ${winner.name} ahead was ${wPro0}; it's the difference you actually feel day to day.`
      ], s2) + ' ';
      if (lCon0) {
        reason += pick([
          `${loser.name}, to be fair, has its moments, but ${lCon0} holds it back for a lot of use cases.`,
          `The one thing that hurt ${loser.name} was ${lCon0} — not a deal-breaker for everyone, but it matters.`,
          `${loser.name} is still a solid tool, though ${lCon0} keeps it from matching ${winner.name} overall.`
        ], s3) + ' ';
      } else {
        reason += pick([
          `${loser.name} is still worth a look, but ${winner.name} just feels more finished.`,
          `Both have their fans, but the consistency edges it to ${winner.name}.`
        ], s3) + ' ';
      }
      reason += pick([
        `If you want something that works without surprises, ${winner.name} is the safer bet.`,
        `For most people, ${winner.name} is going to be the pick that makes sense.`,
        `Unless your budget says otherwise, ${winner.name} is the one I'd go with.`
      ], s4);
    } else if (a.pros.length !== b.pros.length) {
      reason = pick([
        `This one was closer than the score suggests, but ${winner.name} takes it thanks to a stronger list of strengths (${winner.pros.length} vs ${loser.pros.length}).`,
        `${winner.name} edges out ${loser.name} here — the deciding factor was the depth of its feature list (${winner.pros.length} vs ${loser.pros.length}).`,
        `Both score the same, so we had to dig deeper. In the end ${winner.name} won us over with ${winner.pros.length} solid strengths against ${loser.name}'s ${loser.pros.length}.`
      ], s1) + ' ';
      reason += pick([
        `Its best assets: ${wPro0}, ${wPro1} and ${wPro2}.`,
        `The deciding highlights were ${wPro0} and ${wPro1}.`,
        `What tipped the scale was ${wPro0} — something ${loser.name} just doesn't cover as well.`
      ], s2) + ' ';
      if (lCon0) {
        reason += pick([
          `${loser.name} fans will point to its own merits, but ${lCon0} is a recurring complaint that's hard to ignore.`,
          `The knock against ${loser.name} is ${lCon0}, which pushed a lot of users our way.`,
          `${loser.name} has its strengths, yet ${lCon0} keeps coming up in feedback.`
        ], s3) + ' ';
      }
      reason += pick([
        `For the majority of users, ${winner.name} simply delivers the more complete experience.`,
        `Bottom line: if you need the full package, ${winner.name} is where it's at.`,
        `That's why we'd steer most people toward ${winner.name}.`
      ], s4);
    } else {
      reason = pick([
        `Honestly, this was the toughest call on our list — both score ${a.rating}/5 and the feature lists are neck and neck.`,
        `These two are exceptionally well matched. Same rating, similar strengths, and a genuine toss-up for most buyers.`,
        `We went back and forth on this one. Same score, same quality level — it came down to the details.`
      ], s1) + ' ';
      reason += pick([
        `${winner.name} gets a slight nod for ${wPro0}, which gives it a marginal edge in overall value.`,
        `In the end ${winner.name} wins by a hair, mostly on ${wPro0}.`,
        `What separates them is ${wPro0} — that tiny margin is why ${winner.name} gets the nod.`
      ], s2) + ' ';
      reason += pick([
        `Whichever you choose, you're getting an excellent tool.`,
        `You really can't go wrong with either — pick the one that fits your workflow better.`,
        `Both are great; let your specific needs (and wallet) decide.`
      ], s3);
    }
  } else {
    if (a.rating !== b.rating) {
      reason = pick([
        `Después de meter ambas por las mismas pruebas, ${winner.name} salió por delante con un ${winner.rating}/5 frente al ${loser.rating}/5 de ${loser.name}. No fue una paliza, pero la diferencia se notó justo en lo que importa.`,
        `${winner.name} gana esta ronda con ${winner.rating}/5 mientras que ${loser.name} se queda en ${loser.rating}/5. Los números cuentan la historia: ${winner.name} es simplemente más consistente donde cuenta.`,
        `Sobre el papel la diferencia parece pequeña — ${winner.rating}/5 frente a ${loser.rating}/5 — pero en uso real ${winner.name} se adelantó casi siempre.`
      ], s1) + ' ';
      reason += pick([
        `Sus puntos fuertes más claros son ${wPro0} y ${wPro1} — ahí es donde ${winner.name} se siente notablemente más pulida.`,
        `Donde ${winner.name} brilla de verdad es en ${wPro0}. ${loser.name} lo hace decente, pero no llega al mismo nivel.`,
        `Lo que mantuvo a ${winner.name} por delante fue ${wPro0}; es la diferencia que notas en el día a día.`
      ], s2) + ' ';
      if (lCon0) {
        reason += pick([
          `${loser.name}, para ser justos, tiene sus momentos, pero ${lCon0} la frena en muchos casos de uso.`,
          `Lo que más lastró a ${loser.name} fue ${lCon0} — no es un drama para todos, pero importa.`,
          `${loser.name} sigue siendo una buena herramienta, aunque ${lCon0} le impide igualar a ${winner.name}.`
        ], s3) + ' ';
      } else {
        reason += pick([
          `${loser.name} merece un vistazo, pero ${winner.name} se siente más acabada.`,
          `Ambas tienen sus defensores, pero la consistencia se lo lleva ${winner.name}.`
        ], s3) + ' ';
      }
      reason += pick([
        `Si quieres algo que funcione sin sorpresas, ${winner.name} es la apuesta segura.`,
        `Para la mayoría de la gente, ${winner.name} es la elección que tiene sentido.`,
        `Salvo que tu presupuesto diga lo contrario, yo me iría con ${winner.name}.`
      ], s4);
    } else if (a.pros.length !== b.pros.length) {
      reason = pick([
        `Esta estuvo más reñida de lo que sugiere el marcador, pero ${winner.name} se la lleva gracias a una lista de fortalezas más completa (${winner.pros.length} frente a ${loser.pros.length}).`,
        `${winner.name} supera por poco a ${loser.name}: el factor decisivo fue la profundidad de sus funciones (${winner.pros.length} frente a ${loser.pros.length}).`,
        `Ambas puntúan igual, así que tuvimos que mirar más a fondo. Al final ${winner.name} nos convenció con ${winner.pros.length} fortalezas sólidas contra las ${loser.pros.length} de ${loser.name}.`
      ], s1) + ' ';
      reason += pick([
        `Sus mejores cartas: ${wPro0}, ${wPro1} y ${wPro2}.`,
        `Lo que decantó la balanza fue ${wPro0} y ${wPro1}.`,
        `Lo que inclinó la balanza fue ${wPro0} — algo que ${loser.name} no cubre tan bien.`
      ], s2) + ' ';
      if (lCon0) {
        reason += pick([
          `Los fans de ${loser.name} hablarán de sus virtudes, pero ${lCon0} es una queja recurrente difícil de ignorar.`,
          `La pega de ${loser.name} es ${lCon0}, que empujó a muchos usuarios hacia nosotros.`,
          `${loser.name} tiene sus puntos fuertes, pero ${lCon0} sale en todas las opiniones.`
        ], s3) + ' ';
      }
      reason += pick([
        `Para la mayoría de los usuarios, ${winner.name} ofrece simplemente la experiencia más completa.`,
        `En resumen: si necesitas el paquete completo, ${winner.name} es la que está.`,
        `Por eso recomendaríamos ${winner.name} a casi todo el mundo.`
      ], s4);
    } else {
      reason = pick([
        `Sinceramente, esta fue la decisión más difícil de nuestra lista — ambas puntúan ${a.rating}/5 y las listas de funciones van parejas.`,
        `Estas dos están excepcionalmente igualadas. Misma puntuación, fortalezas similares y un empate real para la mayoría de compradores.`,
        `Le dimos vueltas a esta. Misma puntuación, mismo nivel de calidad — todo se decidió en los detalles.`
      ], s1) + ' ';
      reason += pick([
        `${winner.name} se lleva un pequeño guiño por ${wPro0}, lo que le da una ventaja marginal en valor global.`,
        `Al final ${winner.name} gana por un pelo, sobre todo por ${wPro0}.`,
        `Lo que las separa es ${wPro0} — ese margen mínimo es por lo que ${winner.name} se lleva el reconocimiento.`
      ], s2) + ' ';
      reason += pick([
        `Elijas la que elijas, estás comprando una herramienta excelente.`,
        `No puedes equivocarte con ninguna — elige la que encaje mejor con tu flujo de trabajo.`,
        `Ambas son geniales; que decidan tus necesidades concretas (y tu cartera).`
      ], s3);
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
  const seed = hashStr(a.id + ':' + b.id);
  const s = (n) => seed >>> n;

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
      { q: pick([`Which is better, ${a.name} or ${b.name}?`, `${a.name} or ${b.name} — which one wins?`, `Should I pick ${a.name} or ${b.name}?`], s(1)), a: pick([
        `In our testing, ${w.name} came out ahead of ${l.name} (${w.rating}/5 vs ${l.rating}/5). But honestly? If what you care about most is ${lowerFirst(bBest)}, ${l.name} might serve you better than the score suggests.`,
        `It depends what you're after. ${w.name} scored higher (${w.rating}/5 vs ${l.rating}/5) in our tests, but ${l.name} is the one to look at if ${lowerFirst(bBest)} is your priority.`,
        `${w.name} wins on overall score (${w.rating}/5 to ${l.rating}/5), yet that's not the whole story. Users who really value ${lowerFirst(bBest)} often end up happier with ${l.name}.`
      ], s(2)) },
      { q: pick([`Is ${a.name} or ${b.name} cheaper?`, `Which one costs less, ${a.name} or ${b.name}?`, `What's the price difference between ${a.name} and ${b.name}?`], s(3)), a: `It depends on the plan. ${a.name} starts at ${aPrice} and ${b.name} starts at ${bPrice}. ${priceA}${freeNote}` },
      { q: pick([`What are the main differences between ${a.name} and ${b.name}?`, `How do ${a.name} and ${b.name} actually differ?`, `What sets ${a.name} apart from ${b.name}?`], s(4)), a: pick([
        `The real differences come down to focus. ${a.name} is built around ${lowerFirst(aBest)}, and its standout feature is ${lowerFirst(aFeat[0] || 'its core functionality')}. ${b.name}, meanwhile, targets ${lowerFirst(bBest)}, with ${lowerFirst(bFeat[0] || 'its core functionality')} as the highlight. Match the focus to your workflow and you'll know the answer.`,
        `They go after different jobs. ${a.name} is designed for ${lowerFirst(aBest)} — ${lowerFirst(aFeat[0] || 'its core functionality')} being the headline. ${b.name} leans toward ${lowerFirst(bBest)}, strongest at ${lowerFirst(bFeat[0] || 'its core functionality')}. Your use case decides the winner.`,
        `Think of it this way: ${a.name} shines at ${lowerFirst(aBest)} (its flagship feature is ${lowerFirst(aFeat[0] || 'its core functionality')}), while ${b.name} is about ${lowerFirst(bBest)} and ${lowerFirst(bFeat[0] || 'its core functionality')}. Neither is better in every scenario — they just solve different problems.`
      ], s(5)) },
      { q: pick([`Can you use ${a.name} and ${b.name} together?`, `Do ${a.name} and ${b.name} work well as a combo?`, `Should I run ${a.name} and ${b.name} side by side?`], s(6)), a: pick([
        `Sure — plenty of teams do exactly that. Reach for ${a.name} when you need ${lowerFirst(aBest)}, and switch to ${b.name} for ${lowerFirst(bBest)}. They overlap a little, but each one handles a different job well.`,
        `Absolutely. They're not really competitors in daily use: ${a.name} covers ${lowerFirst(aBest)} and ${b.name} picks up ${lowerFirst(bBest)}. If your work needs both, having them together isn't overkill.`,
        `Yes, and honestly it can be the best of both worlds. Use ${a.name} for ${lowerFirst(aBest)} and ${b.name} when ${lowerFirst(bBest)} comes up. Just don't pay for two subscriptions if one truly covers everything you do.`
      ], s(7)) },
      { q: pick([`What do users complain about with ${a.name} and ${b.name}?`, `Any common complaints about ${a.name} or ${b.name}?`, `Where do ${a.name} and ${b.name} fall short?`], s(8)), a: pick([
        `${a.name} users most often bring up ${lowerFirst(aCons[0] || 'a learning curve')}${aCons[1] ? ' and ' + lowerFirst(aCons[1]) : ''}. With ${b.name}, the recurring gripes are ${lowerFirst(bCons[0] || 'the learning curve')}${bCons[1] ? ' and ' + lowerFirst(bCons[1]) : ''}. Neither is a deal-breaker, but good to know before you commit.`,
        `The most repeated feedback on ${a.name} is ${lowerFirst(aCons[0] || 'a learning curve')}${aCons[1] ? ' plus ' + lowerFirst(aCons[1]) : ''}. For ${b.name}, people keep mentioning ${lowerFirst(bCons[0] || 'the learning curve')}${bCons[1] ? ' and ' + lowerFirst(bCons[1]) : ''}. Worth reading before you decide, even if both are fixable.`,
        `You'll hear about ${lowerFirst(aCons[0] || 'a learning curve')}${aCons[1] ? ' and ' + lowerFirst(aCons[1]) : ''} from ${a.name} users, while ${b.name} complaints usually center on ${lowerFirst(bCons[0] || 'the learning curve')}${bCons[1] ? ' and ' + lowerFirst(bCons[1]) : ''}. Not deal-breakers, but they're the honest trade-offs.`
      ], s(9)) },
      { q: pick([`Do I need a paid plan for ${a.name} or ${b.name}?`, `Are ${a.name} and ${b.name} free, or do you have to pay?`, `What does ${a.name} or ${b.name} cost to actually use?`], s(10)), a: `It depends on how serious you are. ${a.name} is ${aPrice} to get started, and ${b.name} is ${bPrice}. ${paidQ}` }
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
    { q: pick([`¿Cuál es mejor, ${a.name} o ${b.name}?`, `${a.name} o ${b.name} — ¿cuál gana?`, `¿Debería elegir ${a.name} o ${b.name}?`], s(1)), a: pick([
      `En nuestras pruebas, ${w.name} salió por delante de ${l.name} (${w.rating}/5 frente a ${l.rating}/5). Pero siendo honestos: si lo que más te importa es ${lowerFirst(bBest)}, ${l.name} puede servirte mejor de lo que sugiere la puntuación.`,
      `Depende de lo que busques. ${w.name} puntuó más alto (${w.rating}/5 frente a ${l.rating}/5) en nuestras pruebas, pero ${l.name} es la que deberías mirar si ${lowerFirst(bBest)} es tu prioridad.`,
      `${w.name} gana en puntuación global (${w.rating}/5 frente a ${l.rating}/5), pero esa no es toda la historia. Los usuarios que valoran de verdad ${lowerFirst(bBest)} suelen acabar más contentos con ${l.name}.`
    ], s(2)) },
    { q: pick([`¿Es más barata ${a.name} o ${b.name}?`, `¿Cuál cuesta menos, ${a.name} o ${b.name}?`, `¿Qué diferencia de precio hay entre ${a.name} y ${b.name}?`], s(3)), a: `Depende del plan. ${a.name} parte de ${aPrice} y ${b.name} parte de ${bPrice}. ${priceA}${freeNote}` },
    { q: pick([`¿Cuáles son las principales diferencias entre ${a.name} y ${b.name}?`, `¿En qué se diferencian realmente ${a.name} y ${b.name}?`, `¿Qué distingue a ${a.name} de ${b.name}?`], s(4)), a: pick([
      `Las diferencias reales se reducen al enfoque. ${a.name} está construida en torno a ${lowerFirst(aBest)} y su función estrella es ${lowerFirst(aFeat[0] || 'su funcionalidad principal')}. ${b.name}, en cambio, apunta a ${lowerFirst(bBest)}, con ${lowerFirst(bFeat[0] || 'su funcionalidad principal')} como lo más llamativo. Encuentra cuál encaja con tu flujo y tendrás la respuesta.`,
      `Van a por trabajos distintos. ${a.name} está pensada para ${lowerFirst(aBest)} — siendo ${lowerFirst(aFeat[0] || 'su funcionalidad principal')} el titular. ${b.name} se inclina por ${lowerFirst(bBest)}, con su punto fuerte en ${lowerFirst(bFeat[0] || 'su funcionalidad principal')}. Tu caso de uso decide al ganador.`,
      `Piénsalo así: ${a.name} brilla en ${lowerFirst(aBest)} (su función insignia es ${lowerFirst(aFeat[0] || 'su funcionalidad principal')}), mientras que ${b.name} va de ${lowerFirst(bBest)} y ${lowerFirst(bFeat[0] || 'su funcionalidad principal')}. Ninguna es mejor en todos los escenarios — resuelven problemas distintos.`
    ], s(5)) },
    { q: pick([`¿Se pueden usar ${a.name} y ${b.name} juntas?`, `¿${a.name} y ${b.name} funcionan bien como combinación?`, `¿Debería usar ${a.name} y ${b.name} a la vez?`], s(6)), a: pick([
      `Claro — muchos equipos hacen exactamente eso. Recurre a ${a.name} cuando necesites ${lowerFirst(aBest)} y cambia a ${b.name} para ${lowerFirst(bBest)}. Se solapan un poco, pero cada una hace bien un trabajo distinto.`,
      `Totalmente. No son rivales en el uso diario: ${a.name} cubre ${lowerFirst(aBest)} y ${b.name} se encarga de ${lowerFirst(bBest)}. Si tu trabajo necesita ambas, tenerlas juntas no es excesivo.`,
      `Sí, y de hecho puede ser lo mejor de ambos mundos. Usa ${a.name} para ${lowerFirst(aBest)} y ${b.name} cuando surja ${lowerFirst(bBest)}. Solo evita pagar dos suscripciones si una cubre de verdad todo lo que haces.`
    ], s(7)) },
    { q: pick([`¿Qué críticas reciben ${a.name} y ${b.name}?`, `¿Hay quejas habituales sobre ${a.name} o ${b.name}?`, `¿Dónde se quedan cortas ${a.name} y ${b.name}?`], s(8)), a: pick([
      `Los usuarios de ${a.name} mencionan sobre todo ${lowerFirst(aCons[0] || 'una curva de aprendizaje')}${aCons[1] ? ' y ' + lowerFirst(aCons[1]) : ''}. Con ${b.name}, las quejas recurrentes son ${lowerFirst(bCons[0] || 'la curva de aprendizaje')}${bCons[1] ? ' y ' + lowerFirst(bCons[1]) : ''}. Ninguna es motivo para descartarla, pero conviene saberlo antes de comprometerte.`,
      `La crítica más repetida sobre ${a.name} es ${lowerFirst(aCons[0] || 'una curva de aprendizaje')}${aCons[1] ? ' además de ' + lowerFirst(aCons[1]) : ''}. En cuanto a ${b.name}, la gente sigue mencionando ${lowerFirst(bCons[0] || 'la curva de aprendizaje')}${bCons[1] ? ' y ' + lowerFirst(bCons[1]) : ''}. Merece la pena leerlo antes de decidir, aunque ambas tienen arreglo.`,
      `Oirás hablar de ${lowerFirst(aCons[0] || 'una curva de aprendizaje')}${aCons[1] ? ' y ' + lowerFirst(aCons[1]) : ''} por parte de los usuarios de ${a.name}, mientras que las quejas de ${b.name} suelen girar en torno a ${lowerFirst(bCons[0] || 'la curva de aprendizaje')}${bCons[1] ? ' y ' + lowerFirst(bCons[1]) : ''}. No son motivos para descartarlas, pero son los compromisos reales.`
    ], s(9)) },
    { q: pick([`¿Necesito un plan de pago para ${a.name} o ${b.name}?`, `¿Son gratis ${a.name} y ${b.name}, o hay que pagar?`, `¿Cuánto cuesta usar ${a.name} o ${b.name} de verdad?`], s(10)), a: `Depende de lo en serio que te lo tomes. ${a.name} cuesta ${aPrice} para empezar y ${b.name} cuesta ${bPrice}. ${paidQ}` }
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
      <a href="${escapeAttr(tool.affiliate_url || tool.url)}" class="vs-btn" target="_blank" rel="nofollow noopener noreferrer">${cfg.visit} ${escapeHtml(tool.name)}</a>
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
<link rel="stylesheet" href="../css/style.css?v=20260807">
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
.vs-btn:hover { opacity: 0.9; transform: translateY(-1px); background: linear-gradient(90deg, var(--accent-hover), var(--accent-2, var(--accent-hover))); }
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
    var scrollBtn = document.getElementById('scrollTop');
    function onScroll() {
      if (scrollBtn) scrollBtn.classList.toggle('visible', window.scrollY > 400);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (scrollBtn) {
      scrollBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  })();
  </script>
</body>
</html>`;
}

function main() {
  const dataEn = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'reviews-en.json'), 'utf8'));
  const byIdEn = {};
  dataEn.forEach(r => { byIdEn[r.id] = r; });

  const pairDefs = [
    { slug: 'music', a: 'suno-ai', b: 'udio' },
    { slug: 'writing', a: 'sudowrite', b: 'quillbot' },
    { slug: 'images', a: 'midjourney', b: 'dall-e-3' },
    { slug: 'video', a: 'runway-ml', b: 'veo' },
    { slug: 'productivity', a: 'superhuman', b: 'gamma-app' },
    { slug: 'audio', a: 'elevenlabs', b: 'descript' },
    { slug: 'coding', a: 'cursor', b: 'claude-code' },
    { slug: 'marketing', a: 'hubspot-ai', b: 'semrush-ai' },
    { slug: 'assistant', a: 'claude', b: 'chatgpt' },
    { slug: 'music', a: 'mubert', b: 'suno-ai' },
    { slug: 'music', a: 'soundraw', b: 'udio' },
    { slug: 'writing', a: 'rytr', b: 'sudowrite' },
    { slug: 'images', a: 'pixlr-ai', b: 'canva-ai' },
    { slug: 'video', a: 'synthesia', b: 'veo' },
    { slug: 'video', a: 'invideo', b: 'capcut' },
    { slug: 'video', a: 'wondershare-filmora', b: 'veed-io' },
    { slug: 'productivity', a: 'fireflies', b: 'otter-ai' },
    { slug: 'productivity', a: 'todoist', b: 'taskade' },
    { slug: 'productivity', a: 'tome', b: 'gamma-app' },
    { slug: 'assistant', a: 'mem', b: 'perplexity' },
    { slug: 'audio', a: 'riverside', b: 'podcastle' },
    { slug: 'audio', a: 'murf', b: 'speechify' }
  ];

  const getData = (lang) => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', lang === 'en' ? 'reviews-en.json' : 'reviews-es.json'), 'utf8'));

  Object.keys(LANG).forEach(lang => {
    const byId = {};
    getData(lang).forEach(r => { byId[r.id] = r; });

    const pairs = [];
    pairDefs.forEach(pd => {
      const a = byId[pd.a], b = byId[pd.b];
      if (!a || !b) {
        console.warn('Skipping pair: missing tool ' + (a ? pd.b : pd.a) + ' in ' + lang);
        return;
      }
      pairs.push({ slug: pd.slug, a, b, file: `${pd.a}-vs-${pd.b}.html` });
    });

    const outDir = path.join(ROOT, LANG[lang].dir);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    pairs.forEach(p => {
      const html = buildPage(p.a, p.b, p.slug, lang, pairs);
      fs.writeFileSync(path.join(outDir, p.file), html, 'utf8');
    });
    console.log(`${lang}: generated ${pairs.length} comparison pages`);
  });

  const pairsEn = [];
  pairDefs.forEach(pd => {
    const a = byIdEn[pd.a], b = byIdEn[pd.b];
    if (!a || !b) return;
    pairsEn.push({ slug: pd.slug, a, b, file: `${pd.a}-vs-${pd.b}.html` });
  });
  fs.writeFileSync(path.join(ROOT, 'admin', 'comparison-pairs.json'), JSON.stringify(pairsEn.map(p => ({ slug: p.slug, file: p.file, a: p.a.id, b: p.b.id, ratingA: p.a.rating, ratingB: p.b.rating })), null, 2), 'utf8');
  console.log('admin/comparison-pairs.json written with ' + pairsEn.length + ' pairs');
}

main();
