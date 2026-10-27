import { P, H, UL, OL, STEPS, INFO, WARN, DANGER, ACT, CL, C112, FIG, FIGS, TABLE, KV, DET, praktisk, info, K } from './_lib.mjs';

export const guides = [
  info({
    id: 'svamp-sikkerhed', kap: 'arter', titel: 'Svampe: sikkerhedsstandard', niveau: 'mi',
    resume: 'Kun svampe du kender 100 %. Billeder og apps kan ikke garantere sikker bestemmelse. Farve, lugt og smag afgør intet.', tags: ['svampe', 'sikkerhed', 'bestemmelse', 'fluesvamp', 'dobbeltgænger', 'rå'],
    kilder: ['fvst-svampe', 'fvst-svampefolder', 'sdk-svampeforg'], kontrol: K.ok('Fødevarestyrelsens fem råd og folderen "Ka\' de spises?" (læst 26.10.2026).'),
    blokke: [
      DANGER('Spis kun svampe, du kender 100 %. Brug af AI eller billeder til at bestemme giftige svampe er **ikke sikkert** (Fødevarestyrelsen). Denne app giver derfor ingen foto-bestemmelse og anbefaler ingen svampe til nybegyndere i en nødsituation.', 'Hovedreglen'),
      H('Fødevarestyrelsens fem råd'),
      OL('Spis kun svampe, du kender 100 %.', 'Spis kun anerkendte spisesvampe, som du kan finde i en nyere svampebog.', 'Brug kun friske svampe til madlavning og nedkøl madrester straks.', 'Begynd altid med en lille portion af en ny spisesvamp (så overfølsomhed viser sig i mindre omfang).', 'Spis ikke rå, vilde svampe.'),
      H('Hvad afgør ikke, om en svamp er giftig'),
      UL('**Farve, lugt, smag og tilberedning** afgør ikke, om en svamp er giftig. De to farligste, grøn og snehvid fluesvamp, smager ikke ubehageligt.', 'Gamle råd som "sølvskeer misfarves af giftsvampe" er forkerte.', 'Billeder og offline identifikationsværktøjer kan ikke garantere en sikker bestemmelse.'),
      H('Hvad nybegyndere bør gøre'),
      UL('Start med letkendelige grupper (Fødevarestyrelsen nævner rørhatte), tag på tur med en kyndig, eller lær via svampeforening/aftenskole.', 'Medtag aldrig svampe, du ikke kan bestemme – hverken til suppe eller "bare at smage".', 'Undgå svampe langs trafikerede veje (tungmetaller og forurening).', 'Slørhatte, trævlhatte og rødblad: afhold dig helt (Fødevarestyrelsen).'),
      INFO('Se artsguiden for de svampe, der er medtaget (spiselige med deres farlige dobbeltgængere, og giftige): [[arter]]. Forgiftning: [[svamp-forgiftning]].'),
    ],
  }),

  praktisk({
    id: 'svamp-forgiftning', kap: 'arter', titel: 'Mistanke om svampeforgiftning', niveau: 'gr',
    resume: 'Ring Giftlinjen 82 12 12 12. Fremkald ikke opkastning. Gem rester og tag billeder.', tags: ['svampeforgiftning', 'giftlinjen', 'opkast', 'fluesvamp', 'rester'],
    kilder: ['sdk-svampeforg', 'fvst-svampe', 'brs-112'], kontrol: K.ok('Følger Sundhed.dk (Førstehjælp ved indtagelse af giftige svampe, 9.7.2025) og Fødevarestyrelsen.'),
    formaal: 'At få hurtig behandling og undgå alvorlig skade ved svampeforgiftning.', hvornaar: ['Du/nogen har spist svamp og har kvalme, opkast, diarré, mavesmerter – eller du bare frygter, at svampen var giftig.', 'Symptomer, der først opstår 8 timer eller mere efter måltidet, kan være tegn på alvorlig forgiftning (Fødevarestyrelsen).'],
    udstyr: ['Telefon (82 12 12 12), kamera, rester af svampen/måltidet/opkast, pose.', 'Alternativ: notér beskrivelse og voksested.'],
    foer: [ACT('Ring **Giftlinjen 82 12 12 12** (døgnåben). Ved bevidstløshed, kramper eller vejrtrækningsproblemer: **112**.', 'Straks')],
    trin: ['**Ring Giftlinjen** – vent ikke på symptomer.', '**Fremkald ikke opkastning.**', '**Gem rester** af svampen, måltidet og opkast.', '**Tag billeder** af svampen fra flere vinkler (oversiden, undersiden af hatten, stokken).', '**Beskriv voksestedet**: have, park, græsplæne, granskov, under løvtræer, på stub eller barkrester, på bakker.', 'Følg Giftlinjens anvisning (de kan rådgive om fx medicinsk kul).', 'Opsøg læge/skadestue ved mistanke.'],
    kontrolTjek: ['Giftlinjen har en vurdering og en plan; personen er under opsyn.'],
    fejl: ['At vente på symptomer.', 'At smide resterne ud.', 'At forsøge hjemmebehandling (opkast, mælk, salt).'],
    sikkerhed: ['Opkast og rester kan hjælpe lægerne med at finde giften – gem dem.', 'Børn: kontakt Giftlinjen straks.'],
    dansk: ['Giftlinjen: Bispebjerg Hospital, 82 12 12 12, døgnåben, landsdækkende (Beredskabsstyrelsen/Sundhed.dk).'],
    alternativ: ['Ingen telefon: opsøg nærmeste læge/skadestue eller ring 112, når du får dækning.'],
  }),

  praktisk({
    id: 'giftige-planter-forgiftning', kap: 'arter', titel: 'Mistanke om forgiftning efter planter eller bær', niveau: 'gr',
    resume: 'Ring Giftlinjen 82 12 12 12; gem rester; tag billeder; fremkald ikke opkast.', tags: ['planter', 'bær', 'giftige', 'forgiftning', 'børn', 'giftlinjen'],
    kilder: ['sdk-svampeforg', 'brs-112', 'dtu-planter'], kontrol: K.delvist('Giftlinjens nummer og generelle procedure følger Sundhed.dk/Beredskabsstyrelsen (svampe). Planteafsnittet er ikke læst som egen side; DTU er brugt til at pege på kendte farlige arter.'),
    formaal: 'At handle rigtigt ved indtagelse af mulig giftig plante.', hvornaar: ['Barn eller voksen har spist ukendte bær/planter eller blade; symptomer: kvalme, opkast, diarré, svimmelhed, hjertebanken.'],
    udstyr: ['Telefon, kamera, rester af planten/bær (pose).'],
    foer: [ACT('Ring **Giftlinjen 82 12 12 12** (døgnåben). Ved alvorlige symptomer: **112**.', 'Straks')],
    trin: ['**Ring Giftlinjen.**', '**Fremkald ikke opkastning.**', 'Skyl munden; giv ikke mælk/salt/andet "husråd" uden vejledning.', '**Gem plantedele** og tag billeder (blade, blomst, bær, hele planten).', 'Notér **mængde, tidspunkt og symptomer**.', 'Følg anvisning og opsøg læge.'],
    kontrolTjek: ['Giftlinjen har vurderet risikoen; du har en plan.'],
    fejl: ['At vente.', 'At undervurdere børns indtagelse (små mængder kan være farlige).'],
    sikkerhed: ['Kendte farlige danske arter: liljekonval, høsttidløs, druehyld/sommerhyld (DTU) og galnebær m.fl. Se [[arter]].'],
    dansk: ['Giftlinjen 82 12 12 12 og 112.'],
    alternativ: ['Ingen telefon: kom hurtigt til læge/skadestue.'],
  }),

  praktisk({
    id: 'mad-hygiejne', kap: 'tilberedning', titel: 'Hygiejne, krydskontaminering og opbevaring af mad', niveau: 'gr',
    resume: 'Vask hænder, hold råt adskilt fra spiseklar, varm ordentligt op, køl hurtigt ned og hold koldt.', tags: ['hygiejne', 'rester', 'opbevaring', 'krydskontaminering', 'køl', 'bakterier', 'hænder'],
    kilder: ['fvst-hygiejne'], kontrol: K.ok('Fødevarestyrelsens fem råd til god køkkenhygiejne (læst 26.10.2026). Under primitive forhold er principperne omsat.'),
    formaal: 'At undgå madforgiftning, når du laver mad uden køkken og med lidt vand.', hvornaar: ['Al madlavning udendørs, under strømsvigt og i beredskabet.'],
    udstyr: ['Sæbe/hånddesinfektion, rent vand (kogt hvis nødvendigt), skærebrætter/underlag, termometer, køletaske/isoleret kasse, rene beholdere.', 'Alternativ: vådservietter og hånddesinfektion, hvis der er meget lidt vand.'],
    trin: ['**Vask hænder** før madlavning, efter råt kød/fisk og efter toiletbesøg. Har du ikke vand: sæbe på vådservietter og desinfektion (Samsik).', '**Hold råt kød/fisk adskilt** fra spiseklar mad (brød, salat). Brug adskilt skærebræt, bestik og beholder (Fødevarestyrelsen).', '**Varm maden ordentligt op:** rygende og gennemvarm; kylling og hakket kød helt igennemstegt; hakkebøf med kernetemperatur **mindst 75 °C** (1,5 cm tyk: ca. 7–8 min pr. side, 15 min i alt).', '**Hold varm mad over 65 °C** – under 65 °C kan bakterier vokse.', '**Køl hurtigt ned:** bakterier trives ved 20–40 °C (1 bakterie → 1.000 på 3 timer, 1 million på 6 timer). Mad der skal gemmes, skal kun lige dampe af og så på køl; del store portioner.', '**Køleskab højst +5 °C.** Uden strøm: hold køleskab og fryser lukket så meget som muligt.', '**Skyl frugt og grønt**; skyl bær fra naturen.', '**Opbevar rester** koldt og brug dem hurtigt; smid mad ud, som lugter/ser forkert ud.'],
    kontrolTjek: ['Termometer viser min. 75 °C i kernen af hakket/fjerkræ; maden er rygende varm; rester er nedkølet og lukket inde.'],
    fejl: ['At lade mad stå ved stuetemperatur i flere timer.', 'At bruge samme kniv til råt kød og salat.', 'At varme kun "lunt".'],
    sikkerhed: ['Spor af bakterier kan overleve kogning som sporer (bacillus, clostridier) – nedkøl hurtigt (Fødevarestyrelsen).', 'Spis aldrig vilde svampe rå; spis ikke tvivlsom mad ved kvalme/opkast efter måltidet.'],
    dansk: ['Køleskabets +5 °C-regel og 75 °C-reglen er fra Fødevarestyrelsens private hjem-råd. Rester fra naturen: kog ofte.'],
    alternativ: ['Ingen termometer: gennemstegt = ingen rødt/rosa kød, saften løber klar; bedst: skær hakket kød ud i små stykker og stege meget grundigt (men et termometer er det eneste sikre).'],
  }),

  praktisk({
    id: 'mad-tilberedning', kap: 'tilberedning', titel: 'Primitiv madlavning: kogning, stegning, bagning, supper', niveau: 'mi',
    resume: 'Kog og steg gennemvarmt; temperatur og tid: termometer er nødvendigt for kød, kylling og hakket kød.', tags: ['kogning', 'stegning', 'bagning', 'gryde', 'suppe', 'temperatur', 'fisk', 'tilberedning'],
    kilder: ['fvst-hygiejne', 'ns-baal'], kontrol: K.delvist('Kernetemperatur 75 °C for hakkebøf, gennemstegt kylling/hakket kød og >65 °C varmholdelse er fra Fødevarestyrelsen. Teknikker (gryde, glød, folie) er almen praksis; temperaturer for fisk er ikke kontrolleret.'),
    formaal: 'At lave varm, sikker mad under primitive forhold.', hvornaar: ['Lejr, strømsvigt, tur, beredskab.'],
    udstyr: ['Gryde med låg, stegepande/rist, tang, kniv, skærebræt, **stegetermometer**, vand, brændsel (stormkøkken/bål – lovligt!).', 'Alternativ: konserves opvarmet i dåsen (åbn først!).'],
    trin: ['**Kogning:** vand i gryde med låg; tilsæt mad, hold simren. Kogning er sikreste måde at tilberede planter, nudler, ris, supper.', '**Supper/stuvninger:** hold simren under låg, til alt er gennemvarmt (rygende).', '**Stegning:** pande/rist på gløder; vend jævnligt; kød og fjerkræ gennemstegt – se [[mad-hygiejne]] for temperaturer.', '**Bagning i gløder:** pak i folie/blade (ingen giftige planter); læg i gløder, ikke flammer; vend; tjek gennemvarmen.', '**Fisk:** gennemsteg/-kog; skær og tjek at kødet er ugennemsigtigt og falder fra hinanden. {T}', '**Hold varmt/kolde:** over 65 °C eller under 5 °C; køl rester hurtigt.', '**Rens og vask** bestik/underlag med varmt vand og sæbe; hold affald væk fra dyr.'],
    kontrolTjek: ['Hakket/fjerkræ: kernen mindst 75 °C; maden rygende varm.', 'Ingen råt kød rørt ved spiseklar mad.'],
    fejl: ['Ugennemstegt kød.', 'At koge i åben gryde i blæst (ujævn varme).', 'Madlavning i telt/ly (kulilte og brand).'],
    sikkerhed: ['Brug handsker og stabilt underlag; forbrændinger: [[fh-forbraending]].', 'Åben ild kun hvor lovligt: [[baal-regler]].', 'Aldrig stormkøkken i lukket rum ([[baal-kulilte]]).'],
    dansk: ['Fisketegn og regler: [[mad-fisk-skaldyr]]. Vilde svampe skal varmebehandles og aldrig spises rå ([[svamp-sikkerhed]]).'],
    alternativ: ['Kold mad: knækbrød, pålæg på dåse, nødder, havregryn med varmt vand.'],
  }),

  info({
    id: 'mad-dyr-risici', kap: 'tilberedning', titel: 'Døde eller syge dyr, råt kød og vildt', niveau: 'mi',
    resume: 'Spis ikke fundne døde dyr eller råt/ugennemstegt animalsk føde. Jagt og fangst kræver tilladelse og viden.', tags: ['døde dyr', 'råt kød', 'vildt', 'jagt', 'fangst', 'syge dyr'],
    kilder: ['fvst-hygiejne'], kontrol: K.delvist('Kravet om gennemstegning af hakket kød/fjerkræ er fra Fødevarestyrelsen. Resten er almen forsigtighed ({T}) og jagtlovgivning er ikke gennemgået.'),
    blokke: [
      DANGER('Spis ikke døde, syge eller fundne dyr, og spis ikke råt eller utilstrækkeligt tilberedt animalsk føde. Risiko for bakterier (salmonella, campylobacter, STEC), parasitter og smitsomme sygdomme.', 'Aldrig'),
      UL('**Jagt og fangst** i Danmark kræver jagttegn/tilladelser og kendskab til jagttider og regler. Forsøg ikke at fange eller håndtere vilde dyr uden viden og tilladelse – det er farligt, ulovligt og sjældent produktivt.', '**Døde/syge dyr:** rør dem ikke med bare hænder; meld døde fugle/dyr til kommunen eller Fødevarestyrelsen {F}. Syge dyr kan bære smitte.', '**Fisk** kræver fisketegn ([[mad-fisk-skaldyr]]).', '**Skaldyr/muslinger:** kontrollér aktuelle advarsler om giftige alger og forurening.'),
    ],
  }),
];
