# Scenarier – design

Dato: 2026-10-28 · Status: godkendt i chat

## Mål
Trin-for-trin-hjælp til konkrete hændelser, fx "strømmen går → tjek HPFI, åbn ikke køleskabet …". Scenarierne er opdelt i faser, og afgørende spørgsmål ændrer de næste trin. Alt skal være kildebelagt som resten af appen.

## Scenarier (første udgave)

| id | Titel | 112-knap |
|---|---|---|
| `scn-stroem` | Strømmen går | nej |
| `scn-vand` | Vandet forsvinder / kogeanbefaling | nej |
| `scn-storm` | Storm, skybrud og vand i kælderen | ja |
| `scn-sirene` | Sirene og varsling – gå inden for | ja |
| `scn-faret-vild` | Faret vild på tur | ja |
| `scn-varme` | Varmen svigter om vinteren | ja |
| `scn-brand` | Røg eller brand i nærheden (lyng- og skovbrand) | ja |
| `scn-hede` | Hedebølge | ja |

## Placering
- **Nød-siden:** to grupper, "Akut" (de 8 situationer) og "Kriser og hændelser" (scenarierne).
- **Forsiden:** nødkortet hedder "Nødsituation eller krise?".
- **Søgning og AI-opslag:** scenarierne er med (type `s`).
- **Temaet *Regler & beredskab*:** liste over scenarierne.
- **Route:** `#/scenarie/:id`.

## Datamodel (`content/95_scenarier.mjs`, eksport `scenarier`)

```js
{ id, titel, resume, ikon, ring112, tags, kilder: [kildeId], kontrol,
  faser: [{ titel, trin: [
    { x: 'mini-markup', ev: 'D'|'T'|'F', link?: 'guide-/liste-id', alarm?: true, hvis?: { spm: 'id', svar: ['id'] } },
    { spm: 'id', tekst: 'Spørgsmål?', svar: [{ id, tekst }], hvis?: … }
  ] }] }
```

**Build-validering:**
- kilder og links findes;
- `hvis` peger på et spørgsmål, der står tidligere i scenariet, og på eksisterende svar-id'er;
- hver fase har mindst ét trin;
- hvert trin har et `ev`-mærke.

## Visning (`app/js/views/scenarie.js`)
- **Toppen:** titel, resumé, statusmærke og "Start forfra".
- **Faser** som foldbare afsnit. Den første ufærdige fase er åben.
- **Trin:** afkrydsning med fed handling, forklaring, evidensmærke og evt. link. Alarmtrin vises som røde rækker med opkaldslink (112/114).
- **Spørgsmål:** svarknapper. Trin, der ikke passer til svaret, skjules, og svaret kan ændres.
- **Fremdrift:** afkrydsninger og svar gemmes lokalt (`kv: scn.<id>`).
- **112-knappen** vises i toplinjen, når `ring112` er sat.
- **Nederst:** kilder og evidens (som på guiderne) og "Se også".

## Test
- **Enhedstests:** synlighed af trin for givne svar, og at validering fanger brudte henvisninger.
- **E2E:**
  - alle scenarier åbner;
  - en forgrening ændrer de viste trin;
  - afkrydsning og svar overlever genindlæsning og offline genstart;
  - 112-reglen;
  - ingen vandret scroll;
  - scenarier findes via søgning.
