const fs = require('fs');
const path = require('path');

['en', 'es'].forEach(function (lang) {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'reviews-' + lang + '.json'), 'utf8'));
  const items = data.map(function (t, i) {
    return { '@type': 'ListItem', 'position': i + 1, 'url': 'https://aitoolsdash.com/' + lang + '/' + t.id + '.html' };
  });
  const obj = { '@context': 'https://schema.org', '@type': 'ItemList', 'name': 'All AI Tool Reviews', 'itemListElement': items };
  const ld = '<script type="application/ld+json">\n' + JSON.stringify(obj, null, 2) + '\n</script>';
  const file = path.join(__dirname, lang, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const endMarker = '</script>';
  const last = html.lastIndexOf(endMarker);
  if (last > -1) {
    html = html.slice(0, last + endMarker.length) + '\n' + ld + html.slice(last + endMarker.length);
    fs.writeFileSync(file, html, 'utf8');
    console.log(lang + ' ItemList injected (' + data.length + ' items)');
  } else {
    console.log(lang + ' no marker found');
  }
});
