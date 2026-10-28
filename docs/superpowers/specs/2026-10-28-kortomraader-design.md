# Kort til andre områder – design

Dato: 2026-10-28 · Status: godkendt i chat

## Mål

Brugeren skal kunne hente offlinekort for et selvvalgt område hvor som helst i verden og bruge det som Djursland-kortet. Det gælder lag, højdekurver, højde, GPS, måling, rute, waypoints og søgning. Alt skal virke uden net efter download. Djursland-pakken bevares uændret.

## Datakilder

| Data | Kilde | CORS | Vilkår |
|---|---|---|---|
| Vektorfliser z0–14, OpenMapTiles-skema | OpenFreeMap (`tiles.openfreemap.org/planet`, TileJSON angiver den aktuelle version) | `*` (verificeret 2026-10-28) | Offline-download tilladt: ≤ 3.000 fliser eller ≤ 50 MB pr. download, ≤ 4 samtidige forespørgsler, "unik User-Agent" |
| Højde (Terrarium PNG) z7–12 | AWS `elevation-tiles-prod/terrarium` | `*` | Åbne data (som Djursland-pakken) |

**Fravalgte kilder:**
- Protomaps' offentlige build: ingen CORS.
- GitHub Releases: ingen CORS.

**User-Agent:** en browser kan ikke sætte User-Agent. Browseren sender `Origin`/`Referer` med appens adresse. Det dokumenteres i `docs/KORTDATA.md` med en anbefaling om at kontakte OpenFreeMap før bred udbredelse.

## Brug

- **Områdevælger øverst på kortsiden** ("Djursland ▾"): viser Djursland, de hentede områder og "+ Hent nyt område". Det valgte område huskes.
- **Hent-skærm:**
  - et onlinekort (OpenFreeMap "liberty"-stil) med en fast ramme;
  - eksakt antal fliser og anslået størrelse (ud fra en stikprøve);
  - knappen er spærret over grænserne med beskeden "Zoom ind – området er for stort";
  - navnefelt, Hent-knap, fremdrift, Afbryd og Genoptag.
- **Hentede områder** vises med en ny stil (`map/style-omt.js`) i Djursland-stilens farver og signaturer:
  - højdekurver beregnet på telefonen (`maplibre-contour`) og skyggerelief;
  - højde i infobjælken;
  - søgning i et lokalt navneindeks pr. område.
- **Indstillinger → Kort:** liste over områder (navn, størrelse, dato) med slet.
- **Uden for omfang:** satellitbilleder, opdatering af områder (slet og hent igen), samlet visning af flere områder.

## Teknik

- **IndexedDB** (version 2):
  - lageret `tiles` med nøglerne `ofm/z/x/y` og `dem/z/x/y` → `{ data: ArrayBuffer, refs: [områdeId…] }`;
  - lageret `areas` med `{ id, name, bbox, zooms, tiles, bytes, created, source, ready, names }`.
- **Download:**
  - fliselisten beregnes ud fra bbox og zoomniveauer;
  - kun manglende fliser hentes, med en pulje på 4 samtidige forespørgsler;
  - hver flise gemmes straks (genoptagelse er gratis);
  - `ready: true` sættes først til sidst. Ikke-klare områder vises med "Genoptag".
- **Sletning:** områdets id fjernes fra hver flises `refs`. Fliser med tom liste slettes.
- **Visning:**
  - `ofm://z/x/y` og `dem://z/x/y` læser fra IndexedDB. Manglende fliser giver et tomt svar, og der gås aldrig til nettet;
  - dækningsmaske ud fra områdets bbox;
  - `maplibre-contour` (vendoret) laver kurverne;
  - højdeopslag bruger samme Terrarium-dekodning som Djursland (`packs.elevationAt` generaliseres).
- **Navneindeks:** ved download dekodes vektorfliserne på z14. Navne fra `place`, `poi`, `transportation_name`, `water_name` og `mountain_peak` lægges i samme format som Djursland-søgeindekset (`[navn, type, lon, lat]`) med dubletfjernelse. En lille, egen MVT-dekoder med protobuf og geometri til punkt eller første koordinat ligger i `app/js/mvt.js`.

## Test

- **Enhedstests:** fliseliste for en bbox (antal pr. zoom, grænser), refs og sletning, og MVT-navneudtræk på en rigtig OpenFreeMap-flise (fixture).
- **E2E med lokal falsk flise-server** (Playwright route omdirigerer OpenFreeMap og AWS til fixtures):
  - områdevælger;
  - spærring af for store områder;
  - download med fremdrift;
  - afbryd og genoptag;
  - lag og kurver renderer;
  - søgning;
  - sletning;
  - **fuld offline efter genstart**.
- **Rigtig afprøvning:** ét lille område (≈ 100 fliser) mod de rigtige tjenester.
- **Eksisterende tests** skal bestå uændret.
