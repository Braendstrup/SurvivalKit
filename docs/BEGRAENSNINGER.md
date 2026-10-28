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
- Djursland-pakken er stor (31 MB); dele af området kan ikke hentes separat.
- Selvvalgte kortområder: højst 3.000 fliser eller 50 MB pr. område (ca. 30–50 km i bredden). De kræver OpenFreeMap og AWS ved download (eksterne, gratis tjenester uden garanti). Højdekurver beregnes ud fra en grovere højdemodel end Djursland-pakken. Navne i ikke-latinske skriftsystemer vises ikke, fordi kun latinske skrifttegn er gemt lokalt. Opdatering kræver, at området slettes og hentes igen.
- Hent-skærmen bruger OpenFreeMaps online-stil, som giver tre ufarlige konsoladvarsler ("Expected value to be of type number") – ikke appens egen stil.
- Højdeværdier er modelbaserede (±flere meter).
- Appen forudsætter en moderne browser (MapLibre WebGL, IndexedDB, Service Worker, OffscreenCanvas).

## AI-assistenten
- En sprogmodel kan gengive håndbogen forkert eller udelade vigtige forbehold, selv med håndbogens tekst som grundlag. Derfor vises altid links til de guides, svaret bygger på – læs originalen ved alt vigtigt. Reglerne (afvisning på følsomme emner, 112 ved nødord) håndhæves af appen, men kan ikke garantere et korrekt svar.
- Kræver WebGPU og meget hukommelse: E4B ca. 3,3 GB GPU-hukommelse (nyere telefoner), E2B mindre. Mange ældre telefoner og nogle browsere (fx Safari på ældre iOS) kan ikke køre modellen.
- Modellen er kun afprøvet i headless Chromium med CPU-emuleret WebGPU (SwiftShader), ikke på en rigtig telefon (se TESTRESULTATER.md / tests/ai_real_results.json).
- "En model der allerede er på telefonen" kan kun udnyttes, hvis browseren selv stiller den til rådighed (Chrome Prompt API); en webapp kan ikke bruge modeller i andre apps eller i styresystemet.
- Samtaler gemmes ikke, og hvert spørgsmål besvares for sig (ingen hukommelse af tidligere spørgsmål i samtalen).

## Det appen aldrig kan love
At have de nyeste regler, afbrændingsforbud, vejrudsigter eller beredskabsmeddelelser; at et sted på kortet er åbent/tilgængeligt/sikkert; at en plante eller svamp er sikker at spise; at et knob kan bære en person; at et AI-svar er korrekt.
