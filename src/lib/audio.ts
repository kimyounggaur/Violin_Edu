let toneModule: typeof import("tone") | null = null;
let synth: import("tone").FMSynth | null = null;

async function ensureSynth() {
  if (!toneModule) {
    toneModule = await import("tone");
  }

  if (toneModule.getContext().state !== "running") {
    await toneModule.start();
  }

  if (!synth) {
    synth = new toneModule.FMSynth({
      harmonicity: 1.08,
      modulationIndex: 2.2,
      envelope: {
        attack: 0.018,
        decay: 0.16,
        sustain: 0.28,
        release: 0.5
      },
      modulationEnvelope: {
        attack: 0.02,
        decay: 0.2,
        sustain: 0.12,
        release: 0.35
      }
    }).toDestination();
  }

  return synth;
}

export async function playPitch(noteName: string, enabled: boolean) {
  if (!enabled) return;

  try {
    const unlockedSynth = await ensureSynth();
    unlockedSynth.triggerAttackRelease(noteName, "8n");
  } catch (error) {
    console.warn("Audio playback failed", error);
  }
}

export function vibrate(pattern: number | number[], enabled: boolean) {
  if (!enabled || !("vibrate" in navigator)) return;
  navigator.vibrate(pattern);
}
