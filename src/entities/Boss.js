import { PLAYER_CONFIG, VIEWPORT } from "../config/constants.js";
import { PALETTE } from "../config/palette.js";
import { PhysicsBody } from "../core/PhysicsBody.js";

export class Boss extends PhysicsBody {
  constructor(x, y, game) {
    super(x, y, 14, 18);
    this.game = game;
    this.maxHp = 24;
    this.hp = this.maxHp;
    this.phase = 1;
    this.facing = -1;
    this.dead = false;

    this.state = "INTRO";
    this.stateTimer = 45;
    this.attackIndex = 0;
    this.flashTimer = 0;
    this.animTick = 0;
    this.projectiles = [];
    this.targetX = x;
    this.targetY = y;
  }

  takeHit(dirX, dirY, game, damage = 1) {
    if (this.dead) return;

    this.hp = Math.max(0, this.hp - damage);
    this.flashTimer = 4;
    game.player.addSoul(PLAYER_CONFIG.SOUL_PER_HIT);
    game.sound.playHit(damage > 1);

    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    game.particles.spawnHitSpray(
      cx,
      cy,
      dirX || 1,
      dirY || -0.3,
      18,
      damage > 1 ? PALETTE.swordCombo : PALETTE.swordGlow
    );

    game.hitstop = 4;
    game.camera.shake(4.5, 8);

    if (this.phase === 1 && this.hp <= this.maxHp / 2 && this.hp > 0) {
      this.phase = 2;
      this.state = "PHASE_TRANSITION";
      this.stateTimer = 50;
      this.vx = 0;
      this.vy = 0;
      game.sound.playBossRoar();
      game.camera.shake(7, 22);
      game.particles.spawnBurst(cx, cy, PALETTE.bossCrimson, PALETTE.swordGlow, 36);
      game.particles.addShockwave(cx, cy, 48, PALETTE.bossCrimson, 24);
      game.particles.addFloatingText(cx - 28, this.y - 14, "ECLIPSE ASCENSION!", PALETTE.bossCrimson, 55);
      return;
    }

    if (this.hp <= 0) {
      this.dead = true;
      this.projectiles.length = 0;
      game.saveManager.recordKill();
      game.hitstop = 14;
      game.camera.shake(9, 28);
      game.sound.playDefeatPop();
      game.sound.playVictoryFanfare();
      game.particles.spawnBurst(cx, cy, PALETTE.swordGlow, PALETTE.white, 55);
      game.particles.spawnBurst(cx, cy, PALETTE.bossCrimson, PALETTE.relicCyan, 40);
      game.particles.addShockwave(cx, cy, 64, PALETTE.swordGlow, 30);
      game.particles.addFloatingText(cx - 32, cy - 16, "WARDEN VANQUISHED", PALETTE.swordGlow, 70);
      game.onBossDefeated();
    }
  }

  spawnShockwaves(groundY) {
    const cx = this.x + this.w / 2;
    const speed = this.phase === 2 ? 2.6 : 2.1;
    [-1, 1].forEach((dir) => {
      this.projectiles.push({
        x: cx - 3,
        y: groundY - 6,
        w: 6,
        h: 6,
        vx: dir * speed,
        vy: 0,
        color: PALETTE.bossCrimson,
        life: 95
      });
    });
  }

