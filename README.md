# Celestial Blade — Echoes of the Eclipse

A retro 2D dark-celestial action platformer built with vanilla JavaScript and HTML5 Canvas. Heavily inspired by *Hollow Knight* and *Celeste*.

🎮 **[Play it in your browser here!](https://platformer-chi-one.vercel.app/)**

---

## What is this?

I wanted to build a responsive, challenging platformer from scratch without bloated engines. It has tight controls, aerial pogo bounces, a 3-hit sword combo, Soul skills, and 12 handcrafted stages leading up to a multi-phase boss fight against Seraph Vael.

### Gameplay & Features

- **Tight Platforming**: Coyote time, jump buffering, wall-sliding, wall-jumping, and an air dash that refreshes when you land or pogo off hazards.
- **Combat & Pogos**: A 3-hit combo chain with a heavy Solar Finisher on the 3rd swing. Hold `Down + Slash` mid-air to bounce off enemies and crystal spikes. Slash enemy and boss orbs to parry them and get bonus Soul.
- **Soul Focus Healing**: Every hit and kill builds up your Soul gauge. Tap your skill key to shoot an Astral Wave, or stand still and hold it down to focus your Soul and recover a heart (Hollow Knight style). Be careful though—taking damage or moving interrupts your channel!
- **Attunement Shrines**: Your health persists between stages—clearing a room won't give you a free full heal anymore. Rest at Shrines to recover HP and set your respawn point. When you pause or start the game, you can warp between any Shrines you've attuned to.
- **Enemies That Fight Back**: Void Stalkers lunge at you, Crimson Vanguards block frontal hits with shields and counter-thrust, Astral Constructs snipe from above, and Mantis Duelists dash-slash with dual scythes.
- **12 Stages & Boss Fight**: Explore ancient ruins, climb the Spire, push through the expanded Citadel in Crimson Bastion, solve the 120x60 Grand Labyrinth, and face off against Seraph Vael in the Eclipse Sanctum.
- **Collectibles & Saves**: 5 hidden Starlight Relics (collecting 3 permanently boosts your max hearts to 4), plus speedrun time and lowest death tracking saved in localStorage.

---

## Controls

The game supports both classic arrow-key and WASD layouts, as well as gamepads:

| Action | Classic Layout | WASD Layout | Gamepad |
| :--- | :--- | :--- | :--- |
| **Move / Aim** | `Arrow Keys` | `W` `A` `S` `D` | D-Pad / Left Stick |
| **Jump / Wall Jump** | `Z` or `Space` | `Space` or `K` | South Button (`A` / `X`) |
| **Sword Slash** | `X` | `J` | West Button (`X` / `Square`) |
| **Pogo Bounce** | `Down` + `X` (in air) | `S` + `J` (in air) | `Down` + Attack (in air) |
| **Astral Dash** | `C` or `Shift` | `L` or `Shift` | East Button (`B` / `Circle`) |
| **Astral Wave (Projectile)** | Tap `V` or `F` | Tap `I` or `U` | Tap North Button (`Y` / `Triangle`) |
| **Soul Focus Heal** | Hold `V` or `F` (grounded) | Hold `I` or `U` (grounded) | Hold North Button (grounded) |
| **Pause Menu** | `Esc` or `P` | `Esc` or `P` | `Start` |
| **Return to Last Shrine** | `R` | `R` | — |
| **Mute Audio** | `M` | `M` | — |
| **Toggle CRT Filter** | `T` | `T` | — |

---

## Running Locally

If you want to clone and run it on your machine:

```bash
git clone https://github.com/yellowphantom364/Celestial-Blade.git
cd Celestial-Blade
npm run dev
```

Then visit `http://localhost:8080`.

You can also double-click `index.html` directly from your file explorer—it'll automatically run via the compiled bundle in `dist/bundle.js`.

---

## License & Credits

Created by **George Lin** ([@yellowphantom364](https://github.com/yellowphantom364)).

Feel free to play, clone, study, and fork this project for personal and educational use! However, please do not steal or re-upload the code/assets as your own work. If you share, showcase, or build upon this project, you must give clear credit with a link back to this repo or the [playable site](https://platformer-chi-one.vercel.app/). See [LICENSE](./LICENSE) for full details.
