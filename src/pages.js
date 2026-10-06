const fs = require('fs');
const path = require('path');
const { layout, esc } = require('./layout');
const { site, prices, eur } = require('./data');
const legal = require('./legal');

const P = prices;
const ZEICHEN = fs.readFileSync(path.join(__dirname, 'svg', 'stillgruen-zeichen-negativ.svg'), 'utf8')
  .replace(/<\?xml[^>]*>/, '').replace(/<metadata>[\s\S]*?<\/metadata>/g, '').replace(/<title>[\s\S]*?<\/title>/g, '').replace(/ xmlns:c2pa="[^"]*"/g, '')
  .replace('<svg ', '<svg aria-hidden="true" width="34" height="34" ').trim();
const HOME = fs.readFileSync(path.join(__dirname, 'home.html'), 'utf8').replace('%%ZEICHEN_NEG%%', ZEICHEN);

// ---------- Strukturierte Daten (schema.org) ----------
const ID = {
  biz: site.url + '/#business',
  web: site.url + '/#website',
  owner: site.url + '/#inhaberin',
};

const offer = (name, price, unit, desc) => ({
  '@type': 'Offer',
  name,
  description: desc,
  priceCurrency: 'EUR',
  price: String(price),
  priceSpecification: { '@type': 'UnitPriceSpecification', price: String(price), priceCurrency: 'EUR', unitText: unit, valueAddedTaxIncluded: false },
  areaServed: { '@type': 'City', name: 'Frankfurt am Main' },
  seller: { '@id': ID.biz },
});

const offerCatalog = {
  '@type': 'OfferCatalog',
  name: 'Grabpflege und Urnenpflege in Frankfurt am Main',
  itemListElement: [
    offer('Jahresabo Urnengrab', P.urne.jahr, 'MON', `Grabpflege Urnengrab, 2 Pflegebesuche pro Monat, 3 Wechselbepflanzungen, Winterabdeckung, Fotobericht. ${eur(P.urne.jahr * 12)} im Jahr.`),
    offer('Jahresabo Einzelgrab', P.einzel.jahr, 'MON', `Grabpflege Einzelgrab, 2 Pflegebesuche pro Monat, 3 Wechselbepflanzungen, Winterabdeckung, Fotobericht. ${eur(P.einzel.jahr * 12)} im Jahr.`),
    offer('Jahresabo Doppelgrab', P.doppel.jahr, 'MON', `Grabpflege Doppelgrab, 2 Pflegebesuche pro Monat, 3 Wechselbepflanzungen, Winterabdeckung, Fotobericht. ${eur(P.doppel.jahr * 12)} im Jahr.`),
    offer('Monatsabo Urnengrab', P.urne.monat, 'MON', 'Monatlich kündbar, 2 Pflegebesuche pro Monat, 1 Wechselbepflanzung, Winterabdeckung im November, Fotobericht.'),
    offer('Monatsabo Einzelgrab', P.einzel.monat, 'MON', 'Monatlich kündbar, 2 Pflegebesuche pro Monat, 1 Wechselbepflanzung, Winterabdeckung im November, Fotobericht.'),
    offer('Monatsabo Doppelgrab', P.doppel.monat, 'MON', 'Monatlich kündbar, 2 Pflegebesuche pro Monat, 1 Wechselbepflanzung, Winterabdeckung im November, Fotobericht.'),
  ],
};

const business = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': ID.biz,
  name: site.fullName,
  alternateName: ['Stillgrün', 'Stillgruen Grabpflege'],
  description: 'Grabpflege und Urnenpflege in Frankfurt am Main zum Festpreis: 2 Pflegebesuche im Monat, Wechselbepflanzung, Gießen, Winterabdeckung und ein Fotobericht nach jedem Besuch.',
  url: site.url + '/',
  logo: site.url + '/img/logo.png',
  image: [site.url + '/img/og-stillgruen.png', site.url + '/img/nachher.jpg'],
  telephone: site.phoneIntl,
  email: site.email,
  address: { '@type': 'PostalAddress', streetAddress: site.street, postalCode: site.zip, addressLocality: site.city, addressRegion: 'Hessen', addressCountry: 'DE' },
  areaServed: [{ '@type': 'City', name: 'Frankfurt am Main', sameAs: 'https://de.wikipedia.org/wiki/Frankfurt_am_Main' }],
  priceRange: `${P.urne.jahr}–${P.doppel.monat} € pro Monat`,
  currenciesAccepted: 'EUR',
  paymentAccepted: 'Rechnung, Lastschrift',
  founder: { '@id': ID.owner },
  foundingDate: site.founded,
  knowsAbout: ['Grabpflege', 'Urnenpflege', 'Grabbepflanzung', 'Wechselbepflanzung', 'Winterabdeckung', 'Gießdienst', 'Grabneuanlage', 'Friedhofsordnung Frankfurt'],
  hasOfferCatalog: offerCatalog,
};
const owner = { '@context': 'https://schema.org', '@type': 'Person', '@id': ID.owner, name: site.owner, jobTitle: 'Inhaberin', worksFor: { '@id': ID.biz } };
const website = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': ID.web, url: site.url + '/', name: site.fullName, inLanguage: 'de-DE', publisher: { '@id': ID.biz } };

const crumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: site.url + p })),
});
const faqSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })),
});
const service = (name, type, desc, p) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name,
  serviceType: type,
  description: desc,
  provider: { '@id': ID.biz },
  areaServed: { '@type': 'City', name: 'Frankfurt am Main' },
  offers: { '@type': 'AggregateOffer', priceCurrency: 'EUR', lowPrice: String(p[0]), highPrice: String(p[1]), offerCount: String(p[2]) },
  url: site.url + p[3],
});

// ---------- Bausteine ----------
const faqHtml = (faqs) => faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n');
const crumbHtml = (items) => `<nav class="crumbs" aria-label="Brotkrumen">${items.map(([n, p], i) => (i < items.length - 1 ? `<a href="${p}">${n}</a> › ` : `<span aria-current="page">${n}</span>`)).join('')}</nav>`;
const cta = (text = 'Kostenlos anfragen') => `<div class="ctas" style="margin-top:8px"><a class="btn primary" href="/#kontakt">${text}</a><a class="btn ghost" href="/#rechner">Preis berechnen</a></div>`;
const usthinweis = '<p class="fine">Alle Preise sind Endpreise. Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.</p>';

const priceTable = () => `<div class="tscroll"><table class="ptable">
<thead><tr><th>Leistung</th><th class="n">Urnengrab</th><th class="n">Einzelgrab</th><th class="n">Doppelgrab</th></tr></thead>
<tbody>
<tr><td><b>Jahresabo</b> pro Monat</td><td class="n">${eur(P.urne.jahr)}</td><td class="n">${eur(P.einzel.jahr)}</td><td class="n">${eur(P.doppel.jahr)}</td></tr>
<tr><td>Jahresabo pro Jahr (einmalige Zahlung)</td><td class="n">${eur(P.urne.jahr * 12)}</td><td class="n">${eur(P.einzel.jahr * 12)}</td><td class="n">${eur(P.doppel.jahr * 12)}</td></tr>
<tr><td><b>Monatsabo</b> pro Monat, monatlich kündbar</td><td class="n">${eur(P.urne.monat)}</td><td class="n">${eur(P.einzel.monat)}</td><td class="n">${eur(P.doppel.monat)}</td></tr>
<tr><td>Saisonpaket</td><td class="n">ab ${eur(Math.min(...P.urne.saison))}</td><td class="n">ab ${eur(Math.min(...P.einzel.saison))}</td><td class="n">ab ${eur(Math.min(...P.doppel.saison))}</td></tr>
<tr><td>Zusätzlicher Pflegebesuch</td><td class="n">${eur(P.urne.pflege)}</td><td class="n">${eur(P.einzel.pflege)}</td><td class="n">${eur(P.doppel.pflege)}</td></tr>
<tr><td>Zusätzliche Wechselbepflanzung inklusive Saisonpflanzen nach Wahl</td><td class="n">ab ${eur(P.urne.bepfl)}</td><td class="n">ab ${eur(P.einzel.bepfl)}</td><td class="n">ab ${eur(P.doppel.bepfl)}</td></tr>
<tr><td>Gestecke und Deko</td><td class="n" colspan="3">ab ${eur(P.gesteck)}</td></tr>
<tr><td>Urlaubs-Gießvertretung (2 Wochen)</td><td class="n" colspan="3">ab ${eur(P.giessUrlaub)}</td></tr>
<tr><td>Komplette Grabsteinreinigung</td><td class="n" colspan="3">Preis auf Anfrage</td></tr>
</tbody></table></div>`;

// ---------- Startseite ----------
const homeFaqs = [];
HOME.replace(/<details><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g, (_, q, a) => homeFaqs.push([q, a]));

function home() {
  return layout({
    title: 'Grabpflege Frankfurt – Festpreis & Fotobericht | Stillgrün',
    description: `Grabpflege und Urnenpflege in Frankfurt ab ${P.urne.jahr} € im Monat: 2 Besuche im Monat, Bepflanzung, Winterabdeckung und Fotos nach jedem Besuch.`,
    pathName: '/',
    body: HOME,
    schema: [business, owner, website, faqSchema(homeFaqs)],
  });
}

