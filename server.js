// Stillgrün Website – Node.js-Server für Hostinger
require('./src/env');
const path = require('path');
const fs = require('fs');
const express = require('express');
const compression = require('compression');
const { PAGES, notFound } = require('./src/pages');
const { site, prices } = require('./src/data');
const db = require('./src/db');
const mail = require('./src/mail');
const admin = require('./src/admin');
const legal = require('./src/legal');

const app = express();
const PORT = process.env.PORT || 3000;
const PROD = process.env.NODE_ENV === 'production';
const CANONICAL = new URL(site.url);

app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(compression());

// Sicherheits-Header
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
  });
  if (PROD) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Eine einzige Adresse für Suchmaschinen: https + www.stillgrün.de
app.use((req, res, next) => {
  if (process.env.FORCE_CANONICAL !== 'true') return next();
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0].toLowerCase();
  const proto = req.headers['x-forwarded-proto'] || req.protocol;
  if (host && (host !== CANONICAL.hostname || proto !== 'https')) {
    return res.redirect(301, site.url + req.originalUrl);
  }
  next();
});

// Seiten ohne Schrägstrich am Ende umleiten (/grabpflege-kosten -> /grabpflege-kosten/)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.endsWith('/') && PAGES[req.path + '/']) {
    const q = req.url.slice(req.path.length);
    return res.redirect(301, req.path + '/' + q);
  }
  next();
});

// Statische Dateien
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: PROD ? '30d' : 0,
  setHeaders: (res, file) => {
    if (/\.(woff2|png|jpg|webp|svg)$/.test(file)) res.set('Cache-Control', 'public, max-age=31536000, immutable');
  },
}));

// Client-Skript mit aktuellen Preisen
const clientJs = fs.readFileSync(path.join(__dirname, 'src', 'site.client.js'), 'utf8').replace('/*PRICES*/null', JSON.stringify(
  Object.fromEntries(['urne', 'einzel', 'doppel'].map((k) => [k, { m: prices[k].jahr, mo: prices[k].monat, s: prices[k].saison, pf: prices[k].pflege }])),
));
app.get('/js/site.js', (req, res) => {
  res.type('application/javascript').set('Cache-Control', PROD ? 'public, max-age=86400' : 'no-cache').send(clientJs);
});

// Seiten (einmal beim Start gerendert)
const rendered = Object.fromEntries(Object.entries(PAGES).map(([p, v]) => [p, v.render()]));
const page404 = notFound();
for (const p of Object.keys(PAGES)) {
  app.get(p, (req, res) => res.type('html').set('Cache-Control', 'public, max-age=600').send(rendered[p]));
}

// robots.txt: Suchmaschinen und KI-Suchdienste ausdrücklich erlaubt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

User-agent: Googlebot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

Sitemap: ${site.url}/sitemap.xml
`);
});

const lastmod = new Date().toISOString().slice(0, 10);
app.get('/sitemap.xml', (req, res) => {
  const urls = Object.entries(PAGES).map(([p, v]) => `  <url><loc>${site.url}${p}</loc><lastmod>${lastmod}</lastmod><priority>${v.priority}</priority></url>`).join('\n');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
});

app.get('/llms.txt', (req, res) => res.type('text/plain; charset=utf-8').send(require('./src/llms')()));

app.get('/site.webmanifest', (req, res) => {
  res.type('application/manifest+json').send(JSON.stringify({
    name: site.fullName, short_name: site.name, lang: 'de', start_url: '/', display: 'browser', background_color: '#FBFBF8', theme_color: '#6F9277',
    icons: [{ src: '/img/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/img/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  }));
});

// Gesundheitscheck für Hostinger
app.get('/healthz', async (req, res) => res.json({ ok: true, db: await db.ping() }));

// Kontaktformular
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > 5;
}
const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
const ALLOWED = {
  grabart: ['Urnengrab', 'Einzelgrab', 'Doppelgrab', 'Weiß ich nicht'],
  leistung: ['Jahresabo', 'Monatsabo', 'Saisonpaket', 'Einzelleistung', 'Erst einmal beraten lassen'],
};

app.post('/api/anfrage', express.json({ limit: '20kb' }), express.urlencoded({ extended: false, limit: '20kb' }), async (req, res) => {
  const b = req.body || {};
  const wantsJson = (req.headers.accept || '').includes('application/json');
  const done = (status, payload) => (wantsJson ? res.status(status).json(payload) : res.status(status).type('html').send(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Anfrage</title><link rel="stylesheet" href="/css/site.css"><main style="padding:40px 20px;max-width:640px;margin:auto"><h1>${payload.ok ? 'Vielen Dank' : 'Das hat nicht geklappt'}</h1><p>${payload.ok ? 'Ihre Anfrage ist angekommen. Ich melde mich innerhalb von 24 Stunden bei Ihnen.' : payload.error}</p><p><a href="/">Zurück zur Startseite</a></p></main>`,
  ));

  if (b.website) return done(200, { ok: true }); // Spam-Falle
  if (rateLimited(req.ip)) return done(429, { ok: false, error: 'Zu viele Anfragen in kurzer Zeit. Bitte versuchen Sie es später noch einmal.' });

  const a = {
    name: clip(b.name, 120),
    email: clip(b.email, 160),
    telefon: clip(b.telefon, 40),
    friedhof: clip(b.friedhof, 160),
    grabart: ALLOWED.grabart.includes(b.grabart) ? b.grabart : 'Weiß ich nicht',
    leistung: ALLOWED.leistung.includes(b.leistung) ? b.leistung : 'Erst einmal beraten lassen',
    nachricht: clip(b.nachricht, 3000),
  };
  if (!a.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)) return done(400, { ok: false, error: 'Bitte geben Sie Ihren Namen und eine gültige E-Mail-Adresse an.' });
  if (b.einwilligung !== 'ja' && b.einwilligung !== 'on' && b.einwilligung !== true) return done(400, { ok: false, error: 'Bitte bestätigen Sie die Einwilligung zur Speicherung Ihrer Angaben.' });

  let saved = false;
  let sent = false;
  try { saved = await db.saveAnfrage(a); } catch (e) { console.error('DB-Fehler:', e.message); }
  try { sent = await mail.notify(a); } catch (e) { console.error('Mail-Fehler:', e.message); }
  if (!saved && !sent) return done(503, { ok: false, error: 'Die Anfrage konnte gerade nicht gespeichert werden.' });
  done(200, { ok: true });
});

