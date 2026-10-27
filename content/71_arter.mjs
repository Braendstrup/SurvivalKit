import { K } from './_lib.mjs';

const DTU = (note) => K.ok('Arten er nævnt som uproblematisk at indsamle i DTU Fødevareinstituttets oversigt (Pilegaard 2013). ' + note);
const KP = 'Kun mængder til eget brug (indholdet af en bærepose) på statens arealer; private skove og haver kræver ejerens tilladelse (Naturstyrelsen).';
const SENT = 'Sæsonen er en tommelfingerregel og varierer med vejr og år.';

export const species = [
  // ------------------------------------------------------------------------------------------- dokumenterede planter
  { id: 'a-naelde', dansk: 'Stor nælde', latin: 'Urtica dioica', familie: 'Nældefamilien (Urticaceae)', kategori: 'standard', naturtyper: ['skovbryn', 'eng', 'have og park', 'skov'], saeson: [3, 4, 5, 6],
    voksested: 'Kvælstofrig jord: skovbryn, grøftekanter, haver, ruderat jord.', kendetegn: 'Stikkende hår på blade og stængel (svier ved berøring). Blade modsat, ægformede, savtakkede. Firkantet stængel.',
    beskrivelse: 'Blade: 5–12 cm, grove savtakker, spids. Stængel: firkantet, oprejst, dækket af stikkehår. Blomster: små grønlige hunlige og hanlige hænger i klaser (jul–okt). Frugter: små nødder.',
    dele: 'Unge skud og de øverste blade (DTU: blade fra stor nælde).', tilberedning: 'Brug handsker. Skold eller kog få minutter (stikkehårene uskadeliggøres), brug som spinat i supper og stuvninger; kan tørres til te. {T}', smag: 'Mild, spinatagtig, let jordagtig.',
    forvekslinger: [{ navn: 'Døvnælde (hvid/rød)', latin: 'Lamium album / L. purpureum', fare: 'Harmløs, men ikke nælde', forskel: 'Døvnælde svier ikke og har ikke stikkehår – er den ikke stikkende, er det ikke nælde.' }],
    sikkerhed: 'Kun unge, friske skud; undgå planter ved vej, hundelort eller sprøjtede områder. Efter blomstring bliver bladene mindre egnede {T}. Kog/skold altid.', lov: KP,
    kilder: ['dtu-planter', 'ns-samle'], kontrol: DTU('Tilberedningsdetaljer er almen praksis ({T}).'), bem: SENT },

  { id: 'a-maelkeboette', dansk: 'Mælkebøtte', latin: 'Taraxacum officinale (agg.)', familie: 'Kurvblomstfamilien (Asteraceae)', kategori: 'standard', naturtyper: ['eng', 'skovbryn', 'have og park'], saeson: [3, 4, 5, 6],
    voksested: 'Enge, græsplæner, vejkanter, åbne pladser.', kendetegn: 'Grundstillet roset af dybt flige blade. Hul, uforgrenet blomsterstængel med én gul kurv. Hvid mælkesaft ved brud.',
    beskrivelse: 'Blade: tandede/flige, 5–25 cm i roset. Stængel: hul, bladløs, med hvid mælkesaft. Blomst: gul kurv (apr–jun). Frugt: "pusteblomst".',
    dele: 'Unge blade (DTU: blade fra almindelig mælkebøtte).', tilberedning: 'Unge blade rå i salat (bitre) eller blancheret/kogt; ældre blade bliver meget bitre. {T}', smag: 'Bitter, grøn; mildere når bladene er unge.',
    forvekslinger: [{ navn: 'Fladbælg / høgeskæg og lignende', latin: 'Hypochaeris, Crepis m.fl.', fare: 'Generelt harmløse, men har samme gule kurve – bestemmelse kan være svær', forskel: 'Mælkebøtte: én blomst på hul, uforgrenet stængel og alle blade i roset. Flere blomster på forgrenet stængel = noget andet.' }],
    sikkerhed: 'Plukning langs veje og i plæner frarådes (forurening, sprøjtemidler, hundeurin).', lov: KP, kilder: ['dtu-planter', 'ns-samle'], kontrol: DTU('Forvekslingsarterne er skrevet ud fra almen botanik og ikke kontrolleret mod en kilde.'), bem: SENT },

  { id: 'a-skovjordbaer', dansk: 'Skovjordbær', latin: 'Fragaria vesca', familie: 'Rosenfamilien (Rosaceae)', kategori: 'standard', naturtyper: ['skov', 'skovbryn', 'eng'], saeson: [6, 7, 8],
    voksested: 'Skovbryn, lysninger, skrænter, mager jord.', kendetegn: 'Lav urt med kravleskud (udløbere). Trekoblede, savtakkede blade. Små røde frugter (bær) med frø på overfladen.',
    beskrivelse: 'Blade: tre småblade, savtakkede. Blomster: hvide (5 kronblade). Frugter: små røde jordbær, 1–1,5 cm.',
    dele: 'Frugten (DTU: frugter fra skovjordbær).', tilberedning: 'Spises friske; kan bruges i dessert og syltning. Skyl bær fra jordnære planter. {T}', smag: 'Sød, aromatisk, saftig.',
    forvekslinger: [{ navn: 'Hvid potentil / gåsepotentil-arter', latin: 'Potentilla sterilis m.fl.', fare: 'Harmløse, men smagløse tørre frugter', forskel: 'Ægte skovjordbær har saftig, rød, sød frugt og kravleskud.' }],
    sikkerhed: 'Skyl godt; undgå bær tæt på vej/hundeluftning.', lov: KP, kilder: ['dtu-planter', 'ns-samle'], kontrol: DTU('Forveksling er almen botanik – ikke kontrolleret.'), bem: SENT },

  { id: 'a-hindbaer', dansk: 'Hindbær', latin: 'Rubus idaeus', familie: 'Rosenfamilien (Rosaceae)', kategori: 'standard', naturtyper: ['skovbryn', 'skov', 'have og park'], saeson: [7, 8],
    voksested: 'Skovlysninger, skovbryn, hugstflader, haver.', kendetegn: 'Op til 1,5 m høje stængler med bløde pigge. Fjerdelte blade, hvide undersider. Røde, bløde bær, der slipper fra frugtbunden.',
    beskrivelse: 'Blade: 3–7 småblade, hvidfiltede på undersiden. Stængel: bløde børster/pigge. Blomster: hvide. Frugt: rød samlefrugt.',
    dele: 'Frugten (DTU: frugter fra almindelig hindbær).', tilberedning: 'Spises friske eller bruges til marmelade/saft. Skyl forsigtigt. {T}', smag: 'Sød-syrlig, aromatisk, blød.',
    forvekslinger: [{ navn: 'Brombær (umodne)', latin: 'Rubus fruticosus agg.', fare: 'Harmløs', forskel: 'Brombær har kraftige, krogede torne og sorte bær.' }],
    sikkerhed: 'Skyl bær; undgå forurenede steder.', lov: KP, kilder: ['dtu-planter', 'ns-samle'], kontrol: DTU('Beskrivelse og forveksling er almen botanik.'), bem: SENT },

  { id: 'a-brombaer', dansk: 'Brombær', latin: 'Rubus fruticosus (agg.)', familie: 'Rosenfamilien (Rosaceae)', kategori: 'standard', naturtyper: ['skovbryn', 'skov', 'eng', 'hede'], saeson: [8, 9, 10],
    voksested: 'Hegn, skovbryn, krat, bortkastede arealer.', kendetegn: 'Buskeagtig med kraftige, krogede torne. Blade 3–5-fingrede. Sorte, blanke bær.',
    beskrivelse: 'Stængel: bueformet, tornet. Blade: 3–5 småblade. Blomster: hvide/lyserøde. Frugt: sort samlefrugt.',
    dele: 'Frugten (DTU: frugter fra almindelig brombær).', tilberedning: 'Friske eller kogt til syltetøj/saft. Plukkes først, når de er helt modne. {T}', smag: 'Sød-syrlig, kernefuld.',
    forvekslinger: [{ navn: 'Galnebær (galdebær)', latin: 'Atropa belladonna', fare: '**Meget giftig** (sorte blanke bær)', forskel: 'Galnebær er en op til 1,5 m høj urt med enkelte store, blanke bær siddende i en grøn bæger – ikke en tornet busk med samlefrugt. Almindelig i kalkrige skove, sjælden. {F} Kun hvis du kender forskellen.' }],
    sikkerhed: 'Skyl godt. Plukkes ikke fra forurenet jord (vejkanter).', lov: KP, kilder: ['dtu-planter', 'ns-samle'], kontrol: K.delvist('Brombær er nævnt i DTU-oversigten. Galnebær-forvekslingen er almen botanisk viden og er IKKE kontrolleret mod en kilde.'), bem: SENT },

  { id: 'a-blaabaer', dansk: 'Blåbær', latin: 'Vaccinium myrtillus', familie: 'Lyngfamilien (Ericaceae)', kategori: 'standard', naturtyper: ['skov', 'hede'], saeson: [6, 7, 8],
    voksested: 'Sur bund i nåleskov, løvskov og på hede.', kendetegn: 'Lav busk (20–50 cm) med kantede grønne grene og små, tynde, savtakkede blade. Blå-sorte bær med lyst frugtkød og kronrest.',
    beskrivelse: 'Blade: 1–3 cm, tynde, lysegrønne. Stængel: grøn, kantet. Blomster: små, lyserøde kugler. Frugt: blåsort bær, 5–8 mm, farver fingre.',
    dele: 'Frugten (DTU: frugter fra almindelig blåbær).', tilberedning: 'Friske, i grød, syltet eller tørret. {T}', smag: 'Sød-syrlig, mild.',
    forvekslinger: [{ navn: 'Mosebølle', latin: 'Vaccinium uliginosum', fare: 'Harmløs (nævnt som uproblematisk af DTU)', forskel: 'Mosebølle har blågrønne, mere ovale blade og rundede (ikke kantede) grene; bærret har lysere frugtkød.' }, { navn: 'Galnebær', latin: 'Atropa belladonna', fare: '**Meget giftig**', forskel: 'Blåbær er en lav, grenet dværgbusk med små bær. Galnebær er en høj urt med store, enkeltstående blanke bær og kalkbund. {F}' }],
    sikkerhed: 'Spis kun bær fra den lave dværgbusk med mange små bær.', lov: KP, kilder: ['dtu-planter', 'ns-samle'], kontrol: K.delvist('Blåbær og mosebølle er nævnt i DTU-oversigten. Galnebær-forvekslingen er almen viden og ikke kontrolleret.'), bem: SENT },

  { id: 'a-tyttebaer', dansk: 'Tyttebær', latin: 'Vaccinium vitis-idaea', familie: 'Lyngfamilien (Ericaceae)', kategori: 'standard', naturtyper: ['hede', 'skov'], saeson: [8, 9, 10],
    voksested: 'Hede og nåleskov på sur bund.', kendetegn: 'Lille stedsegrøn busk med læderagtige, glinsende, ægformede blade med omrullet rand. Røde bær.',
    beskrivelse: 'Blade: 1–3 cm, mørkegrønne, læderagtige. Blomster: hvide/lyserøde klokker. Frugt: røde, runde bær (6–10 mm).', dele: 'Frugten (DTU: frugter fra tyttebær).', tilberedning: 'Normalt kogt til syltetøj/kompot (meget syrlige). {T}', smag: 'Syrlig, let bitter.',
    forvekslinger: [{ navn: 'Mjølbær / bjergbærlignende arter', latin: 'Arctostaphylos uva-ursi', fare: 'Ikke vurderet', forskel: 'Mjølbær har mere flade, matte røde bær og blade uden omrullet rand. {F}' }],
    sikkerhed: 'Kend arten og voksestedet; rå bær er syrlige.', lov: KP, kilder: ['dtu-planter', 'ns-samle'], kontrol: DTU('Forveksling er almen botanik.'), bem: SENT },

  { id: 'a-hyben', dansk: 'Hyben (hunderose)', latin: 'Rosa canina', familie: 'Rosenfamilien (Rosaceae)', kategori: 'standard', naturtyper: ['skovbryn', 'eng', 'kyst', 'hede'], saeson: [8, 9, 10, 11],
    voksested: 'Hegn, skovbryn, kyst, krat.', kendetegn: 'Busk med krogede torne. Fjerdelte blade med 5–7 småblade. Røde, ægformede hyben (nypon) med kronrest.',
    beskrivelse: 'Stængel: bueformet med torne. Blomster: lyserøde (jun). Frugt: røde, glatte hyben 1,5–2,5 cm, med frø og stive hår indeni.',
    dele: 'Frugtkødet af hunderoses frugter (DTU: frugter fra hunderose). **Ikke** frøene og hårene indeni.', tilberedning: 'Del hybenet, fjern **alle frø og hår** (irriterer og kan give kløe), brug skallen i te, suppe eller syltning. Kog skallerne. {T}', smag: 'Syrlig-sød, frugtagtig.',
    forvekslinger: [{ navn: 'Andre vilde roser og dyrkede roser', latin: 'Rosa spp.', fare: 'Ikke vurderet; dyrkede roser kan være sprøjtede', forskel: 'Sprøjtede roser i haver og anlæg bør undgås.' }],
    sikkerhed: 'Fjern hår og frø; undgå sprøjtede roser.', lov: KP, kilder: ['dtu-planter', 'ns-samle'], kontrol: DTU('Tilberedning og fjernelse af hår er almen praksis ({T}).'), bem: SENT },

  { id: 'a-hyldebaer', dansk: 'Hyldebær (almindelig hyld)', latin: 'Sambucus nigra', familie: 'Desmerfamilien (Adoxaceae)', kategori: 'forsigtighed', naturtyper: ['skovbryn', 'have og park', 'eng'], saeson: [8, 9],
    voksested: 'Hegn, skovbryn, haver, bortkastede arealer.', kendetegn: 'Busk/lille træ. Modsatte, fjerdelte blade. Flade skærme af hvide blomster (jun). Sorte, blanke bær i svære hængende skærme.',
    beskrivelse: 'Blade: 5–7 savtakkede småblade, ubehagelig lugt ved knusning. Blomster: store hvide skærme. Frugt: sorte bær på røde stilke.',
    dele: 'Modne, **varmebehandlede** bær; blomster til saft/drik (DTU: ingen sundhedsproblemer beskrevet ved hyldeblomstdrik).', tilberedning: '**Spis aldrig bær rå** (DTU: rå, modne hyldebær kan give kvalme, opkastning og diarré – også i smoothies). Kog til saft, suppe eller syltetøj. {D}', smag: 'Mørk, syrlig-sød efter kogning.',
    forvekslinger: [{ navn: 'Druehyld', latin: 'Sambucus racemosa', fare: 'Giftig (forgiftningstilfælde ved brug af bær/blomster i stedet for almindelig hyld, DTU)', forskel: 'Druehyld har **røde** bær i tætte klaser.' }, { navn: 'Sommerhyld (ellen)', latin: 'Sambucus ebulus', fare: 'Giftig (DTU)', forskel: 'En 1–2 m høj urt (ikke busk) med oprette skærme og sorte bær – i Danmark sjælden.' }],
    sikkerhed: 'Kog bær grundigt; undgå grønne/umodne bær; kend forskellen på almindelig hyld, druehyld og sommerhyld.', lov: KP, kilder: ['dtu-planter', 'ns-samle'], kontrol: K.ok('Rå bær = problem og Italien-forvekslingerne er fra DTU (Pilegaard 2013). Beskrivelse af druehyld/sommerhyld er almen botanik.'), bem: SENT, farligeDobbelt: 'Rød druehyld og sommerhyld (ellen) er giftige og er forvekslet med almindelig hyld ved forgiftninger (DTU).' },

  { id: 'a-roen', dansk: 'Røn', latin: 'Sorbus aucuparia', familie: 'Rosenfamilien (Rosaceae)', kategori: 'forsigtighed', naturtyper: ['skov', 'skovbryn', 'have og park'], saeson: [8, 9, 10],
    voksested: 'Skov, skovbryn, haver, gader.', kendetegn: 'Træ/busk med uligefinnede blade (9–17 småblade) og røde bær i skærme.',
    beskrivelse: 'Blade: uligefinnede, savtakkede. Blomster: hvide skærme. Frugt: orangerøde bær, 8–10 mm.', dele: 'Frugten (DTU: frugter fra almindelig røn).', tilberedning: 'Bær er bitre/syrlige og tåles dårligt rå; kog (gelé/saft) eller frys først. {T}', smag: 'Bitter-syrlig.',
    forvekslinger: [{ navn: 'Andre rødfrugtede træer/buske', latin: '-', fare: 'Kan være giftige', forskel: 'Røn har uligefinnede blade – kontrollér.' }],
    sikkerhed: 'Rå bær kan give mavebesvær {T}; kog og spis moderat.', lov: KP, kilder: ['dtu-planter', 'ns-samle'], kontrol: K.delvist('Røn er nævnt i DTU-oversigten som uproblematisk. Anbefalingen om kogning er almen praksis ({T}) og ikke kontrolleret.'), bem: SENT },

  { id: 'a-slaaen', dansk: 'Slåen', latin: 'Prunus spinosa', familie: 'Rosenfamilien (Rosaceae)', kategori: 'forsigtighed', naturtyper: ['skovbryn', 'kyst', 'eng'], saeson: [10, 11],
    voksested: 'Hegn, skovbryn, kyst, krat.', kendetegn: 'Tornet busk med sort bark. Små tandede blade. Blå-sorte, dugbelagte stenfrugter.', beskrivelse: 'Grene: tornede. Blomster: hvide, før bladene (apr). Frugt: 1–1,5 cm, blågrå-sort, meget stram smag.',
    dele: 'Frugten (DTU: frugter fra slåen). Sten må ikke knuses/spises.', tilberedning: 'Meget syrlig/stram; bruges efter frost og kogt/syltet eller til likør/gelé. Fjern sten. {T}', smag: 'Meget stram, syrlig.',
    forvekslinger: [{ navn: 'Kirsebærblomme / blommer', latin: 'Prunus cerasifera / domestica', fare: 'Harmløse', forskel: 'Slåen har torne og små, stramme frugter.' }],
    sikkerhed: 'Stenene kan indeholde cyanogene stoffer – knus ikke og spis dem ikke {T}.', lov: KP, kilder: ['dtu-planter', 'ns-samle'], kontrol: K.delvist('Slåen er nævnt i DTU-oversigten som uproblematisk; sikkerhed om sten er almen viden og ikke kontrolleret.'), bem: SENT },

  // ---------------------------------------------------------------------------------- planter med ekstra forsigtighed
  { id: 'a-ramsloeg', dansk: 'Ramsløg', latin: 'Allium ursinum', familie: 'Løgfamilien (Amaryllidaceae)', kategori: 'undgaa', naturtyper: ['skov'], saeson: [3, 4, 5],
    voksested: 'Fugtig, næringsrig løvskov (bøgeskov, lunde), ofte i store tæpper.', kendetegn: 'Brede, lancetformede, glatte blade, 2 pr. skud; kraftig **løglugt** ved at knuse; hvide stjerneformede blomster i halvkugleformede skærme (maj).',
    beskrivelse: 'Blade: grundstillede, lange, spidse, med stilk; hvid blomsterstand. Løg: slank, hvidt.', dele: 'Blade, før blomstring.', tilberedning: 'Frisk i salat/pesto eller let varmebehandlet. {T}', smag: 'Hvidløgsagtig, mild.',
    forvekslinger: [{ navn: 'Liljekonval', latin: 'Convallaria majalis', fare: '**Giftig** (dødelige forgiftninger beskrevet)', forskel: 'Har ofte to blade pr. skud; ingen løglugt. Lugttest: **Knuses blade fra flere arter, kan løglugten overføres til hænder og fejlbestemmelse opstå** – tjek hvert blad for sig.' }, { navn: 'Høsttidløs', latin: 'Colchicum autumnale', fare: '**Dødelig giftig**', forskel: 'Blomstrer om efteråret; bladene kommer om foråret; ingen løglugt.' }],
    sikkerhed: 'DTU: det største problem er forveksling med giftige planter; i Tyskland er 32 forgiftninger beskrevet, 6 døde. Tjek **hvert** blad for løglugt og kend alle forvekslingsarter. Er du i tvivl: lad være. Kategori: nybegyndere bør undgå.', lov: KP + ' Ramsløg kan være fredet lokalt – tjek.',
    kilder: ['dtu-planter', 'ns-samle'], kontrol: K.ok('Forveksling med liljekonval/høsttidløs og dødsfald er fra DTU Fødevareinstituttet (Pilegaard 2013, med henvisning til 2012-artikel). Beskrivelse af kendetegn er almen botanik.'), bem: SENT, farligeDobbelt: 'Liljekonval og høsttidløs – begge giftige, den sidste dødelig.' },

  { id: 'a-skvalderkaal', dansk: 'Skvalderkål', latin: 'Aegopodium podagraria', familie: 'Skærmplantefamilien (Apiaceae)', kategori: 'ikke', naturtyper: ['skovbryn', 'have og park'], saeson: [4, 5, 6],
    voksested: 'Skovbryn, haver, ruderatjord.', kendetegn: 'Trekoblede, dobbeltsavtakkede blade; hvide skærme; kraftig rodstok; trekantet stængel.', beskrivelse: 'Blade: 3 småblade, i en trekant; stængel: trekantet, hul; blomster: hvide skærme (jun–aug).',
    dele: 'Unge blade (traditionelt).', tilberedning: 'Unge blade rå eller kogt som spinat. {T}', smag: 'Mild, persilleagtig.', forvekslinger: [{ navn: 'Skærmplanter generelt (fx hundepersille, vild kørvel)', latin: 'Aethusa cynapium m.fl.', fare: 'Nogle skærmplanter er **kraftigt giftige**', forskel: 'Skærmplanter er svære at skelne – bestemmelse kræver erfaring. {F}' }],
    sikkerhed: 'Der er ikke fundet en myndighedsvurdering af arten i de læste kilder. Skærmplanter har farlige dobbeltgængere. **Brug ikke som nødføde.**', lov: KP, kilder: ['dtu-planter'], kontrol: K.ikke('Ikke nævnt i DTU Fødevareinstituttets oversigt over uproblematiske arter; ingen myndighedskilde læst.'), bem: SENT },

  { id: 'a-boegeblade', dansk: 'Bøgeblade (helt unge)', latin: 'Fagus sylvatica', familie: 'Bøgefamilien (Fagaceae)', kategori: 'ikke', naturtyper: ['skov'], saeson: [4, 5],
    voksested: 'Bøgeskov.', kendetegn: 'Lysegrønne, silkebløde, nyudsprungne blade med hårkant og tydelige nerver; glat grå bark.', beskrivelse: 'Blade: ovale, helrandede/svagt bølgede, silkehårede når helt unge.', dele: 'Helt unge blade (traditionelt).', tilberedning: 'Spist rå i salat eller blancheret (traditionelt). {T}', smag: 'Mild, let syrlig.',
    forvekslinger: [{ navn: 'Avnbøg / andre løvtræer', latin: 'Carpinus betulus m.fl.', fare: 'Ikke vurderet', forskel: 'Avnbøg har dobbeltsavtakkede blade med dybe sidenerver.' }],
    sikkerhed: 'Der er ikke fundet en myndighedsvurdering. Samling må ikke skade træet (afbrækning af grene er ikke tilladt). **Brug ikke som nødføde.**', lov: KP, kilder: ['ns-samle'], kontrol: K.ikke('Ingen risikovurdering fundet i læste kilder.'), bem: SENT },

  { id: 'a-hasselnoed', dansk: 'Hasselnød', latin: 'Corylus avellana', familie: 'Birkefamilien (Betulaceae)', kategori: 'ikke', naturtyper: ['skov', 'skovbryn'], saeson: [9, 10],
    voksested: 'Skovbryn, hegn, løvskov.', kendetegn: 'Busk med runde, dobbelt savtakkede blade; nødder i grønt, fligtet svøb.', beskrivelse: 'Blade: runde, bløde, hårede. Hanrakler tidligt forår. Frugt: nød i brun skal, 1,5–2 cm.', dele: 'Kernen.', tilberedning: 'Knækkes og spises rå eller ristet. {T}', smag: 'Mild, nøddeagtig.',
    forvekslinger: [{ navn: 'Hestekastanje (frugt)', latin: 'Aesculus hippocastanum', fare: 'Giftig', forskel: 'Kastanjer er store, blanke, brune frø i en pigget kapsel – ikke nødder i grønt svøb.' }],
    sikkerhed: 'Nøddeallergi. Kontrollér for orm/skimmel. Ingen myndighedskilde læst i denne udgave.', lov: KP, kilder: ['ns-samle'], kontrol: K.ikke('Almindeligt kendt spiselig, men ikke vurderet i de læste fødevarekilder.'), bem: SENT },

  { id: 'a-foelfod', dansk: 'Almindelig følfod', latin: 'Tussilago farfara', familie: 'Kurvblomstfamilien (Asteraceae)', kategori: 'undgaa', naturtyper: ['eng', 'kyst'], saeson: [3, 4],
    voksested: 'Lerede skrænter, grusgrave, vejskråninger.', kendetegn: 'Tidlige gule blomster (kurve) på skællede stængler før bladene; senere hovformede blade.', beskrivelse: 'Blomsterstængel: skællet; blade: hovformede, hvidfiltede på undersiden, efter blomstring.', dele: '–', tilberedning: '**Spises ikke.**', smag: '–',
    forvekslinger: [{ navn: 'Mælkebøtte', latin: 'Taraxacum', fare: 'Harmløs', forskel: 'Mælkebøtte har hul stængel med mælkesaft og blade i roset.' }],
    sikkerhed: 'DTU Fødevareinstituttet fraråder kraftigt at spise følfod: indeholder pyrrolizidinalkaloider (leverskader, kræftfremkaldende i dyreforsøg).', lov: KP, kilder: ['dtu-planter'], kontrol: K.ok('Advarslen er fra DTU Fødevareinstituttet (Pilegaard 2013).'), bem: SENT, advarsel: 'Spis ikke følfod – heller ikke i te.' },

  { id: 'a-oernebregne', dansk: 'Ørnebregne', latin: 'Pteridium aquilinum', familie: 'Hindeløbsfamilien (Dennstaedtiaceae)', kategori: 'undgaa', naturtyper: ['skov', 'hede'], saeson: [4, 5, 6],
    voksested: 'Heder, skovlysninger, sur bund.', kendetegn: 'Stor, trekantet, tredobbelt fjerdelt bregne; unge skud kroger sig.', beskrivelse: 'Blade: 0,5–2 m, trekantede; unge skud: sammenrullede.', dele: '–', tilberedning: '**Spises ikke.**', smag: '–',
    forvekslinger: [{ navn: 'Andre bregner', latin: '-', fare: 'Flere giftige bregnearter i Danmark', forskel: 'Bestemmelse er svær.' }],
    sikkerhed: 'DTU: der er flere giftige bregnearter i Danmark; mange bregneskud indeholder et varmefølsomt giftstof; myndighederne anbefaler under ingen omstændigheder at spise unge bregneskud rå. Ørnebregne er velkendt for giftighed. Udeladt som fødevare.', lov: KP, kilder: ['dtu-planter'], kontrol: K.ok('Bregneadvarslen er fra DTU Fødevareinstituttet.'), bem: SENT },

  // ------------------------------------------------------------------------------------------------- giftige planter
  { id: 'a-liljekonval', dansk: 'Liljekonval', latin: 'Convallaria majalis', familie: 'Asparges-familien (Asparagaceae)', kategori: 'giftig', naturtyper: ['skov'], saeson: [4, 5, 6],
    voksested: 'Løvskov, krat.', kendetegn: 'Lave, elliptiske blade (oftest to pr. skud); duftende hvide klokker i klase (maj); røde bær.', beskrivelse: 'Blade: elliptiske, 10–20 cm, glatte; blomster: hvide klokker; frugt: røde bær.', dele: '–', tilberedning: '**Må ikke spises.**', smag: '–',
    forvekslinger: [{ navn: 'Ramsløg', latin: 'Allium ursinum', fare: 'Spiselig men forvekslet med liljekonval', forskel: 'Ramsløg lugter af løg.' }], advarsel: 'Giftig. Forveksling med ramsløg har givet forgiftninger (DTU).',
    sikkerhed: 'Ring Giftlinjen 82 12 12 12 ved indtagelse.', lov: '–', kilder: ['dtu-planter', 'sdk-svampeforg'], kontrol: K.delvist('Fareangivelsen (giftig, forveksles med ramsløg) er fra DTU; planten er ikke beskrevet i en Giftlinjen-side i denne udgave.'), bem: '' },

  { id: 'a-hoesttidloes', dansk: 'Høsttidløs', latin: 'Colchicum autumnale', familie: 'Tidløs-familien (Colchicaceae)', kategori: 'giftig', naturtyper: ['eng'], saeson: [3, 4, 5, 9, 10],
    voksested: 'Fugtige enge (sjælden vildtvoksende, ofte i haver).', kendetegn: 'Blade om foråret; lilla "krokus-lignende" blomster om efteråret uden blade.', beskrivelse: 'Blade: lancetformede, blanke, 3–4 stk. i foråret; blomster: lilla, uden blade, sep–okt.', dele: '–', tilberedning: '**Må ikke spises.**', smag: '–',
    forvekslinger: [{ navn: 'Ramsløg', latin: 'Allium ursinum', fare: 'Spiselig, men forvekslet', forskel: 'Ramsløg lugter af løg og blomstrer om foråret.' }], advarsel: 'Dødelig giftig; forveksling med ramsløg har medført dødsfald (DTU).', sikkerhed: 'Ring 112/Giftlinjen 82 12 12 12.', lov: '–', kilder: ['dtu-planter'], kontrol: K.delvist('Fare og forveksling er fra DTU; beskrivelse er almen botanik.'), bem: '' },

  { id: 'a-ellen', dansk: 'Sommerhyld (ellen) og druehyld', latin: 'Sambucus ebulus / S. racemosa', familie: 'Desmerfamilien (Adoxaceae)', kategori: 'giftig', naturtyper: ['skovbryn', 'have og park'], saeson: [7, 8, 9],
    voksested: 'Ellen: skrænter/vejkanter (sjælden). Druehyld: haver og skove.', kendetegn: 'Sommerhyld: 1–2 m høj urt med oprette skærme. Druehyld: røde bær i tætte klaser.', beskrivelse: '–', dele: '–', tilberedning: '**Må ikke bruges.**', smag: '–', forvekslinger: [{ navn: 'Almindelig hyld', latin: 'Sambucus nigra', fare: 'Spiselig varmebehandlet', forskel: 'Almindelig hyld er busk/lille træ med sorte bær.' }],
    advarsel: 'Flere forgiftninger i Italien skyldes, at druehyld eller sommerhyld er brugt i stedet for almindelig hyld (DTU).', sikkerhed: 'Ring Giftlinjen 82 12 12 12.', lov: '–', kilder: ['dtu-planter'], kontrol: K.ok('Forgiftningsfakta er fra DTU Fødevareinstituttet.'), bem: '' },

  // ---------------------------------------------------------------------------------------------------------- svampe
  { id: 's-kantarel', dansk: 'Kantarel', latin: 'Cantharellus cibarius', familie: 'Kantarel-familien (Cantharellaceae)', kategori: 'forsigtighed', naturtyper: ['skov'], saeson: [7, 8, 9, 10],
    voksested: 'Løv- og nåleskov (under løvtræer og nåletræer).', kendetegn: 'Gul/æggeblommefarvet, tragtformet; "lameller" er **tykke, kødede og forgrenede med mange tværribber** der løber ned ad stokken (Fødevarestyrelsen/Svampeforeningen).', beskrivelse: 'Hat: 3–10 cm, gul, bølget; fod: kort, solid, ofte samme farve; lugt: let frugtagtig.',
    dele: 'Hele frugtlegemet.', tilberedning: 'Steges eller koges grundigt, aldrig rå. {D}', smag: 'Mild, let peberagtig.',
    forvekslinger: [{ navn: 'Almindelig netbladhat', latin: 'Paxillus involutus', fare: '**Giftig – gentagen spisning kan give livsfarlige allergiske reaktioner**', forskel: 'Netbladhatten har **tragtform, omrullet rand og brune lameller, der bliver mørkere ved tryk** – kantarellens "lameller" er tykke ribber, og de bliver ikke mørke ved tryk (Fødevarestyrelsen).' }, { navn: 'Orange tragthat', latin: 'Hygrophoropsis aurantiaca', fare: 'Ikke vurderet i kilden', forskel: 'Har tynde, tætte, forgrenede lameller i stedet for tykke ribber {F}.' }],
    sikkerhed: 'Fødevarestyrelsen: spis kun svampe, du kender 100 %; brug en nyere svampebog; begynd med en lille portion; spis ikke vilde svampe rå; brug kun friske svampe. Bestem aldrig kun ud fra billeder eller AI. Kategori: kræver særlig forsigtighed og erfaring.',
    lov: 'Du må indsamle svampe til eget brug i begrænset omfang på statens arealer (Naturstyrelsen). Private skove har andre regler.', kilder: ['fvst-svampe', 'fvst-svampefolder', 'ns-samle'], kontrol: K.delvist('Spiselighed, forveksling med netbladhat og "tykke ribber" er fra Fødevarestyrelsens folder. Øvrige beskrivelser er almen mykologi og kontrolleret kun mod folderen i begrænset omfang. Orange tragthat er ikke i kilden.'), bem: SENT },

  { id: 's-karl-johan', dansk: 'Spiselig rørhat (Karl Johan)', latin: 'Boletus edulis', familie: 'Rørhat-familien (Boletaceae)', kategori: 'forsigtighed', naturtyper: ['skov'], saeson: [8, 9, 10],
    voksested: 'Løv- og nåleskov på sur til neutral bund.', kendetegn: 'Rørhat: **rør** (porer) i stedet for lameller; brun hat; tyk, hvidlig fod med net øverst; hvidt kød, der ikke bliver blåt. (Fødevarestyrelsen: Karl Johan hører til de bedste spisesvampe.)',
    beskrivelse: 'Hat: 5–20 cm, brun; rør: hvidlige til olivengrønne; fod: tyk, knoldet, med lyst net.', dele: 'Hele frugtlegemet (sorteres for orm).', tilberedning: 'Steges/koges grundigt; tørres. Spis ikke rå (Fødevarestyrelsen). {D}', smag: 'Nøddeagtig, kraftig.',
    forvekslinger: [{ navn: 'Satans rørhat', latin: 'Rubroboletus satanas', fare: '**Giftig**', forskel: 'Stor, kødfuld, **askegrå hat**, lyserød-gul stok med net øverst, **orangerøde rørmundinger**, kødet blåner moderat, ældre hatte lugter kvalmende. Sjælden (Fødevarestyrelsen).' }, { navn: 'Bitre rørhatte', latin: 'f.eks. Tylopilus felleus', fare: 'Kan ødelægge en ret (smager meget bittert)', forskel: 'Visse rørhatte smager bittert (Fødevarestyrelsen) – smag en lille bid af den rå hat for bitterhed {T} (spyt ud).' }],
    sikkerhed: 'Rørhatte er den gruppe af spisesvampe, der er lettest at kende, men fire rørhatte er giftige (Satans, Djævle-, Rødgul og Purpur-rørhat). Kender du ikke alle kendetegn og dobbeltgængere: lad den stå.', lov: 'Eget brug, begrænset mængde (statens arealer).', kilder: ['fvst-svampe', 'fvst-svampefolder', 'ns-samle'], kontrol: K.delvist('Spiselighed og giftige rørhat-dobbeltgængere er fra Fødevarestyrelsens folder. Detaljerede kendetegn (rør-farver, net) er almen mykologi.'), bem: SENT },

  { id: 's-ager-champignon', dansk: 'Vilde champignoner (fx ager-champignon)', latin: 'Agaricus spp.', familie: 'Champignon-familien (Agaricaceae)', kategori: 'undgaa', naturtyper: ['eng', 'have og park'], saeson: [8, 9, 10],
    voksested: 'Enge, marker, haver, skove.', kendetegn: 'Lameller først lyse/lyserosa, senere chokoladebrune.', beskrivelse: 'Hvid hat, ring; lameller bliver mørke med modning.', dele: '–', tilberedning: 'Frarådes som nødføde.', smag: '–',
    forvekslinger: [{ navn: 'Snehvid fluesvamp og grøn fluesvamp', latin: 'Amanita virosa / A. phalloides', fare: '**Dødeligt giftige**', forskel: 'Fluesvampe har **hvide** lameller, ring og **pose ved foden**; champignoner har lameller, der bliver chokoladebrune. Unge fluesvampe i "æg" kan ligne støvbolde.' }, { navn: 'Karbolchampignon', latin: 'Agaricus xanthodermus', fare: 'Svagt giftig', forskel: 'Bliver smørgul ved berøring (især hatranden) og lugter "kemisk".' }],
    sikkerhed: 'Visse vilde champignoner kan have højt indhold af cadmium (ager-champignon bør kun spises et par gange om året). Forvekslingen med dødelige fluesvampe er farlig. **Nybegyndere bør undgå.**', lov: 'Eget brug, begrænset mængde.', kilder: ['fvst-svampe', 'fvst-svampefolder'], kontrol: K.ok('Fakta (cadmium, dobbeltgængere, lamelfarver) er fra Fødevarestyrelsen/Svampeforeningen-folderen.'), bem: SENT },

  { id: 's-groen-fluesvamp', dansk: 'Grøn fluesvamp', latin: 'Amanita phalloides', familie: 'Fluesvamp-familien (Amanitaceae)', kategori: 'giftig', naturtyper: ['skov'], saeson: [8, 9, 10], voksested: 'Under bøg, eg og hassel, på lerjord (relativt almindelig).',
    kendetegn: 'Hvide lameller, hvid **ring** om stokken, **pose** ved stokkens fod; lysegrøn hat (kan blegne). Unge eksemplarer er dækket af hvidligt fællessvøb og ligner et æg. (Fødevarestyrelsen)', beskrivelse: 'Hat: lysegrøn; lameller: hvide; stok: hvid med ring og pose.', dele: '–', tilberedning: '**Må ikke spises.**', smag: 'Smager ikke ubehageligt.',
    forvekslinger: [{ navn: 'Græsgrøn skørhat (spiselig)', latin: 'Russula aeruginea', fare: 'Spiselig', forskel: 'Skørhatte har hverken ring eller pose og er meget skøre i kødet. Spis den kun, hvis du er helt sikker.' }, { navn: 'Hvid champignon (unge)', latin: 'Agaricus', fare: 'Spiselig', forskel: 'Champignoner har brunnende lameller; fluesvamp har hvide.' }],
    advarsel: 'Dødeligt giftig. Selv ét frugtlegeme kan medføre døden; der findes ingen virkelig effektiv modgift (Fødevarestyrelsen). De fleste alvorlige svampeforgiftninger skyldes denne art.', sikkerhed: 'Ring Giftlinjen 82 12 12 12 / 112; se [[svamp-forgiftning]].', lov: '–', kilder: ['fvst-svampefolder', 'fvst-svampe'], kontrol: K.ok('Alle kendetegn og farer er fra Fødevarestyrelsens/Svampeforeningens folder.'), bem: '' },

  { id: 's-snehvid-fluesvamp', dansk: 'Snehvid fluesvamp', latin: 'Amanita virosa', familie: 'Fluesvamp-familien (Amanitaceae)', kategori: 'giftig', naturtyper: ['skov'], saeson: [8, 9, 10], voksested: 'Ofte under birk, eg eller fyr på mager jord.',
    kendetegn: 'Helt hvid; pose ved foden; høj hvid hat; hvide lameller; hvid ring. Unge eksemplarer ligner æg. (Fødevarestyrelsen)', beskrivelse: '–', dele: '–', tilberedning: '**Må ikke spises.**', smag: '–',
    forvekslinger: [{ navn: 'Hvide champignoner', latin: 'Agaricus', fare: 'Spiselig', forskel: 'Champignon: lameller bliver brune; fluesvamp: hvide.' }, { navn: 'Støvbolde (unge)', latin: 'Lycoperdon', fare: 'Spiselige', forskel: 'Skær svampen over: fluesvamp har hat og stok indeni; støvbold er ensartet.' }],
    advarsel: 'Dødeligt giftig.', sikkerhed: 'Ring Giftlinjen 82 12 12 12 / 112.', lov: '–', kilder: ['fvst-svampefolder', 'fvst-svampe'], kontrol: K.ok('Fra Fødevarestyrelsens/Svampeforeningens folder.'), bem: '' },

  { id: 's-panter-fluesvamp', dansk: 'Panter-fluesvamp', latin: 'Amanita pantherina', familie: 'Fluesvamp-familien (Amanitaceae)', kategori: 'giftig', naturtyper: ['skov'], saeson: [8, 9, 10], voksested: 'Oftest under løvtræer; mindre almindelig.',
    kendetegn: 'Små hvidlige skæl på hatten, hvide lameller, hvid glat ring, randet knold ved stokkens basis. (Fødevarestyrelsen)', beskrivelse: '–', dele: '–', tilberedning: '**Må ikke spises.**', smag: '–',
    forvekslinger: [{ navn: 'Rødmende fluesvamp (spiselig – kun for trænede)', latin: 'Amanita rubescens', fare: 'Spiselig, men forveksles uhyre let med panter-fluesvamp', forskel: 'Brungrå skæl, ingen tydelig knold ved basis, rødmer ved ormegnav (kun trænede svampekendere).' }],
    advarsel: 'Meget giftig.', sikkerhed: 'Ring Giftlinjen 82 12 12 12.', lov: '–', kilder: ['fvst-svampefolder'], kontrol: K.ok('Fra Fødevarestyrelsens/Svampeforeningens folder.'), bem: '' },

  { id: 's-randbaeltet-hjelmhat', dansk: 'Randbæltet hjelmhat', latin: 'Galerina marginata', familie: 'Hymenogastraceae', kategori: 'giftig', naturtyper: ['skov'], saeson: [8, 9, 10, 11], voksested: 'Stammer, stubbe og træflis af løv- og nåletræ.',
    kendetegn: '2–5 cm bred brun hat, lameller der bliver brune, glat stok med ring. (Fødevarestyrelsen) Der findes talrige andre små giftige svampe med brune lameller.', beskrivelse: '–', dele: '–', tilberedning: '**Må ikke spises.**', smag: '–',
    forvekslinger: [{ navn: 'Foranderlig skælhat (spiselig – kun trænede)', latin: 'Kuehneromyces mutabilis', fare: 'Spiselig men forveksles uhyre let', forskel: 'Skælhat har små brune skæl nedad stokken under ringen; hjelmhatten har glat stok.' }],
    advarsel: 'Meget giftig (indeholder stoffer, der skader indre organer – Fødevarestyrelsen).', sikkerhed: 'Ring Giftlinjen 82 12 12 12.', lov: '–', kilder: ['fvst-svampefolder', 'fvst-svampe'], kontrol: K.ok('Fra Fødevarestyrelsens folder og side.'), bem: '' },

  { id: 's-netbladhat', dansk: 'Almindelig netbladhat', latin: 'Paxillus involutus', familie: 'Paxillaceae', kategori: 'giftig', naturtyper: ['skov'], saeson: [7, 8, 9, 10], voksested: 'Under løv- og nåletræer; almindelig.',
    kendetegn: 'Tragtform, omrullet rand, brune lameller der bliver mørkere ved tryk. (Fødevarestyrelsen)', beskrivelse: '–', dele: '–', tilberedning: '**Må ikke spises.**', smag: '–',
    forvekslinger: [{ navn: 'Kantarel', latin: 'Cantharellus cibarius', fare: 'Spiselig', forskel: 'Kantarel har tykke, ribbeagtige "lameller", der ikke bliver mørke ved tryk.' }],
    advarsel: 'Man kan tåle den første gang, men gentagen spisning kan give livsfarlige allergiske reaktioner (Fødevarestyrelsen).', sikkerhed: 'Ring Giftlinjen 82 12 12 12.', lov: '–', kilder: ['fvst-svampefolder'], kontrol: K.ok('Fra Fødevarestyrelsens/Svampeforeningens folder.'), bem: '' },

  { id: 's-satans-roerhat', dansk: 'Satans rørhat', latin: 'Rubroboletus satanas', familie: 'Rørhat-familien (Boletaceae)', kategori: 'giftig', naturtyper: ['skov'], saeson: [8, 9, 10], voksested: 'Fed, ofte kalkholdig jord; sjælden.',
    kendetegn: 'Stor, kødfuld; askegrå hat; lyserød-gul stok med nettegning øverst; orangerøde rørmundinger; kødet blåner moderat; ældre hatte lugter kvalmende. (Fødevarestyrelsen)', beskrivelse: '–', dele: '–', tilberedning: '**Må ikke spises.**', smag: '–',
    forvekslinger: [{ navn: 'Netstokket indigorørhat (spiselig)', latin: 'Neoboletus luridiformis', fare: 'Spiselig men blåner kraftigt', forskel: 'Indigorørhat blåner omgående dybt blå ved såring og har brunlig hat; Satans rørhat blåner kun moderat.' }],
    advarsel: 'Giftig. Har givet forgiftninger i Danmark.', sikkerhed: 'Ring Giftlinjen 82 12 12 12.', lov: '–', kilder: ['fvst-svampefolder'], kontrol: K.ok('Fra Fødevarestyrelsens/Svampeforeningens folder.'), bem: '' },

  { id: 's-stenmorkel', dansk: 'Stenmorkel', latin: 'Gyromitra esculenta', familie: 'Discinaceae', kategori: 'giftig', naturtyper: ['skov'], saeson: [4, 5, 6], voksested: 'Skove om foråret, fx fyrreskov; ret sjælden.',
    kendetegn: 'Hjerneagtigt foldet top med snævre, uregelmæssige hulrum. (Fødevarestyrelsen)', beskrivelse: '–', dele: '–', tilberedning: '**Må ikke spises** – selv ikke efter tørring eller afkogning (metoderne er ikke sikre).', smag: '–',
    forvekslinger: [{ navn: 'Morkler (spiselige)', latin: 'Morchella spp.', fare: 'Spiselige', forskel: 'Morkler har **hul top**; stenmorkel har hjerneagtigt foldet top med snævre hulrum. Morkler er ikke almindelige.' }],
    advarsel: 'Dødeligt giftig rå; Fødevarestyrelsen fraråder helt at spise den. Kan skade lever, nyrer og blodlegemer.', sikkerhed: 'Ring Giftlinjen 82 12 12 12.', lov: '–', kilder: ['fvst-svampefolder', 'fvst-svampe'], kontrol: K.ok('Fra Fødevarestyrelsens folder og side.'), bem: '' },

  { id: 's-slorhatte', dansk: 'Slørhatte (slægten Cortinarius) og trævlhatte', latin: 'Cortinarius spp., Inocybe spp.', familie: 'Slørhat-familien (Cortinariaceae)', kategori: 'giftig', naturtyper: ['skov'], saeson: [8, 9, 10, 11], voksested: 'Skov.',
    kendetegn: 'Lameller får ofte tobaksbrune toner med alderen; slørrester på stok. (Fødevarestyrelsen: "Man bør helt afholde sig fra at spise svampe fra disse slægter.")', beskrivelse: '–', dele: '–', tilberedning: '**Må ikke spises.**', smag: '–',
    forvekslinger: [{ navn: 'Mange spisesvampe', latin: '-', fare: 'Nogle slørhatte indeholder stof, der kan give nyreskade og kræve dialyse eller nyretransplantation (Fødevarestyrelsen)', forskel: 'Bestemmelse kræver ekspert.' }],
    advarsel: 'Hele slægterne frarådes (Fødevarestyrelsen).', sikkerhed: 'Ring Giftlinjen 82 12 12 12.', lov: '–', kilder: ['fvst-svampefolder', 'fvst-svampe'], kontrol: K.ok('Anbefaling og skader er fra Fødevarestyrelsen.'), bem: '' },
];

export const KAT_LABEL = { standard: 'Dokumenteret spiselig', forsigtighed: 'Kræver særlig forsigtighed', undgaa: 'Nybegyndere bør undgå', giftig: 'Giftig', ikke: 'Ikke verificeret' };