// ---------- Grabpflege Kosten ----------
const kostenFaqs = [
  ['Was kostet Grabpflege in Frankfurt im Monat?', `Bei Stillgrün kostet die Grabpflege im Jahresabo ${eur(P.urne.jahr)} für ein Urnengrab, ${eur(P.einzel.jahr)} für ein Einzelgrab und ${eur(P.doppel.jahr)} für ein Doppelgrab im Monat. Im monatlich kündbaren Monatsabo sind es ${eur(P.urne.monat)}, ${eur(P.einzel.monat)} und ${eur(P.doppel.monat)} im Monat.`],
  ['Was kostet Grabpflege im Jahr?', `Das Jahresabo kostet ${eur(P.urne.jahr * 12)} für ein Urnengrab, ${eur(P.einzel.jahr * 12)} für ein Einzelgrab und ${eur(P.doppel.jahr * 12)} für ein Doppelgrab im Jahr. Darin enthalten sind 24 Pflegebesuche, drei Wechselbepflanzungen mit Pflanzen, Gießen im Sommer, die Winterabdeckung und ein Fotobericht nach jedem Besuch.`],
  ['Sind die Pflanzen im Preis enthalten?', 'Ja. Saisonpflanzen, Erde, Dünger und die Entsorgung der alten Bepflanzung sind in den Abos enthalten. Es kommen keine Materialkosten dazu.'],
  ['Gibt es versteckte Kosten?', 'Nein. Sie erhalten vor Beginn einen Festpreis. Nur Leistungen, die Sie zusätzlich bestellen, etwa Gestecke oder eine Grabsteinreinigung, werden extra berechnet, und auch dafür nenne ich Ihnen vorher den Preis.'],
  ['Warum ist auf der Rechnung keine Umsatzsteuer ausgewiesen?', 'Stillgrün ist ein Kleinunternehmen nach § 19 UStG. Es wird keine Umsatzsteuer berechnet, der genannte Preis ist Ihr Endpreis.'],
  ['Wie bezahle ich die Grabpflege?', 'Per Rechnung oder Lastschrift. Das Monatsabo bezahlen Sie monatlich. Das Jahresabo und das Saisonpaket bezahlen Sie einmalig, der Betrag ist sofort fällig.'],
];
function kosten() {
  const items = [['Startseite', '/'], ['Grabpflege Kosten', '/grabpflege-kosten/']];
  const body = `<section><div class="in"><div class="prose">
${crumbHtml(items)}
<span class="eyebrow">Preise 2026</span>
<h1>Grabpflege Kosten in Frankfurt am Main</h1>
<p class="lead"><b>Kurz gesagt:</b> Grabpflege kostet bei Stillgrün im Jahresabo ${eur(P.urne.jahr)} (Urnengrab), ${eur(P.einzel.jahr)} (Einzelgrab) oder ${eur(P.doppel.jahr)} (Doppelgrab) im Monat. Das monatlich kündbare Monatsabo kostet ${eur(P.urne.monat)}, ${eur(P.einzel.monat)} oder ${eur(P.doppel.monat)} im Monat. Alle Preise sind Endpreise mit Pflanzen und Fotobericht.</p>
<h2>Alle Preise im Überblick</h2>
${priceTable()}
${usthinweis}
<h2>Wovon hängen die Kosten der Grabpflege ab?</h2>
<ul>
<li><b>Grabart und Größe:</b> Ein Urnengrab (${P.urne.size}) braucht weniger Zeit als ein Einzelgrab (${P.einzel.size}) oder ein Doppelgrab (${P.doppel.size}). Größere Grabstätten erhalten einen Festpreis nach Foto oder Aufmaß.</li>
<li><b>Paket:</b> Im Jahresabo zahlen Sie einmal für 12 Monate und erhalten den günstigsten Monatspreis. Das Monatsabo ist flexibler und monatlich kündbar.</li>
<li><b>Bepflanzung:</b> Das Jahresabo enthält drei Wechselbepflanzungen im Frühjahr, Sommer und Herbst, das Monatsabo eine.</li>
<li><b>Zustand des Grabes:</b> Ist ein Grab stark verwildert, berechne ich den ersten Einsatz einmalig nach Aufwand. Danach gilt der normale Abopreis.</li>
</ul>
<h2>Was ist im Preis enthalten?</h2>
<p>Bei jedem der zwei Besuche im Monat entferne ich Unkraut, räume Laub und Verblühtes ab, gieße, schneide zurück, lockere die Erde, halte die Kanten sauber und kehre Grabstein und Einfassung ab. Nach jedem Besuch erhalten Sie Fotos per WhatsApp oder E-Mail. Im Abo kommen Wechselbepflanzung mit Pflanzen, Erde und Dünger, die Entsorgung und die Winterabdeckung mit Tannengrün im November dazu.</p>
<h2>Rechenbeispiele</h2>
<ul>
<li><b>Einzelgrab im Jahresabo:</b> ${eur(P.einzel.jahr)} × 12 = ${eur(P.einzel.jahr * 12)} im Jahr, inklusive 24 Pflegebesuchen und drei Bepflanzungen.</li>
<li><b>Urnengrab im Monatsabo:</b> ${eur(P.urne.monat)} im Monat, monatlich kündbar.</li>
<li><b>Doppelgrab im Jahresabo mit Gesteck:</b> ${eur(P.doppel.jahr * 12)} plus ab ${eur(P.gesteck)} für Gestecke und Deko.</li>
</ul>
<p>Ihren genauen Preis sehen Sie sofort im <a href="/#rechner">Preisrechner</a>.</p>
<h2>Häufige Fragen zu den Kosten</h2>
<div>${faqHtml(kostenFaqs)}</div>
${cta()}
</div></div></section>`;
  return layout({
    title: `Grabpflege Kosten Frankfurt – ab ${P.urne.jahr} € im Monat | Stillgrün`,
    description: `Was kostet Grabpflege in Frankfurt? Jahresabo ${P.urne.jahr}/${P.einzel.jahr}/${P.doppel.jahr} € im Monat, Monatsabo ab ${P.urne.monat} €. Endpreise mit Pflanzen und Fotobericht.`,
    pathName: '/grabpflege-kosten/',
    body,
    schema: [business, crumbs(items), faqSchema(kostenFaqs), service('Grabpflege in Frankfurt am Main', 'Grabpflege', 'Grabpflege zum Festpreis mit Fotobericht', [P.urne.jahr, P.doppel.monat, 6, '/grabpflege-kosten/'])],
  });
}

