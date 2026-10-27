# UX-overhaul: mobile-first redesign – design

Dato: 2026-10-27 · Status: til godkendelse

## Mål

Appen skal føles rolig og overskuelig på en telefon. Brugeren skal hurtigt kunne finde det, de skal bruge, uden at blive mødt af ca. 30 elementer og gentagne 112-opfordringer.

**Udgangspunkt (målt i koden):**
- Forsiden har intro, 112-boks, 8 nødfelter, 3 genveje, 17 kapitelfelter, bogmærker og en "Husk"-boks.
- 112 vises som knap i toplinjen på alle sider, som boks på forsiden og som stor knap og liste på Nød-siden. Desuden står der et stort banner øverst i alle nød- og førstehjælpsguides og i mange `call112`-blokke i guidetekster.

**Succeskriterier**
1. Forsiden har højst 5 sektioner, deriblandt 6 temakort, og der er ingen 112-boks.
2. 112-knappen vises kun på Nød-siden og i nødrelaterede guides (se nedenfor).
3. På en guide kan man se strukturen (alle afsnitsoverskrifter) uden at scrolle mere end ca. 2 skærmhøjder.
4. Der er ingen vandret scroll ved 320–768 px på nogen hovedside.
5. Offlinefunktionaliteten er uændret, og den eksisterende offline-e2e består.

## Uden for omfang

- Kortvisningen (`mapview.js`) redesignes ikke. Den tilpasses kun den nye toplinje og bundmenu.
- Indholdet ændres ikke fagligt. Den eneste indholdsnære ændring er, at store 112-bannere vises som en kompakt linje.
- Der kommer ingen nye afhængigheder. Appen forbliver vanilla ES-moduler uden CDN.

## Informationsarkitektur

### Temaer
Temaerne defineres i `content/00_meta.mjs` som `temaer`:

| id | Titel | Kapitler |
|---|---|---|
| `akut` | Akut & førstehjælp | nod, foerstehjaelp |
| `ly-vand` | Ly, varme & vand | ly, baal, vand |
| `mad-natur` | Mad & natur | mad, arter, tilberedning, natur |
| `vej-vejr` | Find vej & vejr | navigation, vejr, kort |
| `udstyr` | Udstyr & færdigheder | knob, udstyr, lister |
| `regler` | Regler & beredskab | beredskab, om |

`tools/build.mjs` validerer, at hvert ikke-skjult kapitel ligger i præcis ét tema, og at alle kapitel-id'er i `temaer` findes.

### Routes

| Route | Side | Bemærkning |
|---|---|---|
| `#/` | Forside | ny |
| `#/tema/:id` | Temaside | ny |
| `#/nod` | Nød | redesign |
| `#/kort` | Kort | uændret, ny ramme |
| `#/gemte` | Gemte | ny (bogmærker + tjeklister) |
| `#/sog` | Søg | redesign |
| `#/indstillinger` | Indstillinger | erstatter `#/mig` |
| `#/kap/:id`, `#/g/:id`, `#/arter`, `#/a/:id`, `#/lister/:id`, `#/kilder` | uændrede routes | ny præsentation |
| `#/mig` | → `#/indstillinger` | omdirigering |
| `#/lister` (uden id) | → `#/gemte` | omdirigering |

## Appens ramme

### Toplinje (ca. 52 px)
- **Forsiden:** logo og "Survivalkit".
- **Øvrige sider:** tilbage-pil og sidetitel. Tilbage-pilen bruger `history.back()`, hvis der er historik i appen, og ellers sidens logiske forælder (guide → kapitlets tema, tema → forside).
- **Til højre:** søgeikon (til `#/sog`) og tandhjul (til `#/indstillinger`).
- **112-knap**, kompakt og rød, vises kun når:
  - siden er `#/nod`, eller
  - siden er en guide i kapitlerne `nod` eller `foerstehjaelp`, eller guiden har `nod` eller `ring112` sat.
- **Net-pillen** fjernes fra toplinjen. Skift mellem online og offline vises som toast, og den aktuelle status står i Indstillinger.

### Bundmenu
Fire faner: **Hjem · Nød · Kort · Gemte**. Nød beholder sin røde markering, og menuen respekterer `env(safe-area-inset-bottom)`. Aktiv fane følger siden:

| Sider | Aktiv fane |
|---|---|
| tema, kapitel, guide, arter, søg, indstillinger | Hjem |
| `#/lister/:id` | Gemte |

## Sider

