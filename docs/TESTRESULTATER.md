# Testresultater

Genereret af `tools/report.mjs`. Tallene stammer fra den seneste faktiske kørsel af `npm run test:unit` og `npm run test:e2e` (Playwright + Chromium). Intet her er skønnet eller antaget.

## Enhedstests

```
UTM32-test: 8 punkter, største afvigelse 0.00000 m, haversine Grenaa-Ebeltoft ca. 25.4 km
OK
Indholdstest: 101 guides, 31 arter, 38 kilder – OK
```

## End-to-end (browser)

Kørt 2026-10-27T00:00:14.423Z; 33/33 bestået; varighed 167 s.

| ID | Test | Resultat | Detalje |
|---|---|---|---|
| F01 | Første start online: indhold indlæses, service worker aktiv | OK | 101 guides, 31 arter |
| F02 | Alle 17 kapitler kan åbnes og har indhold | OK | 17 kapitler |
| F03 | Alle guides har reelt indhold (ingen tomme sider) og praktiske guides har de 9 standardafsnit | OK | 101 guides (55 praktiske med 9 afsnit) |
| F04 | Alle arter kan åbnes; giftige/forsigtige arter viser advarsler; spiselige har forvekslingstabel og kilder | OK | 31 arter |
| F05 | Søgning virker (guides, arter, danske tegn) | OK | 9 søgninger |
| F06 | Nødmenu: 8 genveje peger på eksisterende guides, og 112-link findes på alle hovedsider | OK | 8 genveje |
| F07 | Sikkerhedsadvarsler er synlige på relevante sider | OK | 7 sider |
| F08 | Bogmærker, noter, kontakter og tjekliste gemmes lokalt | OK |  |
| F09 | Kortpakke hentes med fremdrift, SHA-256-kontrol og aktiveres | OK | version 2026.10.26 |
| K01 | Kortet viser data på flere zoomniveauer (veje, skov, vand, kurver, bygninger, punkter) | OK | 13 lag/zoom-kombinationer med data |
| K02 | Koordinater, målestok, nordpil og højde vises korrekt | OK | Midte: Ø 604054 N 6229471 · 56.1988, 10.6771 / højde ≈ 9 m / zoom 14.0 |
| K03 | Højdedata: Agri Bavnehøj ligger i det rette højdeinterval | OK | Agri Bavnehøj ≈ 125 m (OSM: 137 m; model ±) |
| K04 | Kortsøgning finder byer, veje og natursteder uden net | OK | 10 søgninger |
| K05 | Lagstyring, signaturforklaring og dækningsinformation | OK |  |
| K06 | Waypoints: gem, vis, eksportér/importér GPX, overlever genindlæsning | OK | eksport+import OK |
| K07 | Måling af afstand og enkel ruteplanlægning med gangtid | OK |  |
| K08 | GPS-position vises med korrekte UTM-koordinater | OK |  |
| K09 | Mørk tilstand og nat-tilstand skifter farver | OK | rgb(15, 22, 18) / rgb(18, 10, 8) |
| R01 | Begrænset lager: hentning afvises tydeligt og ændrer intet | OK | afvist ved 20 MB kvote |
| R02 | Afbrudt opdatering (forbindelse mistes midt i hentning): gammel pakke forbliver aktiv og kortet virker | OK | aktiv version uændret: 2026.10.26 |
| R03 | Korrupt pakkefil afvises via SHA-256 og efterlader den gamle pakke urørt | OK | korruption opdaget |
| R04 | Afbrudt service worker-opdatering (manglende fil) efterlader den eksisterende version i brug | OK | cache uændret: sk-static-0.9.0-551ccb4c30 |
| R05 | Ingen JavaScript-fejl i sessionen (online fase) | OK |  |
| R06 | Under normal brug kontaktes kun appens egen server (ingen CDN, fonte eller eksterne API'er) | OK | 127.0.0.1:41565, |
| O01 | OFFLINE (server lukket, browser genstartet): appen starter og viser forsiden | OK |  |
| O02 | OFFLINE: alle kernekapitler og alle guides kan læses | OK | 101 guides + 17 kapitler |
| O03 | OFFLINE: illustrationer indlæses (inline SVG, knob-tegninger) | OK |  |
| O04 | OFFLINE: søgning, artsguide og kilder virker | OK |  |
| O05 | OFFLINE: bogmærker, noter, nødkontakter og tjekliste overlever genstart | OK |  |
| O06 | OFFLINE: kortet starter og vises i flere zoomniveauer | OK | z8.6:2 z10:315 z12:28 z14:1778 |
| O07 | OFFLINE: kortsøgning, højde og lokalt gemte waypoints kan åbnes | OK |  |
| O08 | OFFLINE: ny waypoint kan gemmes, og eksport virker | OK |  |
| O09 | OFFLINE: ingen fejlede eller eksterne netværkskald under hele offline-sessionen | OK | 127.0.0.1:41565,, 0 fejlede |

**Offline-test:** fase 4 (O01–O09) lukker den lokale webserver helt og genstarter browseren med samme profil. Appen skal da starte fra service worker-cachen og IndexedDB. Netværksværter og fejlede kald logges (O09).

## Hvad er IKKE testet

- Rigtige mobile enheder (iOS Safari, Android Chrome): kun Chromium (desktop, mobilstørrelse) er testet. iOS kan rydde websitelager efter 7 dages inaktivitet, hvis appen ikke er føjet til startskærmen.
- Ægte GPS-hardware og enhedens kompas: GPS er testet med simuleret position; kompas er ikke testet.
- Installation som PWA via "Føj til startskærm".
- Ydeevne og batteriforbrug over længere tid.
- Flere samtidige faner/enheder.
- Fagligt indhold er ikke testet automatisk ud over struktur; se VERIFICERING.md.
