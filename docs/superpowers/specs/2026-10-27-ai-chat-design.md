# Offline AI-chat – design

Dato: 2026-10-27 · Status: godkendt i chat

## Mål

Man skal kunne stille spørgsmål til håndbogen i naturligt sprog og få et kort dansk svar, også uden net. Svaret bygger på håndbogens egne guides med link til kilden. Sikkerhed og verificerbarhed går forud for, hvor meget AI'en kan svare på.

**Succeskriterier**
1. Med en hentet model virker chatten i flytilstand.
2. Hvert svar viser de guides, det bygger på. Modellens egen viden vises tydeligt mærket "Ikke fra håndbogen – ikke verificeret".
3. Spørgsmål med nødord viser altid "Ring 112"-boksen, før modellen svarer, også hvis modellen fejler.
4. Inden for førstehjælp, nød, giftige arter og spiselighed vises intet svar uden håndbogskilde.
5. Appen og alle eksisterende tests er uændrede for brugere, der ikke henter en model. Der sker ingen eksterne kald, før brugeren selv vælger at hente en model.

## Uden for omfang

- Der gemmes ingen samtalehistorik. Samtalen forsvinder, når man forlader siden.
- Der er ingen fane til chatten i bundmenuen; den åbnes fra søgningen.
- Der er ingen "Spørg om denne guide"-knap i guiderne (kan tilføjes senere).
- Appen kan ikke bruge modeller i andre apps eller i styresystemet (en webapp har ikke adgang). Det eneste genbrug af en eksisterende model er browserens indbyggede AI (Chrome Prompt API).

## Modeller og runtime

| Model | Fil (Hugging Face, `litert-community`, Apache 2.0, ikke gated) | Størrelse | Anbefales når |
|---|---|---|---|
| Gemma 4 E4B | `gemma-4-E4B-it-litert-lm/gemma-4-E4B-it-web.task` | 2.964.324.352 B | WebGPU og `deviceMemory` ≥ 8 |
| Gemma 4 E2B | `gemma-4-E2B-it-litert-lm/gemma-4-E2B-it-web.task` | 2.003.697.664 B | WebGPU, øvrige tilfælde |
| Browserens indbyggede AI | `LanguageModel` (Prompt API) | – | `availability() === 'available'` (vælges automatisk) |

- **Runtime:** MediaPipe LLM Inference (`@mediapipe/tasks-genai`, fastlåst version), vendoret i `app/vendor/mediapipe/`.
- **Service worker:** runtime-filerne udelades af den statiske forhåndscache og caches først, når en model hentes.
- **CORS:** Hugging Face svarer med `access-control-allow-origin` for appens origin (verificeret 2026-10-27).

**Enhedstjek**
- Prompt API-tilgængelighed.
- `navigator.gpu.requestAdapter()`.
- `navigator.deviceMemory`.
- `navigator.storage.estimate()`: kræver mindst 1,3 × modelstørrelsen ledig.

Kan ingen model køre, siges det ærligt, og søgning virker stadig.

**Download**
- Filen hentes i bidder med HTTP range og skrives til OPFS, så en afbrudt download kan genoptages.
- Størrelse og SHA-256 kontrolleres mod appens fastlåste katalog.
- Modellen aktiveres atomisk. En fejlet eller afbrudt download efterlader en evt. tidligere model aktiv.
- Appen anmoder om vedvarende lager.

## Skærme og flow

- **Indgang:**
  - Forsidens søgefelt hedder "Søg eller spørg …".
  - På søgesiden vises en række "Spørg AI: '…'", når feltet ikke er tomt. Den fører til `#/spoerg?q=…`.
- **Chat (`#/spoerg`):**
  - Bobler med løbende output (streaming).
  - Under hvert svar "Bygger på:" med 1–4 guide-links, og en gul boks for egen viden.
  - Stop-knap og "Ny samtale".
  - Fast linje: "AI kan tage fejl. Ved livsfare: ring 112."
