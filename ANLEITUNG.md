# Stillgrün Website – Anleitung

Diese Anleitung ist für Kerstin geschrieben. Programmierkenntnisse sind nicht nötig.
Jeder Schritt wird einzeln beschrieben, in der Reihenfolge, in der er gemacht werden sollte.

---

## 1. Was ist hier drin?

| Ordner / Datei | Wofür |
|---|---|
| `server.js` | Das Programm, das die Website ausliefert |
| `src/data.js` | **Alle Preise und Firmendaten.** Hier wird geändert, wenn ein Preis sich ändert |
| `src/pages.js` | Die Texte der Unterseiten |
| `src/home.html` | Der Text der Startseite |
| `public/` | Bilder, Schriften und das Aussehen (CSS) |
| `check.js` | Prüft die Website automatisch auf Fehler |
| `.env.example` | Vorlage für die Zugangsdaten (Datenbank, E-Mail, Verwaltung) |

Die Website hat sechs Seiten:

- `/` Startseite mit Leistungen, Preisen, Preisrechner und Anfrageformular
- `/grabpflege-kosten/` alle Preise
- `/grabpflege-frankfurt/` Grabpflege in Frankfurt
- `/urnenpflege-frankfurt/` Urnenpflege
- `/impressum/` und `/datenschutz/`

Dazu kommen `/admin` (Liste aller Anfragen, mit Passwort) und die technischen Dateien
`robots.txt`, `sitemap.xml` und `llms.txt` für Suchmaschinen.

---

## 2. GitHub

