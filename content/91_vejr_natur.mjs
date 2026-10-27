import { P, H, UL, OL, STEPS, INFO, WARN, DANGER, ACT, CL, C112, FIG, FIGS, TABLE, KV, DET, praktisk, info, K } from './_lib.mjs';

export const guides = [
  info({
    id: 'vejr-dmi', kap: 'vejr', titel: 'Vejrinformation og varsler – og hvad en offlineapp ikke kan', niveau: 'gr',
    resume: 'Tjek DMI og myndighedernes varsler før og under turen. Appen kan ikke vise aktuel vejrudsigt offline.', tags: ['vejr', 'dmi', 'varsel', 'udsigt', 'beredskabsmeddelelse', 'storm', 'sne'],
    kilder: ['brs-forbered-dig'], kontrol: K.delvist('Råd om at følge DMI/Politi/medier og beredskabsmeddelelser via DR/TV 2 er fra Beredskabsstyrelsen (snestorm- og forberedelsessiderne).'),
    blokke: [
      WARN('En offlineapp kan **ikke** garantere, at du har den nyeste vejrudsigt, afbrændingsforbud eller beredskabsmeddelelse. Tjek, når du har net, og lyt til DR/TV 2 på radio under kriser.'),
      UL('**DMI** (dmi.dk) varsler vejr; Politiet (politi.dk) kan fraråde færdsel. Beredskabsstyrelsen: følg DMI og myndigheder i sne- og stormsituationer.', 'Ved varsel om kraftig vind, skybrud, snestorm: **udsæt turen**, eller søg sikker bygning.', 'FM-radio (batteri/håndsving) kan bringe beredskabsmeddelelser, hvis andre kanaler er nede (Beredskabsstyrelsen).'),
      P('Se også [[vejr-tegn]], [[vejr-rute]], [[vejr-kyst]], [[vejr-lyn]].'),
    ],
  }),

  info({
    id: 'vejr-tegn', kap: 'vejr', titel: 'Vejrtegn i naturen (grove tommelfingerregler)', niveau: 'mi',
    resume: 'Faldende lufttryk, hurtigt skiftende vind og tykkere skyer varsler dårligere vejr – kun som pejling.', tags: ['vejrtegn', 'skyer', 'vind', 'tryk', 'varsel', 'tåge'],
    kilder: [], kontrol: K.ikke('Almen meteorologisk praksis ({T}).'),
    blokke: [
      UL('Tiltagende vind, vindskifte, tiltagende skydække og faldende temperatur kan varsle regn/storm. {T}', 'Høje, tynde slørskyer efterfulgt af lavere, tykkere skyer varsler ofte en front. {T}', 'Tåge: orientering bliver svær – brug kompas og retningslinjer, og vent hellere.', 'Lokale forhold (kyst, bakker) kan give hurtige skift i Danmark.'),
      WARN('Folkeregler er upålidelige. Brug aldrig dem i stedet for et officielt varsel.'),
    ],
  }),

  praktisk({
    id: 'vejr-rute', kap: 'vejr', titel: 'Valg af rute efter vejret', niveau: 'mi',
    resume: 'Vælg læ, korte etaper og tidlig afbrydelse; lad vejret afgøre – ikke planen.', tags: ['rute', 'vejr', 'valg', 'læ', 'vind', 'tidlig'],
    kilder: ['brs-forbered-dig'], kontrol: K.ikke('Almen praksis ({T}).'),
    formaal: 'At undgå at komme i dårligt vejr uden mulighed for læ.', hvornaar: ['Før turen og ved vejrskifte.'],
    udstyr: ['Vejrudsigt (DMI), kort, tøj til lag, tarp, lys.', 'Alternativ: fælles beslutning om at vende om.'],
    trin: ['**Tjek DMI** inden turen og ved pauser.', '**Vælg læ:** skov/bygning frem for hede/strand ved blæst.', '**Planlæg alternative udgange** ([[nav-rute]]).', '**Afbryd tidligt** ved vindskifte, regn, mørke, kulde og træthed.', '**Hold gruppen samlet.**'],
    kontrolTjek: ['Du har læ og en udgang inden for 30–60 minutter.'],
    fejl: ['At holde fast i planen.', 'At undervurdere vind og kulde ved kysten.'],
    sikkerhed: ['Stormflod og høje bølger: hold afstand til vand.', 'Tordenvejr: [[vejr-lyn]].'],
    dansk: ['Vindbrus ved kysten og tåge over vand er hyppige; temperatur og nedbør skifter hurtigt.'],
    alternativ: ['Brug bygning/shelter og vent på forbedring.'],
  }),

  info({
    id: 'vejr-kyst', kap: 'vejr', titel: 'Kysten og vand: særlige risici', niveau: 'mi',
    resume: 'Koldt vand, strøm, høj bølge og stormflod er farligt – hold afstand i dårligt vejr.', tags: ['kyst', 'stormflod', 'bølger', 'koldt vand', 'drukning', 'strøm'],
    kilder: ['brs-forbered-dig', 'sgav-varsomt'], kontrol: K.delvist('Stormflod/oversvømmelse fra havet er omtalt af Beredskabsstyrelsen; strandbreddens status (nbl. § 22) er fra SGAV. Øvrigt er almen forsigtighed ({T}).'),
    blokke: [
      UL('**Stormflod:** vind kan presse havvand ind over kysten (Beredskabsstyrelsen) – hold afstand til lave kyststrækninger.', '**Koldt vand** kan lamme og give drukning selv for gode svømmere – badning udenfor sæson og alene er farlig. {T}', '**Strøm og bølger** ved moler, sten og pynt: undgå at gå ud.', '**Strandbredder** er åbne for færdsel til fods, kortvarigt ophold og badning (naturbeskyttelseslovens § 22), men uden telt/tarp og kun på eget ansvar (SGAV).'),
      INFO('Ring **112** ved drukning/uheld i vand. Kast evt. et reb/flydeobjekt – gå ikke selv ud.'),
    ],
  }),

  praktisk({
    id: 'vejr-lyn', kap: 'vejr', titel: 'Tordenvejr og lyn', niveau: 'mi',
    resume: 'Søg lavt, uden høje enkeltstående objekter; undgå vand og åbent terræn.', tags: ['torden', 'lyn', 'tordenvejr', 'sikkerhed'],
    kilder: [], kontrol: K.ikke('Almen sikkerhedspraksis ({T}).'),
    formaal: 'At mindske risikoen ved lyn.', hvornaar: ['Torden kan høres, eller mørke skyer og lyn er nær.'],
    udstyr: ['Isolerende underlag, tøj.', 'Alternativ: bygning eller bil (lukket).'],
    trin: ['**Søg ly** i bygning eller lukket bil.', 'Uden ly: **kom væk fra høje træer, master, åbne marker, hoveder og kamme**; søg en lavning i skov blandt jævnt høje træer. {T}', 'Spredt gruppen (≥ 15 m), så ikke alle rammes. {T}', 'Sæt dig på isolerende underlag, bøjet, fødder samlet. {T}', '**Vent 30 minutter** efter sidste torden. {T}'],
    kontrolTjek: ['Du er væk fra vand og høje objekter.'],
    fejl: ['At gemme sig under et enkeltstående træ.', 'At blive i vandet.'],
    sikkerhed: ['Ring 112 ved lynnedslag og påbegynd HLR ved hjertestop ([[fh-hlr]]).'],
    dansk: ['Tordenvejr er hyppigst i sommerhalvåret; åbne heder og strande er udsatte.'],
    alternativ: ['Lukket bil/bygning er langt bedre end ethvert friluftsskjul.'],
  }),

  info({
    id: 'natur-oversigt', kap: 'natur', titel: 'Overlevelse i forskellige danske naturtyper', niveau: 'mi',
    resume: 'Skov, hede, strand/kyst, åbent land og plantage har hver deres fordele, farer og regler.', tags: ['naturtyper', 'skov', 'hede', 'strand', 'kyst', 'åbent land', 'plantage', 'overlevelse'],
    kilder: ['ns-teltning', 'ns-ild', 'sgav-varsomt', 'sdk-hugorm'], kontrol: K.delvist('Regler (bål, overnatning, færdsel, rygeforbud) er kontrolleret. Fysiske vurderinger er almen praksis ({T}).'),
    blokke: [
      TABLE(['Naturtype', 'Fordele', 'Farer', 'Praktisk'], [
        ['**Skov**', 'Læ, materialer til isolering, navigationshjælp via stier', 'Faldende grene/stormfald, flåter, let at fare vild, mørke', 'Bliv i stisystem; undgå døde træer; hold lys/refleks'],
        ['**Hede**', 'God udsigt, åbne sigtelinjer', 'Ingen læ, hugorm, brandfare, tåge', 'Hold til stier, tjek hugorm ved solvarme steder, rygeforbud 1.3.–31.10.'],
        ['**Strand/kyst**', 'Åbent, synligt, vand (ikke drikkeligt)', 'Vind, kulde, stormflod, bølger, glatte sten', 'Hold afstand til vand i blæst; søg læ i skov/klit; ingen telt/tarp på strand'],
        ['**Åbent land**', 'Nærhed til vej/bebyggelse', 'Ingen læ, privat ejendom, hegn og dyr', 'Gå ad veje og stier; følg skiltning'],
        ['**Plantage** (nåle)', 'Vindsikker, tørt', 'Brandfare, ensartet, let at fare vild', 'Ingen bål udenfor pladser; rygeforbud'],
        ['**Søer/vandløb**', 'Retningslinjer; vand', 'Drukning, kulde, forurening, glatte bredder', 'Drik ikke ubehandlet'],
      ]),
      P('Se også [[natur-djursland]] og [[ly-naturtyper]].'),
    ],
  }),

  info({
    id: 'natur-djursland', kap: 'natur', titel: 'Djursland: landskab, steder og lokale forhold', niveau: 'mi',
    resume: 'Halvø med Mols Bjerge, Kalø Vig, Ebeltoft Vig, Randers Fjord og kysten mod Kattegat.', tags: ['djursland', 'mols', 'grenaa', 'ebeltoft', 'rønde', 'kalø', 'agri bavnehøj', 'nationalpark'],
    kilder: ['osm', 'terrain'], kontrol: K.delvist('Stedfakta er hentet fra OpenStreetMap-data i kortpakken (fx Agri Bavnehøj 137 m, Trehøje 127 m, Nationalpark Mols Bjerge, Natura 2000-områder, vildtreservater). Ikke gennemgået mod en officiel kilde.'),
    blokke: [
      P('Djursland er en halvø i Østjylland. Kortet dækker **Syddjurs og Norddjurs kommuner** (uden Anholt) + 3 km, herunder byer som **Grenaa, Ebeltoft, Rønde, Hornslet, Ryomgård, Kolind, Auning, Nimtofte** og landskaber som **Mols Bjerge**, **Kalø Vig**, **Følle** og kysterne ved Kattegat.'),
      H('Landskab'),
      UL('**Mols Bjerge:** bakkelandskab med hede, overdrev, skov og kyst; Nationalpark Mols Bjerge (OSM). Højeste punkter i OSM-data: **Agri Bavnehøj 137 m**, **Trehøje 127 m**.', '**Skove og plantager:** fx Knebel, Vistoft og Kalø-skovene (Natura 2000-områder markeret i OSM).', '**Kyster og vige:** Kalø Vig, Ebeltoft Vig (vildtreservat), Begtrup Røn m.fl.', '**Søer og moser:** mindre søer og vådområder.'),
      H('Forhold at være opmærksom på'),
      UL('**Hugorm** på lyngheder og solvarme stier i Mols Bjerge ([[fh-hugorm]]). **Flåter** er almindelige ([[fh-flaat]]).', '**Beskyttede områder** (nationalpark, vildtreservater, Natura 2000): særlige færdsels- og adgangsregler kan gælde – følg skiltning ([[regler-beskyttede]]).', '**Mobildækning** kan mangle i dale og skov.', '**Kyst:** vind og kulde; Kattegat er koldt.'),
      INFO('Kortet viser kun det, OpenStreetMap kender. Udeladte steder findes ikke nødvendigvis ikke.'),
    ],
  }),

  info({
    id: 'natur-dyr-oversigt', kap: 'natur', titel: 'Dyr og farer: flåter, insekter, hugorm og andre møder', niveau: 'gr',
    resume: 'Skeln mellem almindelige gener, situationer der kræver læge, og nødsituationer.', tags: ['flåt', 'myg', 'hvepse', 'hugorm', 'dyr', 'insekter', 'kvæg', 'hund'],
    kilder: ['sdk-flaat', 'sdk-hugorm', 'sdk-allergi'], kontrol: K.delvist('Flåt, hugorm og allergi er kontrolleret mod Sundhed.dk. Myg, hvepse (undtagen allergi) og dyr er almen viden.'),
    blokke: [
      TABLE(['Dyr/fare', 'Almindelig gene', 'Kræver læge', 'Nød (112)'], [
        ['**Flåt**', 'Bid fjernes; lokal rødme få cm', 'Rødt udslæt >5 cm, feber, over 1–2 uger', '–'],
        ['**Hugorm**', 'Tørt bid uden symptomer (alle bør vurderes)', 'Hævelse, smerter, kvalme', 'Børn <12, ældre, gravide, allergi, flere bid, bid ikke i arme/ben, vejrtrækningsbesvær'],
        ['**Hvepse/bier**', 'Lokal smerte og hævelse', 'Stor lokal reaktion, stik i munden', 'Åndenød, hævet svælg, svimmelhed, nældefeber over kroppen → anafylaksi'],
        ['**Myg/knotter**', 'Kløe', 'Infektion af stikket', '–'],
        ['**Kreaturer, heste, hunde**', 'Hold afstand; hunde i snor', 'Bid/spark', 'Alvorlige skader'],
      ]),
      UL('Rør **ikke døde eller syge dyr** med bare hænder ([[mad-dyr-risici]]).', 'Hold afstand til vilde dyr; fodr ikke.', 'Hunde: følg regler om snor ([[regler-faerdsel]]).'),
      P('Se [[fh-flaat]], [[fh-hugorm]], [[fh-allergi]].'),
    ],
  }),
];
