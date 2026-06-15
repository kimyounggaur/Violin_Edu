import type { DisplayOptions } from "./music/violinData";

const SETTINGS_KEY = "fiddle-tap-settings-v1";
const ONBOARDING_KEY = "fiddle-tap-onboarding-v1";

export const DEFAULT_OPTIONS: DisplayOptions = {
  showSolfege: true,
  showNoteName: true,
  showFinger: true,
  includeChromatic: false,
  soundOn: true,
  haptics: true,
  leftHanded: false,
  accidental: "sharp",
  darkMode: false,
  bpm: 90
};

export function loadSettings(): DisplayOptions {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_OPTIONS, ...JSON.parse(raw) } : DEFAULT_OPTIONS;
  } catch {
    return DEFAULT_OPTIONS;
  }
}

export function saveSettings(options: DisplayOptions) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(options));
  } catch {
    // Storage can fail in private mode. The app should keep teaching.
  }
}

export function hasSeenOnboarding() {
  try {
    return window.localStorage.getItem(ONBOARDING_KEY) === "seen";
  } catch {
    return false;
  }
}

export function markOnboardingSeen() {
  try {
    window.localStorage.setItem(ONBOARDING_KEY, "seen");
  } catch {
    // Ignore persistence failure.
  }
}
