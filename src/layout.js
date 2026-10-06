const fs = require('fs');
const path = require('path');
const { site } = require('./data');

const clean = (file) => {
  let t = fs.readFileSync(path.join(__dirname, 'svg', file), 'utf8');
  t = t.replace(/<\?xml[^>]*>/, '').replace(/<metadata>[\s\S]*?<\/metadata>/g, '').replace(/<title>[\s\S]*?<\/title>/g, '').replace(/ xmlns:c2pa="[^"]*"/g, '');
  return t.replace('<svg ', '<svg aria-hidden="true" focusable="false" ').trim();
};
const LOGO = clean('stillgruen-wortmarke-salbei.svg');
const LOGO_NEG = clean('stillgruen-logo-negativ.svg');
const ICONS = fs.readFileSync(path.join(__dirname, 'icons.html'), 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const NAV = [
  ['/#leistungen', 'Leistungen'],
  ['/grabpflege-kosten/', 'Preise'],
  ['/urnenpflege-frankfurt/', 'Urnenpflege'],
  ['/#ablauf', 'Ablauf'],
  ['/#faq', 'Fragen'],
  ['/#kontakt', 'Kontakt'],
];

function layout({ title, description, pathName, body, schema = [], noindex = false, ogType = 'website' }) {
  const canonical = site.url + pathName;
  const ld = schema.length ? `<script type="application/ld+json">${JSON.stringify(schema.length === 1 ? schema[0] : { '@context': 'https://schema.org', '@graph': schema.map(({ ['@context']: _, ...rest }) => rest) })}</script>` : '';
  const navLinks = NAV.map(([href, label]) => `<a href="${href}">${label}</a>`).join('');
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">'}
<meta name="theme-color" content="#6F9277">
<meta property="og:type" content="${ogType}">
<meta property="og:locale" content="de_DE">
<meta property="og:site_name" content="${esc(site.fullName)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.url}/img/og-stillgruen.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/figtree.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/young-serif.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/site.css?v=${layout.version}">
${ld}
</head>
<body>
${ICONS}
<a class="skip" href="#inhalt">Zum Inhalt springen</a>
<header class="top"><div class="in">
  <a class="logo" href="/" aria-label="Stillgrün Startseite">${LOGO}</a>
  <nav class="nav" aria-label="Hauptnavigation">${navLinks}</nav>
  <button class="big-toggle" id="big" type="button" aria-pressed="false" title="Schrift vergrößern">A+</button>
  <a class="btn primary" href="/#kontakt">Kostenlos anfragen</a>
  <div class="menu"><button type="button" id="menuBtn" aria-expanded="false" aria-controls="menuNav" aria-label="Menü öffnen"><span></span><span></span><span></span></button><nav id="menuNav" aria-label="Mobile Navigation" hidden>${navLinks}</nav></div>
</div></header>
<main id="inhalt">
${body}
</main>
<footer><div class="in">
  <div style="display:grid;gap:14px"><a class="logo" href="/" aria-label="Stillgrün Startseite">${LOGO_NEG}</a><p style="color:#C7D0CA">Verlässliche Grab- und Urnenpflege mit Fotobericht in Frankfurt am Main.</p></div>
  <div style="display:grid;gap:6px;align-content:start"><b>Angebot</b><a href="/grabpflege-frankfurt/">Grabpflege in Frankfurt</a><a href="/urnenpflege-frankfurt/">Urnenpflege in Frankfurt</a><a href="/grabpflege-kosten/">Grabpflege Kosten</a><a href="/#faq">Häufige Fragen</a><a href="/#kontakt">Kontakt</a></div>
  <div style="display:grid;gap:6px;align-content:start"><b>Rechtliches</b><a href="/impressum/">Impressum</a><a href="/datenschutz/">Datenschutz</a><a href="/agb/">AGB</a><a href="/widerrufsbelehrung/">Widerrufsbelehrung</a><a href="/vertraege-kuendigen/">Verträge hier kündigen</a><a href="/vertrag-widerrufen/">Vertrag widerrufen</a></div>
  <small>© ${new Date().getFullYear()} ${esc(site.fullName)} · ${esc(site.owner)} · Gemäß § 19 UStG wird keine Umsatzsteuer berechnet. Texte und Grafiken mit KI-Unterstützung erstellt und von der Inhaberin geprüft, Fotos echt (<a href="/impressum/#ki" style="color:inherit">KI-Hinweis</a>).</small>
</div></footer>
<a class="wa" href="https://wa.me/${site.phoneIntl.replace('+', '')}" rel="noopener" target="_blank" aria-label="Per WhatsApp schreiben"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>WhatsApp</a>
<script src="/js/site.js?v=${layout.version}" defer></script>
</body>
</html>`;
}
layout.version = '3';

module.exports = { layout, esc };
