import { P, H, UL, OL, STEPS, INFO, WARN, DANGER, ACT, CL, C112, FIG, FIGS, TABLE, KV, DET, info, K } from './_lib.mjs';
import { figures as knotFigures } from './_knots.mjs';

export const figures = knotFigures;

const NOCERT = DANGER('Ingen af knobene her er certificeret klatreudstyr eller en garanti for sikker personbæring. Brug dem **aldrig** til sikring, nedfiring, løft af personer eller andre livskritiske formål. Brug godkendt udstyr og uddannelse til det.', 'Begrænsning');
const FIGNOTE = INFO('Tegningerne er **skematiske** og kommer fra denne app (ikke fagfællebedømt). De viser rebets vej, ikke alle detaljer. Øv med et rigtigt reb ved siden af, og tjek dit knob mod kontrollen i teksten.', 'Om tegningerne');
const NOFIG = WARN('Der er ikke en tegning til dette knob i denne udgave: skitserne kunne ikke kvalitetssikres og kunne vildlede. Følg trinene nøje, og se fx Det Danske Spejderkorps’ knobside (kræver net) for billeder.', 'Ingen tegning');

// kontrolstatus for kilder læst 2026-10-28
const K28 = { ok: (note) => ({ status: 'kontrolleret', dato: '2026-10-28', note }), delvist: (note) => ({ status: 'delvist', dato: '2026-10-28', note }) };