  spawnOrbFan(player) {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    const baseAngle = Math.atan2(
      player.y + player.h / 2 - cy,
      player.x + player.w / 2 - cx
    );
    const count = this.phase === 2 ? 5 : 3;
    const spreadStep = 0.26;
    const speed = this.phase === 2 ? 2.25 : 1.85;

    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * spreadStep;
      const angle = baseAngle + offset;
      this.projectiles.push({
        x: cx - 3,
        y: cy - 3,
        w: 6,
        h: 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: PALETTE.swordGlow,
        life: 110
      });
    }
  }

  updateProjectiles(level) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      if (this.animTick % 3 === 0) {
        this.game.particles.spawn(p.x + 3, p.y + 3, 0, 0, p.color, 2, 7, 0);
      }

      if (
        p.life <= 0 ||
        p.x < 8 ||
        p.x > level.cols * VIEWPORT.TILE - 14 ||
        p.y < 8 ||
        p.y > level.rows * VIEWPORT.TILE - 8
      ) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  update(level, player) {
    if (this.dead) return;
    this.animTick++;
    if (this.flashTimer > 0) this.flashTimer--;

    this.updateProjectiles(level);

    const speedMult = this.phase === 2 ? 1.28 : 1.0;
    this.stateTimer--;

    switch (this.state) {
      case "INTRO": {
        this.facing = player.x < this.x ? -1 : 1;
        if (this.stateTimer <= 0) {
          this.state = "IDLE";
          this.stateTimer = 28;
        }
        break;
      }

      case "PHASE_TRANSITION": {
        if (this.stateTimer % 5 === 0) {
          this.game.particles.spawn(
            this.x + Math.random() * this.w,
            this.y + Math.random() * this.h,
            (Math.random() - 0.5) * 2,
            -1 - Math.random() * 1.5,
            PALETTE.bossCrimson,
            2,
            16,
            0
          );
        }
        if (this.stateTimer <= 0) {
          this.state = "IDLE";
          this.stateTimer = 20;
        }
        break;
      }

      case "IDLE": {
        this.facing = player.x < this.x ? -1 : 1;
        this.vx *= 0.8;
        this.vy = Math.min(3.2, this.vy + 0.2);
        this.moveX(this.vx, level);
        this.moveY(this.vy, level, () => {
          this.vy = 0;
        });

        if (this.stateTimer <= 0) {
          const pattern = this.attackIndex % 3;
          this.attackIndex++;
          if (pattern === 0) {
            this.state = "TELEGRAPH_LUNGE";
            this.stateTimer = Math.round(28 / speedMult);
            this.facing = player.x < this.x ? -1 : 1;
          } else if (pattern === 1) {
            this.state = "TELEGRAPH_DIVE";
            this.stateTimer = Math.round(28 / speedMult);
            this.x = Math.max(32, Math.min(level.cols * VIEWPORT.TILE - 48, player.x - 4));
            this.y = 34;
            this.vx = 0;
            this.vy = 0;
            this.game.particles.spawnBurst(this.x + 7, this.y + 9, PALETTE.bossGold, PALETTE.white, 14);
          } else {
            this.state = "TELEGRAPH_BARRAGE";
            this.stateTimer = Math.round(30 / speedMult);
            this.x = Math.floor((level.cols * VIEWPORT.TILE) / 2) - 7;
            this.y = 48;
            this.vx = 0;
            this.vy = 0;
            this.game.particles.spawnBurst(this.x + 7, this.y + 9, PALETTE.soulCyan, PALETTE.white, 14);
          }
        }
        break;
      }

      case "TELEGRAPH_LUNGE": {
        this.vx = 0;
        this.vy = Math.min(3.2, this.vy + 0.2);
        this.moveY(this.vy, level, () => {
          this.vy = 0;
        });
        if (this.stateTimer <= 0) {
          this.state = "LUNGE";
          this.stateTimer = 22;
          this.vx = this.facing * 4.4 * speedMult;
          this.game.sound.playDash();
          this.game.camera.shake(3.5, 6);
        }
        break;
      }

      case "LUNGE": {
        this.vy = Math.min(3.2, this.vy + 0.2);
        if (this.animTick % 2 === 0) {
          this.game.particles.addGhost(this.x, this.y, this.w, this.h, PALETTE.bossCrimson);
        }
        this.moveX(this.vx, level, () => {
          this.vx = 0;
          this.stateTimer = 0;
          this.game.camera.shake(4, 7);
        });
        this.moveY(this.vy, level, () => {
          this.vy = 0;
        });
        if (this.stateTimer <= 0) {
          this.vx = 0;
          this.state = "IDLE";
          this.stateTimer = Math.round(32 / speedMult);
        }
        break;
      }

      case "TELEGRAPH_DIVE": {
        this.vx = 0;
        this.vy = 0;
        if (this.stateTimer <= 0) {
          this.state = "DIVE";
          this.vy = 5.2 * speedMult;
          this.game.sound.playSwing(2);
        }
        break;
      }

      case "DIVE": {
        if (this.animTick % 2 === 0) {
          this.game.particles.addGhost(this.x, this.y, this.w, this.h, PALETTE.bossGold);
        }
        this.moveY(this.vy, level, () => {
          this.vy = 0;
          this.game.sound.playHit(true);
          this.game.camera.shake(6, 12);
          this.game.particles.spawnBurst(
            this.x + this.w / 2,
            this.y + this.h,
            PALETTE.bossCrimson,
            PALETTE.swordGlow,
            24
          );
          this.spawnShockwaves(this.y + this.h);
          this.state = "IDLE";
          this.stateTimer = Math.round(36 / speedMult);
        });
        break;
      }

      case "TELEGRAPH_BARRAGE": {
        this.facing = player.x < this.x ? -1 : 1;
        if (this.stateTimer <= 0) {
          this.spawnOrbFan(player);
          this.game.sound.playWaveCast();
          this.game.camera.shake(3, 6);
          this.state = "IDLE";
          this.stateTimer = Math.round(38 / speedMult);
        }
        break;
      }
    }
  }

  draw(ctx) {
    if (this.dead) return;

    const rx = Math.round(this.x);
    const ry = Math.round(this.y);

    if (this.state === "TELEGRAPH_LUNGE") {
      ctx.fillStyle = this.stateTimer % 4 < 2 ? "rgba(235, 59, 90, 0.55)" : "rgba(254, 211, 48, 0.55)";
      const lineX = this.facing === 1 ? rx + this.w : rx - 140;
      ctx.fillRect(lineX, ry + this.h - 6, 140, 2);
    } else if (this.state === "TELEGRAPH_DIVE") {
      ctx.fillStyle = this.stateTimer % 4 < 2 ? "rgba(254, 211, 48, 0.45)" : "rgba(235, 59, 90, 0.45)";
      ctx.fillRect(rx + 5, ry + this.h, 4, 110);
    } else if (this.state === "TELEGRAPH_BARRAGE") {
      ctx.fillStyle = "rgba(84, 198, 235, 0.35)";
      ctx.fillRect(rx - 3, ry - 3, this.w + 6, this.h + 6);
    }

    for (const p of this.projectiles) {
      const px = Math.round(p.x);
      const py = Math.round(p.y);
      ctx.fillStyle = p.color;
      ctx.fillRect(px, py, p.w, p.h);
      ctx.fillStyle = PALETTE.white;
      ctx.fillRect(px + 1, py + 1, p.w - 2, p.h - 2);
    }

    if (this.flashTimer > 0) {
      ctx.fillStyle = PALETTE.white;
      ctx.fillRect(rx, ry, this.w, this.h);
      return;
    }

    const wingOffset = Math.sin(this.animTick * 0.2) > 0 ? -2 : 1;
    const wingColor = this.phase === 2 ? PALETTE.bossCrimson : PALETTE.bossGold;

    ctx.fillStyle = wingColor;
    ctx.fillRect(rx - 5, ry + 2 + wingOffset, 5, 8);
    ctx.fillRect(rx + this.w, ry + 2 + wingOffset, 5, 8);
    ctx.fillRect(rx - 3, ry + 10 + wingOffset, 3, 4);
    ctx.fillRect(rx + this.w, ry + 10 + wingOffset, 3, 4);

    ctx.fillStyle = PALETTE.bossCloak;
    ctx.fillRect(rx + 1, ry + 5, this.w - 2, this.h - 5);

    ctx.fillStyle = PALETTE.bossArmor;
    ctx.fillRect(rx + 2, ry + 4, this.w - 4, 9);

    ctx.fillStyle = PALETTE.bossGold;
    ctx.fillRect(rx + 3, ry, this.w - 6, 4);
    ctx.fillRect(rx + 2, ry - 2, 2, 2);
    ctx.fillRect(rx + 6, ry - 3, 2, 3);
    ctx.fillRect(rx + this.w - 4, ry - 2, 2, 2);

    ctx.fillStyle = this.phase === 2 ? PALETTE.bossCrimson : PALETTE.white;
    const eyeX = this.facing === 1 ? rx + 7 : rx + 3;
    ctx.fillRect(eyeX, ry + 2, 4, 2);

    ctx.fillStyle = PALETTE.swordGlow;
    const bladeX = this.facing === 1 ? rx + this.w + 1 : rx - 4;
    ctx.fillRect(bladeX, ry + 4, 3, 12);
    ctx.fillStyle = PALETTE.white;
    ctx.fillRect(bladeX + 1, ry + 5, 1, 10);
  }
}
