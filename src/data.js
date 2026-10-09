// Zentrale Firmendaten und Preise. Preise nur hier ändern, alle Seiten lesen sie von hier.
const site = {
  name: 'Stillgrün',
  fullName: 'Stillgrün – Grab- und Urnenpflege',
  owner: 'Kerstin Leichtweiß',
  street: 'Dottenfeldstr. 22',
  zip: '65936',
  city: 'Frankfurt am Main',
  district: 'Sossenheim',
  phone: '0151 43168278',
  phoneIntl: '+4915143168278',
  email: 'kontakt@stillgrün.de',
  // Gleiche Adresse in Computerschreibweise, für mailto-Links und strukturierte Daten (funktioniert in jedem E-Mail-Programm).
  emailAscii: 'kontakt@xn--stillgrn-d6a.de',
  // Hauptdomain mit Umlaut. Für Links und Suchmaschinen wird die Punycode-Form genutzt.
  domain: 'stillgrün.de',
  url: process.env.SITE_URL || 'https://www.xn--stillgrn-d6a.de',
  founded: '2026',
};

const prices = {
  urne:   { label: 'Urnengrab',  size: 'bis etwa 1 m²',   jahr: 35, monat: 39, saison: [109, 159, 139], pflege: 29, bepfl: 39 },
  einzel: { label: 'Einzelgrab', size: 'bis etwa 2,5 m²', jahr: 45, monat: 49, saison: [139, 199, 179], pflege: 35, bepfl: 49 },
  doppel: { label: 'Doppelgrab', size: 'bis etwa 5 m²',   jahr: 59, monat: 62, saison: [179, 259, 239], pflege: 45, bepfl: 69 },
  gesteck: 45,
  giessUrlaub: 59,
};

// Google Analytics und Google Ads: bleiben aus, bis die IDs bei Hostinger als Umgebungsvariablen eingetragen sind.
// Sobald eine ID gesetzt ist, erscheint das Einwilligungs-Banner. Ohne Einwilligung wird nichts von Google geladen.
const tracking = {
  ga: (process.env.GA_ID || '').trim(),          // z. B. G-XXXXXXXXXX
  ads: (process.env.GOOGLE_ADS_ID || '').trim(), // z. B. AW-123456789
  adsLabel: (process.env.GOOGLE_ADS_LABEL || '').trim(), // Conversion-Label „Anfrage gesendet“, z. B. AbCdEfGhIj
};
tracking.enabled = !!(tracking.ga || tracking.ads);

const eur = (v) => v.toLocaleString('de-DE') + ' €';

module.exports = { site, prices, eur, tracking };
