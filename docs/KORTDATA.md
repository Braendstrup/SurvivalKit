# Kortdata: kilder, pipeline, download og opdatering

## Dækning
Afgrænsningen **udledes af data**, ikke af en bynavneliste: union af OpenStreetMap-relationerne for **Syddjurs Kommune** og **Norddjurs Kommune** (`admin_level=7`, relationerne 1926255 og 1926320), **uden Anholt** (ligger ~50 km ude i Kattegat), plus **3 km buffer**. Bbox: 10,112–11,008 °Ø, 56,068–56,634 °N. Byer som Grenaa, Ebeltoft, Rønde, Hornslet, Ryomgård, Kolind, Auning, Nimtofte, Følle og Mols Bjerge ligger i dækningen (testet via kortsøgning, K04). Kortet markerer området uden for dækning med en mørk maske og viser en advarsel i statuslinjen.

## Datasæt
| Datasæt | Kilde | Licens | Dato |
|---|---|---|---|
| Veje, stier, skove, vand, bebyggelse, beskyttede områder (OSM-tags), punkter, navne | OpenStreetMap, udtræk fra download.openstreetmap.fr (Danmark) | ODbL 1.0 | filens tidsstempel 2026-10-23T03:01:50Z |
| Højde (skyggerelief, kurver, højdevisning) | Terrain Tiles (Terrarium), AWS Open Data | åbne data, kildeangivelse | hentet 2026-10-26 |
| Kortskrift | Open Sans glyph-PBF (Apache 2.0), fonts.openmaptiles.org | Apache-2.0 | – |

**Kendte begrænsninger:** højdemodellen har ca. 10–25 m opløsning og flere meters usikkerhed; kurver (5/25 m) er afledt og ikke landmåling. OSM er frivillig kortlægning – stier, shelters, bålpladser, vandposter, hjertestartere og toiletter kan mangle eller være forældede og er **ikke verificeret**. Kortet påstår aldrig, at et sted er åbent, tilgængeligt eller egnet til overnatning. Den officielle danske højdemodel (DHM) og topografiske data fra Dataforsyningen kræver adgangstoken og er ikke brugt; de er den oplagte opgradering.

## Lag og punkter
Terræn/kurver, skyggerelief, skove, hede, vådområder, strand, bebyggelse, søer, vandløb, kystlinje (hav/land fra OSM-kystlinje), veje/stier/grusveje/jernbane/færge, broer (markeret på veje), bygninger (z14), beskyttede områder (OSM), kommunegrænse, byer/navne, toppe. Punkter fra OSM: drikkevand, kilde, toilet, shelter/ly, bålplads, campingplads, madpakkehus, parkering, sygehus, politi, brandstation, hjertestarter, apotek, udsigtspunkt, havn, station, landemærke.

## Pipeline (`tools/mapdata/`)
```bash
pip install -r tools/mapdata/requirements.txt
tools/mapdata/run_all.sh ./work     # ~15 min, ~1 GB diskplads, internet påkrævet
```
1. `01_extract.py` finder kommunegrænserne, afgrænser bbox og udtrækker et OSM-udsnit (pyosmium).
2. `03_dem.py` henter Terrarium-fliser (z7–13), kvantiserer dem (0,25 m) og pakker dem i PMTiles; gemmer z13-mosaik.
3. `02_vector.py` klassificerer OSM-objekter, bygger land/hav fra kystlinjen, beregner højdekurver, klipper/forenkler til MVT-fliser (z8–14) og skriver PMTiles + søgeindeks.
4. `04_manifest.py` kopierer til `app/map/pack/` og skriver `manifest.json` med størrelser, **SHA-256**, dækning, kilder og datoer.

Pakkens aktuelle størrelse: vektor 19,2 MB, højde 12,0 MB, søgeindeks 0,6 MB (**31 MB**; kræver ≈ 39 MB ledig plads ved download).

## Download og opdatering i appen
Kort → "Hent kortpakke": fremdrift pr. fil, kontrol af størrelse og SHA-256, atomisk aktivering. Er der en nyere version online, tilbyder **Kortdata og dækning** at hente den; den gamle bevares, til den nye er godkendt. Pakken kan også lægges på en anden statisk server ved at kopiere mappen `app/map/pack/`.

## Selvvalgte kortområder (hele verden)

Brugeren kan hente et område hvor som helst, ud over Djursland-pakken (kode: `app/js/areas.js`, stil: `app/map/style-omt.js`, design: `docs/superpowers/specs/2026-10-28-kortomraader-design.md`).

| Data | Kilde | Zoom | Licens |
|---|---|---|---|
| Vektorfliser (OpenMapTiles-skema) | [OpenFreeMap](https://openfreemap.org/), `tiles.openfreemap.org/planet` (version efter TileJSON, gemmes med området) | 6–14 | © OpenStreetMap-bidragydere, ODbL; OpenMapTiles |
| Højde (Terrarium PNG) | AWS Terrain Tiles, `s3.amazonaws.com/elevation-tiles-prod/terrarium` | 7–12 | SRTM, EU-DEM m.fl. (åbne data) |

- **Vilkår (OpenFreeMap, læst 2026-10-28):** offline-download er tilladt med højst 3.000 fliser eller 50 MB pr. download, højst 4 samtidige forespørgsler og en "unik User-Agent". De to første håndhæves i koden; det sidste er verificeret i e2e-testen M03.
  - **User-Agent:** en browser kan ikke sætte User-Agent, men sender altid `Origin`/`Referer` med appens adresse. Kontakt OpenFreeMap, før appen bruges af mange.
- **Lagring:** IndexedDB-lageret `tiles` (nøgle `ofm/z/x/y` eller `dem/z/x/y`) med en liste over de områder, der bruger flisen. Overlappende områder deler fliser, og en flise slettes først, når intet område bruger den. Et område er "klar" først, når alle fliser og navneindekset er gemt. Afbrudte downloads genoptages uden at hente fliser igen.
- **Visning:**
  - fliser læses via protokollerne `ofm://` og `idbdem://` og aldrig fra nettet;
  - højdekurverne (10/50 m ved zoom 13, 5/25 m ved zoom 14+) beregnes på enheden med `maplibre-contour` og er kun vejledende (højdemodel ca. 30–40 m pr. pixel ved z12);
  - søgeindekset bygges ved download ud fra navnene i z14-fliserne (byer, steder, veje, vand, toppe, POI'er).
- **Afprøvet mod de rigtige tjenester 2026-10-28:** et område over Mols Bjerge (ca. 6 × 6 km, 63 fliser, 2,9 MB, 159 navne) hentede på 4 s og viste skov, vand, højdekurver og højde. Søgning efter "Agri" fandt Agri Bavnehøj m.fl.
