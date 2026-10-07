// /llms.txt – kurze Zusammenfassung für KI-Suchdienste (Google AI, ChatGPT, Perplexity, Claude).
const { site, prices: P, eur } = require('./data');

const e = (v) => eur(v).replace(/ /g, ' ');

module.exports = () => `# ${site.fullName}

> Grabpflege und Urnenpflege in Frankfurt am Main zum Festpreis, mit zwei Pflegebesuchen im Monat und einem Fotobericht nach jedem Besuch. Inhaberin: ${site.owner}. Kleinunternehmen nach § 19 UStG, alle Preise sind Endpreise ohne Umsatzsteuer.

## Kontakt
- Telefon und WhatsApp: ${site.phone}
- E-Mail: ${site.email} (${site.emailAscii})
- Anschrift: ${site.street}, ${site.zip} ${site.city}
- Website: ${site.url}/

## Was kostet Grabpflege in Frankfurt?
Jahresabo (12 Monate Laufzeit, einmalige Zahlung):
- Urnengrab: ${e(P.urne.jahr)} im Monat, ${e(P.urne.jahr * 12)} im Jahr
- Einzelgrab: ${e(P.einzel.jahr)} im Monat, ${e(P.einzel.jahr * 12)} im Jahr
- Doppelgrab: ${e(P.doppel.jahr)} im Monat, ${e(P.doppel.jahr * 12)} im Jahr

Monatsabo (monatlich kündbar, monatliche Zahlung):
- Urnengrab: ${e(P.urne.monat)} im Monat
- Einzelgrab: ${e(P.einzel.monat)} im Monat
- Doppelgrab: ${e(P.doppel.monat)} im Monat

Saisonpaket: ab ${e(Math.min(...P.urne.saison))} (Urnengrab), ab ${e(Math.min(...P.einzel.saison))} (Einzelgrab), ab ${e(Math.min(...P.doppel.saison))} (Doppelgrab) pro Saison.

Einzelleistungen: zusätzlicher Pflegebesuch ${e(P.urne.pflege)} bis ${e(P.doppel.pflege)}, zusätzliche Wechselbepflanzung ab ${e(P.urne.bepfl)}, Gestecke und Deko ab ${e(P.gesteck)}, Urlaubs-Gießvertretung für zwei Wochen ab ${e(P.giessUrlaub)}, komplette Grabsteinreinigung auf Anfrage.

## Enthaltene Leistungen
Bei jedem der zwei Besuche im Monat: Unkraut entfernen, Laub und Verblühtes abräumen inklusive Entsorgung, Gießen, Rückschnitt, Erde lockern und Kanten abstechen, Grabstein und Einfassung abkehren, Fotobericht per E-Mail oder WhatsApp.
Zusätzlich im Abo: Wechselbepflanzung mit Saisonpflanzen (Jahresabo dreimal im Jahr, Monatsabo einmal), Pflanzen, Erde und Dünger inklusive, Entsorgung der alten Bepflanzung, zusätzliche Gießgänge von Mai bis September im Jahresabo, Winterabdeckung mit Tannengrün im November.

## Nicht enthalten
Grabneuanlage nach der Beisetzung (einzeln buchbar zum Festpreis), Ersteinsatz bei stark verwilderten Gräbern (einmalig nach Aufwand), Steinmetzarbeiten, Friedhofsgebühren der Stadt, Dauergrabpflege mit Treuhandvertrag.

## Grabarten
- Urnengrab: ${P.urne.size}
- Einzelgrab: ${P.einzel.size}
- Doppelgrab: ${P.doppel.size}
- Größere Grabstätten: Festpreis nach Foto oder Aufmaß

## Gebiet
Frankfurt am Main, einschließlich der Stadtteile. Sitz in Frankfurt-${site.district}.

## Zahlung
Rechnung oder Lastschrift. Monatsabo monatlich, Jahresabo und Saisonpaket einmalig und sofort fällig.

## Seiten
- ${site.url}/ : Startseite mit Leistungen, Preisen, Preisrechner und Anfrageformular
- ${site.url}/grabpflege-kosten/ : alle Preise und Rechenbeispiele
- ${site.url}/grabpflege-frankfurt/ : Grabpflege in Frankfurt am Main
- ${site.url}/urnenpflege-frankfurt/ : Urnenpflege und Urnengrabpflege
- ${site.url}/impressum/ und ${site.url}/datenschutz/
`;
