# Celestial Blade — Echoes of the Eclipse

A 16-bit dark-celestial 2D action-platformer built with vanilla HTML5 Canvas, ES6 modules, and a zero-dependency Web Audio synthesizer. Inspired by *Celeste* and *Hollow Knight*, **Celestial Blade** combines sub-pixel platforming kinematics, 4-directional blade combat, aerial pogo chains, Soul abilities, and a multi-phase boss encounter across 10 handcrafted chapters.

---

## Highlights & Gameplay Features

- **Precision Sub-Pixel Platforming**:
  - 60Hz fixed-timestep physics loop with sub-pixel remainder accumulation.
  - 6-frame coyote time, 6-frame jump input buffering, variable jump height, apex hang gravity reduction, and automatic ceiling corner-correction.
  - **Wall Slide & Wall Jump**: Cling to vertical masonry walls to arrest descent and kick off across chasms.
  - **Astral Dash**: Horizontal burst with evasion invulnerability frames (i-frames) and afterimage trails; refreshes on ground contact or aerial pogo strikes.
- **4-Directional Blade Combat & 3-Hit Combo System**:
  - **3-Hit Combo Chain**: Rapid horizontal strikes chain Forehand, Backhand, and a wide **Solar Finisher** that deals `2x` damage.
  - **Aerial Pogo Bounce (`Down + Slash`)**: Strike downward mid-air off enemies, crystal spikes, or boss projectiles to launch upward and immediately restore your air dash.
  - **Projectile Parry**: Slash incoming boss orbs to deflect them, gain brief invulnerability, and harvest bonus Soul energy.
- **Soul Gauge & Astral Skills**:
  - Striking and vanquishing foes fills your **Soul Gauge** (`0–100%`).
  - **Astral Wave (`V` / `F` / `I`)**: Spend `45%` Soul to launch a piercing crescent wave across the arena.
  - **Soul Focus Heal (`Up/Down + V/F`)**: Spend `60%` Soul to restore `+1 Heart`.
- **10 Handcrafted Chapters & Final Boss Encounter**:
  - **Chapters I–VIII**: Progressive gauntlets introducing movement, the Celestial Blade Shrine, Void Stalkers, Astral Flyers, and Crimson Vanguards across shifting biomes (*Silent Precipice*, *Astral Spire*, *Sanctum Threshold*).
  - **Chapter IX (*The Grand Labyrinth*)**: A `120x60` non-linear scrolling Metroidvania fortress housing 3 Sanctum Keys, an Attunement Checkpoint Shrine, and a sealed Grand Gate.
  - **Chapter X (*Eclipse Sanctum*)**: A multi-phase boss battle against **Seraph Vael, Warden of the Eclipse**, featuring telegraphed lunges, aerial dive-slams with floor shockwaves, and deflectable astral orb barrages.
- **Hidden Starlight Relics & Persistent Save System**:
  - 5 hidden **Starlight Relics** tucked into optional platforming alcoves; collecting 3 Relics permanently upgrades your maximum health from `3` to `4` Hearts.
  - Automatic `localStorage` persistence tracks unlocked chapters, best speedrun completion time, lowest run deaths, discovered relics, audio mute state, and CRT scanline preferences.

---

## Controls

Both classic platformer (`Arrows + Z/X/C/V`) and modern action (`WASD + Space/J/K/L`) layouts—plus HTML5 Gamepads—are active simultaneously:

| Action | Layout A (Classic) | Layout B (WASD) | Gamepad |
| :--- | :--- | :--- | :--- |
| **Move / Aim** | `Arrow Keys` | `W` `A` `S` `D` | D-Pad / Left Stick |
| **Jump / Wall-Jump** | `Z` or `Space` | `Space` or `K` | South Button (`A` / `Cross`) |
| **Blade Slash (3-Hit Combo)** | `X` | `J` | West Button (`X` / `Square`) |
| **Aerial Pogo Strike** | `Down` + `X` (in air) | `S` + `J` (in air) | `Down` + Attack (in air) |
| **Astral Dash (i-frames)** | `C` or `Shift` | `L` or `Shift` | East Button (`B` / `Circle`) |
| **Astral Wave / Soul Heal** | `V` or `F` (`+Up/Down` to Heal) | `I` or `U` (`+W/S` to Heal) | North Button (`Y` / `Triangle`) |
| **Pause / Menu** | `Esc` or `P` | `Esc` or `P` | `Start` |
| **Quick Retry Stage** | `R` | `R` | — |
| **Toggle Audio Mute** | `M` | `M` | — |
| **Toggle CRT Scanlines** | `T` | `T` | — |

---

## Project Architecture

```text
Celestial-Blade/
├── index.html                  # Semantic HTML5 shell, viewport frame, and control bar
├── package.json                # Project metadata and npm scripts (dev, build, check)
├── css/
│   ├── variables.css           # Design tokens, palette variables, and typography
│   └── main.css                # Responsive 16:9 viewport scaling, CRT filter, and status bar
├── src/
│   ├── main.js                 # Entry point, DOM initialization, and toolbar bindings
│   ├── config/
│   │   ├── constants.js        # Viewport resolution, physics tuning, and stage metadata
│   │   └── palette.js          # 16-bit color palette and 4 biome atmospheric themes
│   ├── core/
│   │   ├── Game.js             # Fixed-step loop, state machine, menus, and run tracking
│   │   ├── InputManager.js     # Dual-layout keyboard + HTML5 Gamepad input abstraction
│   │   ├── Camera.js           # Smooth lookahead tracking and multi-axis screen shake
│   │   ├── PhysicsBody.js      # Sub-pixel AABB kinematics and ceiling corner-correction
│   │   ├── ParticleSystem.js   # Sparks, radial bursts, shockwaves, afterimages, & floating text
│   │   └── SaveManager.js      # Persistent localStorage save state and preferences
│   ├── audio/
│   │   └── SoundEngine.js      # Procedural Web Audio synthesizer (3 BGM tracks + combat SFX)
│   ├── graphics/
│   │   ├── PixelFont.js        # Crisp 5-row bitmap pixel font renderer and text measurement
│   │   ├── BackgroundRenderer.js # Multi-layer biome parallax, moon/eclipse, and ruined pillars
│   │   └── SpriteRenderer.js   # Procedural animations, Verlet scarf physics, and slash arcs
│   ├── entities/
│   │   ├── Player.js           # Player movement, wall-jump, 3-hit combos, pogo, & Soul skills
│   │   ├── Enemy.js            # Void Stalkers, Crimson Vanguards, Astral Flyers, & Runic Gates
│   │   └── Boss.js             # Stage 10 Final Boss: Seraph Vael, Warden of the Eclipse
│   ├── world/
│   │   ├── stages.js           # 10 handcrafted stage maps + procedural 120x60 Grand Labyrinth
│   │   └── LevelManager.js     # Neighbor-aware autotiling, hazard checks, and stage lifecycle
│   └── ui/
│       └── HUDRenderer.js      # HUD, Soul gauge, Boss health bar, banners, and menu screens
├── scripts/
│   └── build.js                # Zero-dependency bundler generating dist/bundle.js fallback
└── dist/
    └── bundle.js               # Compiled standalone bundle for direct file:// execution
```

---

## Getting Started

### 1. Run with a Local Development Server (Recommended)

```bash
git clone https://github.com/yellowphantom364/Celestial-Blade.git
cd Celestial-Blade
npm run dev
```

Then open `http://localhost:8080` in any modern browser.

### 2. Direct `file://` Opening

`index.html` automatically detects the `file://` protocol and loads the pre-compiled `./dist/bundle.js` fallback so the game can also be opened directly from your file manager without a local server.

To rebuild `dist/bundle.js` after editing any file in `src/`:

```bash
npm run build
```

---

## License

Released under the [MIT License](./LICENSE).
