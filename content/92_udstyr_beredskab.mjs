import { P, H, UL, OL, STEPS, INFO, WARN, DANGER, ACT, CL, C112, FIG, FIGS, TABLE, KV, DET, praktisk, info, K } from './_lib.mjs';

export const guides = [
  praktisk({
    id: 'udstyr-pakning', kap: 'udstyr', titel: 'Pak til forholdene (dagstur og natur i Danmark)', niveau: 'gr',
    resume: 'Tøj, lys, vand, mad, førstehjælp, kommunikation, navigation, ly og strøm – og et tørt skiftesæt.', tags: ['udstyr', 'pakning', 'rygsæk', 'tjekliste', 'dagstur', 'nødudstyr'],
    kilder: ['brs-forbered-dig', 'brs-forberedt'], kontrol: K.delvist('Powerbank, FM-radio, medicin og førstehjælpskasse er fra Beredskabsstyrelsen/Samsik. Resten er almen friluftspraksis ({T}).'),
    formaal: 'At pakke udstyr, der dækker de typiske risici i dansk natur.', hvornaar: ['Før hver tur – og til beredskabstasken.'],
    udstyr: ['Se afkrydsningsliste: [[rygsaek-dagstur]].'],
    trin: ['**Tøj efter lag** og tørt skiftesæt ([[ly-lag-paa-lag]]).', '**Lys:** pandelampe + ekstra batterier.', '**Vand og mad:** drikkevand (3 L/døgn til ophold), energirig mad.', '**Førstehjælp:** [[foerstehjaelpskasse]], medicin til mindst 3 dage (Beredskabsstyrelsen).', '**Kommunikation:** opladet telefon, powerbank, fløjte; FM-radio (batteri/håndsving).', '**Navigation:** offlinekort hentet, papirkort, kompas.', '**Ly:** tarp/redningstæppe, liggeunderlag.', '**Ild:** kun hvor lovligt: stormkøkken; tændstikker i vandtæt pose.', '**Reb og værktøj:** snor, kniv, lille sav (brug sikkert).'],
    kontrolTjek: ['Udstyret passer til årstid og længde; alt vejer det, du kan bære.'],
    fejl: ['At pakke for tungt.', 'At glemme tørt tøj og lys.', 'At pakke ting, man ikke kan bruge.'],
    sikkerhed: ['Test udstyret hjemme.', 'Pak nødudstyr tilgængeligt.'],
    dansk: ['Beredskabsstyrelsen anbefaler 3 døgns hjemmeberedskab – se [[hjemmeberedskab]].'],
    alternativ: ['Lån udstyr; start enkelt.'],
  }),

  praktisk({
    id: 'udstyr-kniv', kap: 'udstyr', titel: 'Kniv og værktøj: sikker brug', niveau: 'gr',
    resume: 'Skær væk fra kroppen, hold fast greb, brug skarp kniv, og pas på andre.', tags: ['kniv', 'værktøj', 'sav', 'økse', 'skærestik', 'sikkerhed'],
    kilder: ['sdk-bloedning', 'sdk-saar'], kontrol: K.delvist('Førstehjælp ved skærestik er kontrolleret (Sundhed.dk). Brugsråd er almen praksis ({T}); dansk våbenlovgivning for knive er ikke gennemgået.'),
    formaal: 'At undgå skader ved brug af kniv og værktøj.', hvornaar: ['Når du forbereder brænde, bygger ly eller laver mad.'],
    udstyr: ['Fast-blade kniv eller foldekniv, skærehandsker, første-hjælpskasse.', 'Alternativ: sav/brækkede grene til brænde i stedet for kniv.'],
    trin: ['**Skær væk fra kroppen** og fra andre; hold et blodcirkel af 2 meter fri omkring dig.', '**Hold kniven fast,** med klingen skarp (skarpe knive glider mindre).', '**Sæt dig,** når du skærer med kraft; hvil underarmen.', '**Pak sikkert:** luk/slib og opbevar i skede.', 'Håndter **økse/sav** på stabilt underlag med frit rum.'],
    kontrolTjek: ['Ingen i klingens bane; stabilt greb; frit rum.'],
    fejl: ['At skære mod låret/hånden.', 'At arbejde træt eller i mørke.'],
    sikkerhed: ['Ved alvorligt snit: tryk direkte, ring 112 ([[fh-bloedning]]). Småsår: [[fh-saar]].', 'Overhold gældende lovgivning for at medbringe/bære kniv (kontrolleres ikke her) {F}.'],
    dansk: ['Brug af kniv/økse til at hugge levende træ i naturen er ofte ikke tilladt.'],
    alternativ: ['Brug sav eller samlede grene fra bålpladsen (hvor lovligt).'],
  }),

  info({
    id: 'udstyr-improvisation', kap: 'udstyr', titel: 'Improviserede løsninger – hvad der er klogt og ikke', niveau: 'mi',
    resume: 'Improvisér isolering, tørring og skjul; improvisér ALDRIG varmekilder eller forbrænding i lukkede rum.', tags: ['improvisation', 'nødløsning', 'affaldssæk', 'redningstæppe', 'isolering'],
    kilder: ['sdk-kulilte', 'brs-forberedt'], kontrol: K.delvist('Princippet om aldrig at bruge åben ild/grill i lukkede rum er fra Sundhed.dk/Beredskabsstyrelsen. De viste løsninger er almen praksis ({T}).'),
    blokke: [
      TABLE(['Behov', 'Godt', 'Aldrig'], [
        ['Varme', 'Isolering, affaldssæk som vindspærre, grene/blade under dig, fælles kropsvarme', 'Grill/brændeovn/kul/gasbrænder i telt, hytte, bil eller kælder (kulilte, brand)'],
        ['Vand', 'Opsamling af regn i ren beholder + kogning', 'Ubehandlet vand fra mistænkelige kilder; kogning af kemisk forurenet vand'],
        ['Ly', 'Tarp/presenning/affaldssæk i læ', 'Bygge under døde grene eller skrænter'],
        ['Signal', 'Fløjte, lys, spejl, farvet stof', 'Åben ild under tørke eller ved afbrændingsforbud'],
        ['Førstehjælp', 'Rent tøj som forbinding, pinde som skinne ([[fh-brud]])', 'Hjemmebrygget "gift-udsugning" eller afbinding ved hugormebid'],
      ]),
      DANGER('Forsøg ikke at lave improviserede varmekilder, der kan give brand eller forgiftning. Denne app giver bevidst ingen vejledning til det.', 'Grænse'),
    ],
  }),

  info({
    id: 'dansk-numre', kap: 'beredskab', titel: 'Vigtige danske telefonnumre', niveau: 'gr', nod: true,
    resume: '112 til livsfare; 114 politi (ikke akut); lægevagt efter region; Giftlinjen 82 12 12 12.', tags: ['112', '114', '1813', 'lægevagt', 'giftlinjen', 'telefonnumre', 'alarm'],
    kilder: ['brs-112'], kontrol: K.ok('Alle numre er fra Beredskabsstyrelsens side (opdateret 11.2.2025; læst 26.10.2026). Lægevagtsnumre kan være ændret siden – tjek din region.'),
    blokke: [
      ACT('**112** – livsfare, politi, brandvæsen, ambulance, miljøforurening. Gratis, hele landet, EU. Ring ikke 112, hvis det ikke er akut.', 'Alarm'),
      TABLE(['Nummer', 'Hvad', 'Bemærkning'], [
        ['**1-1-2**', 'Alarm: politi, brand, ambulance, miljø', 'Sig hvad, hvor, hvem, evt. hvorfor. Bliv i telefonen.'],
        ['**1-1-4**', 'Politiets servicenummer', 'Ikke-akut kontakt til politikredsen.'],
        ['**1813**', 'Akuttelefon, Region Hovedstaden (døgnåben)', '–'],
        ['**70 11 31 31**', 'Lægevagten, Region Midtjylland', 'Djursland ligger i Region Midtjylland. Nummeret er fra Beredskabsstyrelsens side; tjek regionens hjemmeside for ændringer.'],
        ['70 11 07 07', 'Lægevagten, Region Syddanmark', ''], ['70 15 03 00', 'Lægevagten, Region Nordjylland', ''], ['1818', 'Lægevagten, Region Sjælland', ''],
        ['**82 12 12 12**', 'Giftlinjen (landsdækkende, døgnåben)', 'Forgiftning: planter, svampe, kemi, medicin'],
        ['33 92 11 12', 'Udenrigsministeriets Globale Vagtcenter', 'Ved akut bistand i udlandet'],
      ]),
      INFO('Døve og hørehæmmede kan få udleveret et hemmeligt nummer til SMS-alarmering via Danske Døves Landsforbund eller det lokale høreinstitut (Beredskabsstyrelsen).'),
      P('Gem vigtige numre under **Mig** ([[nod]]). Se også [[nod-tilkald-hjaelp]].'),
    ],
  }),

  info({
    id: 'beredskab-sirener', kap: 'beredskab', titel: 'Varsling: sirener, S!RENEN og beredskabsmeddelelser', niveau: 'gr',
    resume: 'Hører du en varslingssirene: gå indenfor og opsøg information via DR eller TV 2.', tags: ['sirene', 'varsling', 'siren', 'beredskabsmeddelelse', 'dr', 'fare'],
    kilder: ['brs-forbered-dig', 'brs-forberedt'], kontrol: K.ok('Beredskabsstyrelsen: "Hvis du hører en varslingssirene, skal du gå indenfor og opsøge information gennem DR eller TV 2."'),
    blokke: [
      CL('act', 'Hører du en sirene', 'Gå **indenfor**.', 'Find **information** via DR (radio/TV) eller TV 2 – FM-radio med batteri/håndsving er et sikkert valg.', 'Følg myndighedernes anvisninger.'),
      P('Myndighederne kan advare via sociale medier, hjemmesider, medier, S!RENEN og fysiske varslingssirener. Beredskabsmeddelelser udsendes via DR og TV 2. Den første onsdag i maj kl. 12 testes varslingskanalerne (Beredskabsstyrelsen).'),
      WARN('Vær kildekritisk under kriser (Beredskabsstyrelsen: tænk før du deler).'),
    ],
  }),

  praktisk({
    id: 'beredskab-3dogn', kap: 'beredskab', titel: 'Klar til 3 døgn: hjemmeberedskab', niveau: 'gr',
    resume: 'Vand (3 L/døgn pr. person), mad, medicin, hygiejne, varme og FM-radio til tre døgn.', tags: ['beredskab', '3 døgn', 'hjem', 'forberedt', 'vand', 'mad', 'medicin', 'radio', 'strømsvigt'],
    kilder: ['brs-forberedt', 'brs-forbered-dig'], kontrol: K.ok('Alle anbefalinger er fra Samsik/Beredskabsstyrelsen "Forberedt på kriser" (set 26.10.2026).'),
    formaal: 'At kunne klare dig selv i tre døgn, så myndighederne kan hjælpe dem, der har størst behov.', hvornaar: ['Før en krise: strømsvigt, storm, oversvømmelse, vandforsyningssvigt.'],
    udstyr: ['Se liste: [[hjemmeberedskab]].', 'Alternativ: Samsik har en "beredskabsberegner" online.'],
    trin: ['**Drikkevand:** 3 liter pr. person pr. døgn = 9 liter til 3 døgn (også husdyr).', '**Mad til 3 døgn,** der kan holde sig uden køleskab/fryser og helst ikke kræver ovn/komfur.', '**Medicin** til mindst 3 døgn og en **førstehjælpskasse**.', '**Hygiejne:** toiletpapir, hånddesinfektion, vådservietter, bind/tamponer.', '**Varme:** tæpper, dyner, varmt tøj; hold varmen i ét rum; stearinlys/varmekilder på fast underlag langt fra brændbart.', '**Kommunikation:** FM-radio (batteri/håndsving/sol); powerbank.', '**Madlavning:** mulighed for at koge vand uden strøm/gas – grill/stormkøkken **kun udendørs**.', '**Toilet ved vandmangel:** solid affaldspose i spand/toiletkumme, luk og smid som restaffald.'],
    kontrolTjek: ['Alt er samlet ét sted, nævnt på listen, og ikke udløbet.'],
    fejl: ['At glemme medicin og mad til husdyr.', 'At bruge grill indendørs.'],
    sikkerhed: ['Brug aldrig grill o.l. indendørs eller i delvist lukkede rum (røg/kulilte).'],
    dansk: ['Samsik/Beredskabsstyrelsen: når du kan klare dig i tre døgn, kan myndighederne fokusere på dem, der har størst behov.'],
    alternativ: ['Spørg din kommune om beredskabscentre og lokale retningslinjer.'],
  }),

  praktisk({
    id: 'beredskab-stroemafbrydelse', kap: 'beredskab', titel: 'Længerevarende strømafbrydelse', niveau: 'gr',
    resume: 'Hold varmen i ét rum, spar telefonen, tjek mad og vand, og ring 112 ved nød.', tags: ['strømafbrydelse', 'blackout', 'strømsvigt', 'varme', 'mad', 'kommunikation', 'radio'],
    kilder: ['brs-forberedt', 'brs-forbered-dig', 'fvst-hygiejne'], kontrol: K.ok('Råd om varme, radio, powerbank og at holde køleskab/fryser lukket er fra Samsik/Beredskabsstyrelsen og Fødevarestyrelsen.'),
    formaal: 'At klare dagene uden strøm sikkert.', hvornaar: ['Strømsvigt, der varer mere end få timer.'],
    udstyr: ['FM-radio, powerbank, lommelygte/pandelampe, tæpper, vand, mad.', 'Alternativ: nabohjælp, kommunalt varmested.'],
    trin: ['**Hold varmen:** opholdt jer primært i **ét rum**; tæpper/dyner; varmt tøj.', '**Lys:** brug lommelygte/pandelampe; stearinlys kun på fast underlag langt fra brændbart (og aldrig uden opsyn).', '**Information:** FM-radio og DR; undgå rygter.', '**Mad:** hold **køleskab og fryser lukket**; spis letfordærveligt først; brug mad, der ikke kræver kogning ([[mad-hygiejne]]).', '**Madlavning:** udendørs grill/stormkøkken – aldrig indendørs.', '**Telefon:** SMS frem for opkald; spar strøm; powerbank.', '**Vand:** 3 L pr. person pr. døgn ([[vand-nodforsyning]]); toilet: [[vand-nodforsyning]].', '**Ring 112** ved nød. Hjælp ældre og naboer.'],
    kontrolTjek: ['Alle er varme, har vand og information, og ingen bruger ild indendørs.'],
    fejl: ['At åbne køleskabet gentagne gange.', 'At bruge grill/gasapparater indendørs.'],
    sikkerhed: ['Kulilte og brand: aldrig improviserede varmekilder indendørs ([[baal-kulilte]]).'],
    dansk: ['Se tjekliste: [[stroemafbrydelse]].'],
    alternativ: ['Gå til familie/ven/nabo med varme.'],
  }),

  info({
    id: 'regler-faerdsel', kap: 'beredskab', titel: 'Regler: færdsel i skov, strand, udyrket land og beskyttede områder', niveau: 'mi',
    resume: 'Offentlige skove er åbne til fods og på cykel; private skove kun ad veje/stier kl. 6–solnedgang; strande åbne for færdsel til fods, kort ophold og badning.', tags: ['færdsel', 'regler', 'skov', 'strand', 'adgang', 'privat', 'hunde', 'natur'],
    kilder: ['sgav-varsomt', 'ns-ild'], kontrol: K.delvist('Hovedpunkter er hentet fra SGAV\'s oversigt over naturbeskyttelseslovens §§ 22–26 og adgangsbekendtgørelsen. Folderen kan være ældre end gældende lov; tjek retsinformation.dk.'),
    blokke: [
      WARN('Reglerne varierer med område, ejer, sæson og lokale restriktioner. En offlineapp kan ikke garantere, at du har de nyeste regler. Følg skiltning og tjek myndighedernes sider ved tvivl.', 'Forbehold'),
      TABLE(['Areal', 'Hovedregler (SGAV-oversigt)'], [
        ['**Offentlige skove**', 'Åbne for færdsel til fods og på cykel og for ophold (nbl. § 23). Hunde i snor. Fri fodfærdsel udenfor stier (adgangsbek. § 8) med undtagelser (indhegnede områder m.m.). Ejeren kan lukke ved jagt/skovning.'],
        ['**Private skove**', 'Kun ad **veje og stier**, kun **kl. 6 til solnedgang**; ophold ikke inden for **150 m** af beboelses- og driftsbygninger; hunde i snor.'],
        ['**Strandbredder**', 'Åbne for færdsel til fods, kortvarigt ophold og badning (nbl. § 22). Hunde i snor 1.4.–30.9. Privatejede strandbredder: ophold/badning ikke inden for 50 m af beboelse.'],
        ['**Klitfredede arealer**', 'Åbne for færdsel til fods og kortvarigt ophold (nbl. § 25); hunde i snor.'],
        ['**Udyrkede arealer**', 'Åbne for færdsel til fods (nbl. § 24).'],
        ['**Veje og stier i det åbne land**', 'Mark- og vejfredsloven § 17: skiltning kan begrænse; ikke ophold om natten.'],
      ]),
      UL('**Bål:** [[baal-regler]]. **Overnatning:** [[regler-overnatning]]. **Indsamling:** [[regler-indsamling]]. **Beskyttede områder:** [[regler-beskyttede]].', 'Motorkørsel er ikke tilladt i statens skov- og naturområder (Naturstyrelsen).', 'Følg skilte; adgang sker på eget ansvar.'),
    ],
  }),

  info({
    id: 'regler-overnatning', kap: 'beredskab', titel: 'Regler: overnatning, telt, tarp og shelters', niveau: 'mi',
    resume: 'Statens arealer: sov under åben himmel/i hængekøje; telt/tarp kun i fri-teltningsskove (1-2-3-reglen) eller på primitive pladser.', tags: ['overnatning', 'telt', 'tarp', 'shelter', 'fri teltning', 'hængekøje', 'primitiv plads', 'camping'],
    kilder: ['ns-teltning', 'ns-skovbund', 'ns-primitive'], kontrol: K.ok('Følger Naturstyrelsens sider (læst 26.10.2026). Gælder statens arealer.'),
    blokke: [
      WARN('Kun statens arealer er omfattet her. På private arealer kræves ejerens tilladelse; kommuner kan have egne regler.', 'Forbehold'),
      TABLE(['Aktivitet', 'Regel'], [
        ['**Sove i sovepose/hængekøje/under åben himmel**', 'Tilladt på statens arealer i skovbunden og på stranden; spænd ikke så barken skades. Tarp over hængekøje regnes som telt og kræver fri-teltningsskov.'],
        ['**Fri teltning**', '275 skove (Naturstyrelsen). **1-2-3-reglen:** én nat, højst to telte à tre personer. Teltet skal stå under træer og være skjult for stier, veje og bygninger. Ikke på strand, i klitter, enge, moser, heder, marker eller lysninger. Bål kun på bålsteder; uden for bålsted: stormkøkken med indelukket brænder.'],
        ['**Primitive overnatningspladser**', 'Op til 2 nætter i træk; gratis; shelters kan være først-til-mølle (2 nætter) eller bookes på book.naturstyrelsen.dk (3 måneder frem).'],
        ['**Lejrpladser**', 'Til organiserede grupper på 15 personer eller flere.'],
      ]),
      INFO('Find faciliteter på udinaturen.dk (kræver net). Kortet i appen viser OSM-markerede shelters, men de er **ikke verificeret** som åbne eller tilgængelige.'),
    ],
  }),

  info({
    id: 'regler-indsamling', kap: 'beredskab', titel: 'Regler: indsamling af planter, bær, svampe og andre ressourcer', niveau: 'mi',
    resume: 'Eget brug, begrænset omfang ("en bærepose"), ikke videresalg; fredede arter og områder undtaget.', tags: ['indsamling', 'bær', 'svampe', 'blomster', 'tang', 'gevir', 'kogler', 'regler'],
    kilder: ['ns-samle', 'fvst-svampe', 'sgav-varsomt'], kontrol: K.ok('Følger Naturstyrelsen (statens arealer; adgangsbek. § 28 nr. 5). Private arealer og fredede områder: tjek særskilt.'),
    blokke: [
      P('Statens skove og naturområder: du må **indsamle naturens frugter til eget brug** (ikke videresalg) og **i begrænset omfang** – i dag tolket som indholdet af en almindelig bærepose (Naturstyrelsen, adgangsbek. § 28 nr. 5).'),
      UL('**Bær, nødder, blomster og urter, svampe:** må samles (men ingen giftige svampe!). **Småkviste** fra jorden i begrænset omfang. **Kogler** på jorden – ikke plukket fra træer. **Tang** på strande til eget brug.', 'Må ikke: grangrene i områder med pyntegrønt-salg; brug af brænde uden særlig tilladelse; samling i fredede områder/Natura-områder uden tilladelse {F}.', 'Private skove og haver: ejerens tilladelse kræves.'),
      WARN('Fredede arter og beskyttede områder kan have særlige regler. Ramsløg kan være fredet lokalt. Tjek altid skilte og myndigheder.', 'Forbehold'),
    ],
  }),

  info({
    id: 'regler-beskyttede', kap: 'beredskab', titel: 'Beskyttede naturområder (nationalpark, Natura 2000, vildtreservater)', niveau: 'mi',
    resume: 'Følg skiltning – der kan gælde adgangsforbud, hundebånd og forbud mod indsamling.', tags: ['nationalpark', 'natura 2000', 'vildtreservat', 'fredning', 'beskyttet', 'adgang', 'mols'],
    kilder: ['osm', 'sgav-varsomt'], kontrol: K.ikke('Kortets viste områder stammer fra OpenStreetMap og er ikke juridisk afgrænsede; konkrete regler pr. område er IKKE gennemgået.'),
    blokke: [
      P('Kortet viser **beskyttede områder** i OpenStreetMap (nationalpark, vildtreservater, Natura 2000-områder) – fx Nationalpark Mols Bjerge, Ebeltoft Vig Vildtreservat, Natura 2000 Kaløskovene og Kaløvig. Grænserne er **ikke** juridiske afgrænsninger.'),
      WARN('Regler pr. område (adgang, hundebånd, forbud mod indsamling, ophold) er ikke gennemgået i denne udgave. **Følg skilte** og tjek Naturstyrelsen/kommunen, før du færdes eller samler ressourcer i beskyttede områder.', 'Ikke kontrolleret'),
    ],
  }),
];
