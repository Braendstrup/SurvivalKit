import { K } from './_lib.mjs';

export const lists = [
  { id: 'hjemmeberedskab', titel: 'Hjemmeberedskab – 3 døgn', intro: 'Efter Beredskabsstyrelsen/Samsik: klar til at klare dig selv i tre døgn.', kilder: ['brs-forberedt'], kontrol: K.ok('Alle punkter følger Samsik "Forberedt på kriser".'),
    grupper: [
      { titel: 'Vand', punkter: ['3 liter drikkevand pr. person pr. døgn = 9 liter pr. person til 3 døgn', 'Vand til husdyr', 'Rene, lukkede, fødevaregodkendte beholdere; opbevar køligt og mørkt; skift løbende'] },
      { titel: 'Mad', punkter: ['Mad til 3 døgn, der kan holde sig uden køleskab/fryser', 'Mad der ikke kræver ovn/komfur (fx konserves, knækbrød)', 'Dåseåbner', 'Mulighed for at koge vand uden strøm – grill/stormkøkken **udendørs**'] },
      { titel: 'Sundhed og hygiejne', punkter: ['Medicin til mindst 3 døgn', 'Førstehjælpskasse', 'Toiletpapir, hånddesinfektion, vådservietter, bind/tamponer', 'Solide affaldsposer (til nødtoilet)'] },
      { titel: 'Varme, lys og kommunikation', punkter: ['Tæpper, dyner, varmt tøj – hold varmen i ét rum', 'Lommelygte/pandelampe og batterier', 'Stearinlys kun på fast underlag langt fra brændbart', 'FM-radio (batteri/håndsving/sol)', 'Powerbank og kabel'] },
      { titel: 'Information', punkter: ['Kend 112 og vid at ringe først', 'Lyt til DR/TV 2 ved sirene eller krise', 'Aftal med familie/naboer, hvordan I kommunikerer'] },
    ] },
  { id: 'stroemafbrydelse', titel: 'Under strømafbrydelse', intro: 'Hurtig huskeliste.', kilder: ['brs-forberedt', 'fvst-hygiejne'], kontrol: K.ok('Følger Samsik/Beredskabsstyrelsen og Fødevarestyrelsen.'),
    grupper: [
      { titel: 'Første timer', punkter: ['Saml familien i ét rum og hold varmen', 'Lommelygte frem – ingen åben ild uden opsyn', 'Tænd FM-radioen', 'Hold køleskab og fryser lukket', 'Opladede telefoner på spar; send SMS'] },
      { titel: 'Dagene efter', punkter: ['Spis letfordærveligt først', 'Brug udendørs grill/stormkøkken til varm mad – aldrig indendørs', 'Drik/brug nødvandet: 3 L pr. person pr. døgn', 'Brug affaldspose til toilet ved vandmangel', 'Hjælp ældre og naboer', 'Ring 112 ved nød'] },
    ] },
  { id: 'rygsaek-dagstur', titel: 'Rygsæk – dagstur i dansk natur', intro: 'Almen praksis ({T}); tilpas til årstid og tur.', kontrol: K.ikke('Almen friluftspraksis ({T}); ikke kontrolleret mod kilde.'),
    grupper: [
      { titel: 'Tøj', punkter: ['Basislag (uld/syntetisk)', 'Mellemlag (fleece/uld)', 'Vind- og regnskal', 'Hue og handsker', 'Tørre ekstra strømper og tørt skiftesæt i vandtæt pose'] },
      { titel: 'Navigation og kommunikation', punkter: ['Telefon opladet + powerbank', 'Offlinekort hentet', 'Papirkort og kompas', 'Fløjte', 'Pandelampe + batterier'] },
      { titel: 'Mad og vand', punkter: ['Drikkevand', 'Energirig mad (nødder, chokolade, havregryn)', 'Termokande med varm drik'] },
      { titel: 'Sikkerhed', punkter: ['Førstehjælpskasse', 'Redningstæppe / affaldssæk', 'Tarp og snor', 'Tændstikker i vandtæt pose (hvis ild er lovlig)', 'Flåttang'] },
    ] },
  { id: 'foerstehjaelpskasse', titel: 'Førstehjælpskasse', intro: 'Efter Sundhed.dk/Samsik: plastre, forbindinger, sårrens.', kilder: ['brs-forberedt', 'sdk-saar'], kontrol: K.delvist('Hovedpunkter fra Samsik og Sundhed.dk; kassens fulde indhold er ikke en autoriseret liste.'),
    grupper: [
      { titel: 'Sår og blødning', punkter: ['Plastre i flere størrelser', 'Kompresser og elastikbind/gazebind', 'Tape', 'Sårrens/rent vand og mild sæbe; klorhexidin', 'Pincet (rengjort med sprit)'] },
      { titel: 'Andet', punkter: ['Handsker', 'Redningstæppe', 'Flåttang', 'Saks', 'Personlig medicin (mindst 3 døgn)', 'Evt. adrenalinpen (hvis ordineret)'] },
    ] },
  { id: 'foer-turen', titel: 'Før turen', intro: 'Planlægning der forebygger nødsituationer.', kilder: ['brs-afbraending', 'ns-teltning'], kontrol: K.delvist('Punkter om forbud og overnatningsregler er kontrolleret; resten er almen praksis ({T}).'),
    grupper: [
      { titel: 'Planlægning', punkter: ['Tjek vejret (DMI) og lys', 'Tjek afbrændingsforbud (Beredskabsstyrelsens oversigt) hvis du vil bruge ild', 'Tjek regler for overnatning, adgang og private arealer', 'Fortæl nogen rute og forventet tilbagekomst', 'Planlæg alternative udgange og afbrydelsestid'] },
      { titel: 'Telefon og udstyr', punkter: ['Hent kortpakken', 'Oplad telefon og powerbank', 'Gem nødkontakter', 'Kontrollér udstyr og tøj'] },
    ] },
  { id: 'faret-vild-huskeliste', titel: 'Jeg er faret vild – huskeliste', kilder: ['brs-112'], kontrol: K.delvist('112-trin fra Beredskabsstyrelsen; resten er almen praksis ({T}).',),
    grupper: [
      { titel: 'Gør nu', punkter: ['Stop. Sæt dig. Tag vejret.', 'Hvad ved jeg? Sidste kendte sted, retning, tid', 'Åbn offlinekortet og tryk positionsknappen', 'Er jeg kold, skadet eller bange for mørket? Ring 112', 'Bliv, medmindre stedet er farligt eller du kender en kort sikker vej'] },
      { titel: 'Hold dig sikker og synlig', punkter: ['Hold varmen: ud af vind, isolér mod jorden', 'Lys/refleks, fløjte (6 pr. min {T})', 'Spar telefonens batteri (flytilstand)', 'Skriv status ned'] },
    ] },
  { id: 'flaat-efter-turen', titel: 'Efter turen: flåter', intro: 'Efter Sundhed.dk: tjek kroppen og hold øje i op til 30 dage.', kilder: ['sdk-flaat'], kontrol: K.ok('Følger Sundhed.dk: Flåtbid.'),
    grupper: [
      { titel: 'Tjek', punkter: ['Hårgrænse, bag ører, nakke', 'Armhuler, albuer, knæhaser', 'Lysken og navle', 'Børn: hoved og hårrødder', 'Husdyr: nakke'] },
      { titel: 'Hvis flåt', punkter: ['Fjern med flåttang/pincet, jævnt tryk, ikke vrid', 'Notér dato og sted', 'Hold øje med huden i op til 30 dage', 'Kontakt læge ved rødt voksende udslæt >5 cm eller feber'] },
    ] },
];
