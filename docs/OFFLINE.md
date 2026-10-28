# Offline-funktionalitet

| Del | Hvordan | Nødvendig forbindelse |
|---|---|---|
| App-skal, tekst, illustrationer, kilder, arter, tjeklister, søgning | Service worker forhåndscacher 31 filer (≈ 1,9 MB) under et versioneret cachenavn | Kun første besøg |
| Kortpakke (31 MB) | Hentes fra `map/pack/` med fremdrift; filstørrelse og SHA-256 kontrolleres; gemmes i IndexedDB; aktiveres atomisk | Kun ved download/opdatering |
| Noter, bogmærker, nødkontakter, tjeklister, waypoints, ruter, indstillinger | IndexedDB | Ingen |
| GPS | Browserens geolocation (enhedens GPS) | Ingen netforbindelse; kræver hardware og tilladelse |

## Atomiske opdateringer
- **Indhold:** ny service worker installeres i en ny cache (`sk-static-<version>`). Mislykkes en fil, afbrydes installationen, og den eksisterende version fortsætter (testet: R04). Ny version aktiveres først, når brugeren trykker "Opdater nu".
- **Kort:** den nye pakke lægges under nye nøgler (`vec@<version>` …). Først når alle filer er hentet og SHA-256-kontrolleret, flyttes pegepinden `packs.active`; derefter slettes den gamle. Afbrudt eller korrupt hentning rydder de halve filer og lader den gamle pakke stå (testet: R02, R03).
- **Lager:** hentning afvises med klar besked, hvis ledig kvote < 1,3 × pakkestørrelsen (testet: R01).

## Begrænsninger ved browserlager
Browsere kan rydde websitelager ved lav lagerplads eller lang inaktivitet (Safari/iOS: op til 7 dage uden brug, hvis ikke tilføjet startskærm). Appen anmoder om vedvarende lager (`navigator.storage.persist()`) og viser status under **Indstillinger → Offline og lagring**. Eksportér derfor noter og waypoints (JSON/GPX).

## Kortområder offline
Selvvalgte kortområder gemmes flise for flise i IndexedDB (`tiles`, `areas`) og vises udelukkende fra lageret. Det gælder også højdekurver og skyggerelief, som beregnes på enheden. Fuld offlinebrug efter genstart er testet (e2e O10).

## AI-assistent offline
Sprogmodellen (2–3 GB) ligger i browserens fillager (OPFS) og AI-programfilerne (MediaPipe, ≈ 27 MB) i en separat cache (`sk-ai-*`), som først oprettes, når brugeren henter en model. Appens grundinstallation er derfor uændret (≈ 2 MB). Download sker i bidder af 64 MB med HTTP range og kan genoptages efter afbrydelse; filen kontrolleres med SHA-256, før den aktiveres. Ingen spørgsmål sendes ud af enheden.

## Hvad kræver hardware/net
GPS, kompas og batteri afhænger af enheden. Aktuelle regler, afbrændingsforbud, vejr og beredskabsmeddelelser kræver net eller radio – en offlineapp kan aldrig garantere, at de er opdaterede.
