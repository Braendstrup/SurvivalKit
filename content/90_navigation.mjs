import { P, H, UL, OL, STEPS, INFO, WARN, DANGER, ACT, CL, C112, FIG, FIGS, TABLE, KV, DET, praktisk, info, K } from './_lib.mjs';

const MISV = 'Beregnet for Djursland (56,3° N, 10,6° Ø) i oktober 2026: magnetisk nord ligger ca. **4,7° øst** for geografisk nord (WMM2025), og UTM32-gitterets nord ligger ca. **1,3° øst** for geografisk nord. Kompasnålen peger derfor ca. **3,4° øst for kortets lodrette gitterlinjer**. Værdierne ændrer sig ca. 0,2° pr. år.';

export const guides = [
  praktisk({
    id: 'nav-find-vej-kort', kap: 'navigation', titel: 'Jeg skal finde vej på kortet', niveau: 'gr', nod: true,
    resume: 'Åbn offlinekortet, tryk positionsknappen, læs koordinater, find nærmeste vej, mål afstand og vælg kort, sikker rute.', tags: ['kort', 'find vej', 'gps', 'position', 'offline', 'koordinater', 'vej'],
    kilder: ['osm', 'terrain', 'wmm'], kontrol: K.delvist('Brugsvejledningen beskriver appens egne funktioner. Kortdata er OpenStreetMap og en grov højdemodel (se Kilder).'),
    formaal: 'At bestemme, hvor du er, og komme ad en kort, sikker rute til vej eller bebyggelse.', hvornaar: ['Du er usikker på din position eller på vejen til hjælp.'],
    udstyr: ['Telefon med hentet kortpakke ([[kort]]), evt. papirkort og kompas, pandelampe.', 'Alternativ uden telefon: papirkort + kompas ([[nav-kompas]]).'],
    foer: [INFO('Hent kortpakken, **mens du har net** – ellers virker kortet ikke offline.', 'Forberedelse')],
    trin: [
      'Åbn **Kort** i appen. Tryk på **positionsknappen** (kryds-/pejlesymbol): GPS virker uden mobildækning, hvis tilladelse er givet. Venter du på GPS, så stå under åben himmel.',
      '**Aflæs din position** nederst i kortet og ved at trykke på kortet: grader og **UTM32/ETRS89**. Notér den, hvis du skal ringe 112 ([[nav-koordinater]]).',
      '**Find nærmeste vej/by/bygning:** zoom ud, kig efter veje (gule/hvide linjer), bebyggelse (grå) og skov (grøn). Brug **søgefeltet** til by-/vejnavne.',
      '**Mål afstand** (lineal-knappen) til dit mål. Se **højdekurver** og skyggerelief for stigninger.',
      '**Planlæg en enkel rute** (rutefunktionen) med gangtid og stigning – eller gem **waypoints** for sikre punkter.',
      '**Vælg en kort rute** langs veje/stier, ikke tværs over mose, vand og krat. Medbring lys; vend om, hvis det bliver mørkt eller vejret skifter.',
    ],
    kontrolTjek: ['GPS-positionen stemmer med det, du ser omkring dig (vej, vandløb, skov), og nøjagtigheden (±m) er rimelig.', 'To uafhængige tegn peger samme sted hen.'],
    fejl: ['At stole blindt på GPS i skov/dal med dårlig nøjagtighed.', 'At følge en sti, som kortet viser, men som ikke findes eller er privat.', 'At lade kortet "hænge" uden at tjekke dækningen (grå/mørke områder er ikke hentet).'],
    sikkerhed: ['OSM-data er frivillig kortlægning: veje/stier kan mangle eller være forældede, privat ejendom vises ikke fuldt.', 'Punkter som vand, shelter, hjertestarter er ikke verificeret.', 'Ring 112 ved nød – kortet erstatter ikke det.'],
    dansk: ['Kortet dækker Syddjurs og Norddjurs kommuner (ekskl. Anholt) + 3 km. Uden for det område er der intet kort.', 'Koordinater: appen viser både WGS84 og UTM32/ETRS89 (EPSG:25832) – se [[nav-koordinater]].'],
    alternativ: ['Uden telefon: [[nav-kompas]], [[nav-position]] og [[nav-svigt]].'],
  }),

  info({
    id: 'nav-kortforstaaelse', kap: 'navigation', titel: 'Kortforståelse: målestok, signaturer og højdekurver', niveau: 'gr',
    resume: 'Målestok = forholdet mellem kort og virkelighed; kurver viser højde; tætte kurver = stejlt.', tags: ['målestok', 'signatur', 'højdekurve', 'terræn', 'kort', 'afstand'],
    kilder: ['osm', 'terrain'], kontrol: K.ikke('Kortlære er alment kendt; ikke kontrolleret mod en navngiven kilde.'),
    blokke: [
      H('Målestok og afstand'),
      TABLE(['Målestok', '1 cm på kortet', '4 cm på kortet', 'Brug'], [['1:10.000', '100 m', '400 m', 'Detaljeret, by og sti'], ['1:25.000', '250 m', '1 km', 'Almindeligt friluftskort'], ['1:50.000', '500 m', '2 km', 'Overblik/rute'], ['1:100.000', '1 km', '4 km', 'Planlægning']]),
      P('I appen vises **målestokken** nederst til venstre, og **afstanden** kan måles med lineal-funktionen. Afstand i luftlinje er altid kortere end vejen.'),
      H('Signaturforklaring'),
      P('Se **Signaturforklaring** i kortet (bogknappen). Farver viser skov, hede, vand, bebyggelse; linjer viser veje, stier, vandløb; cirkler viser punkter fra OpenStreetMap. Papirkort har egen signaturforklaring i margen.'),
      H('Højdekurver og terrænformer'),
      UL('**Højdekurve:** linje gennem punkter med samme højde. I appen er den tynde kurve hver **5 m** og den tykke hver **25 m** (modelbaseret).', '**Tætte kurver** = stejlt, **spredte** = jævnt.', '**Bakke/top:** lukkede ringe, hvor højeste tal står inderst. **Dal:** kurverne danner V/U, som peger mod højere terræn. **Ryg:** V/U peger mod lavere terræn. **Sadel:** lavning mellem to toppe.', 'Vandløb løber nedad: kurvernes knæk peger op ad dalen.'),
      WARN('Højdekurver i appen er afledt af en grov højdemodel (ca. 10–25 m opløsning) og er ikke landmåling – brug dem til overblik, ikke til sikkerhedskritisk beslutning.'),
      FIG('hoejdekurver'),
    ],
  }),

  praktisk({
    id: 'nav-kompas', kap: 'navigation', titel: 'Kompas: retninger, kortorientering og misvisning', niveau: 'mi',
    resume: 'Orientér kortet, tag kurs, og husk misvisning (magnetisk nord ligger øst for kortets nord).', tags: ['kompas', 'retning', 'kurs', 'misvisning', 'nord', 'pejling'],
    kilder: ['wmm'], kontrol: K.delvist('Misvisningen er beregnet med WMM2025 (pygeomag) og gitterkonvergens med pyproj – ikke fra en dansk myndighed. Metoden er almindelig kompaslære.'),
    formaal: 'At bruge kompas og kort sammen til at holde en kurs og orientere kortet.', hvornaar: ['Når GPS/mobil svigter, eller du vil kontrollere retning.'],
    udstyr: ['Pejlekompas (plade), papirkort, blyant, ur.', 'Alternativ: kompas på telefonen – tjek mod rigtigt kompas, og hold det væk fra magneter/metal.'],
    advarsel: [INFO(MISV, 'Misvisning i Djursland')],
    fig: ['kompas'],
    trin: [
      '**Orientér kortet:** læg kompasset på kortet og drej kortet, til kortets nord-linjer er parallelle med nålen **forskudt med misvisningen**: nålen peger ca. 3,4° øst for kortets lodrette linjer.',
      '**Tag kurs fra kort:** læg kompassets kant fra dig til mål, drej huset, så retningslinjerne passer med kortets lodrette linjer, og læs graderne (kortvinkel). Træk 3,4° fra for at få **kompaskursen** (kompaskurs = kortvinkel − 3,4°).',
      '**Gå kursen:** hold kompasset fladt, drej dig til nålen peger på N-mærket, og vælg et landemærke i retningen. Gå til det og gentag.',
      '**Tag pejling:** peg på landemærke, læs kompasvinkel, læg 3,4° til for kortvinkel (kortvinkel = kompaskurs + 3,4°).',
      '**Tjek:** stemmer retningen med kortet (veje, vandløb)?',
    ],
    kontrolTjek: ['Nålen peger roligt; resultatet passer med kendte objekter.'],
    fejl: ['At glemme misvisningen (3–5° giver stor afvigelse over lange afstande).', 'At holde kompasset ved metal, mobil eller bil.', 'At lade nålen "hænge" – ryst forsigtigt.'],
    sikkerhed: ['Gå ikke efter kompas i mørke over farlige terræn (vand, skråning).', 'Stop og tjek efter hver etape.'],
    dansk: ['Danske kort har gitter efter UTM32/ETRS89: gitternord ≈ 1,3° øst for geografisk nord på Djursland. Magnetisk misvisning ændres ~0,2°/år – tjek årstal på kortet.'],
    alternativ: ['Ingen kompas: brug landemærker, vej, vandløb, kystlinje ([[nav-svigt]]).'],
  }),

  praktisk({
    id: 'nav-position', kap: 'navigation', titel: 'Bestem din position ud fra synlige terrængenstande (triangulering)', niveau: 'mi',
    resume: 'Pejl 2–3 kendte objekter, læg baglæns pejlelinjer på kortet; skæringen er din position.', tags: ['position', 'triangulering', 'pejling', 'terrængenstande', 'orientering'],
    kilder: [], kontrol: K.ikke('Almindelig kortlæsning ({T}); ikke kontrolleret mod en navngiven kilde.'),
    formaal: 'At finde din position uden GPS.', hvornaar: ['Du kan se mindst to identificerbare objekter, som står på kortet (kirketårn, mast, sø, vejkryds, top).'],
    udstyr: ['Kort, pejlekompas, blyant, lineal.', 'Alternativ: stirrer mod en linje (vej, bæk) og en tværgående markering.'],
    fig: ['triangulering'],
    trin: ['**Orientér kortet** ([[nav-kompas]]).', '**Peg** kompasset mod objekt A og aflæs kompaskursen. Gør det samme for B (og C).', '**Omregn** til kortvinkel (+3,4°) og find **bagpejling** (kortvinkel ± 180°).', '**Tegn linjer** på kortet fra A og B med bagpejlingen; din position er hvor de **skærer hinanden**. En tredje linje viser fejlen (trekant = usikkerhed).', '**Kontrollér** med landskabet: ligger du på en vej/skråning, som terrænet viser?'],
    kontrolTjek: ['Mindst to linjer skærer med vinkel mellem 30° og 150°; tredje pejling giver lille trekant.'],
    fejl: ['Forkert objekt identificeret.', 'Misvisning glemt.', 'Næsten parallelle pejlelinjer (dårlig skæring).'],
    sikkerhed: ['Usikkerhed op til flere hundrede meter ved dårlige pejlinger – tilkald hjælp, hvis du er i tvivl.'],
    dansk: ['Gode objekter: kirker, fyr, master, vindmøller, vandtårne, vejkryds, søer. Offlinekortet viser mange af dem.'],
    alternativ: ['Brug telefonens GPS ([[nav-find-vej-kort]]) eller følg en kendt retningslinje (vej/kyst).'],
  }),

  info({
    id: 'nav-koordinater', kap: 'navigation', titel: 'Koordinater: WGS84 og UTM32/ETRS89', niveau: 'mi',
    resume: 'Appen viser både grader (WGS84) og UTM32 (ETRS89). Brug det system, redningsfolk spørger om – eller læs begge.', tags: ['koordinater', 'utm', 'wgs84', 'etrs89', 'grader', 'gps', 'position'],
    kilder: ['osm'], kontrol: K.delvist('Formlerne i appen er testet mod pyproj (EPSG:25832) – se testoversigt. Beskrivelsen af systemerne er almen geodæsi.'),
    blokke: [
      TABLE(['System', 'Hvad er det', 'Eksempel (Grenaa)'], [
        ['**WGS84** (EPSG:4326)', 'Geografiske koordinater i grader (bredde/længde). Bruges af GPS og mange apps.', '56,41° N, 10,88° Ø'],
        ['**ETRS89 / UTM32N** (EPSG:25832)', 'Officielt dansk kortprojektion: meter i et fladt gitter. Øst-værdi (Ø) og Nord-værdi (N). Zone 32.', 'Ø 615 946 m, N 6 253 676 m'],
      ]),
      P('ETRS89 og WGS84 afviger under ca. 1 m til praktisk brug, så lon/lat kan bruges som input til UTM-beregningen i appen. **Forskellen mellem systemerne:** grader er vinkler på kloden; UTM er meter på et kort og kan bruges direkte med lineal.'),
      H('Sådan oplyser du position til 112'),
      UL('Sig koordinaterne i det system, du ser (fx "UTM32, Ø 615946, N 6253676") eller bredde/længde i grader (56,4134 nord, 10,8793 øst).', 'Sig også nærmeste vej, by eller landemærke og retning/afstand.', 'Er du usikker: sig, at du er usikker, og beskriv omgivelserne.'),
      WARN('Verificér altid, at GPS-nøjagtigheden (±m) er rimelig, før du giver koordinater videre.'),
    ],
  }),

  praktisk({
    id: 'nav-rute', kap: 'navigation', titel: 'Planlæg en rute med alternative udgange og gangtid', niveau: 'mi',
    resume: 'Planlæg korte etaper med synlige retningslinjer, alternative udgange og margener; gangtid er et skøn.', tags: ['rute', 'planlægning', 'gangtid', 'alternativ', 'naismith', 'etape', 'afbrydelse'],
    kilder: [], kontrol: K.ikke('Naismiths regel og planlægningsprincipperne er almen friluftspraksis ({T}).'),
    formaal: 'At lave en realistisk plan og have en plan B.', hvornaar: ['Før en tur – og når du skal bevæge dig fra et uheldssted.'],
    udstyr: ['Kort (offline), kompas, lys, ur; rutefunktionen i appen.', 'Alternativ: papirkort og snor/lineal.'],
    trin: ['**Del ruten op i etaper** på 1–3 km med tydelige delmål (vejkryds, sø, bakke).', '**Notér retningslinjer** (vej, vandløb, kyst) og **fangstlinjer** (noget, du ikke kan gå forbi uden at mærke det).', '**Planlæg alternative udgange:** hvor er nærmeste vej/bygning hvert sted? Marker dem.', '**Estimér tid** ({T}): 5 km/t + 1 minut pr. 10 m stigning (Naismith). Læg 30–50 % til ved børn, tung oppakning, mørke, dårligt føre. Det er et skøn, ikke en garanti.', '**Sæt afbrydelsestid:** hvornår vender du om? Vurder dagslys.', '**Fortæl andre** din rute og forventede tilbagekomst.'],
    kontrolTjek: ['Alle etaper har retningslinje; alle har en udgang; tiden passer med lyset.'],
    fejl: ['For lange etaper uden delmål.', 'Ingen alternative udgange.', 'For optimistisk tid.'],
    sikkerhed: ['Vurder vejr og lys ([[vejr-dmi]]); vend tidligt.', 'Ruten må ikke gå over privat/forbudt areal ([[regler-faerdsel]]).'],
    dansk: ['Rutefunktionen i kortet laver rette linjer og viser stigning og gangtid – følg altid stier/veje i praksis.'],
    alternativ: ['Brug marcherede, eksisterende stier i stedet for direkte linje.'],
  }),

  praktisk({
    id: 'nav-svigt', kap: 'navigation', titel: 'Når GPS, mobil eller kompas svigter', niveau: 'mi',
    resume: 'Fald tilbage på kort, landemærker, retningslinjer og tælletrin.', tags: ['gps', 'mobil', 'kompas', 'svigter', 'fallback', 'retningslinje', 'skridttælling'],
    kilder: ['osm'], kontrol: K.ikke('Almen friluftspraksis ({T}).'),
    formaal: 'At finde vej uden teknik.', hvornaar: ['Strømløs telefon, intet GPS-signal, ødelagt kompas.'],
    udstyr: ['Papirkort (best), ur, noget at markere med.', 'Alternativ: hukommelse + landmærker.'],
    trin: ['**Stop** og afgør: bliv eller gå ([[nod-blive-eller-gaa]]).', 'Brug **retningslinjer** (vej, vandløb, kyst, jernbane, vindmøller) og **fangstlinjer**.', '**Tæl trin:** ca. 65–75 skridt pr. 100 m (dobbeltskridt ~ 60) – kalibrér din egen. {T}', '**Brug tid:** ved 4 km/t gå ca. 15 min pr. kilometer {T}.', '**Orienter efter vejen/vandløb:** vand løber nedad; veje fører til bebyggelse.', '**Markér** vigtige punkter (sten, tøj) og gå kun i sikkert terræn.', 'Prøv at få signal igen på åbent sted.'],
    kontrolTjek: ['Retning bekræftes af mindst to objekter.'],
    fejl: ['At gå i ring uden retningslinje.', 'At gå i mørke.', 'At følge solen som eneste kompas.'],
    sikkerhed: ['Gå aldrig ud på is eller i vand for at "genvej".', 'Bliv hellere, end at gå i dårligt vejr uden orientering.'],
    dansk: ['Danske veje og kyster er tætte – de er bedste retningslinjer.'],
    alternativ: ['Tilkald hjælp ([[nod-tilkald-hjaelp]]).'],
  }),

  info({
    id: 'nav-folkelige-metoder', kap: 'navigation', titel: 'Folkelige retningsmetoder – brug dem ikke som primær navigation', niveau: 'gr',
    resume: 'Mos, sol og stjerner kan give en grov pejling, men de er upålidelige som eneste metode.', tags: ['mos', 'sol', 'stjerne', 'ur', 'folkelig', 'retning', 'nord'],
    kilder: [], kontrol: K.ikke('Almen kritisk vurdering ({T}); ikke citeret.'),
    blokke: [
      WARN('Mos på træer, træernes vækst, solens position og stjernebilleder er **ikke pålidelige primære metoder**. De kan afvige betydeligt og give falsk tryghed.', 'Vigtigt'),
      UL('**Mos på nordsiden:** mos vokser, hvor det er fugtigt og skyggefuldt – det varierer med træ, skov og vejr.', '**Solen:** står ca. i syd ved middagstid (i Danmark omkring kl. 13 sommertid), op i øst og ned i vest – kun en grov retning {T}, afhænger af årstid og klokken.', '**Stjerner:** Nordstjernen (Polaris) står tæt på nord – kræver, at du kan finde den.', '**Armbåndsur:** metoder med analogt ur giver kun en grov retning {T}.'),
      P('Brug dem kun som **kontrol** af et kompas/kort/GPS – aldrig som det eneste, du går efter. Se [[nav-kompas]], [[nav-svigt]].'),
    ],
  }),
];
