import { P, H, UL, OL, STEPS, INFO, WARN, DANGER, ACT, CL, C112, FIG, FIGS, TABLE, KV, DET, info, K } from './_lib.mjs';
import { figures as knotFigures } from './_knots.mjs';

export const figures = knotFigures;

const NOCERT = DANGER('Ingen af knobene her er certificeret klatreudstyr eller en garanti for sikker personbæring. Brug dem **aldrig** til sikring, nedfiring, løft af personer eller andre livskritiske formål. Brug godkendt udstyr og uddannelse til det.', 'Begrænsning');
const FIGNOTE = INFO('Tegningerne er **skematiske** og kommer fra denne app (ikke fagfællebedømt). De viser rebets vej, ikke alle detaljer. Øv med et rigtigt reb ved siden af, og tjek dit knob mod kontrollen i teksten.', 'Om tegningerne');
const NOFIG = WARN('Der er ikke en tegning til dette knob i denne udgave: skitserne kunne ikke kvalitetssikres og kunne vildlede. Følg trinene nøje, og se fx Det Danske Spejderkorps’ knobside (kræver net) for billeder.', 'Ingen tegning');

const knot = (o) => info({
  type: 'knob', niveau: 'gr', kap: 'knob', kilder: ['dds-knob', ...(o.kilder || [])], se: ['knob-begreber', 'knob-samle-reb'],
  ...o,
  blokke: [
    o.fig ? FIGS(...o.fig) : NOFIG,
    ...(o.fig ? [FIGNOTE] : []),
    H('Primær anvendelse', 2), P(o.brug),
    H('Sådan binder du det', 2), STEPS(o.trin),
    H('Sådan kontrollerer du, at det er bundet rigtigt', 2), UL(o.kontrolTjek),
    H('Begrænsninger – brug det ikke til …', 2), UL(o.begr),
    H('Sådan løsner du det', 2), P(o.loes),
    H('Typiske fejl', 2), UL(o.fejl),
    NOCERT,
    ...(o.ekstra || []),
  ],
});

