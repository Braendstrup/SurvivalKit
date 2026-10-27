import { P, H, UL, OL, STEPS, INFO, WARN, DANGER, ACT, CL, C112, FIG, FIGS, TABLE, KV, DET, praktisk, info, K } from './_lib.mjs';

export const guides = [
  praktisk({
    id: 'mad-vurder-sikker', kap: 'mad', titel: 'Er denne plante, svamp eller mad sikker at spise?', niveau: 'gr', nod: true,
    resume: 'Standardsvaret er NEJ, medmindre du kender arten 100 % og kan udelukke giftige dobbeltgængere. Mad kan oftest vente.', tags: ['vurdere', 'sikker', 'plante', 'svamp', 'giftig', 'nødsituation', 'mad'],
    kilder: ['fvst-svampe', 'dtu-planter', 'ns-samle'], kontrol: K.ok('Hovedreglen ("spis kun, hvad du kender 100 %"; AI/billeder er ikke sikre) følger Fødevarestyrelsen. Planteadvarsler følger DTU Fødevareinstituttet.'),
    formaal: 'At forhindre forgiftning ved at stille de rigtige spørgsmål, før noget spises.', hvornaar: ['Du overvejer at spise noget fra naturen, eller en anden har spist noget ukendt.'],
    udstyr: ['En nyere dansk feltbog (Fødevarestyrelsen anbefaler en nyere svampebog frem for AI eller tilfældige hjemmesider), kyndig person, notesbog/kamera til at dokumentere fund.', 'Alternativ: spis det, du har med. Er du i tvivl: lad være.'],
    foer: [ACT('Har nogen spist en ukendt svamp eller plante og har symptomer eller du er i tvivl: ring **Giftlinjen 82 12 12 12** (døgnåben) eller **112** ved alvorlige symptomer. Se [[fh-forgiftning-overblik]].', 'Allerede spist?')],
    trin: [
      '**Behøver du maden nu?** Du kan klare dig i dage til uger uden mad, men kun få dage uden vand. Tag **aldrig risici** for at skaffe mad. Spis det, du har med, eller vent på hjælp.',
      '**Kender du arten 100 %?** Ikke "ligner den på billedet", men: du kan nævne *alle* kendetegn og de farlige dobbeltgængere og har tjekket dem. Billeder og apps (inkl. AI) kan ikke garantere sikker bestemmelse (Fødevarestyrelsen).',
      '**Står arten i denne app som "Dokumenteret spiselig"** og matcher *alle* kendetegn **og** ingen forvekslingsarter? Står den som "Forsigtighed", "Undgå" eller "Uverificeret": spis den ikke.',
      '**Er stedet sikkert?** Undgå planter/svampe langs trafikerede veje, ved industri, i nyligt sprøjtede områder, tæt på hundelort, forurenet vand ([[mad-hygiejne]]). Svampe fra vejkanter kan indeholde tungmetaller (Fødevarestyrelsen).',
      '**Er indsamlingen lovlig?** Kun til eget forbrug i begrænset omfang; ikke fredede arter eller områder ([[regler-indsamling]]).',
      '**Tilbered rigtigt** (varme, fjern giftige dele) og **start med en lille portion**; spis ikke vilde svampe rå (Fødevarestyrelsen).',
      '**Gem rester og tag billeder** (ovenfra, fra siden og nedefra) til Giftlinjen, hvis nogen bliver dårlige.',
    ],
    kontrolTjek: ['Du har sagt "ja" til *alle* trin ovenfor, og der er ingen tvivl.', 'Hvis ikke: spis det ikke.'],
    fejl: ['At stole på en app eller et foto som eneste bestemmelse.', 'At tro, at farve, lugt eller smag afgør om noget er giftigt – de dødeligste svampe smager ikke ubehageligt (Fødevarestyrelsen).', 'At "tage en lille smagsprøve" af ukendte svampe/planter.', 'At spise noget alene, fordi "dyr spiser det".'],
    sikkerhed: ['Gamle råd er forkerte: sølvskeer misfarves ikke af giftsvampe, og giftige svampe smager ikke altid grimt (Fødevarestyrelsen).', 'Tungmetaller: ager-champignon bør kun spises et par gange om året.', 'Børn og husdyr: hold dem fra ukendte planter og svampe.'],
    dansk: ['Danske spiselige og giftige dobbeltgængere findes tæt på hinanden. Brug [[arter]] kun som støtte, ikke som bestemmelsesnøgle.', 'Kontakt Giftlinjen 82 12 12 12 ved enhver tvivl efter indtagelse.'],
    alternativ: ['Spis medbragt mad; drik rent vand; tilkald hjælp ([[nod-tilkald-hjaelp]]). Er du i længere tid ude, så pak energirig mad ([[mad-energi-beredskab]]).'],
  }),

  info({
    id: 'mad-principper', kap: 'mad', titel: 'Principper: mad fra naturen er et supplement, ikke en redning', niveau: 'gr',
    resume: 'Find er ikke det samme som energi. Beredskabet bygger på medbragt og lagret mad – naturen supplerer.', tags: ['principper', 'energi', 'næring', 'madsankning', 'spisekammer', 'beredskab'],
    kilder: ['brs-forberedt', 'dtu-planter', 'ns-samle'], kontrol: K.delvist('Beredskabsanbefalingen (3 døgn, mad der holder sig uden køl) er fra Samsik/Beredskabsstyrelsen; energi-versus-næring-påstanden er almen ernæringsviden og er ikke citeret.'),
    blokke: [
      P('**Forskellen mellem at *kunne finde* føde og at *have energi og ernæring nok*:** De fleste vilde planter, bær og svampe har få kalorier. Du bruger ofte flere kræfter på at finde og tilberede dem, end de giver. Bær og grønt er vitaminer og afveksling – de dækker ikke et længerevarende energibehov.'),
      CL('info', 'Hvad dokumentationen siger', 'DTU Fødevareinstituttet fandt, at kun omkring **14 vildtvoksende danske arter** er spist i betydelig mængde og anses for uproblematiske at indsamle (nælde, mælkebøtte, skovjordbær, hindbær, brombær, blåbær, mosebølle, tranebær, multebær, hunderose, tyttebær, røn, slåen, hyld – og kun bestemte plantedele).', 'For hver art er det oftest kun én plantedel, der traditionelt er spist.'),
      UL('**Beredskabsstyrelsen:** hav mad til 3 døgn, der kan holde sig uden køleskab/fryser (fx konserves, knækbrød) – du kommer længst med det, du har med.', '**Energirig mad** (nødder, havregryn, chokolade, tørrede frugter) fylder lidt og giver mange kalorier – se [[mad-energi-beredskab]].', '**Hav aldrig som plan** at leve af naturen alene. Brug den til afveksling og hvor det er sikkert og lovligt.'),
      WARN('Opfind ikke "sikre" regler om naturtyper ("alt i skoven er spiseligt"). Der findes ingen sådanne regler. Hver art skal bestemmes sikkert for sig.', 'Husk'),
      P('Se: [[mad-vurder-sikker]], [[arter]], [[mad-naturtyper]], [[mad-fisk-skaldyr]], [[mad-tang]].'),
    ],
  }),

  info({
    id: 'mad-naturtyper', kap: 'mad', titel: 'Hvad kan findes hvornår? Oversigt efter naturtype og årstid', niveau: 'mi',
    resume: 'Kun arter med dokumentation i artsguiden. Brug filtre i artsguiden til naturtype og måned.', tags: ['naturtype', 'årstid', 'sæson', 'skov', 'hede', 'eng', 'kyst', 'have'],
    kilder: ['dtu-planter', 'fvst-svampefolder', 'ns-samle'], kontrol: K.delvist('Arterne, der er nævnt, er dem, der indgår i artsguiden og er kontrolleret mod DTU/Fødevarestyrelsen; sæsoner er forenklede og afhænger af vejr og år ({T}).'),
    blokke: [
      P('Dette er en **oversigt**, ikke en bestemmelsesnøgle. Hver art har egen side med forvekslingsarter og sikkerhedskrav. Brug filtrene i [[arter]].'),
      TABLE(['Naturtype', 'Forår (mar–maj)', 'Sommer (jun–aug)', 'Efterår (sep–nov)'], [
        ['**Skov**', 'Ramsløg (kun for kyndige, [[a-ramsloeg]])', 'Skovjordbær, hindbær, blåbær', 'Brombær, kantarel/Karl Johan (kun for kyndige), hasselnød'],
        ['**Skovbryn og lysninger**', 'Stor nælde (unge skud)', 'Hindbær, brombær (sen sommer), hyldeblomst', 'Hyldebær (kun varmebehandlet), hyben, slåen, røn'],
        ['**Enge og overdrev**', 'Mælkebøtte (blade)', 'Mælkebøtte (blomster), nælde', 'Hyben'],
        ['**Heder**', '–', 'Blåbær', 'Tyttebær, blåbær (sen sommer)'],
        ['**Kyst og strand**', '–', '–', 'Hyben, slåen (hegn), tang – se [[mad-tang]]'],
        ['**Søer og vandløb**', '–', '–', 'Fiskeri kræver fisketegn – se [[mad-fisk-skaldyr]]'],
        ['**Haver og parker**', '–', 'Frugttræer og bær – kun med ejerens tilladelse', 'Frugter – kun med ejerens tilladelse'],
      ]),
      WARN('Sæsonerne er grove tommelfingerregler ({T}) og kan variere flere uger. Indsamling i private haver, på dyrkede marker og i fredede områder kræver tilladelse – se [[regler-indsamling]].'),
    ],
  }),

  info({
    id: 'mad-noedder-fro', kap: 'mad', titel: 'Nødder, frø og spiselige dele af træer og buske', niveau: 'mi',
    resume: 'Hasselnødder er almindelige, men ikke fagligt verificeret i denne udgave. Bøgeblade og andre dele: kun hvis du kender dem.', tags: ['nødder', 'hasselnød', 'frø', 'bøg', 'træer', 'buske', 'agern'],
    kilder: ['ns-samle', 'dtu-planter'], kontrol: K.delvist('Retten til at samle nødder/frugter til eget brug er fra Naturstyrelsen. Hverken hasselnød, bøgeblade eller bøgenødder er vurderet i de læste fødevarekilder.'),
    blokke: [
      INFO('Du må samle naturens frugter til eget brug i begrænset omfang – "indholdet af en bærepose" (Naturstyrelsen, statens arealer). Træer og grene må ikke fældes eller afbrækkes; bøgens frugtkapsler og egens agern må samles, når de ligger på jorden.'),
      UL('**Hasselnød** ([[a-hasselnoed]]): almindelig, men artsguiden markerer den som *ikke verificeret mod myndighedskilde*. Nøddeallergi kan være alvorlig.', '**Bøgeblade (unge):** traditionelt spist, men ingen myndighedsvurdering fundet – [[a-boegeblade]] er markeret som *ikke verificeret*.', '**Agern:** indeholder garvesyre og er uegnet rå; udeladt – ikke vurderet.', '**Kastanjer (hestekastanje):** giftige – spis dem aldrig.'),
      WARN('Mængderne i naturen er små, og tilberedning er tidskrævende. Se [[mad-principper]].'),
    ],
  }),

  info({
    id: 'mad-fisk-skaldyr', kap: 'mad', titel: 'Fisk og skaldyr: regler og risici', niveau: 'mi',
    resume: 'Fisketegn kræves med stang; garn kræver fritidsfiskertegn. Skaldyr og rå fisk har egne risici.', tags: ['fisk', 'skaldyr', 'fisketegn', 'lystfiskeri', 'muslinger', 'fiskeri', 'kyst'],
    kilder: ['fisketegn', 'fvst-hygiejne'], kontrol: K.delvist('Fisketegnsreglerne følger Fisketegn.dk (læst 26.10.2026: under 18 og over 67 er undtaget; garn/ruser = fritidsfiskertegn). Fredningstider, mindstemål, redskabsregler og risici ved skaldyr er IKKE kontrolleret her.'),
    blokke: [
      TABLE(['Aktivitet', 'Krav (Fisketegn.dk)'], [
        ['Fiskeri med **stang/pilk/harpun** (håndredskaber)', '**Lystfiskertegn** – undtaget: under 18 år, over 67 år, fritidsfiskere med gyldigt tegn, grundejere ved eget ferskvand, put-and-take-søer'],
        ['Fiskeri med **garn, ruser, kroge** (passive redskaber)', '**Fritidsfiskertegn** (fra 12 år, ingen øvre aldersgrænse)'],
        ['Fangst af **beskyttet art** (saltvand, fra jan. 2026)', 'Registrering som rekreativ fisker og registrering af fangst i RecFishing-app (beholdt eller genudsat)'],
      ]),
      P('Fisketegnet er personligt. **Fredningstider, mindstemål, redskabsregler og lokale regler** kan variere og findes hos Fiskeristyrelsen – tjek før fiskeri (kræver net). Offline-appen kan ikke garantere, at reglerne er aktuelle.'),
      H('Risici'),
      UL('**Giftige alger** (blågrønalger i søer og kystvand), forurening og bakterier i muslinger og skaldyr – kontrollér aktuelle advarsler hos Fødevarestyrelsen/kommunen {F}.', '**Rå fisk** kan indeholde parasitter og bakterier – tilbered fisk helt igennem; se [[mad-hygiejne]].', '**Forveksling og fredede arter**: fang og behold kun arter, du kender og må tage.', '**Kysten i mørke og blæst** er farlig – gå ikke ud på glatte sten/moler.'),
      INFO('Det er ikke en overlevelsesmetode at fange fisk i en nødsituation – brug energi på varme, vand og hjælp ([[nod-prioriteter]]).'),
    ],
  }),

  info({
    id: 'mad-tang', kap: 'mad', titel: 'Tang og andre marine ressourcer', niveau: 'mi',
    resume: 'Tang må samles til eget brug i bærepose-mængde på statens strande, men artsbestemmelse og forurening er risici.', tags: ['tang', 'strand', 'marint', 'alger', 'forurening'],
    kilder: ['ns-samle'], kontrol: K.delvist('Retten til at samle tang (eget brug, én bærepose) er fra Naturstyrelsen. Spiselighed af enkelte tangarter er IKKE verificeret i denne udgave.'),
    blokke: [
      P('Naturstyrelsen: "Det er tilladt at samle tang på strande ved havet … kun til eget brug og i en mængde, der svarer til indholdet af en bærepose" (statens arealer).'),
      WARN('Artsbestemmelse, forurening (spildevand, olie, tungmetaller, blågrønalger), og tilberedning er ikke vurderet i denne udgave. Der er derfor **ingen tangarter** på artslisten. Spis ikke tang, du ikke kan bestemme 100 %.'),
    ],
  }),

  praktisk({
    id: 'mad-energi-beredskab', kap: 'tilberedning', titel: 'Energirige og praktiske fødevarer til beredskab', niveau: 'gr',
    resume: 'Mad der holder sig, kræver lidt tilberedning og giver mange kalorier pr. gram.', tags: ['energi', 'holdbar', 'nødder', 'havregryn', 'konserves', 'beredskab', 'mad'],
    kilder: ['brs-forberedt', 'fvst-hygiejne'], kontrol: K.delvist('Princippet (mad der holder sig uden køl, kræver ikke ovn/komfur, bruges i hverdagen) er fra Samsik. Konkrete kaloriemængder er ikke angivet (ikke kontrolleret).'),
    formaal: 'At have mad til 3 døgn, som holder sig og kan spises uden komfur.', hvornaar: ['Hjemmeberedskab, strømsvigt, tur.'],
    udstyr: ['Dåsemad, knækbrød, nødder, havregryn, chokolade, tørrede frugter, energibarer, pålæg på dåse, dåseåbner.', 'Alternativ: madvarer du bruger i hverdagen og lagrer i lille mængde.'],
    trin: ['Vælg **madvarer der kan holde sig uden køleskab/fryser** (Samsik).', 'Vælg mad, du **selv bruger og kan lide**, så den roterer og ikke bliver gammel.', 'Vælg mad, der **ikke kræver ovn/komfur**, fx konserves og knækbrød – eller sørg for en grill/stormkøkken til udendørs brug.', 'Opbevar **tørt, mørkt og køligt**; brug og genopfyld løbende.', 'Husk **mad til børn, ældre, kæledyr** og særlige behov.'],
    kontrolTjek: ['Du har mad til 3 døgn pr. person, og den er ikke udløbet.'],
    fejl: ['At lagre mad, man ikke spiser til daglig.', 'At glemme dåseåbner.'],
    sikkerhed: ['Grill/stormkøkken kun udendørs – aldrig indendørs (kulilte).', 'Hold rå og tilberedt mad adskilt ([[mad-hygiejne]]).'],
    dansk: ['Samsik: "Mad til tre døgn … mad der kan holde sig i længere tid uden for køleskab og fryser … gerne mad, som ikke kræver tilberedning i ovn eller på komfur."'],
    alternativ: ['Køb kommercielle nødrationer; hent hjælp hos kommunens beredskabscenter, hvis der opstår længerevarende kriser.'],
  }),
];
