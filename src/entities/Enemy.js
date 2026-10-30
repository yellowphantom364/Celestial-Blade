import { PLAYER_CONFIG, VIEWPORT } from "../config/constants.js";
import { PALETTE } from "../config/palette.js";
import { PhysicsBody } from "../core/PhysicsBody.js";

/**
 * Standard enemies (Void Stalker, Crimson Charger, Astral Flyer)
 * as well as destructible Runic Gates and the 3-Key Grand Sanctum Gate.
 */
export class Enemy extends PhysicsBody {
  constructor(x, y, type = "patrol", customHeight = null) {
    const isGate = type === "gate" || type === "keygate";
    const h = isGate ? customHeight || 24 : 10;
    super(x, y, isGate ? 8 : 10, h);
    this.type = type;
    this.isDummy = isGate;
    this.isKeyGate = type === "keygate";
    this.isFlyer = type === "flyer";
    this.hp = this.isKeyGate ? 999 : isGate ? 3 : type === "charger" ? 3 : 2;
    this.maxHp = this.hp;
    this.dir = -1;
    this.baseY = y;
    this.flashTimer = 0;
    this.knockbackTimer = 0;
    this.aggro = false;
    this.dead = false;
    this.animTick = Math.floor(Math.random() * 30);
  }

  unlockGrandGate(game) {
    if (this.dead) return;
    this.dead = true;
    game.player.keysCollected = Math.max(0, game.player.keysCollected - 3);
    game.hitstop = 8;
    game.camera.shake(7, 16);
    game.sound.playDefeatPop();
    game.particles.spawnBurst(
      this.x + this.w / 2,
      this.y + this.h / 2,
      PALETTE.swordGlow,
      PALETTE.white,
      44
    );
    game.particles.addShockwave(this.x + 4, this.y + this.h / 2, 34, PALETTE.swordGlow, 20);
    game.particles.addFloatingText(this.x - 20, this.y - 8, "SANCTUM UNSEALED", PALETTE.swordGlow, 45);
  }

  takeHit(dirX, dirY, game, damage = 1) {
    if (this.isKeyGate) {
      if (game.player.keysCollected >= 3) {
        this.unlockGrandGate(game);
      } else {
        this.flashTimer = 3;
        this.knockbackTimer = 4;
        game.sound.playHit(false);
        game.camera.shake(2.5, 5);
        game.particles.spawnHitSpray(this.x + this.w / 2, this.y + this.h / 2, dirX || 1, dirY, 8);
        game.particles.addFloatingText(
          this.x - 18,
          this.y - 6,
          `NEEDS ${3 - game.player.keysCollected} KEY${3 - game.player.keysCollected === 1 ? "" : "S"}`,
          PALETTE.swordGlow,
          30
        );
      }
      return;
    }

    this.hp -= damage;
    this.flashTimer = 4;
    const isFinisher = damage > 1;
    game.sound.playHit(isFinisher);

    const impactX = this.x + this.w / 2;
    const impactY = this.y + this.h / 2;
    const sprayX = dirX !== 0 ? dirX : 0;
    const sprayY = dirY !== 0 ? dirY : -0.25;
    game.particles.spawnHitSpray(
      impactX,
      impactY,
      sprayX,
      sprayY,
      isFinisher ? 22 : 16,
      isFinisher ? PALETTE.swordCombo : PALETTE.swordGlow
    );

    if (!this.isDummy) {
      game.player.addSoul(PLAYER_CONFIG.SOUL_PER_HIT);
      if (dirY === 1) {
        this.vy = 1.8;
        this.vx = (this.x < game.player.x ? -1 : 1) * 1.1;
      } else if (dirY === -1) {
        this.vy = -2.6;
        this.vx = (this.x < game.player.x ? -1 : 1) * 1.1;
      } else {
        this.vx = dirX * (isFinisher ? 4.2 : 3.5);
        this.vy = -1.6;
      }
      this.knockbackTimer = 11;
    } else {
      this.knockbackTimer = 4;
    }

    game.hitstop = isFinisher ? 5 : 4;
    game.camera.shake(isFinisher ? 5.5 : 4.5, 8);

    if (this.hp <= 0) {
      this.dead = true;
      if (!this.isDummy) {
        game.player.addSoul(PLAYER_CONFIG.SOUL_PER_KILL);
        game.saveManager.recordKill();
      }
      game.hitstop = 5;
      game.camera.shake(6.5, 12);
      game.sound.playDefeatPop();
      game.particles.spawnBurst(
        impactX,
        impactY,
        PALETTE.white,
        this.isDummy ? PALETTE.swordGlow : PALETTE.enemyEye,
        28
      );
      game.particles.addShockwave(impactX, impactY, 18, PALETTE.white, 12);
    }
  }

