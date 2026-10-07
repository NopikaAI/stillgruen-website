// AGB, Widerrufsbelehrung, Kündigungs- und Widerrufsfunktion (§ 312k und § 356a BGB) und KI-Hinweis.
const { layout, esc } = require('./layout');
const { site } = require('./data');

const STAND = 'Oktober 2026';
const addr = `${esc(site.fullName)}, Inhaberin ${esc(site.owner)}, ${esc(site.street)}, ${esc(site.zip)} ${esc(site.city)}, E-Mail: <a href="mailto:${site.emailAscii}">${esc(site.email)}</a>`;
const page = (title, h1, description, pathName, inner) => layout({
  title, description, pathName,
  body: `<section><div class="in"><div class="prose">\n<h1>${h1}</h1>\n${inner}\n</div></div></section>`,
});

// ---------- AGB ----------
function agb() {
  return page('AGB | Stillgrün', 'Allgemeine Geschäftsbedingungen', 'Allgemeine Geschäftsbedingungen von Stillgrün für Grabpflege und Urnenpflege in Frankfurt am Main.', '/agb/', `
<h2>1. Geltungsbereich</h2>
<p>Diese Bedingungen gelten für alle Verträge über Grabpflege, Urnenpflege und Einzelleistungen zwischen ${addr} (im Folgenden „Stillgrün“) und ihren Kundinnen und Kunden. Abweichende Bedingungen gelten nur, wenn Stillgrün ihnen in Textform zustimmt.</p>

<h2>2. Angebot und Vertragsschluss</h2>
<p>Die Darstellung der Leistungen und Preise auf der Website ist noch kein verbindliches Angebot. Eine Anfrage über das Formular, per E-Mail, Telefon oder WhatsApp ist unverbindlich und kostenlos. Stillgrün schickt daraufhin ein Angebot mit Festpreis in Textform (zum Beispiel per E-Mail). Der Vertrag kommt zustande, wenn Sie dieses Angebot in Textform annehmen. Den Vertragstext speichert Stillgrün nicht öffentlich zugänglich; Sie erhalten Angebot, Annahme und diese Bedingungen per E-Mail.</p>

<h2>3. Leistungen</h2>
<p>Der Umfang der Leistungen ergibt sich aus dem Angebot und der Leistungsbeschreibung auf der Website zum Zeitpunkt des Vertragsschlusses. Stillgrün erbringt die Leistungen persönlich und fachgerecht und richtet sich dabei nach der jeweiligen Friedhofssatzung. Nach jedem Pflegebesuch erhalten Sie einen Fotobericht per E-Mail oder auf Wunsch per WhatsApp.</p>
<p>Die Termine der Pflegebesuche legt Stillgrün innerhalb des vereinbarten Zeitraums selbst fest. Kann ein Besuch wegen Frost, Unwetter, Schließung des Friedhofs oder Anordnungen der Friedhofsverwaltung nicht stattfinden, wird er zeitnah nachgeholt.</p>
<p>Der erste Besuch am Grab mit Bestandsaufnahme und Fotos findet nach Eingang der ersten Zahlung statt. Ist das Grab bei Vertragsbeginn stark verwildert oder in einem anderen Zustand als beschrieben, kann Stillgrün den Mehraufwand für die erste Herrichtung nach vorheriger Absprache gesondert berechnen.</p>

<h2>4. Ihre Mitwirkung</h2>
<p>Sie versichern, dass Sie Nutzungsberechtigte oder Nutzungsberechtigter des Grabes sind oder von dieser Person beauftragt wurden. Bitte nennen Sie Friedhof und Lage des Grabes so genau wie möglich und teilen Sie Änderungen (zum Beispiel Arbeiten eines Steinmetzes) rechtzeitig mit. Gebühren und Genehmigungen der Friedhofsverwaltung sind nicht im Preis enthalten.</p>

<h2>5. Preise und Zahlung</h2>
<p>Es gelten die im Angebot genannten Festpreise. Alle Preise sind Endpreise. Gemäß § 19 UStG wird keine Umsatzsteuer berechnet. Pflanzen, Erde, Anfahrt in Frankfurt am Main und die Entsorgung von Grünschnitt sind in den Abos enthalten, soweit im Angebot nichts anderes steht.</p>
<p>Sie zahlen per Rechnung (Überweisung) oder per SEPA-Lastschrift.</p>
<ul>
<li><b>Jahresabo, Saisonpakete und Einzelleistungen:</b> Der Betrag ist einmalig mit Rechnungsstellung fällig.</li>
<li><b>Monatsabo:</b> Der Monatsbetrag ist jeweils zu Beginn des Monats fällig.</li>
</ul>
<p>Bei der SEPA-Lastschrift wird Ihnen der Einzugstermin spätestens einen Tag vorher mitgeteilt. Kosten einer Rücklastschrift, die Sie zu vertreten haben, tragen Sie.</p>

<h2>6. Laufzeit und Kündigung</h2>
<ul>
<li><b>Jahresabo „Stillgrün Jahr“:</b> Die Laufzeit beträgt 12 Monate ab dem vereinbarten Beginn. Danach verlängert sich der Vertrag auf unbestimmte Zeit und ist dann jederzeit mit einer Frist von einem Monat kündbar. Eine Kündigung zum Ende der ersten 12 Monate ist ebenfalls mit einer Frist von einem Monat möglich.</li>
<li><b>Monatsabo „Stillgrün Monat“:</b> Der Vertrag läuft auf unbestimmte Zeit und ist jederzeit zum Ende des laufenden Kalendermonats kündbar.</li>
<li><b>Saisonpakete und Einzelleistungen</b> enden mit ihrer Erbringung.</li>
</ul>
<p>Sie können per E-Mail, per Brief oder bequem über die Schaltfläche <a href="/vertraege-kuendigen/">„Verträge hier kündigen“</a> unten auf jeder Seite kündigen. Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.</p>
<p>Preisänderungen gelten nur für Verlängerungszeiträume. Stillgrün teilt sie mindestens sechs Wochen vorher in Textform mit. Sie können den Vertrag dann zum Zeitpunkt der Preisänderung kündigen.</p>

<h2>7. Pflanzen, Witterung und Schäden durch Dritte</h2>
<p>Pflanzen sind lebendig. Stillgrün wählt standortgerechte Pflanzen aus und pflegt sie fachgerecht. Für Ausfälle durch außergewöhnliche Witterung (zum Beispiel starken Frost oder lange Hitze trotz Gießens), Wildverbiss, Diebstahl, Vandalismus oder Arbeiten Dritter am Grab haftet Stillgrün nicht. Solche Schäden werden im Fotobericht dokumentiert; eine Nachpflanzung erfolgt nach Absprache gegen Berechnung der Pflanzen.</p>

<h2>8. Fotos</h2>
<p>Die Fotos für den Fotobericht zeigen ausschließlich das Grab. Für Werbezwecke, etwa auf der Website oder im Google-Profil, verwendet Stillgrün Fotos nur mit Ihrer ausdrücklichen Zustimmung und so, dass Namen auf dem Grabstein nicht lesbar sind.</p>

<h2>9. Haftung</h2>
<p>Stillgrün haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit. Bei leichter Fahrlässigkeit haftet Stillgrün nur bei Verletzung einer wesentlichen Vertragspflicht und begrenzt auf den vertragstypischen, vorhersehbaren Schaden. Ansprüche nach dem Produkthaftungsgesetz bleiben unberührt.</p>

<h2>10. Widerrufsrecht</h2>
<p>Verbraucherinnen und Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Einzelheiten finden Sie in der <a href="/widerrufsbelehrung/">Widerrufsbelehrung</a>. Widerrufen können Sie auch über die Schaltfläche <a href="/vertrag-widerrufen/">„Vertrag widerrufen“</a> unten auf jeder Seite.</p>

<h2>11. Streitbeilegung und Schlussbestimmungen</h2>
<p>Stillgrün ist nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen. Vertragssprache ist Deutsch. Es gilt deutsches Recht. Bei Verbraucherinnen und Verbrauchern gilt diese Rechtswahl nur, soweit dadurch nicht der Schutz durch zwingende Vorschriften des Staates entzogen wird, in dem sie ihren gewöhnlichen Aufenthalt haben. Sollte eine Bestimmung unwirksam sein, bleibt der Vertrag im Übrigen wirksam.</p>
<p class="fine">Stand: ${STAND}</p>`);
}