- **Opsætningskort** (ingen model): indbygget AI fundet, eller anbefalet model med alternativ, plads og wifi-anbefaling, eller en ærlig forklaring på, at enheden ikke kan. Download vises med fremdrift og kan afbrydes og genoptages.
- **Indstillinger → AI-assistent:** aktiv model og størrelse, skift model, slet model og status for indbygget AI.

## Håndbogsopslag og prompt

1. `search(spørgsmål)` på det eksisterende indeks giver op til 4 guides.
2. Fra hver guide tages titel, resumé og de afsnit, der indeholder søgeord, med Fremgangsmåde og Sikkerhed foran. Konteksten afkortes til et budget på ca. 6.000 tegn (≈ 2.000 tokens).
3. Systeminstruksen (dansk):
   - svar kort;
   - brug håndbogen først;
   - henvis med `[1]`…`[4]`;
   - marker egen viden med `[egen viden]`;
   - på følsomme emner: kun håndbogen, ellers svar `[ikke i håndbogen]`.

## Sikkerhedsregler (håndhæves af appen)

- **Nødord** (fx bevidstløs, vejrtrækning, blødning, hugormebid, forgiftning, brud, hypotermi, drukning, brand, kulilte): en rød 112-boks med opkaldsknap og nødguide-link vises, før modellen kaldes.
- **Følsomt emne:** mindst én fundet guide i kapitlerne `nod` eller `foerstehjaelp`, eller ordliste for spis/svamp/bær/giftig.
  - Uden fundne guides vises intet modelsvar, kun "Det står ikke i håndbogen …" med links.
  - Indeholder svaret `[egen viden]` eller `[ikke i håndbogen]`, erstattes det af samme besked.
- **Spiselighed:** svaret får altid tilføjet håndbogens regel ("Spis kun det, du kender 100 % …").
- **Kildeangivelser:** `[n]` bliver til links til guide n. Henvisninger til ikke-eksisterende numre fjernes.

## Kode

| Fil | Ansvar |
|---|---|
| `app/js/ai/engine.js` | `createEngine(kind)`: `load(onProgress)`, `generate(prompt, onToken, signal)`. Implementeringer: `mediapipe`, `builtin`, `fake` (kun test, aktiveres via `window.__skFakeAI`) |
| `app/js/ai/models.js` | Katalog, enhedstjek, OPFS-download/genoptag/verificér/slet, aktiv model i kv |
| `app/js/ai/rag.js` | `retrieve(q)`, `buildPrompt(q, guides, sensitive)` |
| `app/js/ai/safety.js` | `emergency(q)`, `isSensitive(q, guides)`, `postprocess(text, guides, sensitive)` |
| `app/js/views/chat.js` | Chatside og opsætningskort |
| `app/js/views/settings.js` | Gruppen "AI-assistent" |

## Test

| Type | Indhold |
|---|---|
| Enhedstests (`tests/unit_ai.mjs`) | Nødord, følsomhed, efterbehandling, kildelinks, promptbudget |
| E2E med falsk model (A01–A06) | Indgang fra søgning, streaming, kildelinks, nødboks før svar, afvisning på følsomt emne uden kilde, stop-knap, opsætningskort uden WebGPU, ingen eksterne kald uden brugerhandling |
| Afprøvning med rigtig model | E2B i headless Chromium. Resultatet, også hvis det ikke kan lade sig gøre i miljøet, skrives i `docs/TESTRESULTATER.md` |
| Eksisterende 40 tests | Skal bestå uændret |

## Risici

- **Modellen gengiver håndbogen forkert.** Imødegås af, at linket til originalen altid vises, af korte svar og af afvisning på følsomme emner uden kilde. Kan ikke elimineres og står i `BEGRAENSNINGER.md`.
- **Hukommelse på telefoner.** E4B kræver ca. 3,3 GB GPU-hukommelse. Hvis modellen ikke kan indlæses, vises fejlen med forslag om E2B.
- **Udviklingen i MediaPipe.** Versionen fastlåses, og afprøvningen dokumenterer den version, der virker.
