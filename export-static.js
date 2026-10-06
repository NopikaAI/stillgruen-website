/**
 * Erzeugt eine statische Vorschau der Website im Ordner "export".
 * Aufruf: node export-static.js
 * Die Vorschau hat kein Formular-Backend, sie dient nur zum Ansehen.
 */
const fs = require('fs');
const path = require('path');
const { PAGES, notFound } = require('./src/pages');
const { prices } = require('./src/data');

const OUT = path.join(__dirname, 'export');
const FILE = { '/': 'index.html', '/grabpflege-kosten/': 'grabpflege-kosten.html', '/grabpflege-frankfurt/': 'grabpflege-frankfurt.html', '/urnenpflege-frankfurt/': 'urnenpflege-frankfurt.html', '/impressum/': 'impressum.html', '/datenschutz/': 'datenschutz.html', '/agb/': 'agb.html', '/widerrufsbelehrung/': 'widerrufsbelehrung.html', '/vertraege-kuendigen/': 'vertraege-kuendigen.html', '/vertrag-widerrufen/': 'vertrag-widerrufen.html' };

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.cpSync(path.join(__dirname, 'public'), OUT, { recursive: true });

const clientJs = fs.readFileSync(path.join(__dirname, 'src', 'site.client.js'), 'utf8').replace('/*PRICES*/null', JSON.stringify(
  Object.fromEntries(['urne', 'einzel', 'doppel'].map((k) => [k, { m: prices[k].jahr, mo: prices[k].monat, s: prices[k].saison, pf: prices[k].pflege }])),
));
fs.mkdirSync(path.join(OUT, 'js'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'js', 'site.js'), clientJs);

const rewrite = (html) => {
  let h = html.replace(/(href|src)="\/([^"]*)"/g, (m, attr, rest) => `${attr}="${rest || 'index.html'}"`);
  for (const [p, f] of Object.entries(FILE)) {
    if (p === '/') continue;
    h = h.split(`href="${p.slice(1)}"`).join(`href="${f}"`);
  }
  return h.replace(/action="\/api\/anfrage"/g, 'action="#kontakt" data-preview="1"').replace(/action="\/api\/erklaerung"/g, 'action="#" data-preview="1"');
};

for (const [p, v] of Object.entries(PAGES)) fs.writeFileSync(path.join(OUT, FILE[p]), rewrite(v.render()));
fs.writeFileSync(path.join(OUT, '404.html'), rewrite(notFound()));
console.log('Statische Vorschau liegt in', OUT);
