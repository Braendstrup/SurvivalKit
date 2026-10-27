# Survivalkit – dansk feltmanual med offline Djursland-kort

En **offline-first PWA** med en dansk survivalhåndbog (101 guides, 17 kapitler, 31 arter, 7 tjeklister, 38 registrerede kilder) og et **interaktivt topografisk offlinekort over Djursland** (OpenStreetMap + højdemodel, 31 MB, med reelle data og dokumenteret dækning).

> **Vigtigt:** Appen erstatter aldrig 112, et førstehjælpskursus eller en kyndig svampe-/plantekender. Se [docs/BEGRAENSNINGER.md](docs/BEGRAENSNINGER.md) og [docs/VERIFICERING.md](docs/VERIFICERING.md) for, hvad der er kontrolleret mod kilder, og hvad der ikke er.

## Hurtig start

```bash
npm run build          # bygger indhold (app/data/content.json) og service worker (app/sw.js)
npm run serve          # statisk server på http://127.0.0.1:8080/ (appen = mappen app/)
npm run test:unit      # UTM32-formler mod pyproj-referencer + indholdstest
npm run test:e2e       # Playwright/Chromium: funktions-, offline- og robusthedstests (~3 min)
node tools/report.mjs  # genererer docs/VERIFICERING.md, KILDER.md, TESTRESULTATER.md
```

**Installation:** Læg mappen `app/` på en statisk HTTPS-server (fx GitHub Pages) – eller brug `localhost`. Åbn siden online én gang, vælg "Føj til startskærm" (Android/iOS), og hent kortpakken under **Kort** (≈ 31 MB, Wi-Fi anbefales). Derefter virker alt uden internet. Service worker og kortpakke kræver `https://` eller `localhost`.

Testede forudsætninger: Node 22, Chromium (Playwright). Kortpakken genskabes med Python (se [docs/KORTDATA.md](docs/KORTDATA.md)).

## Indhold

17 kapitler efter den ønskede struktur: nødsituationer og prioriteter · førstehjælp · ly · bål (inkl. lovlighed og forbud) · vand og vandrensning · knob (5 tegnede, øvrige uden tegning) · mad fra naturen · planter/svampe/forgiftning · madtilberedning · navigation (kompas, kort, UTM32/ETRS89, triangulering) · vejr · naturtyper og dyreliv · udstyr · dansk beredskab og regler · Djursland-kortet · tjeklister · om og begrænsninger.

Alle praktiske guides følger samme struktur (Formål · Hvornår · Udstyr · Fremgangsmåde · Sådan kontrollerer du resultatet · Typiske fejl · Sikkerhed · Danske forhold · Alternativ løsning) og er markeret med *dokumenteret / tommelfingerregel / faglig vurdering* samt en **kontrolstatus med kilder og dato**. Nødmenuen (8 genveje) og et altid synligt 112-link findes på alle sider.

Der er **ingen artsfotos og ingen AI-genererede artstegninger**: de kunne give falsk tryghed. Artsguiden er et støtteværktøj, ikke et bestemmelsesværktøj.

## Kortet

Se [docs/KORTDATA.md](docs/KORTDATA.md). Kort fortalt: MapLibre + PMTiles (vektorfliser z8–14 + Terrarium-højdemodel z7–13) fra IndexedDB; lag, koordinater (WGS84 + UTM32/ETRS89), højde, GPS, måling, waypoints (GPX ind/ud), enkel rute med gangtid, søgning, signaturforklaring, dækningsindikator.

## Arkitektur

Se [docs/ARKITEKTUR.md](docs/ARKITEKTUR.md) og [docs/OFFLINE.md](docs/OFFLINE.md).

## Dokumentation

| Fil | Indhold |
|---|---|
| [docs/ARKITEKTUR.md](docs/ARKITEKTUR.md) | Teknisk oversigt |
| [docs/OFFLINE.md](docs/OFFLINE.md) | Offline-funktionalitet, lager, opdatering |
| [docs/KORTDATA.md](docs/KORTDATA.md) | Datakilder, licenser, pipeline, download og opdatering |
| [docs/KILDER.md](docs/KILDER.md) | Alle kilder med understøttet indhold og begrænsninger |
| [docs/VERIFICERING.md](docs/VERIFICERING.md) | Hvad er kontrolleret – og liste over uverificeret indhold |
| [docs/TESTRESULTATER.md](docs/TESTRESULTATER.md) | Faktiske testresultater |
| [docs/BEGRAENSNINGER.md](docs/BEGRAENSNINGER.md) | Kendte begrænsninger og krav, der ikke er opfyldt |

## Licens

Kode: MIT (se `LICENSE`). Kortdata: ODbL 1.0 © OpenStreetMap-bidragydere. Indholdstekster og kildehenvisninger: ejeren af projektet vælger licens (ikke fastlagt). Tredjepartskomponenter: se docs/KILDER.md.

## Udgivelse på GitHub Pages
Workflowet `.github/workflows/pages.yml` bygger og udgiver mappen `app/`. Én gang: Repository → Settings → Pages → *Source: GitHub Actions*. Derefter udgives ved hver push til `main` (eller manuelt via *Actions → Deploy til GitHub Pages → Run workflow*). Adressen bliver `https://<bruger>.github.io/SurvivalKit/`.