  update(level, player) {
    if (this.dead) return;
    this.animTick++;

    if (this.flashTimer > 0) this.flashTimer--;
    if (this.knockbackTimer > 0) this.knockbackTimer--;

    if (this.isDummy) return;

    if (this.isFlyer) {
      if (this.knockbackTimer > 0) {
        this.vx *= 0.85;
        this.vy *= 0.85;
      } else {
        const wallAhead = level.collideSolid(this.x + this.dir * 2, this.y, this.w, this.h);
        if (wallAhead || this.x < 16 || this.x > level.cols * VIEWPORT.TILE - 26) {
          this.dir *= -1;
        }
        this.vx = this.dir * 0.68;
        const targetY = this.baseY + Math.sin(this.animTick * 0.08) * 8;
        this.vy = (targetY - this.y) * 0.15;
      }

      this.moveX(this.vx, level, () => {
        this.vx = 0;
        this.dir *= -1;
      });
      this.moveY(this.vy, level, () => {
        this.vy = 0;
      });
      return;
    }

    this.onGround = level.collideSolid(this.x, this.y + 1, this.w, this.h);

    if (this.knockbackTimer > 0) {
      this.vx *= 0.82;
    } else {
      const distToPlayerX = player.x - this.x;
      const distToPlayerY = Math.abs(player.y - this.y);

      if (this.type === "charger" && Math.abs(distToPlayerX) < 88 && distToPlayerY < 24) {
        this.aggro = true;
        this.dir = Math.sign(distToPlayerX) || 1;
        this.vx += (this.dir * 1.2 - this.vx) * 0.18;
      } else {
        this.aggro = false;
        const lookAheadX = this.dir === 1 ? this.x + this.w + 1 : this.x - 2;
        const groundAhead = level.collideSolid(lookAheadX, this.y + this.h + 1, 1, 2);
        const wallAhead = level.collideSolid(this.x + this.dir, this.y, this.w, this.h);

        if ((this.onGround && !groundAhead) || wallAhead) {
          this.dir *= -1;
        }
        this.vx = this.dir * 0.62;
      }
    }

    this.vy = Math.min(3.5, this.vy + 0.22);

    this.moveX(this.vx, level, () => {
      this.vx = 0;
      this.dir *= -1;
    });
    this.moveY(this.vy, level, () => {
      this.vy = 0;
    });

    if (
      level.collideSpike(this.x, this.y, this.w, this.h) ||
      this.y > level.rows * VIEWPORT.TILE + 8
    ) {
      this.takeHit(this.dir, 0, player.game, 3);
    }
  }

  draw(ctx) {
    if (this.dead) return;

    const shakeX =
      this.knockbackTimer > 0 && this.isDummy ? (this.knockbackTimer % 2 === 0 ? 1 : -1) : 0;
    const rx = Math.round(this.x) + shakeX;
    const ry = Math.round(this.y);

    if (this.flashTimer > 0) {
      ctx.fillStyle = PALETTE.white;
      ctx.fillRect(rx, ry, this.w, this.h);
      return;
    }

    if (this.isDummy) {
      ctx.fillStyle = this.isKeyGate ? "#2c224e" : "#303952";
      ctx.fillRect(rx, ry, this.w, this.h);
      ctx.fillStyle = this.isKeyGate ? PALETTE.swordGlow : PALETTE.tileEdge;
      ctx.fillRect(rx, ry, 1, this.h);
      ctx.fillRect(rx + this.w - 1, ry, 1, this.h);

      if (this.isKeyGate) {
        const slotSpacing = Math.max(7, Math.floor((this.h - 6) / 3));
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = "#090a14";
          ctx.fillRect(rx + 2, ry + 4 + i * slotSpacing, 4, 5);
          ctx.fillStyle = PALETTE.swordGlow;
          ctx.fillRect(rx + 3, ry + 5 + i * slotSpacing, 2, 2);
        }
      } else {
        ctx.fillStyle = PALETTE.swordGlow;
        const spacing = Math.max(6, Math.floor((this.h - 6) / this.maxHp));
        for (let i = 0; i < this.hp; i++) {
          ctx.fillRect(rx + 2, ry + 4 + i * spacing, 4, 4);
        }
      }
      return;
    }

    if (this.isFlyer) {
      const wingFlap = Math.sin(this.animTick * 0.35) > 0 ? -2 : 2;
      ctx.fillStyle = PALETTE.playerNoDash;
      ctx.fillRect(rx - 3, ry + 3 + wingFlap, 3, 3);
      ctx.fillRect(rx + this.w, ry + 3 + wingFlap, 3, 3);

      ctx.fillStyle = PALETTE.enemyFlyer;
      ctx.fillRect(rx + 1, ry + 1, this.w - 2, this.h - 2);
      ctx.fillStyle = "#273c75";
      ctx.fillRect(rx + 2, ry + this.h - 2, this.w - 4, 2);

      ctx.fillStyle = PALETTE.swordGlow;
      ctx.fillRect(rx + 3, ry + 3, 4, 3);
      return;
    }

    const bounce = Math.sin(this.animTick * 0.22) > 0.3 ? 1 : 0;
    const isCharger = this.type === "charger";

    // Animated legs
    ctx.fillStyle = "#1e272e";
    const step = Math.floor(this.animTick / 5) % 2;
    ctx.fillRect(rx + 1 + step, ry + this.h - 2, 2, 2);
    ctx.fillRect(rx + this.w - 3 - step, ry + this.h - 2, 2, 2);

    // Armored body
    ctx.fillStyle = isCharger ? PALETTE.enemyCharger : PALETTE.enemyBody;
    ctx.fillRect(rx, ry + bounce, this.w, this.h - 2 - bounce);

    // Horns / Crown
    ctx.fillStyle = isCharger ? PALETTE.swordGlow : PALETTE.enemyEye;
    ctx.fillRect(rx + 1, ry - 2 + bounce, 2, 2);
    ctx.fillRect(rx + this.w - 3, ry - 2 + bounce, 2, 2);

    // Visor & Eye
    ctx.fillStyle = PALETTE.white;
    const eyeOffset = this.dir === 1 ? 5 : 1;
    ctx.fillRect(rx + eyeOffset, ry + 3 + bounce, 4, 2);
    ctx.fillStyle = PALETTE.enemyEye;
    ctx.fillRect(rx + eyeOffset + (this.dir === 1 ? 2 : 0), ry + 3 + bounce, 2, 2);

    // Aggro alert spark above Charger
    if (isCharger && this.aggro && this.animTick % 6 < 3) {
      ctx.fillStyle = PALETTE.swordGlow;
      ctx.fillRect(rx + 4, ry - 6, 2, 3);
    }
  }
}