// Kündigung und Widerruf (§ 312k und § 356a BGB): ohne JavaScript, Bestätigungsseite plus E-Mail
app.post('/api/erklaerung', express.urlencoded({ extended: false, limit: '20kb' }), async (req, res) => {
  const b = req.body || {};
  const kind = b.art === 'widerruf' ? 'widerruf' : 'kuendigung';
  const k = legal.ERKL[kind];
  const fail = (status, msg) => res.status(status).type('html').send(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${k.label}</title><link rel="stylesheet" href="/css/site.css"><main style="padding:40px 20px;max-width:640px;margin:auto"><h1>Das hat nicht geklappt</h1><p>${msg}</p><p><a href="${k.path}">Zurück zum Formular</a> oder per E-Mail an <a href="mailto:${site.email}">${site.email}</a></p></main>`,
  );
  if (b.website) return res.redirect(303, k.path); // Spam-Falle
  if (rateLimited(req.ip)) return fail(429, 'Zu viele Anfragen in kurzer Zeit. Bitte versuchen Sie es später noch einmal.');
  const e = {
    zeit: new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin', dateStyle: 'long', timeStyle: 'medium' }) + ' Uhr',
    name: clip(b.name, 120),
    email: clip(b.email, 160),
    anschrift: clip(b.anschrift, 200),
    vertrag: legal.VERTRAG.includes(b.vertrag) ? b.vertrag : legal.VERTRAG[0],
    zuordnung: clip(b.zuordnung, 200),
    kuendigungsart: b.kuendigungsart === 'außerordentliche Kündigung aus wichtigem Grund' ? b.kuendigungsart : 'ordentliche Kündigung',
    zeitpunkt: b.zeitpunkt === 'Wunschtermin (bitte unten angeben)' ? b.zeitpunkt : 'nächstmöglichen Zeitpunkt',
    datum: clip(b.datum, 40),
    nachricht: clip(b.nachricht, 2000),
  };
  if (!e.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email)) return fail(400, 'Bitte geben Sie Ihren Namen und eine gültige E-Mail-Adresse an.');
  const rows = [
    ['Art', k.label], ['Eingegangen am', e.zeit], ['Name', e.name], ['E-Mail', e.email], ['Anschrift', e.anschrift || '-'],
    ['Vertrag', e.vertrag], ['Zuordnung', e.zuordnung || '-'],
    ...(kind === 'kuendigung' ? [['Art der Kündigung', e.kuendigungsart], ['Zeitpunkt', e.zeitpunkt]] : [['Vertrag geschlossen am', e.datum || '-']]),
    ['Nachricht', e.nachricht || '-'],
  ];
  let saved = false;
  let mailed = false;
  try {
    saved = await db.saveAnfrage({
      name: e.name, email: e.email, telefon: '', friedhof: e.zuordnung, grabart: '-',
      leistung: `${k.label}: ${e.vertrag}`, nachricht: rows.map(([x, y]) => `${x}: ${y}`).join('\n'),
    });
  } catch (err) { console.error('DB-Fehler:', err.message); }
  try { mailed = await mail.notifyErklaerung(k, e, rows); } catch (err) { console.error('Mail-Fehler:', err.message); }
  if (!saved && !mailed) return fail(503, `${k.nom} konnte gerade nicht gespeichert werden. Bitte schicken Sie sie per E-Mail.`);
  res.type('html').set('Cache-Control', 'no-store').send(legal.erklaerungDone(kind, e, mailed));
});

// Verwaltung der Anfragen (passwortgeschützt)
app.use('/admin', admin);

app.use((req, res) => res.status(404).type('html').send(page404));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).type('text/plain').send('Es ist ein Fehler aufgetreten.');
});

if (require.main === module) {
  db.init().catch((e) => console.error('Datenbank nicht verfügbar:', e.message)).finally(() => {
    app.listen(PORT, () => console.log(`Stillgrün läuft auf Port ${PORT}`));
  });
}

module.exports = app;
