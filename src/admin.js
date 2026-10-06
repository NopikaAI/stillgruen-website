// Einfache Anfragen-Übersicht unter /admin, geschützt per Benutzername und Passwort.
const express = require('express');
const crypto = require('crypto');
const db = require('./db');
const { esc } = require('./layout');

const router = express.Router();

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

router.use((req, res, next) => {
  const user = (process.env.ADMIN_USER || '').trim();
  const pass = (process.env.ADMIN_PASSWORD || '').trim();
  if (!user || !pass) return res.status(503).type('text/plain').send('Die Verwaltung ist noch nicht eingerichtet (ADMIN_USER und ADMIN_PASSWORD fehlen).');
  const h = req.headers.authorization || '';
  if (h.startsWith('Basic ')) {
    // Nur am ersten Doppelpunkt trennen, damit Passwörter mit ":" funktionieren.
    const raw = Buffer.from(h.slice(6), 'base64').toString('utf8');
    const i = raw.indexOf(':');
    const u = raw.slice(0, i).trim();
    const p = raw.slice(i + 1);
    if (i > 0 && safeEqual(u.toLowerCase(), user.toLowerCase()) && safeEqual(p, pass)) return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="Stillgruen", charset="UTF-8"').status(401).type('text/plain').send('Bitte anmelden.');
});

router.use(express.urlencoded({ extended: false, limit: '20kb' }));

const dt = (v) => new Date(v).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });

router.get('/', async (req, res) => {
  const rows = await db.list();
  const body = rows.length ? rows.map((r) => `<tr>
  <td>${esc(dt(r.erstellt_am))}</td>
  <td><b>${esc(r.name)}</b><br><a href="mailto:${esc(r.email)}">${esc(r.email)}</a>${r.telefon ? `<br><a href="tel:${esc(r.telefon)}">${esc(r.telefon)}</a>` : ''}</td>
  <td>${esc(r.leistung)}<br><small>${esc(r.grabart)}${r.friedhof ? ' · ' + esc(r.friedhof) : ''}</small></td>
  <td>${esc(r.nachricht || '')}</td>
  <td>${esc(r.status)}<form method="post" action="/admin/status"><input type="hidden" name="id" value="${esc(r.id)}"><button name="status" value="erledigt">erledigt</button> <button name="status" value="neu">neu</button></form></td>
</tr>`).join('\n') : '<tr><td colspan="5">Noch keine Anfragen.</td></tr>';
  res.type('html').send(`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Anfragen – Stillgrün</title>
<style>body{font:16px/1.5 system-ui,sans-serif;margin:0;padding:24px;background:#FBFBF8;color:#2E3B33}h1{font-size:1.4rem}table{border-collapse:collapse;width:100%;background:#fff;font-size:.92rem}th,td{border:1px solid #DDE1D7;padding:8px 10px;vertical-align:top;text-align:left}th{background:#F2F3EE}button{font:inherit;padding:4px 8px;margin-top:4px;cursor:pointer}form{display:inline}</style>
</head><body><h1>Anfragen (${rows.length})</h1>
<table><thead><tr><th>Datum</th><th>Kontakt</th><th>Wunsch</th><th>Nachricht</th><th>Status</th></tr></thead><tbody>${body}</tbody></table>
<p><a href="/">Zur Website</a></p></body></html>`);
});

router.post('/status', async (req, res) => {
  const status = req.body.status === 'erledigt' ? 'erledigt' : 'neu';
  await db.setStatus(Number(req.body.id), status).catch(() => {});
  res.redirect('/admin');
});

module.exports = router;