// ---------- Widerrufsbelehrung ----------
function widerrufsbelehrung() {
  return page('Widerrufsbelehrung | Stillgrün', 'Widerrufsbelehrung', 'Widerrufsbelehrung und Muster-Widerrufsformular von Stillgrün – Grab- und Urnenpflege in Frankfurt am Main.', '/widerrufsbelehrung/', `
<h2>Widerrufsrecht</h2>
<p>Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.</p>
<p>Um Ihr Widerrufsrecht auszuüben, müssen Sie mir (${addr}, Telefon ${esc(site.phone)}) mittels einer eindeutigen Erklärung (zum Beispiel ein mit der Post versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.</p>
<p>Sie können den Widerruf auch über die Widerrufsfunktion auf meiner Website erklären. Sie finden sie über die Schaltfläche <a href="/vertrag-widerrufen/">„Vertrag widerrufen“</a> unten auf jeder Seite. Nutzen Sie diese Möglichkeit, bestätige ich Ihnen den Eingang des Widerrufs unverzüglich per E-Mail, mit Inhalt, Datum und Uhrzeit Ihrer Erklärung.</p>
<p>Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.</p>

<h2>Folgen des Widerrufs</h2>
<p>Wenn Sie diesen Vertrag widerrufen, habe ich Ihnen alle Zahlungen, die ich von Ihnen erhalten habe, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei mir eingegangen ist. Für diese Rückzahlung verwende ich dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.</p>
<p>Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen sollen, so haben Sie mir einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie mich von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.</p>

<h2>Vorzeitiges Erlöschen</h2>
<p>Das Widerrufsrecht erlischt bei einem Vertrag über Dienstleistungen, wenn ich die Dienstleistung vollständig erbracht habe und mit der Ausführung erst begonnen habe, nachdem Sie dazu Ihre ausdrückliche Zustimmung gegeben haben und gleichzeitig Ihre Kenntnis davon bestätigt haben, dass Sie Ihr Widerrufsrecht bei vollständiger Vertragserfüllung verlieren.</p>

<h2>Widerruf online erklären</h2>
<p>Am einfachsten widerrufen Sie direkt hier auf der Website. Sie erhalten sofort eine Eingangsbestätigung per E-Mail.</p>
<p><a class="btn primary" href="/vertrag-widerrufen/">Vertrag widerrufen</a></p>

<h2>Muster-Widerrufsformular zum Ausdrucken</h2>
<p>Wenn Sie lieber per Brief oder E-Mail widerrufen möchten, können Sie dieses Formular ausdrucken, ausfüllen und an mich senden. Das Formular ist nicht vorgeschrieben.</p>
<div class="card muster">
<p>An ${esc(site.fullName)}, ${esc(site.owner)}, ${esc(site.street)}, ${esc(site.zip)} ${esc(site.city)}, E-Mail: ${esc(site.email)}:</p>
<p>Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung (*)<span class="wl" aria-hidden="true"></span></p>
<p>Bestellt am (*) / erhalten am (*)<span class="wl" aria-hidden="true"></span></p>
<p>Name des/der Verbraucher(s)<span class="wl" aria-hidden="true"></span></p>
<p>Anschrift des/der Verbraucher(s)<span class="wl" aria-hidden="true"></span><span class="wl" aria-hidden="true"></span></p>
<p>Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)<span class="wl" aria-hidden="true"></span></p>
<p>Datum<span class="wl" aria-hidden="true"></span></p>
<p class="fine">(*) Unzutreffendes streichen.</p>
</div>
<p class="noprint"><button class="btn ghost" type="button" id="printBtn">Formular drucken</button></p>
<p class="fine">Stand: ${STAND}</p>`);
}