// ---------- Grabpflege Frankfurt ----------
const ffmFaqs = [
  ['Wer pflegt Gräber in Frankfurt am Main?', 'Stillgrün pflegt Gräber und Urnengräber in Frankfurt am Main. Inhaberin Kerstin Leichtweiß kommt 2x im Monat zum Grab und schickt nach jedem Besuch Fotos.'],
  ['Auf welchen Friedhöfen arbeiten Sie?', 'Auf Friedhöfen in Frankfurt am Main. Nennen Sie mir in Ihrer Anfrage den Friedhof, ich sage Ihnen sofort, ob ich ihn betreue.'],
  ['Muss ich in Frankfurt wohnen?', 'Nein. Viele Angehörige wohnen weit weg. Sie nennen mir die Lage des Grabes, also Feld und Nummer, und sehen das Ergebnis auf den Fotos.'],
  ['Halten Sie sich an die Friedhofsordnung?', 'Ja. Ich arbeite nach der Friedhofsordnung der Stadt Frankfurt am Main, zum Beispiel bei Pflanzenhöhe, Einfassung und Abfallentsorgung.'],
  ['Wie schnell kann die Pflege beginnen?', 'Nach Ihrer Anfrage erhalten Sie einen Festpreis. Sobald Sie zugesagt und bezahlt haben, plane ich den ersten Besuch ein und schicke Ihnen Fotos vom Ausgangszustand.'],
];
function frankfurt() {
  const items = [['Startseite', '/'], ['Grabpflege Frankfurt', '/grabpflege-frankfurt/']];
  const body = `<section><div class="in"><div class="prose">
${crumbHtml(items)}
<span class="eyebrow">Frankfurt am Main</span>
<h1>Grabpflege in Frankfurt am Main</h1>
<p class="lead">Stillgrün pflegt Gräber in Frankfurt am Main zum Festpreis. Ich komme 2x im Monat zum Grab, pflanze nach der Jahreszeit, gieße im Sommer, decke im Winter ab und schicke Ihnen nach jedem Besuch Fotos.</p>
<h2>Für wen ist die Grabpflege?</h2>
<p>Für Angehörige, die weiter weg wohnen, wenig Zeit haben oder die Pflege körperlich nicht mehr schaffen. Sie müssen nicht vor Ort sein: Die Lage des Grabes genügt, alles Weitere klären wir am Telefon oder per E-Mail.</p>
<h2>Das ist in der Grabpflege enthalten</h2>
<ul>
<li>2 Pflegebesuche im Monat mit Unkraut entfernen, Laub abräumen, Gießen, Rückschnitt und sauberen Kanten</li>
<li>Wechselbepflanzung mit Saisonpflanzen, im Jahresabo dreimal im Jahr, im Monatsabo einmal</li>
<li>Gießen im Sommer, im Jahresabo mit zusätzlichen Gießgängen von Mai bis September</li>
<li>Winterabdeckung mit Tannengrün im November</li>
<li>Fotobericht nach jedem Besuch per WhatsApp oder E-Mail</li>
</ul>
<p>Die ausführliche Liste finden Sie unter <a href="/#leistungen">Leistungen</a>, alle Preise unter <a href="/grabpflege-kosten/">Grabpflege Kosten</a>.</p>
<h2>Preise für Grabpflege in Frankfurt</h2>
<p>Das Jahresabo kostet ${eur(P.urne.jahr)} für ein Urnengrab, ${eur(P.einzel.jahr)} für ein Einzelgrab und ${eur(P.doppel.jahr)} für ein Doppelgrab im Monat. Das Monatsabo ist monatlich kündbar und kostet ${eur(P.urne.monat)}, ${eur(P.einzel.monat)} oder ${eur(P.doppel.monat)} im Monat.</p>
${usthinweis}
<h2>So läuft es ab</h2>
<ol>
<li><b>Anfragen:</b> über das Formular, per E-Mail oder WhatsApp.</li>
<li><b>Festpreis erhalten:</b> Sie bekommen ein verbindliches Angebot.</li>
<li><b>Zusagen und bezahlen:</b> Damit ist Ihr Auftrag fest eingeplant.</li>
<li><b>Erster Besuch und Pflege:</b> Sie erhalten Fotos vom Ausgangszustand und danach von jedem Besuch.</li>
</ol>
<h2>Häufige Fragen zur Grabpflege in Frankfurt</h2>
<div>${faqHtml(ffmFaqs)}</div>
${cta()}
</div></div></section>`;
  return layout({
    title: 'Grabpflege in Frankfurt am Main | Stillgrün',
    description: 'Grabpflege in Frankfurt am Main: 2 Besuche im Monat, Bepflanzung, Gießen, Winterabdeckung und Fotos nach jedem Besuch. Zum Festpreis, ohne lange Bindung.',
    pathName: '/grabpflege-frankfurt/',
    body,
    schema: [business, crumbs(items), faqSchema(ffmFaqs), service('Grabpflege in Frankfurt am Main', 'Grabpflege', 'Regelmäßige Grabpflege mit Bepflanzung und Fotobericht', [P.urne.jahr, P.doppel.monat, 6, '/grabpflege-frankfurt/'])],
  });
}