Die Website liegt im Repository [NopikaAI/stillgruen-website](https://github.com/NopikaAI/stillgruen-website),
Zweig `main`. Hostinger holt sich die Website von dort. Jede Änderung, die auf `main`
gespeichert wird, wird automatisch neu veröffentlicht.

---

## 3. Bei Hostinger veröffentlichen

1. Im Hostinger-Panel auf der Seite **Node.js Web-App bereitstellen** auf
   **Verbinden Sie sich mit GitHub** klicken und das Repository `stillgruen-website` auswählen.
2. Als Startbefehl wird `npm start` verwendet, als Node-Version **20 oder neuer**.
3. Bei **Umgebungsvariablen** die Werte aus `.env.example` eintragen (siehe Punkt 4 und 5).
4. Nach dem ersten Start die Domain `stillgrün.de` zuweisen und bei Hostinger
   **stillgruen.de auf www.stillgrün.de weiterleiten** lassen.
5. SSL-Zertifikat (https) aktivieren. Das ist bei Hostinger kostenlos.

---

## 4. Datenbank anlegen

1. Im Hostinger-Panel unter **Datenbanken › MySQL-Datenbanken** eine neue Datenbank anlegen,
   zum Beispiel `stillgruen_anfragen`, mit eigenem Benutzer und Passwort.
2. Diese vier Werte als Umgebungsvariablen eintragen: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
3. Mehr ist nicht nötig. Die Tabelle `anfragen` legt die Website beim ersten Start selbst an.

Sind keine Datenbankdaten hinterlegt, schreibt die Website die Anfragen ersatzweise in die
Datei `data/anfragen.jsonl`, damit nichts verloren geht.

---

## 5. E-Mail-Benachrichtigung

Damit jede Anfrage sofort als E-Mail ankommt:

1. Bei Hostinger unter **E-Mails** das Postfach `kontakt@stillgruen.de` anlegen.
2. Die Werte `SMTP_HOST=smtp.hostinger.com`, `SMTP_PORT=465`, `SMTP_USER=kontakt@stillgruen.de`
   und `SMTP_PASSWORD=<Passwort des Postfachs>` als Umgebungsvariablen eintragen.
3. `MAIL_TO` legt fest, wohin die Benachrichtigung geht.

---

## 6. Anfragen ansehen

Unter `https://www.stillgrün.de/admin` liegt eine einfache Liste aller Anfragen.
Benutzername und Passwort werden über `ADMIN_USER` und `ADMIN_PASSWORD` festgelegt.
Bitte ein langes Passwort wählen. Ohne diese beiden Werte ist die Seite gesperrt.

---

## 7. Preise ändern

Alle Preise stehen in der Datei `src/data.js`, in diesem Block:

```js
urne:   { label: 'Urnengrab',  ..., jahr: 35, monat: 39, ... },
einzel: { label: 'Einzelgrab', ..., jahr: 45, monat: 49, ... },
doppel: { label: 'Doppelgrab', ..., jahr: 59, monat: 62, ... },
```

`jahr` ist der Monatspreis im Jahresabo, `monat` der Preis im Monatsabo.
Nach dem Ändern die Datei auf GitHub speichern. Hostinger veröffentlicht die Website
automatisch neu, und Preistabelle, Preisrechner, Unterseiten und die Angaben für
Suchmaschinen sind überall gleichzeitig aktualisiert.

---

## 8. Website prüfen

Nach jeder Änderung kann die Website automatisch geprüft werden:

```
npm install
npm run check
```

Geprüft werden: Erreichbarkeit aller Seiten, JavaScript-Fehler, tote Links, Titel und
Beschreibungen, Überschriften, Alternativtexte der Bilder, strukturierte Daten,
der Preisrechner, das Formular und die Darstellung auf dem Handy.

---

## 9. Was bei Google noch zu tun ist

Die Website bringt technisch alles mit: Titel, Beschreibungen, strukturierte Daten
(LocalBusiness, Angebote, FAQ), `sitemap.xml`, `robots.txt` und eine `llms.txt` für die
KI-Antworten von Google, ChatGPT, Perplexity und Claude. Diese Schritte muss Kerstin
noch selbst erledigen:

1. **Google-Unternehmensprofil anlegen** unter [business.google.com](https://business.google.com).
   Kategorie „Friedhofsgärtnerei“ oder „Gartenbauunternehmen“, Gebiet Frankfurt am Main.
   Das ist der wichtigste Schritt für die Sichtbarkeit in Google Maps und in KI-Antworten.
2. **Google Search Console** unter [search.google.com/search-console](https://search.google.com/search-console)
   einrichten, Domain bestätigen und `https://www.stillgrün.de/sitemap.xml` einreichen.
3. **Bing Webmaster Tools** ebenfalls einrichten. Bing versorgt unter anderem ChatGPT mit Suchergebnissen.
4. **Erste Bewertungen sammeln.** Bewertungen im Google-Profil wirken stärker als jeder Text auf der Website.

---

## 10. Google Analytics und Google Ads einschalten

Das Einwilligungs-Banner ist schon eingebaut, aber ausgeschaltet. Solange keine ID eingetragen ist,
erscheint kein Banner und es wird nichts von Google geladen.

1. Bei [analytics.google.com](https://analytics.google.com) eine Property für `https://www.stillgrün.de`
   anlegen. Google zeigt eine **Mess-ID** im Format `G-XXXXXXXXXX`.
2. Für Werbung: Bei [ads.google.com](https://ads.google.com) eine Conversion-Aktion anlegen. Die
   **Conversion-ID** hat das Format `AW-123456789`.
3. Bei Hostinger unter **Umgebungsvariablen** eintragen: `GA_ID` und/oder `GOOGLE_ADS_ID`.
   Danach neu bereitstellen.
4. Das Banner erscheint jetzt beim ersten Besuch. Google wird erst nach „Alle akzeptieren“ oder
   einer Auswahl unter „Einstellungen“ geladen. Die Datenschutzerklärung passt sich automatisch an.
5. In Google Analytics unter **Verwaltung › Datenaufbewahrung** 14 Monate einstellen und den
   Vertrag zur Auftragsverarbeitung akzeptieren (Verwaltung › Kontodetails).
