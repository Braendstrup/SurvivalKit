# Arkitektur

```
content/*.mjs ──┐                         ┌─ app/data/content.json  (tekst, arter, lister, kilder, SVG-figurer)
content/fig/*.svg┼─► tools/build.mjs ─────┼─ app/sw.js               (versioneret forhåndscache)
content/_knots.mjs┘   (validering)        └─ (fejler hvis links/kilder/figurer/struktur er forkerte)

tools/mapdata/*.py ──► app/map/pack/{djursland-vector.pmtiles, djursland-dem.pmtiles, djursland-search.json, manifest.json}

app/ (statisk, ingen server-logik)
  index.html, css/app.css, js/{app,views,store,db,packs,geo,mapview,util}.js
  vendor/ (MapLibre, PMTiles – lokale kopier)   map/{style.js, glyphs/}
```

## Valg og begrundelser

| Beslutning | Valg | Hvorfor |
|---|---|---|
| Platform | PWA (HTML/JS, ingen framework) | Én kodebase til Android/iOS/desktop; ingen app-butik; lille og gennemskuelig |
| Kort | MapLibre GL JS + PMTiles | Vektorfliser giver små filer og skarp skrift; PMTiles er én fil, åbent format, kan slices fra en Blob uden server |
| Kortlagring | PMTiles som Blob i IndexedDB | Virker offline; en fil pr. datasæt; kan hentes, kontrolleres (SHA-256) og aktiveres atomisk |
| Højde | Terrarium-DEM (PNG) i PMTiles | Direkte brug til skyggerelief i MapLibre og til højdeopslag i appen |
| Kurver | Beregnet i pipeline (5 m / 25 m) fra z13-DEM, vektorfliser | Ingen tung beregning i klienten |
| Søgning | Lille lokalt indeks (tokens, danske tegn foldes) + kortets navneindeks (JSON) | Ingen eksterne API'er |
| Lagring | IndexedDB (kv, waypoints, packs) | Robust over for genstart; blobs understøttes |
| Opdatering | Service worker: ny version i ny cache, aktiveres først på brugerens valg | Afbrudt opdatering efterlader den gamle brugbare version |
| Eksterne ressourcer | Ingen (skrifttyper = systemfonte, glyphs lokale, ingen CDN) | Krav om fuld offlinebrug |

## Datamodel (content.json)

`chapters`, `guides` (blokke: p/h/ul/ol/steps/callout/call112/fig/figs/table/kv/details/sec), `species`, `lists`, `sources`, `figs`, `nodmenu`, `build`.
Hver guide/art har `kontrol` (status, dato, note) og `kilder` (id'er til kilderegistret). Mini-markup i tekst: `**fed**`, `*kursiv*`, `[[id|tekst]]` (internt link), `{D}`/`{T}`/`{F}` (dokumenteret / tommelfingerregel / faglig vurdering).

## Koordinater

WGS84 (kort og GPS) og ETRS89/UTM32N (EPSG:25832) vises. UTM-formlerne er egen implementering (Krüger-serie), testet mod pyproj (afvigelse < 0,00001 m i 8 testpunkter).