// ---------- Urnenpflege Frankfurt ----------
const urneFaqs = [
  ['Was kostet die Pflege eines Urnengrabes in Frankfurt?', `Im Jahresabo kostet die Urnengrabpflege ${eur(P.urne.jahr)} im Monat, also ${eur(P.urne.jahr * 12)} im Jahr. Das monatlich kündbare Monatsabo kostet ${eur(P.urne.monat)} im Monat. Pflanzen und Fotobericht sind enthalten.`],
  ['Kann man jedes Urnengrab pflegen lassen?', 'Pflegen lässt sich ein Urnenwahlgrab oder Urnenreihengrab mit eigener Pflanzfläche. Bei Urnengemeinschaftsanlagen, Rasengräbern oder Baumgräbern übernimmt meist der Friedhof die Pflege. Dort ist oft nur Grabschmuck an einer Ablagestelle erlaubt.'],
  ['Wie groß ist ein Urnengrab?', `Meist ${P.urne.size}. Ist Ihr Urnengrab größer, ordne ich es nach einem Foto als Einzelgrab ein.`],
  ['Pflegen Sie auch Urnenwände?', 'An Urnenwänden und Kolumbarien gibt es keine Pflanzfläche. Hier kann ich nach Absprache Gestecke und Deko bringen, soweit der Friedhof das erlaubt.'],
];
function urne() {
  const items = [['Startseite', '/'], ['Urnenpflege Frankfurt', '/urnenpflege-frankfurt/']];
  const body = `<section><div class="in"><div class="prose">
${crumbHtml(items)}
<span class="eyebrow">Urnengrab pflegen lassen</span>
<h1>Urnenpflege in Frankfurt am Main</h1>
<p class="lead">Ein Urnengrab ist klein, braucht aber genauso regelmäßige Pflege. Stillgrün pflegt Urnengräber in Frankfurt am Main ab ${eur(P.urne.jahr)} im Monat, mit 2 Besuchen im Monat und Fotos nach jedem Besuch.</p>
<h2>Was gehört zur Urnengrabpflege?</h2>
<ul>
<li>Unkraut entfernen, Laub und Verblühtes abräumen, Kanten sauber halten</li>
<li>Gießen, bei Hitze nach Wetterlage häufiger</li>
<li>Wechselbepflanzung mit Saisonpflanzen, Pflanzen inklusive</li>
<li>Grabplatte oder Stein abkehren</li>
<li>Winterabdeckung mit Tannengrün im November</li>
<li>Fotobericht nach jedem Besuch</li>
</ul>
<h2>Preise für die Urnenpflege</h2>
<div class="tscroll"><table class="ptable"><tbody>
<tr><td>Jahresabo Urnengrab</td><td class="n">${eur(P.urne.jahr)} im Monat · ${eur(P.urne.jahr * 12)} im Jahr</td></tr>
<tr><td>Monatsabo Urnengrab, monatlich kündbar</td><td class="n">${eur(P.urne.monat)} im Monat</td></tr>
<tr><td>Saisonpaket Urnengrab</td><td class="n">ab ${eur(Math.min(...P.urne.saison))}</td></tr>
<tr><td>Zusätzlicher Pflegebesuch</td><td class="n">${eur(P.urne.pflege)}</td></tr>
<tr><td>Gestecke und Deko</td><td class="n">ab ${eur(P.gesteck)}</td></tr>
</tbody></table></div>
${usthinweis}
<h2>Welche Urnengräber kann ich pflegen lassen?</h2>
<p>Pflegen lassen sich Urnengräber mit eigener Pflanzfläche, also Urnenwahlgräber und Urnenreihengräber. Bei Gemeinschaftsanlagen, Rasen- und Baumgräbern kümmert sich in der Regel der Friedhof selbst um die Fläche. Dort bringe ich auf Wunsch Gestecke und Deko an die vorgesehene Ablagestelle.</p>
<h2>Häufige Fragen zur Urnenpflege</h2>
<div>${faqHtml(urneFaqs)}</div>
${cta()}
</div></div></section>`;
  return layout({
    title: `Urnenpflege Frankfurt ab ${P.urne.jahr} € im Monat | Stillgrün`,
    description: `Urnengrab in Frankfurt pflegen lassen: ${eur(P.urne.jahr)} im Monat im Jahresabo, Monatsabo ${eur(P.urne.monat)}. 2 Besuche im Monat, Bepflanzung, Winterabdeckung und Fotobericht.`.replace(/ /g, ' '),
    pathName: '/urnenpflege-frankfurt/',
    body,
    schema: [business, crumbs(items), faqSchema(urneFaqs), service('Urnenpflege in Frankfurt am Main', 'Urnengrabpflege', 'Pflege von Urnengräbern mit Bepflanzung und Fotobericht', [P.urne.jahr, P.urne.monat, 2, '/urnenpflege-frankfurt/'])],
  });
}