const knot = (o) => info({
  type: 'knob', niveau: 'gr', kap: 'knob', kilder: [...(o.dds === false ? [] : ['dds-knob']), ...(o.kilder || [])], se: ['knob-begreber', 'knob-samle-reb'],
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
    id: 'knob-kaedestik', titel: 'Kædestik (kort reb til opbevaring)', resume: 'Daisy chain: en række løkker, der forkorter et reb og kan hives op med enden.', tags: ['kædestik', 'daisy chain', 'chain sinnet', 'opbevaring', 'forkorte', 'reb'], fig: ['knob-kaedestik-trin', 'knob-kaedestik'], kilder: ['ak-chain'], kontrol: K28.ok('Fremgangsmåde, låsning og opløsning følger Animated Knots: Chain Sinnet.'),
    brug: 'Midlertidig opbevaring af et længere reb eller snor (bag på rygsæk, i skuret) uden at det filtrer. Kan hurtigt rulles ud ved at hive i enden.',
    trin: ['Lav en **løkke** i rebets ende.', 'Træk en **bugt** af rebet **gennem løkken**, og stram let.', 'Gentag: træk en ny bugt gennem den forrige.', 'Til sidst: stik **enden gennem sidste løkke** og stram for at låse.', 'Tip: skift retning på hver løkke (med og mod uret) – så snor rebet sig mindre, når du løser det op.'],
    kontrolTjek: ['Kæden ligger jævnt, hver løkke låser den forrige.', 'Træk den låsende ende ud: hele kæden løser sig. (Trækker du i den anden ende, forsvinder kun ét led.)'],
    begr: ['Ikke til at bære eller sikre last.', 'Kan løsne, hvis enden ikke er låst.'],
    loes: 'Træk den ende, du låste med, ud af sidste løkke, og hiv – så forsvinder alle løkkerne.',
    fejl: ['Løkkerne trækkes ikke gennem den forrige.', 'Enden ikke låst.'],
  }),

  knot({
    id: 'knob-bardun', titel: 'Bardunbinding til tarp eller læsejl', resume: 'Glidende knob til udspænding; justér stramning uden at binde om.', tags: ['bardun', 'tarp', 'telt', 'tautline', 'midshipman', 'udspænding', 'stram', 'barduneknob'], kilder: ['ak-midshipman'], kontrol: K28.delvist('Knobet (Midshipman\'s Hitch) og glid-advarslerne følger Animated Knots. Tegning mangler; brugen til tarp er almen praksis.'),
    brug: 'Udspænding af tarp, telt eller læsejl fra hjørne til pløk. Knobet kan flyttes for at stramme eller løsne.',
    trin: ['Sæt rebet fast i tarpens hjørne (øje) og før det ud til pløkken.', 'Lav en **løkke om pløkken** (eller et stik) og før enden tilbage langs egen faste part.', 'Vikl enden **én gang om den faste part** inde i løkken (mod pløkken).', 'Vikl **endnu en gang**, men stik enden ind **ved siden af den første omgang** – mellem den og løkken – så den krydser og klemmer. Nu holder knobet allerede, mens du justerer.', 'Afslut med **et halvstik om den faste part udenfor** omgangene (mod tarpen), og stram.', 'Skub knobet op ad den faste part for at stramme; når det er strammet, holder det.'],
    kontrolTjek: ['Knobet holder, når du trækker i tarpen, og glider, når du skubber det.', 'Rebet er stramt og tarpen ryster ikke.'],
    begr: ['Glat nylon kan glide med tiden – tag en ekstra omgang og/eller et ekstra halvstik. Dyneema- og polypropylenreb glider næsten altid.', 'Den udbredte spejdervariant (to omgange spiralformet indenfor) er mindre sikker.', 'Ikke til belastning af personer.', 'Under kraftig storm kan knob og pløkke give efter.'],
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
  // ---- nye knob og besnøringer (kilder læst 2026-10-28) -------------------------------------------------
  knot({
    id: 'knob-ottetalsloekke', titel: 'Ottetalsløkke (dobbelt ottetalsknob)', dds: false, kilder: ['ak-fig8'], niveau: 'mi',
    resume: 'Stærk, let kontrollerbar fast løkke i enden af et reb – bundet ved at "følge" et ottetalsknob tilbage.',
    tags: ['ottetalsløkke', 'dobbelt ottetal', 'flamsk knob', 'figure 8 loop', 'løkke', 'øje'],
    kontrol: K28.ok('Trin, kontrol (to parallelle strenge) og stopperknob er fra Animated Knots. Personbæring og klatring kræver uddannelse og godkendt udstyr.'),
    brug: 'En fast, pålidelig løkke i enden af et reb – fx om en stamme, en ring eller et hjørneøje på en tarp. Knobet er let at huske, binde og **kontrollere** (Animated Knots). Det er sværere at løsne efter tung belastning end et pælestik.',
    trin: ['Bind et **løst ottetalsknob** et stykke inde på rebet (ca. 60–80 cm fra enden, afhængigt af løkkens størrelse).', 'Før **tampen rundt om** det, løkken skal sidde om (ring, stamme, øje).', '**Følg ottetallet tilbage:** før tampen ind i knobet, hvor den kom ud, og lad den løbe ved siden af den første streng hele vejen rundt – i omvendt rækkefølge.', 'Tampen kommer ud **ved siden af den faste part**. Ret knobet til, så strengene ligger parallelt, og stram ved at trække i alle fire ender.', 'Lad tampen være lang, og slå evt. et **stopperknob om den faste part** tæt op mod ottetallet.'],
    kontrolTjek: ['**To strenge ligger side om side overalt** i knobet – ingen steder krydser de hinanden (Animated Knots).', 'Knobet ligner et tydeligt "8" med dobbelte linjer.', 'Tampen er mindst en håndsbredde lang, og et evt. stopperknob sidder tæt mod knobet.'],
    begr: ['personsikring, klatring og nedfiring uden uddannelse og godkendt udstyr.', 'steder, hvor knobet skal kunne løsnes hurtigt efter tung belastning (brug hellere pælestik).'],
    loes: 'Giv slæk, bøj knobet frem og tilbage ("bræk" det), og løsn den yderste omgang først. Efter meget tung belastning kan det være svært.',
    fejl: ['Tampen følger ikke den første streng hele vejen, så der opstår krydsninger.', 'For kort tamp.', 'Knobet er ikke strammet til, før det belastes.'],
  }),
  knot({
    id: 'knob-sommerfugl', titel: 'Alpesommerfugl (sommerfugleknob)', dds: false, kilder: ['ak-butterfly', 'friluft-knob'], niveau: 'mi',
    resume: 'Fast løkke midt på et reb, som kan belastes fra alle sider – uden at du skal bruge enderne.',
    tags: ['alpesommerfugl', 'sommerfugleknob', 'butterfly', 'løkke midt på reb', 'talje'],
    kontrol: K28.ok('Bindemetode og anvendelser (løkke midt på reb, belastning i alle retninger, isolere beskadiget reb, første del af en talje) fra Animated Knots; dansk navn fra friluftsaktiviteter.dk.'),
    brug: 'En løkke **midt på et reb**, fx til at hænge ting op på en udspændt line, som fastgøringspunkt i en talje ([[knob-talje]]) eller for at **isolere et beskadiget stykke** af rebet, så resten kan bruges. Løkken kan tage træk fra løkken mod begge ender og mellem de to ender (Animated Knots).',
    trin: ['Hold hånden fladt, og **vikl rebet to gange om hånden** (håndfladen opad).', 'Læg den første vikling ved **fingerspidserne**, og afslut den anden vikling tilbage ved **tommelfingeren**.', '**Tag fat i viklingen ved fingerspidserne**, og løft den op.', '**Før den rundt om de to andre viklinger** og ind under dem, så den bliver til løkken.', '**Træk knobet af hånden**, og stram ved at trække i løkken og i begge ender.'],
    kontrolTjek: ['Løkken står ud til siden af rebet, og knobet ser symmetrisk ud – to "vinger" omkring løkken.', 'Træk hårdt i de to ender (uden løkken): knobet holder og glider ikke.', 'Træk i løkken: den holder sin størrelse.'],
    begr: ['personsikring uden uddannelse og godkendt udstyr.', 'meget glatte reb uden prøvetræk.'],
    loes: 'Giv slæk, og skub de to "vinger" væk fra løkken – knobet åbner sig let, også efter belastning (friluftsaktiviteter.dk).',
    fejl: ['Viklingerne krydser forkert, så knobet bliver et simpelt overhåndsknob med en løkke, der glider.', 'Knobet er ikke strammet ordentligt til.'],
  }),
  knot({
    id: 'knob-fiskerknob', titel: 'Dobbelt fiskerknob', dds: false, kilder: ['ak-fisherman'], niveau: 'mi',
    resume: 'Meget sikker samling af to reb med samme tykkelse – og til at lukke en prusikløkke. Svær at løsne igen.',
    tags: ['dobbelt fiskerknob', 'fiskerknob', 'double fisherman', 'samle reb', 'prusikløkke'],
    kontrol: K28.ok('Trin, anvendelser og advarsler (kan låse sig, skal efterses; tredobbelt ved meget glatte fibre) fra Animated Knots.'),
    brug: 'At samle **to reb af samme tykkelse** permanent og sikkert – eller lukke en snor til en **løkke**, fx en prusikløkke ([[knob-prusik]]). Knobet holder bedre end råbåndsknob, men kan låse sig så hårdt, at det næsten ikke kan løsnes (Animated Knots).',
    trin: ['Læg de to ender **overlappende**, så de peger mod hinanden (ca. 30 cm overlap).', 'Tag den ene ende **to gange rundt om begge reb**, i retning mod dens egen faste part.', '**Før enden tilbage gennem de to omgange**, og stram knobet.', 'Gentag med **den anden ende** i modsat retning: to gange om begge reb og tilbage gennem omgangene.', '**Træk i de to faste parter**, så de to knob glider sammen og ligger tæt mod hinanden.'],
    kontrolTjek: ['De to knob ligger **tæt sammen** og ser ens ud (spejlvendte).', 'På den ene side ser du fire parallelle linjer, på den anden to "X"-krydsninger.', 'Tamperne er lange (mindst en håndsbredde) – længere ved vigtige anvendelser (Animated Knots).'],
    begr: ['reb af meget forskellig tykkelse (brug flagknob).', 'samlinger, der skal kunne løsnes igen (knobet låser sig).', 'meget glatte fibre (Dyneema o.l.) – brug tredobbelt fiskerknob, og kun med uddannelse (Animated Knots).'],
    loes: 'Træk de to knob fra hinanden, og løsn hvert knob for sig. Efter tung belastning kan det være næsten umuligt – planlæg at skære det af.',
    fejl: ['Den anden ende vikles i samme retning som den første, så knobene ikke passer sammen.', 'Kun én omgang om rebene (enkelt fiskerknob er langt svagere).', 'Korte tamper.'],
  }),
  knot({
    id: 'knob-prusik', titel: 'Prusikknude', dds: false, kilder: ['ak-prusik', 'ak-fisherman'], niveau: 'av',
    resume: 'En løkke af tynd snor, der kan skubbes langs et reb, men låser, når den belastes – fx til at hænge tarp eller tørresnor op uden knob i hovedlinen.',
    tags: ['prusik', 'prusikknude', 'friktionsknude', 'klemknob', 'glidende', 'tarp'],
    kontrol: K28.ok('Tre omgange om rebet, 5–6 mm snor, prusikløkke samlet med dobbelt fiskerknob og afprøvning tæt ved jorden er fra Animated Knots. Brug til klatring/redning kræver uddannelse.'),
    brug: 'At fastgøre noget til en **udspændt line**, så det kan flyttes, men holder, når det belastes – fx hjørnerne af en tarp på en ridgeline, en lygte eller en tørresnor. Prusikknuden glider, når den ikke er belastet, og låser under belastning. Den bruges også i klatring og redning, men **kun med uddannelse** (Animated Knots).',
    trin: ['Lav en **løkke af tynd snor** (fx 5–6 mm), og luk den med et **dobbelt fiskerknob** ([[knob-fiskerknob]]). Snoren skal være tydeligt tyndere end hovedrebet.', 'Læg løkken bag hovedrebet, og **før den rundt om rebet og ind gennem sig selv** – tre gange (tre omgange inde i løkken).', '**Læg omgangene pænt side om side**, og træk løkken ud midt på knuden, så den strammer.', 'Hæng tarp eller last i løkken, og **afprøv** at den låser, når den belastes, og glider, når du skubber knuden uden belastning.'],
    kontrolTjek: ['Omgangene ligger **pænt side om side** uden at krydse.', 'Ubelastet: knuden kan skubbes. Belastet: den holder uden at glide.', 'Fiskerknobet på løkken sidder **uden for** selve omgangene.'],
    begr: ['klatring, nedfiring og redning uden uddannelse.', 'snor, der er lige så tyk eller tykkere end hovedrebet (låser ikke).', 'meget glatte eller våde/isede reb – kan glide; tilføj evt. en omgang og afprøv.'],
    loes: 'Fjern belastningen, og løsn omgangene ved at skubbe den midterste omgang tilbage.',
    fejl: ['For tyk snor eller for få omgange (glider).', 'Omgange, der krydser hinanden.', 'At tage fat om selve knuden under belastning – det kan få den til at glide og blive varm (Animated Knots om beslægtede knuder).'],
  }),
  knot({
    id: 'knob-talje', titel: 'Talje (lastbilstik) – stram en line hårdt', dds: false, kilder: ['ak-trucker', 'ak-butterfly'], niveau: 'mi',
    resume: 'Giver ekstra kraft, når en line skal strammes: en ridgeline til tarp, en presenning eller en last.',
    tags: ['talje', 'lastbilstik', 'truckers hitch', 'stramme', 'ridgeline', 'presenning', 'udveksling'],
    kontrol: K28.ok('Opbygning, anvendelse og friktionstab (teoretisk 3:1, i praksis ca. 1,6:1) er fra Animated Knots; løkken kan laves som alpesommerfugl.'),
    brug: 'At **stramme en line hårdt**, fx en ridgeline mellem to træer til en tarp, eller surre en presenning eller last. Rebet løber over sig selv og giver en udveksling – i teori 3:1, i praksis ca. **1,6:1** pga. friktion (Animated Knots).',
    trin: ['Fastgør den ene ende af linen (fx et **pælestik** om det første træ).', 'Lav en **fast løkke i den faste part** et stykke fra det andet fæste – fx en **alpesommerfugl** ([[knob-sommerfugl]]).', 'Før **tampen rundt om** det andet træ eller krogen og **tilbage gennem løkken**.', '**Træk i tampen** – nu strammes linen med udveksling. Hold strammet ved at klemme rebet, hvor det løber gennem løkken.', 'Lås med **to halvstik** om begge parter under løkken (eller en bugt, så den let kan løsnes).'],
    kontrolTjek: ['Linen er stram og bliver stram, når du slipper tampen.', 'Løkken holder sin form og glider ikke.', 'Halvstikkene sidder tæt mod løkken.'],
    begr: ['overstramning af tynde liner, træer eller tarp-øjer – udvekslingen gør det let at trække for hårdt.', 'løft eller sikring af personer.', 'en løkke, der ikke er fast (en almindelig glidende løkke kan blive trukket sammen).'],
    loes: 'Løsn halvstikkene (eller træk bugten ud), giv slæk gennem løkken, og løsn alpesommerfuglen.',
    fejl: ['Løkken laves som et overhåndsknob, der låser sig og ikke kan løsnes.', 'Linen saves over løkken ved gentagen stramning (brug evt. en karabin i løkken {T}).'],
  }),
  knot({
    id: 'knob-vinkelbesnoering', titel: 'Vinkelbesnøring (kvadratsurring)', dds: false, kilder: ['spejder-besnoering', 'ak-square'], niveau: 'mi',
    resume: 'Binder to rafter eller grene sammen i ret vinkel – til ramme, bord, stativ eller bivuak.',
    tags: ['vinkelbesnøring', 'kvadratsurring', 'square lashing', 'besnøring', 'surring', 'rafter', 'pionering'],
    kontrol: K28.ok('Fremgangsmåde fra dansk spejdermateriale (start med tømmerstik, mindst fire omgange, strammetørn) og Animated Knots (3–4 omgange, 3–4 strammetørn, slut med halvstik; virker ned til ca. 45°).'),
    brug: 'At samle **to rafter eller grene i ret vinkel** – fx en ramme til et læ, et bord eller et stativ. Besnøringen kan bære last og virker ned til ca. 45° vinkel (Animated Knots).',
    trin: ['Slå et **tømmerstik** ([[knob-toemmerstik]]) om den **lodrette** rafte lige under den vandrette (eller et dobbelt halvstik, som Animated Knots viser).', 'Før rebet **foran over** den vandrette, **bag om** den lodrette, **foran over** den vandrette på den anden side og **bag om** den lodrette forneden – rundt i en firkant.', 'Læg **mindst fire omgange**; hver omgang skal ligge **indenfor den forrige** på den vandrette rafte og udenfor på den lodrette.', 'Læg **3–4 strammetørn** mellem rafterne, vinkelret på omgangene, og træk dem så stramt som muligt.', 'Afslut med et **dobbelt halvstik** om den ene rafte.'],
    kontrolTjek: ['Rafterne kan ikke vrides eller glide i forhold til hinanden.', 'Omgangene ligger pænt ved siden af hinanden – ikke oven på hinanden.', 'Strammetørnene trækker omgangene tydeligt sammen.'],
    begr: ['konstruktioner, folk skal stå eller klatre på, uden erfaring og kontrol.', 'rådne eller for tynde grene – besnøringen er aldrig stærkere end træet.', 'naturreb eller gammelt reb uden prøvebelastning.'],
    loes: 'Løsn det afsluttende halvstik, vikl strammetørn og omgange af i omvendt rækkefølge, og løsn tømmerstikket.',
    fejl: ['For få omgange eller manglende strammetørn – besnøringen bliver løs.', 'Omgangene ligger oven på hinanden.', 'Start-stikket sidder på den forkerte rafte, så besnøringen glider ned.'],
  }),
  knot({
    id: 'knob-krydsbesnoering', titel: 'Krydsbesnøring (diagonalsurring)', dds: false, kilder: ['spejder-besnoering'], niveau: 'mi',
    resume: 'Samler to rafter, der krydser hinanden i en skæv vinkel, eller som har en tendens til at springe fra hinanden.',
    tags: ['krydsbesnøring', 'diagonalsurring', 'diagonal lashing', 'besnøring', 'surring', 'kryds'],
    kontrol: K28.delvist('Fremgangsmåde fra dansk lokalt spejdermateriale (9530 spejder); ikke kontrolleret mod en anden kilde.'),
    brug: 'At samle to rafter i en **vinkel, der ikke er ret**, fx kryds-afstivning i en ramme eller et stativ.',
    trin: ['Slå et **tømmerstik om begge rafter** på det sted, hvor de krydser.', '**Snør rebet nogle gange rundt** om rafterne diagonalt i den ene retning.', 'Læg lige så mange omgange **diagonalt i den anden retning**, hvis rafterne skal sikres mod bevægelse begge veje.', 'Læg **strammetørn** mellem rafterne, og **afslut med et dobbelt halvstik**.'],
    kontrolTjek: ['Rafterne ligger tæt sammen, og krydset kan ikke forskydes.', 'Omgangene i begge retninger er stramme.'],
    begr: ['bærende konstruktioner til personer uden erfaring.', 'rådne eller for tynde grene.'],
    loes: 'Løsn halvstikket, vikl omgangene af, og løsn tømmerstikket.',
    fejl: ['Omgange i kun én retning, når der er træk begge veje.', 'Tømmerstikket strammes ikke, så rafterne glider fra hinanden.'],
  }),
  knot({
    id: 'knob-trefod', titel: 'Ottetalsbesnøring – trefod af tre rafter', dds: false, kilder: ['spejder-besnoering'], niveau: 'mi',
    resume: 'Binder tre rafter sammen, så de kan rejses som en trefod – fx til at hænge en gryde eller som stativ.',
    tags: ['trefod', 'ottetalsbesnøring', 'tripod', 'besnøring', 'gryde', 'stativ'],
    kontrol: K28.delvist('Fremgangsmåde fra dansk lokalt spejdermateriale (9530 spejder); ikke kontrolleret mod en anden kilde.'),
    brug: 'At lave en **trefod** af tre rafter, fx som stativ over et bål til en gryde (på lovlig bålplads – [[baal-regler]]) eller som rejsning til et lille læ.',
    trin: ['**Læg de tre rafter parallelt** – de to yderste vender den ene vej, den midterste den anden vej.', 'Slå et **tømmerstik** om en af de yderste rafter.', 'Sur **i ottetaller** ind og ud mellem rafterne fra midten mod hver side – ikke for stramt, så rafterne kan spredes bagefter.', 'Læg **strammetørn vinkelret** mellem rafterne.', 'Slut af med et **råbåndsknob** over den midterste rafte, og **rejs trefoden** ved at sprede benene.'],
    kontrolTjek: ['Trefoden står stabilt med benene spredt i en ligesidet trekant.', 'Besnøringen glider ikke ned, når der hænges vægt i den.'],
    begr: ['tung last eller noget, der kan vælte over folk.', 'brug over bål uden opsyn eller på steder, hvor bål ikke er tilladt.'],
    loes: 'Saml benene, løsn råbåndsknobet og strammetørnene, og vikl ottetallene af.',
    fejl: ['For stram besnøring, så benene ikke kan spredes.', 'For løs besnøring, så toppen glider.'],
  }),

];
