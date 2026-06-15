# Violin Fingering Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the mobile-first violin fingering PWA from the supplied design prompt and `01 Source` learning assets.

**Architecture:** A Vite React TypeScript app uses `src/lib/music/violinData.ts` as the single music data source. UI state lives in `App.tsx`, with focused components for the fingerboard, selected-note display, option sheet, modes, help, settings, audio, and persistence.

**Tech Stack:** React, Vite, TypeScript, Tailwind CSS, Framer Motion, Tone.js, Vitest, Testing Library, PWA manifest and service worker.

---

### Task 1: Core Data Contract

**Files:**
- Create: `src/lib/music/violinData.ts`
- Create: `src/lib/music/songs.ts`
- Test: `src/lib/music/violinData.test.ts`
- Test: `src/lib/music/songs.test.ts`

- [ ] Write failing tests for `getNote("A","1")`, E-string high-2, fourth-finger/open-string equivalence, string-length `posRatio`, and song range validation.
- [ ] Run `npm test` and confirm the tests fail because the modules do not exist yet.
- [ ] Implement the music modules exactly from the prompt, adding only derived helpers.
- [ ] Re-run `npm test` and confirm data tests pass.

### Task 2: Mobile App Shell And Fingerboard

**Files:**
- Create: `src/App.tsx`
- Create: `src/components/Fingerboard.tsx`
- Create: `src/components/SelectedNoteCard.tsx`
- Create: `src/styles.css`
- Test: `src/components/Fingerboard.test.tsx`

- [ ] Write the failing render test for 20 beginner markers and 32 chromatic markers.
- [ ] Implement the app shell, sticky selected note card, safe-area layout, bottom tabbar, and data-driven fingerboard.
- [ ] Re-run component tests and fix only the behavior under test.

### Task 3: Interaction, Audio, Options, And Modes

**Files:**
- Create: `src/lib/audio.ts`
- Create: `src/lib/storage.ts`
- Create: `src/lib/quiz.ts`
- Create: `src/features/modes/*.tsx`
- Modify: `src/App.tsx`

- [ ] Add marker tap selection, haptics, Tone.js unlock/playback, replay, and motion.
- [ ] Add the option sheet for display toggles, chromatic notes, handedness, accidentals, sound, haptics, and BPM.
- [ ] Add Explore, Solfege, Quiz, Song, Help, and Settings panels with friendly Korean copy.
- [ ] Persist settings and progress in `localStorage` with try/catch.

### Task 4: PWA Assets And Verification

**Files:**
- Create: `public/manifest.webmanifest`
- Create: `public/sw.js`
- Create: `public/icons/*.svg`
- Copy: `01 Source/*.png` to `public/assets/`
- Modify: `index.html`

- [ ] Register the service worker and manifest.
- [ ] Copy the source learning images into `public/assets` and render them in Help.
- [ ] Run `npm run build`, `npm test`, and browser verification at mobile and desktop widths.