// ---------- Rechtliches ----------
function impressum() {
  const body = `<section><div class="in"><div class="prose">
<h1>Impressum</h1>
<h2>Angaben gemäß § 5 DDG</h2>
<p>${esc(site.fullName)}<br>Inhaberin: ${esc(site.owner)}<br>${esc(site.street)}<br>${esc(site.zip)} ${esc(site.city)}</p>
<h2>Kontakt</h2>
<p>Telefon: <a href="tel:${site.phoneIntl}">${esc(site.phone)}</a><br>E-Mail: <a href="mailto:${site.email}">${esc(site.email)}</a></p>
<h2>Umsatzsteuer</h2>
<p>Kleinunternehmerin gemäß § 19 UStG. Es wird keine Umsatzsteuer berechnet und daher keine Umsatzsteuer-Identifikationsnummer angegeben.</p>
<h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
<p>${esc(site.owner)}, Anschrift wie oben.</p>
<h2>Verbraucherstreitbeilegung</h2>
<p>Ich bin nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
<h2>Haftung für Links</h2>
<p>Für die Inhalte verlinkter externer Seiten sind ausschließlich deren Betreiber verantwortlich. Bei Bekanntwerden von Rechtsverletzungen entferne ich solche Links umgehend.</p>
<h2>Bildnachweis</h2>
<p>Alle Fotos: ${esc(site.owner)}. Logo und Grafiken: ${esc(site.fullName)}.</p>
${legal.kiHinweis}
</div></div></section>`;
  return layout({ title: 'Impressum | Stillgrün', description: 'Impressum von Stillgrün – Grab- und Urnenpflege in Frankfurt am Main.', pathName: '/impressum/', body, noindex: false, schema: [] });
}

