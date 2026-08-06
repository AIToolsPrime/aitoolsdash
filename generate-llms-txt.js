const fs = require('fs');

const en = JSON.parse(fs.readFileSync('data/reviews-en.json', 'utf8'));
const cats = [];
const byCat = {};
en.forEach((t) => {
  if (!byCat[t.category_slug]) {
    byCat[t.category_slug] = { name: t.category, items: [] };
    cats.push(byCat[t.category_slug]);
  }
  byCat[t.category_slug].items.push(t);
});
cats.sort((a, b) => a.name.localeCompare(b.name));

const lines = [];
lines.push('# AI Tools Dash');
lines.push('');
lines.push('> Honest, in-depth reviews and comparisons of the best AI tools for music, writing, images, video, productivity, audio, coding, and marketing.');
lines.push('');
lines.push('[AI Tools Dash](https://aitoolsdash.com/)');
lines.push('');
lines.push('## Key pages');
lines.push('');
lines.push('- [All AI Tool Reviews (English)](https://aitoolsdash.com/en/): Browse every AI tool review');
lines.push('- [AI Tool Reviews (Spanish)](https://aitoolsdash.com/es/): Todas las reseñas de herramientas IA en español');
lines.push('- [AI Tool Comparisons](https://aitoolsdash.com/en/comparisons.html): Side-by-side comparisons of popular AI tools');
lines.push('- [Comparativas de herramientas IA](https://aitoolsdash.com/es/comparaciones.html): Comparativas de herramientas de IA en español');
lines.push('');

cats.forEach((c) => {
  lines.push(`## ${c.name}`);
  lines.push('');
  c.items.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach((t) => {
    lines.push(`- [${t.name} review](https://aitoolsdash.com/en/${t.id}.html): ${t.excerpt}`);
  });
  lines.push('');
});

fs.writeFileSync('llms.txt', lines.join('\n'), 'utf8');
console.log(`llms.txt written: ${lines.length} lines`);