### Forside (`pageHome`)
1. Søgefelt ("Søg i håndbogen…"). Fokus eller tryk navigerer til `#/sog` med fokus i feltet.
2. Nødkort "Er du i en nødsituation?" med kort undertekst, som fører til `#/nod`.
3. 6 temakort i 2 kolonner, eller 3 ved ≥ 600 px, med ikon, titel og fx "2 kapitler · 23 guides".
4. "Fortsæt": senest læste guide (gemt lokalt ved visning af en guide) og op til 3 bogmærker. Sektionen skjules, hvis begge er tomme.
5. Én diskret linje nederst: "Offlinehåndbog – tjek altid aktuelle regler og afbrændingsforbud. Om appen ›".

Følgende fjernes fra forsiden: hero-tekst, 112-boks, nødgitter, genvejsfelter, kapitelgitter og "Husk"-boksen. Indholdet fra "Husk" ligger i forvejen under Om-kapitlet.

### Temaside (`#/tema/:id`)
- Titel og eventuelt én intro-linje.
- For hvert kapitel: overskrift (kapitlets titel) og en kompakt liste af guides med titel, kort resumé og statusmærke som lille prik eller ikon.
- Temaet *Mad & natur* får en knap "Artsguide", og *Find vej & vejr* får en knap "Åbn kortet".
- Kapitelintro vises foldet under kapiteloverskriften.

### Kapitelside (`#/kap/:id`)
Bevares for links og bogmærker. Den bruger samme liste-komponent som temasiden.

### Guideside (`#/g/:id`)
- **Top:** titel, resumé, og én række med statusmærke, niveau og Gem-ikonknap.
- **Ikke-verificerede guides:** én kort advarselslinje under toppen med linket "Hvad betyder det?".
- **Altid åbne afsnit:** *Fremgangsmåde* og *Sikkerhed*.
- **Foldbare afsnit** (`<details>`): *Formål*, *Hvornår*, *Udstyr*, *Sådan kontrollerer du resultatet*, *Typiske fejl*, *Danske forhold* og *Alternativ løsning*.
- Indhold før første afsnitsoverskrift vises over afsnittene, ufoldet.
- Et foldet afsnit med `callout` af typen `danger` eller `act` får et advarselsikon i overskriften (`summary`).
- **Info-guides** uden de 9 standardafsnit vises som i dag, men med den nye typografi. Ingen foldning.
- **`call112`-blokke** vises som én kompakt række: telefon-ikon, "Ring 112" og blokkens tekst i én linje (afkortes, fuld tekst ved tryk). Det store banner, der i dag vises øverst ved `g.nod || g.ring112`, fjernes; toplinjens 112-knap overtager.
- **Nederst:** foldet afsnit "Kilder og evidens" (kildeboks og evidensforklaring) efterfulgt af "Se også".
- Kommer man fra søgning (`?q=` i route), åbnes de afsnit, der indeholder søgeordet, og første træf scrolles i syne.
- `@media print`: alle `<details>` vises åbne.

Visning af en guide opdaterer "senest læst" (`db.kvSet('recent', id)`).

### Nød (`#/nod`)
1. De 8 nødsituationer som store rækker: ikon, titel og undertekst, mindst 56 px høje.
2. "Ring 112 hvis" som `<details open>`.
3. "Nødprocedure på under ét minut" som `<details>`.
4. "Andre numre" som `<details>`.

### Gemte (`#/gemte`)
- **Bogmærker:** liste med fjern-knap pr. række. Tom tilstand: "Tryk på bogmærket i en guide for at gemme den her."
- **Tjeklister:** én række pr. liste med fremdrift ("7/15"), som linker til `#/lister/:id`.

### Søg (`#/sog`)
- Søgefelt med autofokus.
- Resultater grupperet som *Guides*, *Arter* og *Tjeklister*, og hvert resultat linker med `?q=`.
- Tom tilstand: forslag med de 6 temaer som chips.

### Indstillinger (`#/indstillinger`)
Indholdet fra den nuværende `pageMig`, grupperet:
- **Visning:** tema og tekststørrelse.
- **Offline & lagring:** status, kortpakke og lagringsforbrug.
- **Om:** kilder, begrænsninger og version.

## Visuelt system

- **Tokens på `:root`:**
  - Farver: `--bg`, `--surface`, `--surface-2`, `--text`, `--muted`, `--line`, `--primary` (mørkegrøn), `--accent`, `--danger`, `--warn`, `--ok`.
  - Radier, afstande (4/8/12/16/24/32) og skriftskala.
  - Lys, mørk og nat (rødt lys) defineres som token-sæt. Mørk styres af både `prefers-color-scheme` og det manuelle `data-theme`, som i dag.
