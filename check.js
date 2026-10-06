/**
 * Automatische Prüfung der Website.
 * Aufruf: npm run check   (der Server muss nicht laufen, er wird selbst gestartet)
 * Prüft: Erreichbarkeit, JavaScript-Fehler, interne Links, Titel und Beschreibung,
 * Überschriften, Bild-Alternativtexte, strukturierte Daten, Formular, Handy-Ansicht.
 */
const { chromium } = require('playwright');
const app = require('./server');
const { PAGES } = require('./src/pages');

const PORT = Number(process.env.CHECK_PORT || 3999);
const BASE = `http://127.0.0.1:${PORT}`;
const problems = [];
const warnings = [];
const fail = (p, m) => problems.push(`${p}: ${m}`);
const warn = (p, m) => warnings.push(`${p}: ${m}`);

(async () => {
  const server = app.listen(PORT);
  await new Promise((r) => server.once('listening', r));
  const browser = await chromium.launch();
  const paths = Object.keys(PAGES);
  const seenTitles = new Map();
  const seenDesc = new Map();

  for (const p of paths) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    page.on('requestfailed', (r) => errs.push('Datei fehlt: ' + r.url()));
    const res = await page.goto(BASE + p, { waitUntil: 'networkidle' });

    if (!res || res.status() !== 200) fail(p, `HTTP-Status ${res && res.status()}`);
    errs.forEach((e) => fail(p, e));

    const info = await page.evaluate(() => ({
      title: document.title,
      desc: document.querySelector('meta[name=description]')?.content || '',
      canonical: document.querySelector('link[rel=canonical]')?.href || '',
      h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
      headings: [...document.querySelectorAll('h1,h2,h3')].map((h) => Number(h.tagName[1])),
      imgsNoAlt: [...document.images].filter((i) => !i.alt).map((i) => i.currentSrc || i.src),
      links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
      ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
      lang: document.documentElement.lang,
      labels: [...document.querySelectorAll('input,select,textarea')].filter((el) => el.type !== 'hidden' && !el.closest('.hp') && !el.labels?.length && !el.getAttribute('aria-label')).map((el) => el.id || el.name),
    }));

    if (!info.title) fail(p, 'Kein Seitentitel');
    else if (info.title.length > 65) warn(p, `Titel ist ${info.title.length} Zeichen lang (Google zeigt etwa 60)`);
    if (!info.desc) fail(p, 'Keine Meta-Beschreibung');
    else if (info.desc.length > 165) warn(p, `Beschreibung ist ${info.desc.length} Zeichen lang`);
    if (seenTitles.has(info.title)) fail(p, `Gleicher Titel wie ${seenTitles.get(info.title)}`);
    seenTitles.set(info.title, p);
    if (seenDesc.has(info.desc)) fail(p, `Gleiche Beschreibung wie ${seenDesc.get(info.desc)}`);
    seenDesc.set(info.desc, p);
    if (info.lang !== 'de') fail(p, 'Sprache ist nicht auf Deutsch gesetzt');
    if (info.h1.length !== 1) fail(p, `${info.h1.length} H1-Überschriften, es sollte genau eine sein`);
    if (!info.canonical) fail(p, 'Keine Canonical-Adresse');
    info.imgsNoAlt.forEach((s) => fail(p, 'Bild ohne Alternativtext: ' + s));
    info.labels.forEach((l) => fail(p, 'Eingabefeld ohne Beschriftung: ' + l));
    for (let i = 1; i < info.headings.length; i++) {
      if (info.headings[i] - info.headings[i - 1] > 1) { warn(p, 'Überschriften-Ebene übersprungen'); break; }
    }
    info.ld.forEach((t) => { try { JSON.parse(t); } catch (e) { fail(p, 'Strukturierte Daten fehlerhaft: ' + e.message); } });

    // interne Links prüfen
    for (const href of [...new Set(info.links)]) {
      if (/^(https?:|mailto:|tel:)/.test(href)) continue;
      const [target, hash] = href.split('#');
      if (target && !PAGES[target] && !target.startsWith('/img') && !target.startsWith('/css')) fail(p, 'Link zeigt ins Leere: ' + href);
      if (hash) {
        const ok = await page.evaluate((h) => !!document.getElementById(h), hash);
        if (!ok && (!target || target === p)) fail(p, 'Sprungziel fehlt: #' + hash);
      }
    }

    // Handy-Ansicht: nichts darf seitlich herausragen
    await page.setViewportSize({ width: 360, height: 760 });
    await page.waitForTimeout(200);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (over > 1) fail(p, `Auf dem Handy ragt der Inhalt ${over}px über den Rand`);
    await page.close();
  }

  // Preisrechner und Formular auf der Startseite
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  for (const [grab, paket, erwartet] of [['einzel', 'jahr', '540'], ['urne', 'monat', '39'], ['doppel', 'jahr', '708']]) {
    await page.click(`.tabs button[data-g="${grab}"]`);
    await page.check('#p-' + paket, { force: true });
    const sum = (await page.textContent('#sum')).replace(/\D/g, '');
    if (sum !== erwartet) fail('/#rechner', `${grab}/${paket} zeigt ${sum} statt ${erwartet}`);
  }
  await page.fill('#n', 'Prüflauf');
  await page.fill('#e', 'pruefung@example.com');
  await page.check('#ds');
  await page.click('#form button[type=submit]');
  await page.waitForTimeout(800);
  const msg = await page.textContent('#ok');
  if (!/Vielen Dank/.test(msg || '')) fail('/#kontakt', 'Formular meldet: ' + msg);
  errs.forEach((e) => fail('/', e));
  await page.close();

  // Technische Dateien
  for (const [url, muss] of [['/robots.txt', 'Sitemap:'], ['/sitemap.xml', '<urlset'], ['/llms.txt', 'Grabpflege'], ['/site.webmanifest', 'Stillgrün'], ['/healthz', '"ok":true']]) {
    const r = await fetch(BASE + url);
    const t = await r.text();
    if (!r.ok || !t.includes(muss)) fail(url, 'Datei fehlt oder ist unvollständig');
  }
  const r404 = await fetch(BASE + '/gibtesnicht');
  if (r404.status !== 404) fail('/gibtesnicht', 'Fehlerseite liefert Status ' + r404.status);

  await browser.close();
  server.close();

  console.log('\n=== Prüfbericht Stillgrün ===');
  console.log(`Geprüfte Seiten: ${paths.length}`);
  if (warnings.length) { console.log('\nHinweise:'); warnings.forEach((w) => console.log('  - ' + w)); }
  if (problems.length) {
    console.log('\nFehler:');
    problems.forEach((p) => console.log('  - ' + p));
    process.exit(1);
  }
  console.log('\nKeine Fehler gefunden.');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
