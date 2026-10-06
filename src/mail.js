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

module.exports = { notify };