- **Flader:** lister og kort på `--surface` med blød radius og ingen tunge rammer. Callouts får en farvet venstrekant og et ikon på `--surface-2`, ikke helt farvede bokse. Rød bruges kun til fare og 112.
- **Typografi:**
  - Systemfont-stack, brødtekst 17 px og line-height 1.55.
  - H1 26 px, H2 20 px, H3 17 px fed.
  - Maks. linjelængde 68ch.
  - `data-size` skalerer rod-størrelsen som i dag.
- **Touch:** interaktive mål ≥ 48×48 px og fokusring synlig ved tastatur (`:focus-visible`).
- **Layout:**
  - Én kolonne med 16 px side-gutter og maks. indholdsbredde 720 px.
  - Toplinje og bundmenu er `position: sticky`/`fixed` med safe-area-padding.
- **Bevægelse:** højst 150 ms overgange på farve og transform. `prefers-reduced-motion: reduce` slår dem fra.

## Teknisk struktur

- **`app/js/views.js` deles op** i `app/js/views/`:
  - `ui.js`: `ic`, `tile`/`card`, `row`, `section` (details) og `toast`.
  - `home.js`: forside og temaside.
  - `guide.js`: guide, kapitel og blokrendering (`renderBlocks` flyttes hertil).
  - `nod.js`: Nød-siden.
  - `gemte.js`: Gemte og tjekliste-sider (`pageList`).
  - `search.js`: Søg.
  - `settings.js`: Indstillinger og kilder.
  - `arter.js`: arter og art.

  `app/js/views.js` beholdes som barrel (`export * from …`), så `app.js` og `mapview.js` ikke behøver store ændringer.
- **`app/js/app.js`:** router med nye routes og omdirigeringer, nyt shell-API `setChrome({ title, back, show112 })` til toplinjen og opdatering af aktiv fane efter tabellen ovenfor.
- **`app/index.html`:** ny toplinje-markup og bundmenu med 4 faner. Nye ikoner i sprite: `i-back`, `i-gear`, `i-chevron`.
- **`app/css/app.css`:** omskrives omkring tokens. Kortets eksisterende klasser bevares, så `mapview.js` ikke brydes.
- **`tools/build.mjs`:** validering af `temaer` og nye filer i precache-listen (som i dag via glob).
- **Service worker:** uændret mekanik. Ny cache-version følger automatisk af hash.

## Test

**Eksisterende e2e (33 tests)** opdateres til nye selektorer og routes. Testenes indhold bevares, især hele O-serien (offline).

**Nye e2e-tests:**

| Id | Test |
|---|---|
| U01 | Forsiden har 6 `.temakort`, ét nødkort og ingen `a[href="tel:112"]`. |
| U02 | 112-knap i toplinjen er synlig på `#/nod` og på en førstehjælpsguide, men ikke synlig på `#/`, en knob-guide eller `#/kort`. |
| U03 | Guide: *Fremgangsmåde* og *Sikkerhed* er åbne, *Formål* er lukket. `#/g/<id>?q=<ord fra lukket afsnit>` åbner det afsnit. |
| U04 | Ingen vandret overflow (`scrollWidth <= clientWidth`) ved 320, 360, 390 og 768 px på `#/`, `#/tema/akut`, en guide, `#/nod`, `#/gemte`, `#/sog` og `#/indstillinger`. |
| U05 | `#/mig` → `#/indstillinger`, `#/lister` → `#/gemte`, og `#/lister/<id>` virker uændret. |
| U06 | Gem en guide, så den vises på `#/gemte` og under "Fortsæt" på forsiden. Fjern den, så den forsvinder. |
| U07 | Bundmenuen har 4 faner, og den aktive fane følger tabellen. |

**Enhedstest:** `tests/unit_content.mjs` udvides med validering af temaer (hvert kapitel i præcis ét tema).

**Skærmbilleder** ved 390 px i lyst og mørkt tema af forside, tema, guide, Nød og Gemte lægges i `docs/screenshots/` og sendes til brugeren til vurdering før merge.

**Dokumentation:** README og `docs/ARKITEKTUR.md` opdateres med de nye routes og filer, og `docs/TESTRESULTATER.md` regenereres med faktiske resultater.

## Risici

- **Foldede afsnit kan skjule vigtig information.** Det imødegås af, at Fremgangsmåde og Sikkerhed altid er åbne, at foldede afsnit med fare-indhold har et advarselsikon, og at søgning og udskrift åbner afsnittene.
- **Ændrede routes kan bryde gemte links.** Det imødegås af omdirigeringer og af, at alle indholds-routes bevares.
- **Omskrivning af CSS kan bryde kortets layout.** Det imødegås af, at kortets klasser bevares, og at e2e-testenes K-serie (kort) skal bestå.
