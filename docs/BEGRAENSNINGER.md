# Kendte begrænsninger og krav, der ikke (fuldt) er opfyldt

Opdateret sammen med den seneste testkørsel. Intet er markeret som testet, hvis det ikke er det.

## Krav der ikke er fuldt opfyldt
1. **Faglig verificering er ufuldstændig.** Et mindretal af guides er kontrolleret mod primærkilder (se VERIFICERING.md); resten er *delvist* eller *ikke* verificeret og er markeret i appen. Der har ikke været en menneskelig fagekspert (instruktør, læge, botaniker, mykolog) til at gennemgå indholdet. **Det skal ske før offentlig brug.**
2. **Knob:** kun fem knob (pælestik, råbåndsknob, flagknob, ottetal, kædestik) har tegninger, og de er skematiske; dobbelt halvstik, tømmerstik, dobbelt halvstik om fast genstand og bardun har kun tekst, fordi skitserne ikke kunne kvalitetssikres. Der er ikke trinvise tegninger for samling/surring ud over det angivne.
3. **Artsguide uden illustrationer:** bevidst (ingen fotos/AI-tegninger), men kravet om "tydelig visuel identifikation" er dermed ikke opfyldt. 31 arter er medtaget (20 med kilde-verificeret status, 8 delvist, 3 uverificerede). Fisk, skaldyr og tang har regler og risici, men ingen artslister.
4. **Kort:** ingen officielle danske data (DHM/Geodatastyrelsen/Dataforsyningen kræver token). Ingen verificerede drikkevandsposter, toiletter eller hjælpesteder – kun OSM-markerede punkter med advarsel. Zoom over 14 er forstørrelse. Anholt er ikke med. Rutefunktionen er rette linjer (ingen stiruting).
5. **Regler** er hentet fra Naturstyrelsen, Beredskabsstyrelsen og SGAV på angivne datoer; lovtekster på retsinformation.dk er ikke læst direkte. Regler for beskyttede områder, fiskeriets fredningstider/mindstemål og jagt er ikke gennemgået.
6. **Test:** kun Chromium; ingen rigtige mobile enheder, ingen ægte GPS/kompas, ingen test af PWA-installation, iOS-lagerrydning eller længerevarende brug (se TESTRESULTATER.md).
7. **Tilgængelighed:** farvekontrast er designet efter høj kontrast, og information er ikke kun farve – men der er ikke kørt en formel WCAG-audit eller skærmlæsertest.

## Tekniske begrænsninger
- Browserlager kan ryddes af styresystemet (se OFFLINE.md).
- GPS-nøjagtighed varierer; kompas i telefon kan være misvisende.
- Kortsøgning er en simpel delstrengs-søgning i et indeks på ≈ 14.500 navne.
- Kortpakken er stor (31 MB); dele af området kan ikke hentes separat.
- Højdeværdier er modelbaserede (±flere meter).
- Appen forudsætter en moderne browser (MapLibre WebGL, IndexedDB, Service Worker, OffscreenCanvas).

## Det appen aldrig kan love
At have de nyeste regler, afbrændingsforbud, vejrudsigter eller beredskabsmeddelelser; at et sted på kortet er åbent/tilgængeligt/sikkert; at en plante eller svamp er sikker at spise; at et knob kan bære en person.
