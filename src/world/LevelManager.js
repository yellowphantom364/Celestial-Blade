import { STAGE_METADATA, VIEWPORT } from "../config/constants.js";
import { BIOME_THEMES, PALETTE } from "../config/palette.js";
import { Boss } from "../entities/Boss.js";
import { Enemy } from "../entities/Enemy.js";
import { drawPixelText } from "../graphics/PixelFont.js";
import { STAGES } from "./stages.js";

/**
 * Tilemap loader, neighbor-aware autotiler, collision detector,
 * and stage lifecycle manager with persistent HP across stage transitions.
 */
export class LevelManager {
  constructor(game) {
    this.game = game;
    this.currentIndex = 0;
    this.rows = 23;
    this.cols = 40;
    this.solids = [];
    this.spikes = [];
    this.enemies = [];
    this.keys = [];
    this.relics = [];
    this.boss = null;
    this.pedestal = null;
    this.checkpoint = null;
    this.prompts = [];
    this.exitY = 110;
    this.tick = 0;
    this.bannerTimer = 0;
  }

  getTheme() {
    const meta = STAGE_METADATA[this.currentIndex] || STAGE_METADATA[0];
    return BIOME_THEMES[meta.biome] || BIOME_THEMES.precipice;
  }

  load(index, useCheckpointPos = false, restoreFullHp = false) {
    this.currentIndex = Math.max(0, Math.min(STAGES.length - 1, index));
    this.game.saveManager.unlockStage(this.currentIndex);

    // Select biome soundtrack
    const meta = STAGE_METADATA[this.currentIndex] || STAGE_METADATA[0];
    if (meta.biome === "eclipse") {
      this.game.sound.setTrack("boss");
    } else if (meta.biome === "labyrinth") {
      this.game.sound.setTrack("labyrinth");
    } else if (meta.biome === "spire") {
      this.game.sound.setTrack("bastion");
    } else {
      this.game.sound.setTrack("exploration");
    }

    if (this.currentIndex === 0) {
      this.game.player.hasSword = false;
      this.game.player.swordShrineClaimed = false;
    } else if (this.currentIndex > 1) {
      this.game.player.hasSword = true;
      this.game.player.swordShrineClaimed = true;
    }

    // Only restore full HP on new run, shrine respawn, or shrine warp — NOT when walking between stages!
    if (restoreFullHp || this.game.player.hp <= 0) {
      this.game.player.hp = this.game.player.maxHp;
    }

    if (!useCheckpointPos) {
      this.game.player.keysCollected = 0;
    }
    this.game.particles.clear();

    const data = STAGES[this.currentIndex];
    this.rows = data.grid.length;
    this.cols = data.grid[0].length;
    this.prompts = data.prompts || [];
    this.exitY = data.exitY || 110;
    this.solids = [];
    this.spikes = [];
    this.enemies = [];
    this.keys = [];
    this.relics = [];
    this.boss = null;
    this.pedestal = null;
    this.checkpoint = null;
    this.bannerTimer = 135;

    for (let r = 0; r < this.rows; r++) {
      this.solids[r] = [];
      this.spikes[r] = [];
      const rowStr = data.grid[r] || "";
      for (let c = 0; c < this.cols; c++) {
        const ch = rowStr[c] || ".";
        this.solids[r][c] = ch === "#";
        this.spikes[r][c] = ch === "^";

        const wx = c * VIEWPORT.TILE;
        const wy = r * VIEWPORT.TILE;

        if (ch === "P") {
          this.game.player.spawnX = wx;
          this.game.player.spawnY = wy - 1;
          this.game.player.resetToSpawn();
        } else if (ch === "S") {
          this.pedestal = { x: wx, y: wy };
        } else if (ch === "K") {
          const isShrineActive =
            (useCheckpointPos && this.game.checkpointStage === this.currentIndex) ||
            this.game.saveManager.hasShrine(this.currentIndex);
          this.checkpoint = {
            x: wx,
            y: wy,
            activated: isShrineActive
          };
          if (useCheckpointPos) {
            this.game.player.spawnX = wx;
            this.game.player.spawnY = wy - 1;
            this.game.player.resetToSpawn();
          }
        } else if (ch === "Q") {
          this.keys.push({ x: wx, y: wy, collected: false });
        } else if (ch === "R") {
          const relicId = `stage_${this.currentIndex}_r_${r}_${c}`;
          this.relics.push({
            id: relicId,
            x: wx,
            y: wy,
            collected: this.game.saveManager.hasRelic(relicId)
          });
        } else if (ch === "G" || ch === "L") {
          if (r === 0 || (data.grid[r - 1] && data.grid[r - 1][c] !== ch)) {
            let gateTiles = 0;
            while (
              r + gateTiles < this.rows &&
              data.grid[r + gateTiles] &&
              data.grid[r + gateTiles][c] === ch
            ) {
              gateTiles++;
            }
            const gateType = ch === "L" ? "keygate" : "gate";
            this.enemies.push(new Enemy(wx, wy, gateType, gateTiles * VIEWPORT.TILE));
          }
        } else if (ch === "E") {
          this.enemies.push(new Enemy(wx, wy - 2, "patrol"));
        } else if (ch === "C") {
          this.enemies.push(new Enemy(wx, wy - 2, "charger"));
        } else if (ch === "F") {
          this.enemies.push(new Enemy(wx, wy, "flyer"));
        } else if (ch === "D") {
          this.enemies.push(new Enemy(wx, wy - 4, "duelist"));
        } else if (ch === "M") {
          this.enemies.push(new Enemy(wx, wy - 4, "mage"));
        } else if (ch === "B") {
          this.boss = new Boss(wx, wy - 10, this.game);
        }
      }
    }

    this.game.camera.snapTo(
      this.game.player,
      this.cols * VIEWPORT.TILE,
      this.rows * VIEWPORT.TILE
    );
  }

