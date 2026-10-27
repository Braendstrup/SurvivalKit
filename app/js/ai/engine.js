// Sprogmodel-motorer med fælles grænseflade:
//   load(onProgress)                              – indlæs modellen (kan tage tid)
//   generate({ system, user, text }, onToken, signal) → Promise<string>
// Implementeringer: 'mediapipe' (Gemma i OPFS via WebGPU), 'builtin' (browserens Prompt API), 'fake' (kun tests).
import { openModelFile, RUNTIME } from './models.js';

let cached = null; // indlæst motor genbruges, så længe siden er åben

export async function getEngine(kind, onProgress) {
  if (cached && cached.kind === kind) return cached;
  cached?.close?.();
  const e = kind === 'fake' ? fakeEngine() : kind === 'builtin' ? await builtinEngine() : await mediapipeEngine(onProgress);
  cached = e;
  return e;
}
export function releaseEngine() { cached?.close?.(); cached = null; }

async function mediapipeEngine(onProgress = () => {}) {
  onProgress('Indlæser AI-programmet …');
  const { FilesetResolver, LlmInference } = await import('../../' + RUNTIME.files[0]);
  // SIMD-udgaven bruges altid (alle browsere med WebGPU har WASM-SIMD); kun den er vendoret
  const fileset = { wasmLoaderPath: new URL('../../' + RUNTIME.files[1], import.meta.url).href, wasmBinaryPath: new URL('../../' + RUNTIME.files[2], import.meta.url).href };
  void FilesetResolver;
  onProgress('Indlæser modellen i hukommelsen (kan tage op til et minut) …');
  const file = await openModelFile();
  const llm = await LlmInference.createFromOptions(fileset, {
    baseOptions: { modelAssetBuffer: file.stream().getReader() },
    maxTokens: 3072, topK: 40, temperature: 0.3, randomSeed: 1,
  });
  return {
    kind: 'mediapipe',
    async generate(p, onToken, signal) {
      let out = '';
      const onAbort = () => { try { llm.cancelProcessing(); } catch { /* */ } };
      signal?.addEventListener('abort', onAbort);
      try { await llm.generateResponse(p.text, (part) => { out += part; onToken(out); }); }
      finally { signal?.removeEventListener('abort', onAbort); }
      return out;
    },
    close() { try { llm.close(); } catch { /* */ } },
  };
}

async function builtinEngine() {
  const LM = globalThis.LanguageModel;
  return {
    kind: 'builtin',
    async generate(p, onToken, signal) {
      const session = await LM.create({ initialPrompts: [{ role: 'system', content: p.system }], signal });
      try {
        let out = '';
        for await (const chunk of session.promptStreaming(p.user, { signal })) { out += chunk; onToken(out); }
        return out;
      } finally { session.destroy?.(); }
    },
  };
}

// Testmotor: window.__skFakeAI = { reply: (prompt) => string, msPerToken }
function fakeEngine() {
  const cfg = globalThis.__skFakeAI;
  return {
    kind: 'fake',
    async generate(p, onToken, signal) {
      const full = typeof cfg.reply === 'function' ? cfg.reply(p) : String(cfg.reply);
      let out = '';
      for (const w of full.split(/(?<=\s)/)) {
        if (signal?.aborted) break;
        await new Promise((r) => setTimeout(r, cfg.msPerToken ?? 20));
        out += w; onToken(out);
      }
      return out;
    },
  };
}
