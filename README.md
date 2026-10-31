# Celestial Blade — Echoes of the Eclipse

A 16-bit dark-celestial 2D action-platformer built with vanilla HTML5 Canvas, ES6 modules, and a zero-dependency Web Audio synthesizer. Inspired by *Celeste* and *Hollow Knight*, **Celestial Blade** combines sub-pixel platforming kinematics, 4-directional blade combat, aerial pogo chains, Hollow Knight-style Soul Focus healing, Attunement Shrine checkpoints, and a multi-phase boss encounter across 12 handcrafted chapters.

---

## Highlights & Gameplay Features

- **Precision Sub-Pixel Platforming**:
  - 60Hz fixed-timestep physics loop with sub-pixel remainder accumulation.
  - 6-frame coyote time, 6-frame jump input buffering, variable jump height, apex hang gravity reduction, and automatic ceiling corner-correction.
  - **Wall Slide & Wall Jump**: Cling to vertical masonry walls to arrest descent and kick off across chasms.
  - **Astral Dash**: Horizontal burst with evasion invulnerability frames (i-frames) and afterimage trails; refreshes on ground contact or aerial pogo strikes.
- **4-Directional Blade Combat & 3-Hit Combo System**:
  - **3-Hit Solar Combo Chain**: Rapid horizontal strikes chain Forehand, Backhand, and a lunging **Solar Finisher** (`2x` damage) with overhead combo pips and distinct slash colors.
  - **Aerial Pogo Bounce (`Down + Slash`)**: Strike downward mid-air off enemies, crystal spikes, or projectiles to launch upward and immediately restore your air dash.
  - **Projectile Parry**: Slash incoming enemy or boss orbs to deflect them, gain brief invulnerability, and harvest bonus Soul energy.
- **Soul Gauge, Astral Wave & Hollow Knight-Style Soul Focus**:
  - Striking and vanquishing foes fills your **Soul Gauge** (`0–100%`).
  - **Astral Wave (`Tap V` / `F` / `I`)**: Tap to spend `45%` Soul and launch a piercing crescent wave across the arena.
  - **Soul Focus Heal (`Hold V` / `F` on ground)**: Hold while standing still (`60%` Soul) to channel luminous white Soul energy. Completing the channel spawns a glowing heart from your vessel that arcs across the screen into your HUD health bar (`+1 Heart`). Moving or taking damage interrupts the focus!
- **Persistent Health & Attunement Shrine System**:
  - Advancing between chapters preserves your current HP—only resting/attuning at an **Attunement Shrine** or focusing Soul restores your health.
  - Dying returns you to your last attuned Shrine, and the **Shrine Warp** menu lets you travel exclusively between discovered Shrines:
    1. **Chapter I (*Silent Precipice*)** — Awakening Altar
    2. **Chapter V (*Crimson Bastion*)** — Citadel Keep Altar (inside a massive `80x36` multi-tier fortress)
    3. **Chapter XI (*The Grand Labyrinth*)** — Sanctum Nexus Altar (inside the `120x60` non-linear fortress)
- **Aggressive Enemy Roster & 12 Handcrafted Chapters**:
  - **Void Stalkers**: Patrol ledges, telegraph a crouch, and hop-lunge when you enter range.
  - **Crimson Vanguards**: Heavy shield-bearers that block frontal strikes and unleash a guard-counter lance thrust.
  - **Astral Constructs**: Winged sentinels that lock on and fire aimed astral bolts.
  - **Mantis Duelists**: Agile blademasters in the *Mantis Cloister* that execute high-speed scythe dash-slashes and counter-lunges.
  - **Sanctum Acolytes**: Teleporting void mages in the *Astral Observatory* that blink away from close combat and fire twin void orbs.
  - **Seraph Vael, Warden of the Eclipse (Chapter XII)**: Multi-phase final boss featuring telegraphed lunges, aerial dive-slams with floor shockwaves, and deflectable astral orb barrages.
- **Hidden Starlight Relics & Persistent Save System**:
  - 5 hidden **Starlight Relics** tucked into optional platforming alcoves; collecting 3 Relics permanently upgrades your maximum health from `3` to `4` Hearts.
  - Automatic `localStorage` persistence tracks attuned shrines, best speedrun completion time, lowest run deaths, discovered relics, audio mute state, and CRT scanline preferences.

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
| **Astral Wave (Projectile)** | `Tap V` or `F` | `Tap I` or `U` | `Tap` North Button (`Y` / `Triangle`) |
| **Soul Focus Heal (+1 Heart)** | `Hold V` or `F` (grounded) | `Hold I` or `U` (grounded) | `Hold` North Button (grounded) |
| **Pause / Menu** | `Esc` or `P` | `Esc` or `P` | `Start` |
| **Return to Last Shrine** | `R` | `R` | — |
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
│   │   ├── constants.js        # Viewport resolution, physics tuning, shrines, and 12 stages
│   │   └── palette.js          # 16-bit color palette and 4 biome atmospheric themes
│   ├── core/
│   │   ├── Game.js             # Fixed-step loop, shrine respawn/warp logic, and run tracking
│   │   ├── InputManager.js     # Dual-layout keyboard + HTML5 Gamepad input abstraction
│   │   ├── Camera.js           # Smooth lookahead tracking and multi-axis screen shake
│   │   ├── PhysicsBody.js      # Sub-pixel AABB kinematics and ceiling corner-correction
│   │   ├── ParticleSystem.js   # Sparks, bursts, shockwaves, flying HUD hearts, & floating text
│   │   └── SaveManager.js      # Persistent localStorage save state and shrine progression
│   ├── audio/
│   │   └── SoundEngine.js      # Multi-layered Web Audio synth (4 drum+bass+arp tracks + SFX)
│   ├── graphics/
│   │   ├── PixelFont.js        # Crisp 5-row bitmap pixel font renderer and text measurement
│   │   ├── BackgroundRenderer.js # Multi-layer biome parallax, pixel moon/sun/eclipse, & pillars
│   │   └── SpriteRenderer.js   # Procedural animations, Focus vessel glow, & 3-hit slash arcs
│   ├── entities/
│   │   ├── Player.js           # Movement, wall-jump, 3-hit combos, pogo, & Hold-to-Focus heal
│   │   ├── Enemy.js            # Stalkers, Vanguards, Flyers, Mantis Duelists, & Acolyte Mages
│   │   └── Boss.js             # Chapter XII Final Boss: Seraph Vael, Warden of the Eclipse
│   ├── world/
│   │   ├── stages.js           # 12 handcrafted stages including 80x36 Bastion & 120x60 Labyrinth
│   │   └── LevelManager.js     # Neighbor-aware autotiling, hazard checks, and HP persistence
│   └── ui/
│       └── HUDRenderer.js      # HUD, Soul/Focus bars, Boss bar, banners, and Shrine Warp menu
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