  collideSolid(x, y, w, h) {
    if (x < 0) return true;
    const startCol = Math.max(0, Math.floor(x / VIEWPORT.TILE));
    const endCol = Math.min(this.cols - 1, Math.floor((x + w - 1) / VIEWPORT.TILE));
    const startRow = Math.max(0, Math.floor(y / VIEWPORT.TILE));
    const endRow = Math.min(this.rows - 1, Math.floor((y + h - 1) / VIEWPORT.TILE));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        if (this.solids[r][c]) return true;
      }
    }

    for (const e of this.enemies) {
      if (!e.dead && e.isDummy) {
        if (x < e.x + e.w && x + w > e.x && y < e.y + e.h && y + h > e.y) {
          return true;
        }
      }
    }
    return false;
  }

  collideSpike(x, y, w, h) {
    const hx = x + 2;
    const hy = y + 3;
    const hw = Math.max(1, w - 4);
    const hh = Math.max(1, h - 3);

    const startCol = Math.max(0, Math.floor(hx / VIEWPORT.TILE));
    const endCol = Math.min(this.cols - 1, Math.floor((hx + hw - 1) / VIEWPORT.TILE));
    const startRow = Math.max(0, Math.floor(hy / VIEWPORT.TILE));
    const endRow = Math.min(this.rows - 1, Math.floor((hy + hh - 1) / VIEWPORT.TILE));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        if (this.spikes[r][c]) {
          const sx = c * VIEWPORT.TILE + 2;
          const sy = r * VIEWPORT.TILE + 3;
          const sw = VIEWPORT.TILE - 4;
          const sh = VIEWPORT.TILE - 3;
          if (hx < sx + sw && hx + hw > sx && hy < sy + sh && hy + hh > sy) {
            return true;
          }
        }
      }
    }
    return false;
  }

  update(player) {
    this.tick++;
    if (this.bannerTimer > 0) this.bannerTimer--;

    const camX = this.game.camera.scrollX;
    const camY = this.game.camera.scrollY;
    const margin = 96;

    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      if (
        enemy.x + enemy.w >= camX - margin &&
        enemy.x <= camX + VIEWPORT.WIDTH + margin &&
        enemy.y + enemy.h >= camY - margin &&
        enemy.y <= camY + VIEWPORT.HEIGHT + margin
      ) {
        enemy.update(this, player);
      }
    }

    if (this.boss && !this.boss.dead) {
      this.boss.update(this, player);
    }

    if (this.checkpoint && this.checkpoint.activated && this.tick % 5 === 0) {
      this.game.particles.spawn(
        this.checkpoint.x + 4 + (Math.random() - 0.5) * 6,
        this.checkpoint.y + 4,
        (Math.random() - 0.5) * 0.2,
        -0.6 - Math.random() * 0.5,
        this.tick % 10 === 0 ? PALETTE.white : PALETTE.playerNoDash,
        1,
        24,
        -0.01,
        0.98
      );
    }

    // Advance to next stage when crossing right exit boundary (KEEPING current HP!)
    if (player.x > this.cols * VIEWPORT.TILE - 4) {
      if (this.currentIndex < STAGES.length - 1) {
        this.load(this.currentIndex + 1, false, false);
      }
    }
  }

  draw(ctx, player) {
    const theme = this.getTheme();
    const camX = this.game.camera.x;
    const camY = this.game.camera.y;
    const startCol = Math.max(0, Math.floor(camX / VIEWPORT.TILE) - 1);
    const endCol = Math.min(this.cols - 1, Math.ceil((camX + VIEWPORT.WIDTH) / VIEWPORT.TILE) + 1);
    const startRow = Math.max(0, Math.floor(camY / VIEWPORT.TILE) - 1);
    const endRow = Math.min(this.rows - 1, Math.ceil((camY + VIEWPORT.HEIGHT) / VIEWPORT.TILE) + 1);

    // Neighbor-aware autotiled solid blocks & spikes
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const wx = c * VIEWPORT.TILE;
        const wy = r * VIEWPORT.TILE;

        if (this.solids[r][c]) {
          ctx.fillStyle = theme.tileFill;
          ctx.fillRect(wx, wy, VIEWPORT.TILE, VIEWPORT.TILE);

          const openTop = r > 0 && !this.solids[r - 1][c];
          const openBottom = r < this.rows - 1 && !this.solids[r + 1][c];
          const openLeft = c > 0 && !this.solids[r][c - 1];
          const openRight = c < this.cols - 1 && !this.solids[r][c + 1];

          if (openTop) {
            ctx.fillStyle = theme.tileHighlight;
            ctx.fillRect(wx, wy, VIEWPORT.TILE, 2);
          }
          if (openBottom) {
            ctx.fillStyle = PALETTE.tileInner;
            ctx.fillRect(wx, wy + VIEWPORT.TILE - 1, VIEWPORT.TILE, 1);
          }
          if (openLeft) {
            ctx.fillStyle = theme.tileEdge;
            ctx.fillRect(wx, wy, 1, VIEWPORT.TILE);
          }
          if (openRight) {
            ctx.fillStyle = theme.tileEdge;
            ctx.fillRect(wx + VIEWPORT.TILE - 1, wy, 1, VIEWPORT.TILE);
          }
          if (!openTop && !openBottom && !openLeft && !openRight) {
            if ((r + c) % 3 === 0) {
              ctx.fillStyle = theme.tileEdge;
              ctx.fillRect(wx + 2, wy + 2, 2, 1);
            } else if ((r * 3 + c) % 5 === 0) {
              ctx.fillStyle = PALETTE.tileInner;
              ctx.fillRect(wx + 1, wy + 4, 3, 1);
            }
          }
        } else if (this.spikes[r][c]) {
          ctx.fillStyle = PALETTE.spike;
          ctx.fillRect(wx + 1, wy + 5, 2, 3);
          ctx.fillRect(wx + 5, wy + 5, 2, 3);
          ctx.fillStyle = PALETTE.spikeTip;
          ctx.fillRect(wx + 2, wy + 3, 1, 2);
          ctx.fillRect(wx + 6, wy + 3, 1, 2);
        }
      }
    }

    // Contextual tutorial prompts
    for (const p of this.prompts) {
      if (p.reqSword && !player.hasSword) continue;
      if (p.hideOnSword && player.hasSword) continue;
      if (player.x > p.x + 150) continue;
      const bobY = p.y + Math.round(Math.sin(this.tick * 0.06) * 1.5);
      const color = p.reqSword ? PALETTE.swordGlow : PALETTE.textSubtle;
      drawPixelText(ctx, p.text, p.x, bobY, color, PALETTE.textShadow);
    }

    // Right exit indicator (for stages 1-11)
    if (this.currentIndex < STAGES.length - 1) {
      const bobX = Math.round(Math.sin(this.tick * 0.1) * 2);
      drawPixelText(
        ctx,
        ">>",
        this.cols * VIEWPORT.TILE - 14 + bobX,
        this.exitY,
        PALETTE.swordGlow,
        PALETTE.textShadow
      );
    }

    // Stage 2 Celestial Blade Shrine
    if (this.pedestal) {
      const px = this.pedestal.x;
      const py = this.pedestal.y;
      ctx.fillStyle = theme.tileHighlight;
      ctx.fillRect(px, py + 5, 8, 3);
      ctx.fillRect(px + 2, py + 3, 4, 2);

      if (!player.swordShrineClaimed) {
        const floatY = py - 5 + Math.round(Math.sin(this.tick * 0.08) * 2);
        ctx.fillStyle = "rgba(254, 211, 48, 0.25)";
        ctx.fillRect(px - 2, floatY - 2, 12, 12);
        ctx.fillStyle = PALETTE.white;
        ctx.fillRect(px + 3, floatY, 2, 6);
        ctx.fillStyle = PALETTE.swordGlow;
        ctx.fillRect(px + 1, floatY + 5, 6, 1);
        ctx.fillRect(px + 3, floatY + 6, 2, 2);
      }
    }

    // Attunement Checkpoint Shrine
    if (this.checkpoint) {
      const cx = this.checkpoint.x;
      const cy = this.checkpoint.y;
      if (this.checkpoint.activated) {
        ctx.fillStyle = "rgba(84, 198, 235, 0.18)";
        ctx.fillRect(cx - 2, cy - 36, 12, 44);
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillRect(cx + 2, cy - 36, 4, 44);
      }
      ctx.fillStyle = theme.tileHighlight;
      ctx.fillRect(cx - 1, cy + 5, 10, 3);
      ctx.fillStyle = this.checkpoint.activated ? PALETTE.playerNoDash : PALETTE.textSubtle;
      ctx.fillRect(cx + 2, cy - 2, 4, 7);
      ctx.fillStyle = this.checkpoint.activated ? PALETTE.white : theme.tileEdge;
      ctx.fillRect(cx + 3, cy - 5, 2, 3);
    }

    // Starlight Relics
    for (const r of this.relics) {
      if (r.collected) continue;
      const ry = r.y + Math.round(Math.sin(this.tick * 0.08 + r.x) * 2);
      ctx.fillStyle = "rgba(126, 255, 245, 0.22)";
      ctx.fillRect(r.x - 2, ry - 2, 10, 10);
      ctx.fillStyle = PALETTE.relicCyan;
      ctx.fillRect(r.x + 2, ry, 2, 6);
      ctx.fillRect(r.x, ry + 2, 6, 2);
      ctx.fillStyle = PALETTE.white;
      ctx.fillRect(r.x + 2, ry + 2, 2, 2);
    }

    // Sanctum Keys
    for (const k of this.keys) {
      if (k.collected) continue;
      const ky = k.y + Math.round(Math.sin(this.tick * 0.09 + k.x) * 2);
      ctx.fillStyle = "rgba(254, 211, 48, 0.22)";
      ctx.fillRect(k.x - 2, ky - 2, 10, 10);
      ctx.fillStyle = PALETTE.swordGlow;
      ctx.fillRect(k.x + 1, ky, 4, 3);
      ctx.fillStyle = PALETTE.bgDeep;
      ctx.fillRect(k.x + 2, ky + 1, 2, 1);
      ctx.fillStyle = PALETTE.white;
      ctx.fillRect(k.x + 2, ky + 3, 2, 4);
      ctx.fillRect(k.x + 4, ky + 4, 2, 1);
      ctx.fillRect(k.x + 4, ky + 6, 2, 1);
    }

    // Viewport-culled enemies
    for (const enemy of this.enemies) {
      if (
        enemy.x + enemy.w < camX - 24 ||
        enemy.x > camX + VIEWPORT.WIDTH + 24 ||
        enemy.y + enemy.h < camY - 24 ||
        enemy.y > camY + VIEWPORT.HEIGHT + 24
      ) {
        continue;
      }
      enemy.draw(ctx);
    }

    // Stage 12 Boss
    if (this.boss && !this.boss.dead) {
      this.boss.draw(ctx);
    }
  }
}
