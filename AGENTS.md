# AGENTS.md

## Project

This is an educational browser app for learning how cameras and eyes form images.

The app combines:
- visual-novel-like lesson progression
- interactive 3D optics simulation
- right-side sensor/screen preview
- click-based one-pixel light path analysis

## Read first

Before implementing major features, read:

1. docs/00_READ_FIRST_FOR_CODEX.md
2. docs/product/01_PROJECT_BRIEF.md
3. docs/design/01_SCREEN_STRUCTURE.md
4. docs/content/02_CORE_EXPLANATION.md
5. docs/content/03_PIXEL_ANALYSIS_MODE.md
6. docs/simulation/01_OPTICS_MODEL.md
7. docs/tasks/00_IMPLEMENTATION_PLAN.md

## Tech stack

Use:
- Vite
- React
- TypeScript
- Three.js
- React Three Fiber
- Drei
- Zustand or Jotai for app state

## Implementation rules

- Keep lesson content data-driven.
- Do not hard-code long lesson text directly inside React components.
- Keep 3D simulation logic separate from UI components.
- The right-side sensor view must be treated as a first-class feature, not a decorative preview.
- The one-pixel analysis mode is the core differentiating feature.
- Prefer clear educational correctness over visual gimmicks.
- If full physics simulation is too expensive, use simplified but explainable educational models.

## UX direction

The app should feel like a serious educational service with a visual-novel-inspired learning flow.

Do not make the whole app look like a game menu only.
The user should feel:
- guided
- curious
- able to experiment freely
- able to connect explanation and simulation

## Done criteria

For each implemented feature:
- It works in the browser.
- It has clear UI labels in Japanese.
- It does not break existing lesson flow.
- It is documented if the implementation uses a simplified physics model.