function datenschutz() {
  const body = `<section><div class="in"><div class="prose">
<h1>Datenschutzerklärung</h1>
<p>Der Schutz Ihrer Daten ist mir wichtig. Hier erfahren Sie, welche Daten beim Besuch dieser Website und bei einer Zusammenarbeit verarbeitet werden, wozu und wie lange.</p>

<h2>1. Verantwortliche</h2>
<p>${esc(site.owner)}, ${esc(site.fullName)}, ${esc(site.street)}, ${esc(site.zip)} ${esc(site.city)}<br>E-Mail: <a href="mailto:${site.email}">${esc(site.email)}</a>, Telefon: ${esc(site.phone)}</p>
<p>Eine Datenschutzbeauftragte oder einen Datenschutzbeauftragten muss ich nicht benennen.</p>

<h2>2. Hosting, Server-Logdateien und Sicherheit</h2>
<p>Diese Website, die Datenbank und das E-Mail-Postfach werden bei Hostinger International Ltd., 61 Lordou Vironos Street, 6023 Larnaka, Zypern, betrieben. Mit Hostinger besteht ein Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO. Zur schnellen und sicheren Auslieferung nutzt Hostinger ein Content Delivery Network (CDN) und einen Schutz vor Schadsoftware.</p>
<p>Beim Aufruf der Seiten verarbeitet der Server technisch notwendige Daten: IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browser und Betriebssystem sowie die zuvor besuchte Seite. Das ist für die Auslieferung der Website und für ihren sicheren Betrieb erforderlich (Art. 6 Abs. 1 lit. f DSGVO, berechtigtes Interesse an einer funktionierenden und sicheren Website). Die Logdateien werden nach spätestens 30 Tagen gelöscht, sofern der Hoster keine kürzere Frist vorsieht.</p>
<p>Die Verbindung ist mit TLS (https) verschlüsselt.</p>

<h2>3. Anfrageformular, E-Mail, Telefon</h2>
<p>Wenn Sie mir über das Formular, per E-Mail oder Telefon schreiben, verarbeite ich Ihre Angaben (Name, E-Mail, auf Wunsch Telefon, Friedhof, Grabart, gewünschte Leistung und Nachricht), um Ihre Anfrage zu beantworten und Ihnen ein Angebot zu machen (Art. 6 Abs. 1 lit. b DSGVO, vorvertragliche Maßnahmen). Pflichtfelder sind Name und E-Mail, ohne sie kann ich nicht antworten.</p>
<p>Die Anfragen werden in einer Datenbank bei Hostinger gespeichert und per E-Mail an mich weitergeleitet. Kommt kein Auftrag zustande, lösche ich die Daten spätestens 6 Monate nach dem letzten Kontakt.</p>
<p>Zum Schutz vor Missbrauch wird die IP-Adresse kurzzeitig im Arbeitsspeicher gehalten, um zu viele Anfragen in kurzer Zeit zu begrenzen (Art. 6 Abs. 1 lit. f DSGVO). Sie wird nicht gespeichert.</p>

<h2>4. Kündigung und Widerruf über die Website</h2>
<p>Nutzen Sie die Schaltflächen „Verträge hier kündigen“ oder „Vertrag widerrufen“, verarbeite ich Ihre Angaben, um Ihre Erklärung zu bearbeiten und Ihnen den Eingang per E-Mail zu bestätigen (Art. 6 Abs. 1 lit. c DSGVO in Verbindung mit § 312k und § 356a BGB). Die Erklärung bewahre ich als Nachweis bis zum Ablauf der gesetzlichen Verjährungsfrist von drei Jahren auf.</p>

<h2>5. Durchführung des Auftrags</h2>
<p>Für einen Pflegeauftrag verarbeite ich Ihre Kontaktdaten, Rechnungsanschrift, die Angaben zum Grab und die Zahlungsdaten (Art. 6 Abs. 1 lit. b DSGVO). Bei Zahlung per SEPA-Lastschrift gebe ich Kontoinhaber, IBAN und Betrag an meine Bank weiter. Rechnungen und Buchungsbelege bewahre ich nach den steuer- und handelsrechtlichen Vorschriften auf (Art. 6 Abs. 1 lit. c DSGVO, § 147 AO, je nach Unterlage 6, 8 oder 10 Jahre).</p>
<p><b>Fotobericht:</b> Nach jedem Besuch fotografiere ich das Grab und schicke Ihnen die Fotos. Die Fotos zeigen nur das Grab. Auf dem Grabstein stehen in der Regel Namen und Daten der verstorbenen Person. Diese sind nach der DSGVO nicht geschützt, ich gehe aber trotzdem vertraulich damit um. Die Fotos lösche ich spätestens 12 Monate nach Vertragsende. Für Werbung verwende ich Fotos nur mit Ihrer ausdrücklichen Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) und ohne lesbare Namen.</p>

<h2>6. WhatsApp</h2>
<p>Der WhatsApp-Knopf ist ein einfacher Link. Erst wenn Sie ihn anklicken, öffnet sich WhatsApp, ein Dienst der WhatsApp Ireland Limited, Merrion Road, Dublin 4, Irland. Dabei können Daten auch an die Muttergesellschaft Meta Platforms Inc. in den USA übermittelt werden. Die USA verfügen mit dem EU-US Data Privacy Framework über einen Angemessenheitsbeschluss der EU-Kommission. Fotoberichte schicke ich per WhatsApp nur, wenn Sie das ausdrücklich wünschen (Art. 6 Abs. 1 lit. a DSGVO). Andernfalls erhalten Sie die Fotos per E-Mail.</p>

<h2>7. Keine Cookies, kein Tracking, keine KI-Dienste</h2>
<p>Diese Website setzt keine Cookies und verwendet keine Analyse-, Werbe- oder Social-Media-Dienste. Schriften und Bilder werden vom eigenen Server geladen, es werden keine Daten an Google Fonts oder ähnliche Dienste übertragen.</p>
<p>Wenn Sie die Schaltfläche „A+“ (Schrift vergrößern) nutzen, wird diese Einstellung nur in Ihrem Browser gespeichert (Local Storage). Sie wird nicht an mich übertragen. Die Speicherung ist für diese von Ihnen gewünschte Funktion unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Sie können sie jederzeit in Ihrem Browser löschen.</p>
<p>Ihre Daten werden nicht mit KI-Diensten verarbeitet, und es findet keine automatisierte Entscheidungsfindung oder Profilbildung statt (Art. 22 DSGVO). Mehr zum Einsatz von KI bei der Erstellung dieser Website steht im <a href="/impressum/#ki">Impressum</a>.</p>

<h2>8. Empfänger</h2>
<p>Ihre Daten erhalten nur, soweit nötig: Hostinger als Auftragsverarbeiter (Hosting, Datenbank, E-Mail), meine Bank (Zahlungen), meine Steuerberatung (Buchhaltung) sowie Behörden, wenn ich gesetzlich dazu verpflichtet bin. Ich verkaufe keine Daten und gebe sie nicht zu Werbezwecken weiter.</p>

<h2>9. Ihre Rechte</h2>
<p>Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18) und Datenübertragbarkeit (Art. 20). Eine Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen (Art. 7 Abs. 3). Eine kurze E-Mail an <a href="mailto:${site.email}">${esc(site.email)}</a> genügt.</p>
<p><b>Widerspruchsrecht (Art. 21 DSGVO):</b> Verarbeite ich Daten auf Grundlage eines berechtigten Interesses, können Sie dem aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit widersprechen.</p>
<p>Sie können sich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel beim Hessischen Beauftragten für Datenschutz und Informationsfreiheit, Postfach 3163, 65021 Wiesbaden, <a href="https://datenschutz.hessen.de" rel="noopener">datenschutz.hessen.de</a>.</p>
<p class="fine">Stand: Oktober 2026</p>
</div></div></section>`;
  return layout({ title: 'Datenschutzerklärung | Stillgrün', description: 'Datenschutzerklärung von Stillgrün – Grab- und Urnenpflege in Frankfurt am Main.', pathName: '/datenschutz/', body, schema: [] });
}