// ---------- Kündigungs- und Widerrufsfunktion ----------
const ERKL = {
  kuendigung: {
    path: '/vertraege-kuendigen/',
    title: 'Verträge hier kündigen | Stillgrün',
    h1: 'Verträge hier kündigen',
    description: 'Kündigen Sie Ihr Grabpflege-Abo bei Stillgrün einfach online. Sie erhalten sofort eine Bestätigung per E-Mail.',
    intro: 'Hier können Sie Ihr Jahresabo oder Monatsabo kündigen. Nach dem Absenden erhalten Sie sofort eine Bestätigung mit Datum und Uhrzeit per E-Mail.',
    button: 'jetzt kündigen',
    label: 'Kündigung',
    nom: 'Ihre Kündigung',
    gen: 'Ihrer Kündigung',
  },
  widerruf: {
    path: '/vertrag-widerrufen/',
    title: 'Vertrag widerrufen | Stillgrün',
    h1: 'Vertrag widerrufen',
    description: 'Widerrufen Sie Ihren Vertrag mit Stillgrün einfach online. Sie erhalten sofort eine Eingangsbestätigung per E-Mail.',
    intro: 'Hier können Sie einen Vertrag innerhalb der Widerrufsfrist von 14 Tagen widerrufen. Gründe müssen Sie nicht angeben. Nach dem Absenden erhalten Sie sofort eine Eingangsbestätigung mit Datum und Uhrzeit per E-Mail.',
    button: 'Widerruf bestätigen',
    label: 'Widerruf',
    nom: 'Ihr Widerruf',
    gen: 'Ihres Widerrufs',
  },
};
const VERTRAG = ['Jahresabo', 'Monatsabo', 'Saisonpaket', 'Einzelleistung'];