export const guides = [
  info({
    id: 'knob-begreber', kap: 'knob', niveau: 'gr', titel: 'Knob, stik og surring – forskellen', resume: 'Knob binder et reb til sig selv; stik binder til noget; surring binder ting sammen.',
    tags: ['knob', 'stik', 'surring', 'begreber', 'hitch', 'bend'], kilder: ['dds-knob'], kontrol: K.delvist('Begreberne er almindelig dansk knobterminologi (jf. spejderbrug); De Danske Spejdere bruger bl.a. "stik" for hitches. Definitioner er ikke citeret ordret.'),
    blokke: [
      TABLE(['Begreb', 'Betyder', 'Eksempler'], [
        ['**Knob**', 'Reb bundet til sig selv eller til et andet reb (løkke, stopper, samling)', 'Ottetalsknob, råbåndsknob, flagknob'],
        ['**Stik**', 'Reb bundet *til* en genstand (pæl, ring, stamme, anden line)', 'Pælestik (løkke), dobbelt halvstik, tømmerstik'],
        ['**Surring/besnøring**', 'Flere omgange reb, der binder ting sammen (fx pæle)', 'Kvadratsurring, vinkelbesnøring – de fleste starter med et tømmerstik (DDS)'],
        ['**Bardun**', 'Udspændingslinje fra tarp/telt/mast til jorden, ofte med justerbart knob', 'Bardunbinding med glidende knob'],
      ]),
      NOCERT,
      INFO('Alle tegninger i knudebiblioteket er skematiske egne tegninger. Reb med glat overflade eller af forskellig tykkelse kan få knob til at glide – test altid med træk under sikre forhold.'),
    ],
  }),

  knot({
    id: 'knob-paelestik', titel: 'Pælestik', resume: 'Fast løkke i enden af et reb; låser sig selv og kan løsnes igen.', tags: ['pælestik', 'bowline', 'løkke', 'øje', 'fortøjning'],
    fig: ['knob-paelestik-trin', 'knob-paelestik'], kontrol: K.delvist('Anvendelse (stabil, selvlåsende løkke, til fortøjning) er fra De Danske Spejdere. Trin og tegning: kontrolleret mod en standardmetode og et referencebillede i sammenligning; begrænsninger er almindelig praksis ({T}).'),
    brug: 'En pålidelig løkke i enden af et reb – fx til at fæstne en tarp-bardun til et ring/øje, fortøje et lille fartøj eller binde et reb om en stamme. Pælestikket er stabilt og låser sig selv, også selvom der rykkes i rebet fra forskellige retninger (De Danske Spejdere).',
    trin: ['Lav et **hul** (en lille løkke) i rebet, så den korte ende (**tampen**) ender **oven på** den faste part. Hullet bestemmer størrelsen på øjet senere.', '**Tampen op gennem hullet nedefra** ("kaninen kommer op af hullet").', 'Tampen **bag om den faste part** ("rundt om træet").', 'Tampen **ned i hullet igen**. Hold fast i tampen og den faste part, og **træk** hullet sammen. Lad tampen være mindst en håndsbredde lang.'],
    kontrolTjek: ['Tampen ligger **inde i øjet**, parallelt med øjets side – ikke udenfor.', 'Den faste part går gennem knobets "krave" uden at blive snoet.', 'Under træk: øjet bevarer sin størrelse, og knobet strammer pænt til.', 'Tampen er ikke trukket helt ind i knobet.'],
    begr: ['personbæring, klatring, nedfiring (ikke certificeret).', 'stive/glatte reb uden træk – kan løsne sig; sikr med et ekstra stopperknob på tampen ved tvivl {T}.', 'reb der belastes i forskellige retninger i længere tid uden kontrol.'],
    loes: 'Slip trækket, bøj den faste part, og "bræk" kraven bagud, så knobet kan skubbes fra hinanden; træk tampen ud af hullet.',
    fejl: ['Tampen udenfor øjet (knobet kan blive til "cowboy-pælestik", som løsner sig).', 'Hullet er lavet forkert, så knobet bliver et simpelt overhåndsknob.', 'For kort tamp.'],
  }),

  knot({
    id: 'knob-halvstik', titel: 'Dobbelt halvstik', resume: 'Slutter om en pæl eller ring; låser godt, hvis trækket er jævnt.', tags: ['dobbelt halvstik', 'clove hitch', 'pæl', 'stik', 'ring'], kontrol: K.delvist('Anvendelse og begrænsninger er fra De Danske Spejdere. Tegning mangler (kunne ikke kvalitetssikres); trin er en standardbeskrivelse, ikke kontrolleret mod billede.'),
    brug: 'Fastgør et reb til en pæl, stamme, ring eller rækværk. Det "slutter ring om et emne" og kan også slås i luften og lægges over enden af en pæl (De Danske Spejdere).',
    trin: ['Før rebet **rundt om pælen** (første omgang), og lad det krydse sig selv foran pælen.', 'Før det **endnu en gang rundt** i samme retning.', '**Stik tampen ind under** den sidste omgang (mellem omgangen og pælen), så den kommer ud parallelt med den faste part.', 'Stram begge omgange, så de ligger pænt side om side.'],
    kontrolTjek: ['Begge omgange ligger flade og parallelle, og de to ender går ud i hver sin retning.', 'Træk i den faste part: knobet strammer og glider ikke.'],
    begr: ['skiftende eller slækket træk – knobet kan løsne sig (DDS: låser bedst ved jævnt træk).', 'glatte stolper og lange, vippende belastninger.', 'personbæring.'],
    loes: 'Giv slæk, skub de to omgange sammen, og vikl dem af i omvendt rækkefølge.',
    fejl: ['Omgangene ligger krydset forkert, så det bliver et andet stik.', 'Tampen ikke stukket under.'],
  }),

  knot({
    id: 'knob-raabaand', titel: 'Råbåndsknob', resume: 'Binder to lige tykke reb sammen i en hurtig vending – kun til lette formål.', tags: ['råbåndsknob', 'reef knot', 'samle', 'forbinde'], fig: ['knob-raabaand-trin', 'knob-raabaand'],
    kontrol: K.delvist('Anvendelse (kun lige tykke reb) er fra De Danske Spejdere; trin og kontrol (ender på samme side) er almindelig praksis og kontrolleret mod referencebillede i sammenligning.'),
    brug: 'Hurtig sammenføjning af to lige tykke reb, snore eller bandager, til lette formål (bundt, forlænge snor). Simpelt og let at kontrollere, men der findes mange mere solide alternativer (De Danske Spejdere).',
    trin: ['Hold en ende i hver hånd.', '**Højre ende over venstre** og rund under – et halvt knob.', '**Nu venstre ende over højre** og rund under – andet halve knob.', 'Træk i begge faste dele og begge ender.'],
    kontrolTjek: ['Hver ende ligger på **samme side** som sin egen faste part (to sammenlåste bugter).', 'Ligger ender på hver sin side, er det et **grandmother-knob**, som ikke holder – bind om.'],
    begr: ['reb af **forskellig tykkelse** (brug flagknob).', 'tunge eller livskritiske belastninger.', 'glatte reb; knobet kan "vælte" og løsne sig ved skiftende træk.'],
    loes: 'Tag fat i en fast part og en tilsvarende ende i hver side og skub bugterne mod hinanden, så knobet kan "vælte" fladt og trækkes fra hinanden.',
    fejl: ['Grandmother-knob (forkert over/under anden gang).', 'Ender for korte.', 'Brug på forskellig tykkelse.'],
  }),

  knot({
    id: 'knob-flagknob', titel: 'Flagknob', resume: 'Samler to reb, også af forskellig tykkelse; også en line til et øje. Styrken er omdiskuteret.', tags: ['flagknob', 'skødestik', 'sheet bend', 'samle', 'forskellig tykkelse'], fig: ['knob-flagknob-trin', 'knob-flagknob'],
    kontrol: K.delvist('Anvendelse og begrænsninger er fra De Danske Spejdere (flagknob = skødestik/sheet bend). Trin og tegning er skematiske og kontrolleret mod referencebillede i sammenligning.'),
    brug: 'Knytter to liner sammen eller fæstner en line til et øje. Kan bedre bruges til liner af forskellig tykkelse end råbåndsknob (De Danske Spejdere). Lav bugten på det **tykkeste** reb.',
    trin: ['Lav en **bugt** (U) i det tykke reb.', 'Før enden af det **tynde reb op gennem bugten** nedefra.', 'Før det **rundt bag begge ben** af bugten.', '**Stik det ind under sig selv** (under tyndt rebs egen faste part) og stram.'],
    kontrolTjek: ['Begge frie ender ligger på **samme side** af knobet.', 'Knobet er stramt og kompakt, og det tynde reb er tæt om bugten.'],
    begr: ['store eller vedvarende belastninger – knobet kan kollapse, og rebs brudstyrke forringes kraftigt (De Danske Spejdere).', 'personbæring.', 'Stramning rundt om et emne er svært.'],
    loes: 'Slip trækket; skub bugten ned og flyt det tynde reb tilbage ud af knobet.',
    fejl: ['Bugten er lavet på det tynde reb.', 'Enderne på hver sin side (svagere form).', 'Rebet ikke trukket under sig selv.'],
    ekstra: [P('**Dobbelt flagknob:** kør tampen en ekstra gang rundt om bugten *og* under sig selv igen – ellers giver den ekstra runde ikke ekstra sikkerhed (De Danske Spejdere).')],
  }),

  knot({
    id: 'knob-ottetal', titel: 'Ottetalsknob', resume: 'Stopperknob i enden af et reb; dobbelt ottetal giver en fast løkke.', tags: ['ottetalsknob', 'ottetal', 'stopper', 'figure-eight', 'løkke'], fig: ['knob-ottetal-trin', 'knob-ottetal'],
    kontrol: K.delvist('Anvendelse er fra De Danske Spejdere. Tegningen af det færdige knob er en matematisk figur-otte-knude (4 kryds) – verificeret geometrisk, men ikke mod en knobkilde.'),
    brug: 'Som **stopperknob** forhindrer det, at rebet løber gennem et øje. Lagt dobbelt giver det en solid fast løkke og er en favorit blandt klatrere – men er svær at løsne efter kraftig belastning (De Danske Spejdere).',
    trin: ['Lav en **bugt/løkke** i rebet med tampen oven på.', 'Før tampen **rundt bag den faste part**.', 'Før tampen **ned gennem løkken** foran.', 'Stram, så knobet får "8"-formen.'],
    kontrolTjek: ['Knobet ligner et tydeligt **8-tal**, og rebene ligger parallelle (ingen kryds).', 'Tampen er mindst 10 cm (en håndsbredde) lang {T}.'],
    begr: ['Dette er ikke klatreudstyr – personsikring kræver uddannelse og godkendt udstyr.', 'Efter kraftig belastning er knobet meget svært at løsne.'],
    loes: 'Slip trækket og bøj knobet; skub løkkerne tilbage fra hinanden.',
    fejl: ['Blandet over/under, så der kommer et andet knob.', 'For kort tamp.'],
  }),

  knot({
    id: 'knob-toemmerstik', titel: 'Tømmerstik', resume: 'Hurtigt stik til at binde bundter og starte surringer; virker kun med træk.', tags: ['tømmerstik', 'timber hitch', 'stik', 'bundt', 'brænde', 'surring'], kontrol: K.delvist('Anvendelse og begrænsninger er fra De Danske Spejdere. Tegning mangler; trin er en standardbeskrivelse.'),
    brug: 'Let at binde og bruges til at snøre ting sammen, fx brænde og grene. De fleste besnøringer startes med et tømmerstik (De Danske Spejdere).',
    trin: ['Før rebet **rundt om stammen/bundtet**.', 'Før tampen **rundt om egen faste part**.', 'Vikl tampen **mindst tre gange** om sig selv langs rebet.', 'Stram – knobet låser kun, når der er **træk**.'],
    kontrolTjek: ['Mindst tre snoninger ligger tæt og pænt.', 'Under træk: ingen glidning.'],
    begr: ['virker bedst, når der er træk – løsner hurtigt uden (DDS).', 'personbæring, løft og vedvarende skiftende belastning.'],
    loes: 'Slip trækket og skub snoningerne ud fra hinanden.',
    fejl: ['For få snoninger.', 'Ingen træk.'],
  }),

  knot({
    id: 'knob-halvstik-fast', titel: 'Dobbelt halvstik omkring en fast genstand (om egen part)', resume: 'Rebende sikres om pæl eller ring med dobbelt halvstik om egen part.', tags: ['halvstik', 'egen part', 'pæl', 'ring', 'sikre', 'rebende'], kontrol: K.delvist('Anvendelse er fra De Danske Spejdere (dobbelt halvstik om egen part). Tegning mangler; trin er standard.'),
    brug: 'Sikrer en rebende til et øje eller en pæl: vikl rebet en eller to gange om pælen og sikr med dobbelt halvstik om **egen part** – "den del af rebet, der løber frem til knobet" (De Danske Spejdere).',
    trin: ['Vikl rebet **en eller to gange** om pælen/ringen.', 'Slå et **dobbelt halvstik om rebets egen faste part**.', 'Stram, så omgangene ligger tæt.'],
    kontrolTjek: ['Rebet sidder fast, når du trækker i enden; omgangene ligger pænt side om side.'],
    begr: ['Kan rebet glide over det, du binder til, strammer knobet og kan blive svært at løsne (DDS).', 'ikke til personbæring.'],
    loes: 'Slip trækket og vikl omgangene af i omvendt rækkefølge.',
    fejl: ['For slapt rebet; omgangene krydser.'],
  }),

  knot({
    id: 'knob-kaedestik', titel: 'Kædestik (kort reb til opbevaring)', resume: 'Daisy chain: en række løkker, der forkorter et reb og kan hives op med enden.', tags: ['kædestik', 'daisy chain', 'opbevaring', 'forkorte', 'reb'], fig: ['knob-kaedestik-trin', 'knob-kaedestik'], kontrol: K.ikke('Almen praksis ({T}); ikke kontrolleret mod en navngiven kilde.'),
    brug: 'Midlertidig opbevaring af et længere reb eller snor (bag på rygsæk, i skuret) uden at det filtrer. Kan hurtigt rulles ud ved at hive i enden.',
    trin: ['Lav en **løkke** i rebets ende.', 'Træk en **bugt** af rebet **gennem løkken**, og stram let.', 'Gentag: træk en ny bugt gennem den forrige.', 'Til sidst: stik **enden gennem sidste løkke** og stram for at låse.'],
    kontrolTjek: ['Kæden ligger jævnt, hver løkke låser den forrige.', 'Hiv i enden: kæden løsner sig kontrolleret.'],
    begr: ['Ikke til at bære eller sikre last.', 'Kan løsne, hvis enden ikke er låst.'],
    loes: 'Træk i enden og lad løkkerne falde ud én ad gangen.',
    fejl: ['Løkkerne trækkes ikke gennem den forrige.', 'Enden ikke låst.'],
  }),

  knot({
    id: 'knob-bardun', titel: 'Bardunbinding til tarp eller læsejl', resume: 'Glidende knob til udspænding; justér stramning uden at binde om.', tags: ['bardun', 'tarp', 'telt', 'tautline', 'udspænding', 'stram'], kontrol: K.ikke('Almen praksis ({T}); De Danske Spejdere omtaler den ikke. Tegning mangler.'),
    brug: 'Udspænding af tarp, telt eller læsejl fra hjørne til pløk. Knobet kan flyttes for at stramme eller løsne.',
    trin: ['Sæt rebet fast i tarpens hjørne (øje) og før det ud til pløkken.', 'Lav en **løkke om pløkken** (eller et stik) og før enden tilbage langs egen faste part.', 'Vikl enden **to gange om den faste part indenfor løkken** (mod pløkken).', 'Vikl enden **én gang om den faste part udenfor løkken** (mod tarpen) og stram. Lad knobet kunne glide.', 'Skub knobet for at stramme; slip for at løsne.'],
    kontrolTjek: ['Knobet holder, når du trækker i tarpen, og glider, når du skubber det.', 'Rebet er stramt og tarpen ryster ikke.'],
    begr: ['Glatte syntetiske reb kan glide.', 'Ikke til belastning af personer.', 'Under kraftig storm kan knob og pløkke give efter.'],
    loes: 'Skub knobet mod pløkken for at løsne, eller åbn omgangene.',
    fejl: ['For mange/få omgange (knobet glider eller låser fast).', 'Pløk for kort/blød jord.'],
  }),

  knot({
    id: 'knob-samle-reb', titel: 'Samling af to reb – diameter og belastning', resume: 'Vælg efter tykkelse og belastning: lige tykke og let → råbåndsknob; forskellig tykkelse → flagknob; tungt/kritisk → ingen af disse.', tags: ['samle', 'samling', 'forskellig tykkelse', 'belastning', 'flagknob', 'råbåndsknob'],
    kilder: ['dds-knob'], kontrol: K.delvist('Valget følger De Danske Spejdere (råbåndsknob kun lige tykke; flagknob bedre ved forskellig tykkelse; flagknobets styrke omdiskuteret). Øvrige råd om belastning er almen forsigtighed.'),
    fig: ['knob-raabaand', 'knob-flagknob'],
    brug: 'At vælge den bedst egnede metode til at samle to reb ud fra tykkelse og belastning.',
    trin: ['**Samme tykkelse + let belastning** (bundt, snor): råbåndsknob.', '**Forskellig tykkelse**: flagknob – bugten på det tykkeste reb; overvej dobbelt flagknob.', '**Tung eller vedvarende belastning, livskritisk brug:** brug **ikke** disse knob – brug ét sammenhængende reb/godkendt udstyr.', 'Test hver samling med moderat træk, før du stoler på den.'],
    kontrolTjek: ['Enderne ligger rigtigt (samme side som egen faste part ved råbånd; samme side ved flagknob).', 'Knobet strammer og glider ikke ved prøvetræk.'],
    begr: ['Begge knob reducerer rebets brudstyrke og kan gå op ved skiftende træk.'],
    loes: 'Se de enkelte knob.',
    fejl: ['Råbåndsknob på forskellig tykkelse eller glatte reb.', 'Samling ved sikring af personer.'],
  }),
];
