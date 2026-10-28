// Scenarier: trin-for-trin-hjælp til konkrete hændelser – faser, afkrydsning og enkelte forgreninger.
// Hvert trin: { x: mini-markup, ev: 'D'|'T'|'F', link?, alarm?, hvis? }. Spørgsmål: { spm, tekst, svar: [{ id, tekst }] }.
// ev: D = understøttet af navngiven kilde (se scenariets kilder), T = tommelfingerregel, F = kræver faglig vurdering.
// Kilderne er hentet og læst 2026-10-28 (se content/00_meta.mjs).
const DATO = '2026-10-28';
const ok = (note) => ({ status: 'kontrolleret', dato: DATO, note });
const delvist = (note) => ({ status: 'delvist', dato: DATO, note });
const T = (x, o = {}) => ({ x, ev: 'T', ...o });
const D = (x, o = {}) => ({ x, ev: 'D', ...o });
const F = (x, o = {}) => ({ x, ev: 'F', ...o });
const Q = (spm, tekst, ...svar) => ({ spm, tekst, svar: svar.map(([id, t]) => ({ id, tekst: t })) });
const hvis = (spm, ...svar) => ({ hvis: { spm, svar } });

export const scenarier = [
  {
    id: 'scn-stroem', titel: 'Strømmen går', ikon: 'flame', ring112: false,
    resume: 'Find ud af, om fejlen er i dit hus eller udefra – og hold maden kold, telefonen ladet og varmen inde.',
    tags: ['strøm', 'strømafbrydelse', 'strømsvigt', 'HPFI', 'HFI', 'relæ', 'eltavle', 'sikring', 'køleskab', 'fryser', 'blackout'],
    kilder: ['bolius-stroem', 'fvst-stroem', 'bolius-stroemsvigt', 'brs-forberedt'],
    kontrol: ok('HPFI-fremgangsmåden er fra Bolius; madråd fra Fødevarestyrelsen (køleskab maks. 5 °C); beredskabsråd fra Samsik/Beredskabsstyrelsen. Bolius er ikke en myndighed.'),
    faser: [
      { titel: 'Med det samme', trin: [
        D('**Tjek eltavlen.** Er HPFI-relæet eller en gruppe slået fra (vippen nede), er fejlen sandsynligvis i dit eget hus. Står alt oppe, er fejlen typisk udefra.'),
        D('**Se ud ad vinduet.** Er gadelyset slukket, eller har naboerne heller ikke strøm?'),
        Q('omfang', 'Hvor er strømmen væk?', ['hus', 'Kun hos mig (HPFI eller gruppe slået fra)'], ['omraade', 'Hele området / naboerne også']),
        D('**Slå alle grupper fra, og slå HPFI-relæet til igen.** Slå derefter grupperne til **én ad gangen**. Den gruppe, der får relæet til at slå fra igen, har fejlen.', hvis('omfang', 'hus')),
        D('**Find apparatet:** lad den fejlramte gruppe være slået til, og tænd/tilslut apparaterne på den én ad gangen. Tag stikket ud af det apparat, der udløser relæet.', hvis('omfang', 'hus')),
        F('**Slår relæet fra igen uden noget tilsluttet,** eller kan det ikke slås til: ring til en autoriseret elinstallatør. Omgå aldrig relæet – det beskytter mod dødeligt stød.', { ...hvis('omfang', 'hus'), alarm: false }),
        D('**Find information:** batteriradio (DR P4) eller elselskabets hjemmeside. Mobilnettet kan være overbelastet – brug SMS frem for opkald.', hvis('omfang', 'omraade')),
        D('**Er strømmen stadig væk efter et kvarter,** kan du ringe til elselskabet og spørge, hvor længe det forventes at vare.', hvis('omfang', 'omraade')),
        D('**Åbn ikke køleskab og fryser.** Lukket holder de kulden længst. Et par timer skader sandsynligvis ikke maden.', { link: 'beredskab-stroemafbrydelse' }),
      ] },
      { titel: 'Hvis det trækker ud (flere timer)', trin: [
        D('**Lys:** lommelygte eller pandelampe. Stearinlys kun på fast underlag langt fra gardiner og tæpper – og aldrig uden opsyn.'),
        D('**Spar telefonen:** lav skærmlysstyrke, SMS frem for opkald, powerbank. Ved længere afbrydelser kan mobilnet og internet også falde ud.'),
        D('**Varme:** saml jer i **ét rum**, brug tæpper, dyner og varmt tøj.', { link: 'scn-varme' }),
        D('**Mad:** spis det, der ikke kræver køl, og brug letfordærveligt først. Lav kun mad **udendørs** på grill eller stormkøkken – aldrig indendørs (kulilte).', { link: 'baal-kulilte' }),
        D('**Vand:** spar på vandet og toiletskyl – vandværker og spildevandsanlæg kan også være ramt.', { link: 'scn-vand' }),
        D('**Vinterkulde:** nye kølevarer kan stå udenfor i en tæt beholder (ikke direkte på jorden). Maden skal under 10 °C inden for højst 4 timer.'),
        T('**Tjek på dem, der har brug for det:** ældre naboer, nogen med strømdrevet medicinsk udstyr eller kæledyr.'),
        D('**Ring 112** kun ved akut nød – så linjen er fri til livsvigtige opkald.', { alarm: true }),
      ] },
      { titel: 'Når strømmen kommer igen', trin: [
        D('**Mål temperaturen i køleskabet.** Den skal være højst 5 °C. Fersk fisk og hakket kød er mest følsomme; yoghurt og ost tåler mere. Brug sanserne – kassér ved tvivl.'),
        D('**Fryser:** har temperaturen været over 0 °C, skal varerne tilberedes og spises – ikke fryses igen.'),
        T('**Tjek, at komfur, kogeplader og strygejern er slukket,** før/når strømmen vender tilbage.'),
        D('**Rengør** køleskab og fryser, hvis de har stået åbne.'),
      ] },
    ],
  },
  {
    id: 'scn-vand', titel: 'Vandet forsvinder eller der er kogeanbefaling', ikon: 'drop', ring112: false,
    resume: 'Hold styr på tre slags vand – til at drikke, til at koge og til toilet – og følg vandværkets meldinger.',
    tags: ['vand', 'vandafbrydelse', 'kogeanbefaling', 'drikkevand', 'vandværk', 'forurening', 'toilet'],
    kilder: ['brs-forberedt', 'bolius-vand', 'mst-kog'],
    kontrol: ok('Mængder (3 L pr. person pr. døgn) fra Samsik/Beredskabsstyrelsen; kogning fra Miljøstyrelsens kogevejledning; praktiske råd fra Bolius (ikke en myndighed).'),
    faser: [
      { titel: 'Med det samme', trin: [
        Q('type', 'Hvad er situationen?', ['vaek', 'Der kommer intet vand (afbrudt)'], ['koge', 'Vandværket/kommunen har udsendt kogeanbefaling']),
        D('**Følg vandværkets og kommunens meldinger** (hjemmeside, SMS-service, DR/TV 2). De oplyser, hvor længe det varer, og om der er vandudlevering.'),
        D('**Brug kun kogt eller flaskevand** til at drikke, børste tænder, skylle salat og lave mad. Kog til kraftig "spilkogning" i mindst 1 minut – følg vandværkets anvisning, hvis den er strengere.', { ...hvis('type', 'koge'), link: 'vand-kogning' }),
        D('**Elkedel:** giv vandet 2 opkog med et par minutters mellemrum.', hvis('type', 'koge')),
        D('**Tap det, der er tilbage,** fra hanerne på rene flasker og beholdere til drikke og madlavning.', hvis('type', 'vaek')),
        D('**Sluk for varmtvandsbeholderen,** så den ikke varmer uden vand. Vandet i den kan bruges til toilet og gulvvask – ikke til at drikke.', hvis('type', 'vaek')),
      ] },
      { titel: 'Mens det står på', trin: [
        D('**Regn med 3 liter drikkevand pr. person pr. døgn** – og husk husdyrene.', { link: 'vand-nodforsyning' }),
        D('**Hold tre slags vand adskilt:** drikkevand (hane-/flaskevand), kogevand (fx opsamlet regnvand, der koges) og vand til toilet og gulv.'),
        D('**Toilet uden vand:** stærk affaldspose i toilet eller spand, luk den og smid den ud som restaffald. Vask hænder.', { link: 'vand-nodforsyning' }),
        D('**Hent vand ved udleveringssteder** – tag selv rene dunke med.', hvis('type', 'vaek', 'koge')),
        T('**Spar på hygiejnevandet:** vask dig ved håndvasken med en klud; brug hånddesinfektion, hvor det giver mening.'),
        D('**Hæld ikke vand i kloakken ved strømsvigt** – det belaster spildevandsanlæggene.'),
        F('**Opkast, diarré eller feber** efter at have drukket vandet: kontakt lægevagten. Ved livstruende symptomer: ring 112.', { alarm: true, link: 'dansk-numre' }),
      ] },
      { titel: 'Når vandet er sikkert igen', trin: [
        D('**Vent på, at vandværket ophæver kogeanbefalingen** – enkelte rene prøver er ikke nok.', hvis('type', 'koge')),
        D('**Tjek, at alle haner er lukkede,** så intet løber over, når vandet kommer igen.', hvis('type', 'vaek')),
        D('**Lad brunt (rustent) vand løbe,** til det er klart. Det er ikke sundhedsskadeligt. Tænd derefter varmtvandsbeholderen igen.', hvis('type', 'vaek')),
        T('**Skyl** filtre, isterningbakker og beholdere, der har haft forurenet vand, og fyld op med rent vand.', hvis('type', 'koge')),
      ] },
    ],
  },
  {
    id: 'scn-storm', titel: 'Storm, skybrud og vand i kælderen', ikon: 'cloud', ring112: true,
    resume: 'Sikr løse genstande og afløb før, bliv inde og hold dig fra vandmasserne under – og afbryd strømmen, før du går i vandet efter.',
    tags: ['storm', 'orkan', 'skybrud', 'ekstremregn', 'stormflod', 'oversvømmelse', 'kælder', 'sandsække', 'forsikring'],
    kilder: ['brs-storm', 'brs-skybrud', 'brs-stormflod', 'bolius-skybrud'],
    kontrol: delvist('Før- og under-rådene er fra Beredskabsstyrelsen; oprydning og el efter oversvømmelse er fra Bolius (ikke en myndighed). Beredskabsstyrelsen giver ingen konkrete råd om el.'),
    faser: [
      { titel: 'Før – når DMI varsler', trin: [
        Q('type', 'Hvad er varslet?', ['storm', 'Storm eller orkan'], ['regn', 'Skybrud / ekstremregn'], ['hav', 'Stormflod / højvande']),
        D('**Fastgør eller fjern løse genstande:** havemøbler, trampolin, affaldsspande, løse tagsten.', hvis('type', 'storm')),
        D('**Rens afløb, riste og tagrender,** så vandet kan komme væk.', hvis('type', 'regn')),
        D('**Hav kraftig plast og sandsække klar** til gulvafløb, toilet, døre og skakter – og find ud af, hvor du kan få sandsække.', hvis('type', 'regn', 'hav')),
        D('**Oplad telefon og powerbank,** og læg lommelygte klar, hvis strømmen går.', { link: 'scn-stroem' }),
        T('**Flyt værdier og papirer op fra kælderen** og ting, der ikke tåler vand.', hvis('type', 'regn', 'hav')),
        D('**Tænk på særlige behov:** medicin på lager, ældre familie du skal kunne kontakte, kæledyr.'),
      ] },
      { titel: 'Under', trin: [
        D('**Bliv indendørs.** Går du ud, så pas på tagsten, grene og løsrevne genstande. Udsæt færdsel, hvis myndighederne fraråder den.', hvis('type', 'storm')),
        D('**Luk vinduer og døre,** og dæk åbninger udadtil med sandsække eller plast.', hvis('type', 'regn', 'hav')),
        D('**Kør ikke i vandmasserne.** Bliver du fanget i bil, så hold ind til siden.', hvis('type', 'regn')),
        D('**Undgå kontakt med kloakvand** – opstigende vand kan være sundhedsskadeligt, og dæksler kan være løftet.', hvis('type', 'regn', 'hav')),
        D('**Følg DR, TV 2 og myndighedernes kanaler.** Del kun bekræftede oplysninger.'),
        D('**Hører du sirenen:** gå inden for og lyt til DR eller TV 2.', { link: 'scn-sirene' }),
        D('**Ring 112 kun ved akut nød** (fx personer i fare, brand, sammenstyrtning).', { alarm: true }),
      ] },
      { titel: 'Efter – vand i kælder eller bolig', trin: [
        Q('vand', 'Er der vand i boligen?', ['ja', 'Ja'], ['nej', 'Nej']),
        D('**Afbryd strømmen,** hvis vandet kan nå stikkontakter, eltavle eller apparater – før du går ud i vandet. Kan du ikke nå tavlen sikkert, så hold dig væk og ring efter hjælp.', { ...hvis('vand', 'ja'), alarm: true }),
        D('**Gummistøvler og -handsker.** Vandet er ofte blandet med spildevand; vask vådt tøj ved høj temperatur med det samme.', hvis('vand', 'ja')),
        D('**Red det vigtigste** (fotos, papirer, værdier) og **få vandet væk** – vandsuger ved lidt vand, dykpumpe ved mere.', hvis('vand', 'ja')),
        D('**Fotografér skaderne og anmeld til forsikringen,** før du laver aftaler om reparation. Smid ikke skadet indbo ud, før taksatoren har set det, og gem kvitteringer.', hvis('vand', 'ja')),
        D('**Udtør grundigt** med gennemtræk og gerne affugter (luk vinduerne, mens den kører).', hvis('vand', 'ja')),
        F('**Lad en autoriseret elinstallatør tjekke installationen,** før du tænder for strøm i rum, der har stået under vand.', hvis('vand', 'ja')),
        T('**Gå boligen igennem for skader:** tag, tagrender, vinduer, kælder og loft – og hold øje med fugt de næste dage.', hvis('vand', 'nej')),
        D('**Er der skader:** fotografér dem, og anmeld til forsikringen, før du laver aftaler om reparation.', hvis('vand', 'nej')),
        T('**Gå ikke tæt på væltede træer og nedfaldne ledninger** – hold afstand og meld det til netselskab eller 112, hvis det er farligt.', hvis('type', 'storm')),
      ] },
    ],
  },
  {
    id: 'scn-sirene', titel: 'Sirenen lyder – varsling', ikon: 'alert', ring112: true,
    resume: 'Gå inden døre, og lyt til DR eller TV 2 – de fortæller, hvad der sker, og hvad du skal gøre.',
    tags: ['sirene', 'varsling', 'S!RENEN', 'beredskabsmeddelelse', 'gå ind', 'DR', 'TV 2', 'tekst-tv 150'],
    kilder: ['brs-sirene', 'brs-forberedt', 'politi-brand'],
    kontrol: ok('Fra Beredskabsstyrelsens faktaark om sirenevarsling (2021) og Samsik. "Luk døre og vinduer, sluk ventilationen" gælder ved farlig røg (politiet) – og ellers kun, hvis beredskabsmeddelelsen siger det.'),
    faser: [
      { titel: 'Med det samme', trin: [
        D('**Gå inden døre.** Faresignalet stiger hurtigt og falder langsomt – fire gange på i alt 45 sekunder.'),
        D('**Lyt til DR eller TV 2** (radio, tv, deres apps). Informationen står også på **tekst-tv side 150**. Har du ingen strøm: FM-radio med batteri – mange har én i bilen.'),
        D('**Sørg for, at dem omkring dig har forstået signalet** – også børn, ældre og naboer, der ikke hører godt.'),
        T('**Ring ikke 112 for at spørge, hvad der sker** – linjen skal være fri til livsvigtige opkald.', { alarm: true }),
      ] },
      { titel: 'Følg beredskabsmeddelelsen', trin: [
        Q('besked', 'Hvad siger meddelelsen på DR/TV 2?', ['roeg', 'Farlig røg eller gas i området'], ['andet', 'Noget andet (fx evakuering, vejr, forsyning)'], ['ukendt', 'Jeg kan ikke finde information']),
        D('**Luk døre og vinduer, og sluk ventilationen** (emhætte, ventilationsanlæg). Bliv inde, til faren er forbi.', hvis('besked', 'roeg')),
        D('**Får du symptomer** (irritation i næse og hals, hoste, åndenød, hovedpine, svimmelhed): gå væk fra røgen og kontakt lægevagten. Ved bevidstløshed, kramper eller åndedrætsstop: **ring 112**.', { ...hvis('besked', 'roeg'), alarm: true }),
        D('**Følg anvisningerne præcist** – fx at blive inde, at evakuere eller at undgå bestemte områder.', hvis('besked', 'andet')),
        D('**Kemisk udslip eller nuklear hændelse:** bliv inde med lukkede døre og vinduer – og tag kun jodtabletter, hvis Sundhedsstyrelsen siger det.', { ...hvis('besked', 'andet'), link: 'beredskab-udslip' }),
        D('**Bliv inde og prøv igen:** FM-radio (DR), tekst-tv side 150, politiets og myndighedernes sociale medier og hjemmesider.', hvis('besked', 'ukendt')),
        D('**Vær kildekritisk:** del kun bekræftede oplysninger fra myndighederne.'),
      ] },
      { titel: 'Når faren er forbi', trin: [
        D('**Signalet "faren er forbi" er én lang, ensartet tone i 45 sekunder.** Derefter må du gå udendørs igen.'),
        D('**Luft ud,** hvis du har lukket ventilationen (ved røg).', hvis('besked', 'roeg')),
        D('**Godt at vide:** sirenerne testes første onsdag i maj kl. 12. Døve og hørehæmmede kan tilmelde sig SMS-varsling hos Beredskabsstyrelsen.', { link: 'beredskab-sirener' }),
      ] },
    ],
  },
  {
    id: 'scn-faret-vild', titel: 'Faret vild på tur', ikon: 'compass', ring112: true,
    resume: 'Stop, find ud af hvad du ved, brug offlinekortet – og ring 112 hellere for tidligt end for sent.',
    tags: ['faret vild', 'vild', 'orientering', 'tur', 'skov', 'mørke', 'STOP', 'bliv eller gå'],
    kilder: ['brs-112'],
    kontrol: delvist('Bygger på appens nødguides. 112-rådene er fra Beredskabsstyrelsen; de praktiske trin er tommelfingerregler.'),
    faser: [
      { titel: 'Stop – med det samme', trin: [
        T('**Stop.** Sæt dig, drik og spis lidt, og tænk i 2–3 minutter. At gå videre i panik gør det værre.', { link: 'nod-faret-vild' }),
        T('**Hvor var du sidst sikker på din position?** Hvilken retning og hvor længe har du gået siden?'),
        T('**Åbn offlinekortet og tryk på positionsknappen.** GPS virker uden dækning, når kortet er hentet. Notér koordinaterne.', { link: 'nav-find-vej-kort' }),
        Q('position', 'Ved du nu, hvor du er?', ['ja', 'Ja – jeg kan se det på kortet'], ['nej', 'Nej / jeg er i tvivl']),
        D('**Er nogen skadet, kold, bange – eller bliver det mørkt?** Ring 112 nu. Det er ikke "for meget" at ringe.', { alarm: true, link: 'nod-tilkald-hjaelp' }),
      ] },
      { titel: 'Kender du positionen', trin: [
        T('**Vælg en kort, sikker rute** mod vej, sti eller bebyggelse – ikke den korteste over ukendt terræn.', { ...hvis('position', 'ja'), link: 'nav-find-vej-kort' }),
        T('**Tjek hvert 10.–15. minut,** at terrænet stemmer med kortet. Vend om til sidste sikre punkt, hvis det ikke gør.', hvis('position', 'ja')),
        T('**Fortæl nogen** din plan og retning (SMS).', hvis('position', 'ja')),
      ] },
      { titel: 'Kender du ikke positionen', trin: [
        D('**Ring 112** og fortæl, hvad du ved: sidste kendte sted, retning, tid, tøj, antal personer og evt. koordinater.', { ...hvis('position', 'nej'), alarm: true }),
        T('**Bliv, hvor du er,** hvis stedet er nogenlunde sikkert – især i mørke, kulde, tåge, med børn eller når du har ringet 112.', { ...hvis('position', 'nej'), link: 'nod-blive-eller-gaa' }),
        T('**Gør dig synlig og hørbar:** lys, farvet tøj i lysningen, fløjte (tre signaler).', { ...hvis('position', 'nej'), link: 'nod-tilkald-hjaelp' }),
        T('**Hold varmen:** find læ (ikke under døde grene), isolér mod jorden, tag tøj på, før du fryser.', { ...hvis('position', 'nej'), link: 'ly-find' }),
        T('**Spar telefonens batteri:** skærm ned, luk apps, flytilstand mellem opkald/SMS (112 kan stadig ringes op).', hvis('position', 'nej')),
      ] },
    ],
  },
  {
    id: 'scn-varme', titel: 'Varmen svigter om vinteren', ikon: 'flame', ring112: true,
    resume: 'Saml jer i ét rum, stop træk, tag tøj og dyner på – og brug aldrig grill eller improviseret varme indendørs.',
    tags: ['varme', 'kulde', 'fjernvarme', 'gasfyr', 'varmesvigt', 'vinter', 'frost', 'kulilte', 'nedkøling'],
    kilder: ['brs-forberedt', 'bolius-varme', 'sdk-kulilte', 'sdk-hypotermi'],
    kontrol: ok('Ét rum, tæpper og varmekilder fra Samsik/Beredskabsstyrelsen; kulilte og nedkøling fra Sundhed.dk; praktiske råd fra Bolius (ikke en myndighed).'),
    faser: [
      { titel: 'Med det samme', trin: [
        T('**Er det kun dig?** Tjek fyr/fjernvarmeunit for fejlkode og om naboerne også er ramt; ring til varmeforsyningen eller VVS-service.'),
        D('**Udnyt den varme, der er:** hold døre og vinduer lukkede, og stop træk med tæpper eller håndklæder ved utætte døre og vinduer.'),
        D('**Gardiner:** lukkede om aftenen og i mørke timer, åbne når solen skinner.'),
      ] },
      { titel: 'Hold varmen', trin: [
        D('**Saml jer i ét rum** (gerne det mindste og mest solbeskinnede), og luk de andre af.'),
        D('**Tæpper, dyner og varmt tøj** – flere lag, hue og sokker, også om natten.'),
        D('**Luft stadig kort ud** et par gange om dagen, så luften ikke bliver dårlig (CO₂ og fugt).'),
        D('**Gas- og petroleumsovne** kun i velventilerede rum – aldrig i soveværelset om natten. **Aldrig grill, stormkøkken eller aggregat indendørs** (kulilte).', { alarm: true, link: 'baal-kulilte' }),
        D('**Stearinlys** kun på fast underlag langt fra brændbart – og aldrig uden opsyn.'),
        T('**Varm mad og drikke** hjælper; spis jævnligt.'),
        F('**Hold øje med de sårbare:** små børn og ældre køles hurtigere ned. Kuldegysninger, sløret tale, forvirring eller sløvhed: få personen varm og **ring 112**.', { alarm: true, link: 'fh-hypotermi' }),
        D('**Hovedpine, kvalme eller svimmelhed** hos flere på én gang, mens noget brænder: mistænk kulilte – sluk kilden, ud i frisk luft, ring 112 ved alvorlige symptomer.', { alarm: true, link: 'baal-kulilte' }),
        T('**Er det koldt i mange timer:** tag til familie, venner eller et kommunalt varmested, hvis det er muligt.'),
      ] },
      { titel: 'Når varmen kommer igen', trin: [
        D('**Luft alle rum godt ud** med gennemtræk.'),
        D('**Luft radiatorerne ud,** og motionér termostaterne.'),
        D('**Tjek rør for frostsprængninger,** og om fyret eller unitten taber vand.'),
        T('**Luft og varm de aflukkede rum op** for at undgå fugt og skimmel.'),
      ] },
    ],
  },
  {
    id: 'scn-brand', titel: 'Røg eller brand i nærheden', ikon: 'flame', ring112: true,
    resume: 'Ring 112, kom væk fra ilden og røgen – og er det røg fra en brand i området: gå inden for, luk vinduer og sluk ventilationen.',
    tags: ['brand', 'røg', 'naturbrand', 'lyngbrand', 'skovbrand', 'markbrand', 'brandrøg', 'ventilation'],
    kilder: ['politi-brand', 'brs-afbraending', 'ns-ild'],
    kontrol: ok('Fra politiets kriseinformation om brand (røg, symptomer, naturbrand) samt Beredskabsstyrelsens og Naturstyrelsens regler om ild.'),
    faser: [
      { titel: 'Med det samme', trin: [
        Q('hvor', 'Hvor er du?', ['ude', 'Ude i naturen – jeg ser ild eller røg'], ['hjemme', 'Hjemme/indendørs – der er røg fra en brand i området']),
        D('**Ring 112,** hvis du opdager en brand. Sig hvad, hvor (koordinater fra kortet) og hvem.', { ...hvis('hvor', 'ude'), alarm: true, link: 'nod-tilkald-hjaelp' }),
        D('**Red dig selv:** gå væk fra ilden, så du ikke bliver omringet – på tværs af vinden og mod veje, åbne marker eller vand.', hvis('hvor', 'ude')),
        T('**Slukningsforsøg** kun ved en helt lille brand, hvis du har vand og en sikker vej væk. Ellers: væk og 112.', hvis('hvor', 'ude')),
        D('**Gå inden døre, luk døre og vinduer, og sluk ventilationen** (emhætte og ventilationsanlæg).', hvis('hvor', 'hjemme')),
        D('**Følg DR/TV 2** – politiet kan varsle med sirener og beredskabsmeddelelser ved farlig røg.', { ...hvis('hvor', 'hjemme'), link: 'scn-sirene' }),
      ] },
      { titel: 'Røg og symptomer', trin: [
        D('**Al brandrøg er giftig i store mængder** – og farligheden kan ikke ses på røgen. Hold dig ude af den.'),
        D('**Symptomer:** irritation i næse, mund og svælg, hoste, åndenød, hovedpine, svimmelhed, kvalme, hjertebanken. Gå væk fra røgen og kontakt lægevagten.', { link: 'dansk-numre' }),
        D('**Bevidstløshed, kramper eller åndedrætsstop: ring 112** og start hjertelungeredning, hvis personen ikke trækker vejret normalt.', { alarm: true, link: 'fh-hlr' }),
        D('**Astmatikere og folk med åndedrætssygdomme** er særligt udsatte – hav medicinen ved hånden. Nogle stoffer giver først symptomer senere.'),
      ] },
      { titel: 'Undgå at starte en brand', trin: [
        D('**Tjek brandfare og afbrændingsforbud** (brandfare.dk) før bål, grill og ukrudtsbrænder – og respektér dem.', { link: 'baal-regler' }),
        D('**Bål og grill kun på anviste steder,** med vand ved hånden – og forlad dem aldrig, før de er helt slukket med vand.'),
        D('**Kør og parkér ikke** i højt, tørt græs – udstødningen kan antænde det. Smid ikke cigaretter, glas eller flasker i naturen.'),
      ] },
    ],
  },
  {
    id: 'scn-hede', titel: 'Hedebølge', ikon: 'cloud', ring112: true,
    resume: 'Drik før du er tørstig, hold dig i skygge midt på dagen, hold boligen kølig – og hold øje med de sårbare.',
    tags: ['hedebølge', 'varme', 'hedeslag', 'dehydrering', 'sol', 'ældre', 'børn'],
    kilder: ['sdk-hedeslag', 'sdk-dehydrering', 'brs-forberedt'],
    kontrol: delvist('Hedeslag og væske fra Sundhed.dk. Sundhedsstyrelsens egne sider om varmt vejr kunne ikke hentes ved kontrollen (blokeret for automatisk adgang); råd om indeklima er derfor tommelfingerregler.'),
    faser: [
      { titel: 'Når hedebølgen er varslet', trin: [
        T('**Hav drikkevand og gerne lidt saltholdigt** (snacks, bouillon) klar.'),
        T('**Planlæg aktiviteter** til morgen og aften – ikke midt på dagen.'),
        T('**Opbevar medicin** efter indlægssedlen – nogle typer tåler ikke høj varme.'),
        T('**Aftal at tjekke på** ældre familie, naboer og andre sårbare hver dag.'),
      ] },
      { titel: 'I varmen', trin: [
        D('**Drik jævnligt i små slurke** – også uden tørst. Ved meget sved: væske med salte.', { link: 'fh-dehydrering' }),
        T('**Hold dig i skygge,** især midt på dagen; let, lyst og løst tøj og hat.'),
        T('**Hold boligen kølig:** træk gardiner/persienner for på solsiden om dagen, luft ud om natten og tidlig morgen.'),
        T('**Efterlad aldrig børn eller dyr i en parkeret bil.**', { alarm: true }),
        D('**Hold øje med de sårbare:** ældre, små børn, kronisk syge, overvægtige og folk, der arbejder fysisk hårdt.'),
        D('**Varsler om overophedning:** svimmelhed, hovedpine, sløvhed, kvalme. Ud af varmen, afkøl med våde klude og vifte, giv væske.', { link: 'fh-varme' }),
        D('**Forvirring, bevidstløshed eller ophørt svedtendens: ring 112** – det kan være hedeslag. Afkøl personen, mens du venter.', { alarm: true, link: 'fh-varme' }),
      ] },
      { titel: 'Når det køler af', trin: [
        T('**Fortsæt med at drikke** – væsketabet indhentes ikke på én dag.'),
        T('**Tjek på dem, der har været syge** af varmen – symptomer kan komme igen næste dag.'),
      ] },
    ],
  },
];