function erklaerungForm(kind) {
  const k = ERKL[kind];
  const kuend = kind === 'kuendigung';
  return page(k.title, k.h1, k.description, k.path, `
<p>${k.intro}</p>
<form class="card" method="post" action="/api/erklaerung">
  <input type="hidden" name="art" value="${kind}">
  <div class="field"><label for="en">Ihr Name</label><input id="en" name="name" type="text" autocomplete="name" required maxlength="120"></div>
  <div class="field"><label for="ee">E-Mail für die Bestätigung</label><input id="ee" name="email" type="email" autocomplete="email" required maxlength="160"></div>
  <div class="field"><label for="ea">Ihre Anschrift (optional)</label><input id="ea" name="anschrift" type="text" autocomplete="street-address" maxlength="200"></div>
  <div class="field"><label for="ev">Welcher Vertrag?</label><select id="ev" name="vertrag">${VERTRAG.map((v) => `<option>${v}</option>`).join('')}</select></div>
  <div class="field"><label for="eg">Friedhof und Grab, Vertrags- oder Rechnungsnummer (falls zur Hand)</label><input id="eg" name="zuordnung" type="text" maxlength="200"></div>
  ${kuend ? `<div class="field"><label for="ek">Art der Kündigung</label><select id="ek" name="kuendigungsart"><option>ordentliche Kündigung</option><option>außerordentliche Kündigung aus wichtigem Grund</option></select></div>
  <div class="field"><label for="ez">Kündigen zum</label><select id="ez" name="zeitpunkt"><option>nächstmöglichen Zeitpunkt</option><option>Wunschtermin (bitte unten angeben)</option></select></div>` : `<div class="field"><label for="ed">Vertrag geschlossen am (falls bekannt)</label><input id="ed" name="datum" type="text" maxlength="40" placeholder="zum Beispiel 01.03.2027"></div>`}
  <div class="field"><label for="em">${kuend ? 'Grund oder Wunschtermin (optional)' : 'Nachricht (optional)'}</label><textarea id="em" name="nachricht" maxlength="2000"></textarea></div>
  <div class="hp" aria-hidden="true"><label for="ew">Website</label><input id="ew" name="website" type="text" tabindex="-1" autocomplete="off"></div>
  <button class="btn primary" type="submit" style="justify-self:start">${k.button}</button>
  <p class="fine">Ihre Angaben verwende ich nur zur Bearbeitung ${k.gen}. Mehr dazu in der <a href="/datenschutz/">Datenschutzerklärung</a>. Alternativ erreichen Sie mich per E-Mail an <a href="mailto:${site.emailAscii}">${esc(site.email)}</a>.</p>
</form>`);
}

function erklaerungDone(kind, e, mailed) {
  const k = ERKL[kind];
  const rows = [
    ['Art', k.label], ['Eingegangen am', e.zeit], ['Name', e.name], ['E-Mail', e.email], ['Anschrift', e.anschrift || '-'],
    ['Vertrag', e.vertrag], ['Zuordnung', e.zuordnung || '-'],
    ...(kind === 'kuendigung' ? [['Art der Kündigung', e.kuendigungsart], ['Zeitpunkt', e.zeitpunkt]] : [['Vertrag geschlossen am', e.datum || '-']]),
    ['Nachricht', e.nachricht || '-'],
  ];
  return layout({
    title: `${k.label} eingegangen | Stillgrün`, description: `Bestätigung ${k.gen}.`, pathName: k.path, noindex: true,
    body: `<section><div class="in"><div class="prose">
<h1>${k.nom} ist eingegangen</h1>
<p>${mailed ? `Eine Bestätigung mit diesen Angaben wurde an ${esc(e.email)} geschickt.` : 'Bitte speichern oder drucken Sie diese Seite als Nachweis. Die Bestätigung per E-Mail folgt in Kürze.'}</p>
<div class="tscroll"><table class="ptable"><tbody>${rows.map(([a, b]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}</tbody></table></div>
<p><a href="/">Zurück zur Startseite</a></p>
</div></div></section>`,
  });
}

// ---------- KI-Hinweis ----------
const kiHinweis = `<h2 id="ki">Hinweis zum Einsatz künstlicher Intelligenz</h2>
<p>Die Texte dieser Website sowie Logo und Grafiken wurden mit Unterstützung von KI-Werkzeugen erstellt. Alle Inhalte wurden von der Inhaberin ${esc(site.owner)} inhaltlich geprüft, überarbeitet und freigegeben. Sie trägt dafür die redaktionelle Verantwortung.</p>
<p>Die Fotos von Gräbern sind eigene Aufnahmen und nicht mit KI erzeugt oder verändert. Auf dieser Website gibt es keinen Chatbot. Ihre Anfragen werden ausschließlich persönlich bearbeitet, und Ihre Daten werden nicht mit KI-Diensten verarbeitet.</p>
<p>Dieser Hinweis erfolgt freiwillig im Sinne der Transparenzpflichten nach Art. 50 der EU-Verordnung über künstliche Intelligenz (KI-Verordnung, Verordnung (EU) 2024/1689).</p>`;

module.exports = { agb, widerrufsbelehrung, erklaerungForm, erklaerungDone, kiHinweis, ERKL, VERTRAG };
