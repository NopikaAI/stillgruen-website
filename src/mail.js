// Schickt jede neue Anfrage per E-Mail an Stillgrün (SMTP von Hostinger).
const nodemailer = require('nodemailer');

let transport = null;
function getTransport() {
  if (transport || !process.env.SMTP_HOST) return transport;
  const port = Number(process.env.SMTP_PORT || 465);
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  return transport;
}

async function notify(a) {
  const t = getTransport();
  if (!t) return false;
  const to = process.env.MAIL_TO || process.env.SMTP_USER;
  const text = [
    'Neue Anfrage über stillgrün.de',
    '',
    `Name: ${a.name}`,
    `E-Mail: ${a.email}`,
    `Telefon: ${a.telefon || '-'}`,
    `Friedhof: ${a.friedhof || '-'}`,
    `Grabart: ${a.grabart}`,
    `Leistung: ${a.leistung}`,
    '',
    'Nachricht:',
    a.nachricht || '-',
  ].join('\n');
  await t.sendMail({
    from: `"Stillgrün Website" <${process.env.SMTP_USER}>`,
    to,
    replyTo: `"${a.name.replace(/"/g, '')}" <${a.email}>`,
    subject: `Neue Anfrage: ${a.leistung}, ${a.grabart} – ${a.name}`,
    text,
  });
  return true;
}

// Kündigung oder Widerruf: Nachricht an Stillgrün und Eingangsbestätigung an die Kundin oder den Kunden.
async function notifyErklaerung(k, e, rows) {
  const label = k.label;
  const t = getTransport();
  if (!t) return false;
  const to = process.env.MAIL_TO || process.env.SMTP_USER;
  const table = rows.map(([a, b]) => `${a}: ${b}`).join('\n');
  await t.sendMail({
    from: `"Stillgrün Website" <${process.env.SMTP_USER}>`,
    to,
    replyTo: `"${e.name.replace(/"/g, '')}" <${e.email}>`,
    subject: `${label} eingegangen – ${e.name}`,
    text: `${label} über stillgrün.de\n\n${table}`,
  });
  await t.sendMail({
    from: `"Stillgrün" <${process.env.SMTP_USER}>`,
    to: e.email,
    replyTo: to,
    subject: `Eingangsbestätigung ${k.gen}`,
    text: [
      `Guten Tag ${e.name},`,
      '',
      `hiermit bestätige ich den Eingang ${k.gen} mit folgendem Inhalt:`,
      '',
      table,
      '',
      'Bei Fragen antworten Sie einfach auf diese E-Mail.',
      '',
      'Freundliche Grüße',
      'Kerstin Leichtweiß',
      'Stillgrün – Grab- und Urnenpflege',
      'Dottenfeldstr. 22, 65936 Frankfurt am Main',
      'kontakt@stillgrün.de · www.stillgrün.de',
    ].join('\n'),
  });
  return true;
}

module.exports = { notify, notifyErklaerung };
