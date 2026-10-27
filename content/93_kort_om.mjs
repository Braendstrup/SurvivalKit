import { P, H, UL, OL, STEPS, INFO, WARN, DANGER, ACT, CL, C112, FIG, FIGS, TABLE, KV, DET, praktisk, info, K } from './_lib.mjs';

export const guides = [
  praktisk({
    id: 'kort-brug', kap: 'kort', titel: 'Sådan bruger du Djursland-kortet', niveau: 'gr',
    resume: 'Hent pakken én gang online. Derefter: kort, lag, koordinater, GPS, måling, waypoints, rute og søgning – helt offline.', tags: ['kort', 'djursland', 'offline', 'hent', 'gps', 'waypoints', 'rute', 'søg', 'lag'],
    kilder: ['osm', 'terrain', 'wmm'], kontrol: K.delvist('Funktionerne er appens egne og er testet (se testoversigt). Datakilder og begrænsninger: se [[kort-data]].'),
    formaal: 'At bruge det interaktive topografiske offlinekort til orientering og planlægning.', hvornaar: ['Før turen (hent pakken) og under turen/nød (brug offline).'],
    udstyr: ['Telefon eller computer med moderne browser; ca. 31 MB pakke + plads; GPS valgfrit.', 'Alternativ: papirkort.'],
    trin: ['**Hent kortpakken** (Kort-siden → "Hent kortpakke"; Wi-Fi anbefales). Fremgang vises; filer kontrolleres med SHA-256, og en afbrudt hentning efterlader den gamle pakke urørt.', '**Panorér/zoom:** træk og knib. Midtpunktets koordinater og højde vises nederst.', '**Lag:** vælg veje, stier, skov, vand, højdekurver, skyggerelief, bygninger, punkter og beskyttede områder.', '**GPS:** tryk positionsknappen; tillad adgang. Position, nøjagtighed og UTM-koordinater vises.', '**Mål** afstand med linealen; **planlæg rute** (rette linjer med gangtid og stigning); **gem waypoints** og eksportér/importér som **GPX**.', '**Søg** efter byer, veje og steder (kun i det hentede område, uden net).', '**Signaturforklaring** (bogknap); **Kortdata og dækning** (pilknap) viser pakkeversion, dækning og kildeoplysninger.'],
    kontrolTjek: ['Kortet vises uden net (flytilstand): panorering og zoom virker i hentet område; dækningsgrænsen er markeret; mørkt område = ikke hentet.'],
    fejl: ['At glemme at hente pakken, mens du har net.', 'At tro punkter (vand, shelter, hjertestarter) er verificeret.', 'At zoome over niveau 14 og tro at der kommer flere detaljer (det er blot forstørrelse).'],
    sikkerhed: ['Kortet er ikke en garanti for tilgængelighed eller åbningstider.', 'GPS-nøjagtighed varierer (skov/dal).'],
    dansk: ['Dækning: Syddjurs + Norddjurs (ekskl. Anholt) + 3 km buffer (kommunegrænser fra OSM).', 'Koordinater vises både som WGS84 og ETRS89/UTM32N.'],
    alternativ: ['Papirkort og kompas ([[nav-kompas]]).'],
  }),

  info({
    id: 'kort-data', kap: 'kort', titel: 'Kortdata: kilder, licenser, dækning og begrænsninger', niveau: 'mi',
    resume: 'OpenStreetMap-data (ODbL) og en afledt højdemodel; kendte begrænsninger er angivet.', tags: ['kortdata', 'licens', 'osm', 'højdedata', 'dækning', 'begrænsninger', 'kilder', 'opdatering'],
    kilder: ['osm', 'terrain', 'wmm'], kontrol: K.ok('Kildeoplysninger følger pakkens manifest (genereret af tools/mapdata).'),
    blokke: [
      TABLE(['Datasæt', 'Kilde og licens', 'Dato/Version', 'Begrænsninger'], [
        ['**Veje, stier, skove, vand, bebyggelse, punkter, navne, kommunegrænser**', 'OpenStreetMap via download.openstreetmap.fr (Danmark). © OpenStreetMap-bidragydere, ODbL 1.0', 'OSM-data pr. 23.10.2026 (filens tidsstempel), pakke v2026.10.26', 'Frivillig kortlægning: kan mangle eller være forældet. Punkter (vand, shelter, bål, hjertestarter) er **ikke verificeret**. Fredninger er ikke juridiske afgrænsninger.'],
        ['**Højde (skyggerelief, kurver, højdevisning)**', 'Terrain Tiles (Terrarium) fra AWS Open Data Registry (afledt af bl.a. SRTM, EU-DEM); kræver kildeangivelse', 'Hentet 26.10.2026', 'Grov model (ca. 10–25 m): usikkerhed typisk flere meter; kurver 5/25 m er beregnet af denne model og er ikke landmåling.'],
        ['**Skrifttype til kortnavne**', 'Open Sans (Apache 2.0) via fonts.openmaptiles.org', '–', '–'],
        ['**Kortbibliotek**', 'MapLibre GL JS 4.7.1 (BSD-3), PMTiles 3.2.1 (BSD-3)', '–', 'Leveres sammen med appen.'],
      ]),
      H('Dækning'),
      P('Afgrænsningen er union af OSM-kommunegrænserne for **Syddjurs** og **Norddjurs Kommune** (admin_level=7), **uden Anholt**, plus 3 km buffer. Det giver bbox ca. 10,11–11,01 °Ø, 56,07–56,63 °N. Vektordata findes for zoom 8–14 (zoom over 14 er forstørrelse); terrændata for zoom 7–13.'),
      H('Officielle danske data'),
      WARN('Den officielle danske højdemodel (DHM) og topografiske kortdata fra Dataforsyningen/Klimadatastyrelsen kræver adgangstoken og er ikke brugt i denne udgave. De kunne give mere præcise kurver og terræn.'),
      P('Opdatering: kortpakken genskabes af scripts i `tools/mapdata` (se README). I appen vises, når en nyere pakke findes online; den gamle bevares, indtil den nye er hentet og kontrolleret.'),
    ],
  }),

  info({
    id: 'om-begraensninger', kap: 'om', titel: 'Om appen: begrænsninger og hvad den aldrig kan love', niveau: 'gr',
    resume: 'Appen erstatter ikke 112, uddannelse eller officielle varsler. Regler, forbud og udsigter kan ændre sig.', tags: ['begrænsninger', 'ansvar', 'om', 'forbehold', 'offline', 'verificering'],
    kilder: ['brs-112'], kontrol: K.ok('Beskrivelse af appens begrænsninger.'),
    blokke: [
      DANGER('Appen erstatter aldrig **112**, et førstehjælpskursus, en kyndig svampe-/plantekender eller myndighedernes meddelelser. Den kan ikke garantere, at du har de nyeste regler, afbrændingsforbud, vejrudsigter eller beredskabsmeddelelser.', 'Det vigtigste'),
      UL('**Verificering:** Mange afsnit er kontrolleret mod primærkilder, men **ikke alle**. Hvert afsnit viser sin status. Se [[kilder]] for en liste over det, der er uverificeret.', '**Kortdata** er fra frivillig kortlægning og en grov højdemodel – ikke officiel landmåling.', '**Illustrationer** (knob m.m.) er skematiske egne tegninger. Der er **ingen artsfotos**, fordi de kunne give falsk tryghed.', '**Svampe og planter:** appen er ikke et bestemmelsesværktøj.', '**Førstehjælp:** lægmandsråd – tag et kursus.', '**Hardware:** GPS, kompas og batteri afhænger af enheden (se [[om-offline]]).'),
      INFO('Lovgivning og myndighedsregler er hentet fra primære kilder (Naturstyrelsen, Beredskabsstyrelsen, SGAV m.fl.) på de datoer, der står ved hver kilde. De kan ændre sig.'),
    ],
  }),

  info({
    id: 'om-offline', kap: 'om', titel: 'Offline: hvad der virker, og hvad der kræver hardware eller net', niveau: 'mi',
    resume: 'Efter første besøg og kortdownload virker alt uden net. GPS, kompas og batteri afhænger af enheden.', tags: ['offline', 'pwa', 'installation', 'opdatering', 'lager', 'gps', 'batteri'],
    kilder: ['brs-forbered-dig'], kontrol: K.ok('Beskrivelse af appens egen funktion; testet med Playwright (se testoversigt).'),
    blokke: [
      TABLE(['Funktion', 'Virker offline?', 'Afhænger af'], [
        ['Tekst, guides, illustrationer, kilder, tjeklister, søgning', 'Ja – efter første besøg (service worker)', 'Browserlager'],
        ['Kort, kortsøgning, højde, måling, waypoints, noter', 'Ja – efter download af kortpakke (31 MB)', 'Browserlager (IndexedDB)'],
        ['**GPS-position**', 'Ja, uden mobildækning', 'Enhedens GPS-hardware og tilladelse; fri sigt'],
        ['**Kompasretning (enhedens)**', 'Delvist', 'Enhedens sensor – kan være unøjagtig; brug rigtigt kompas'],
        ['Opdatering af indhold/kort', 'Kun online', 'Net'],
        ['Aktuelle regler, forbud, vejr, beredskab', 'Nej', 'Net / radio'],
      ]),
      H('Installation og lager'),
      UL('Åbn siden online én gang og "Føj til startskærm/installér". Hent derefter kortpakken under **Kort**.', 'Browseren kan i sjældne tilfælde rydde lager (lav lagerplads, længere tids inaktivitet). Appen anmoder om **vedvarende lager**; tjek **Mig → Data**.', 'Eksportér vigtige noter og waypoints jævnligt (JSON/GPX).', 'Opdateringer installeres i baggrunden og aktiveres først, når du vælger det; en afbrudt opdatering efterlader den gamle version i brug.'),
    ],
  }),
];