function notFound() {
  const body = `<section><div class="in"><div class="prose">
<h1>Diese Seite gibt es nicht</h1>
<p>Vielleicht hilft Ihnen einer dieser Links weiter:</p>
<ul><li><a href="/">Startseite</a></li><li><a href="/grabpflege-kosten/">Grabpflege Kosten</a></li><li><a href="/grabpflege-frankfurt/">Grabpflege in Frankfurt</a></li><li><a href="/urnenpflege-frankfurt/">Urnenpflege in Frankfurt</a></li></ul>
</div></div></section>`;
  return layout({ title: 'Seite nicht gefunden | Stillgrün', description: 'Diese Seite wurde nicht gefunden.', pathName: '/404', body, noindex: true });
}

const PAGES = {
  '/': { render: home, priority: '1.0' },
  '/grabpflege-kosten/': { render: kosten, priority: '0.9' },
  '/grabpflege-frankfurt/': { render: frankfurt, priority: '0.9' },
  '/urnenpflege-frankfurt/': { render: urne, priority: '0.9' },
  '/impressum/': { render: impressum, priority: '0.2' },
  '/datenschutz/': { render: datenschutz, priority: '0.2' },
  '/agb/': { render: legal.agb, priority: '0.2' },
  '/widerrufsbelehrung/': { render: legal.widerrufsbelehrung, priority: '0.2' },
  '/vertraege-kuendigen/': { render: () => legal.erklaerungForm('kuendigung'), priority: '0.1' },
  '/vertrag-widerrufen/': { render: () => legal.erklaerungForm('widerruf'), priority: '0.1' },
};

module.exports = { PAGES, notFound };
