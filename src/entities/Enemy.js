import { PLAYER_CONFIG, VIEWPORT } from "../config/constants.js";
import { PALETTE } from "../config/palette.js";
import { PhysicsBody } from "../core/PhysicsBody.js";

export class Enemy extends PhysicsBody {
  constructor(x, y, type = "patrol", customHeight = null) {
    const isGate = type === "gate" || type === "keygate";
    const h = isGate ? customHeight || 24 : type === "duelist" || type === "mage" ? 12 : 10;
    super(x, y, isGate ? 8 : 10, h);
    this.type = type;
    this.isDummy = isGate;
    this.isKeyGate = type === "keygate";
    this.isFlyer = type === "flyer";

    if (this.isKeyGate) {
      this.hp = 999;
    } else if (isGate) {
      this.hp = 3;
    } else if (type === "charger" || type === "duelist") {
      this.hp = 4;
    } else if (type === "mage") {
      this.hp = 3;
    } else {
      this.hp = 2;
    }

    this.maxHp = this.hp;
    this.dir = -1;
    this.baseX = x;
    this.baseY = y;
    this.flashTimer = 0;
    this.knockbackTimer = 0;
    this.aggro = false;
    this.dead = false;
    this.animTick = Math.floor(Math.random() * 30);

    this.aiState = "PATROL";
    this.aiTimer = 0;
    this.attackCooldown = 25 + Math.floor(Math.random() * 25);
    this.projectiles = [];
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

  spawnProjectile(vx, vy, color = PALETTE.enemyEye, life = 85) {
    this.projectiles.push({
      x: this.x + this.w / 2 - 2,
      y: this.y + this.h / 2 - 2,
      w: 5,
      h: 5,
      vx,
      vy,
      color,
      life
    });
  }

  updateProjectiles(level, game) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      if (this.animTick % 3 === 0 && game) {
        game.particles.spawn(p.x + 2, p.y + 2, 0, 0, p.color, 1, 6, 0);
      }

      if (p.life <= 0 || level.collideSolid(p.x, p.y, p.w, p.h)) {
        this.projectiles.splice(i, 1);
      }
    }
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

    if (
      this.type === "charger" &&
      this.aiState === "PATROL" &&
      dirY === 0 &&
      dirX !== 0 &&
      dirX === -this.dir &&
      damage === 1
    ) {
      this.flashTimer = 3;
      this.vx = dirX * 1.4;
      this.aiState = "WINDUP";
      this.aiTimer = 14;
      game.sound.playHit(false);
      game.camera.shake(3, 5);
      game.particles.spawnHitSpray(this.x + this.w / 2, this.y + this.h / 2, -dirX, -0.3, 10, PALETTE.white);
      game.particles.addFloatingText(this.x - 10, this.y - 8, "GUARD COUNTER!", PALETTE.swordGlow, 24);
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
      this.knockbackTimer = 10;

      if (this.type === "duelist" && this.hp > 0 && this.aiState !== "ATTACK") {
        this.dir = Math.sign(game.player.x - this.x) || this.dir;
        this.aiState = "WINDUP";
        this.aiTimer = 16;
      }
    } else {
      this.knockbackTimer = 4;
    }

    game.hitstop = isFinisher ? 5 : 4;
    game.camera.shake(isFinisher ? 5.5 : 4.5, 8);

    if (this.hp <= 0) {
      this.dead = true;
      this.projectiles.length = 0;
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
    if (this.attackCooldown > 0) this.attackCooldown--;

    this.updateProjectiles(level, player.game);

    if (this.isDummy) return;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (this.isFlyer) {
      if (this.knockbackTimer > 0) {
        this.vx *= 0.85;
        this.vy *= 0.85;
      } else if (this.aiState === "WINDUP") {
        this.vx *= 0.7;
        this.vy *= 0.7;
        this.dir = Math.sign(dx) || 1;
        this.aiTimer--;
        if (this.aiTimer <= 0) {
          const angle = Math.atan2(dy, dx);
          this.spawnProjectile(Math.cos(angle) * 2.1, Math.sin(angle) * 2.1, PALETTE.swordGlow, 75);
          player.game.sound.playWaveCast();
          this.vx = -Math.cos(angle) * 1.1;
          this.aiState = "PATROL";
          this.attackCooldown = 85;
        }
      } else {
        const wallAhead = level.collideSolid(this.x + this.dir * 2, this.y, this.w, this.h);
        if (wallAhead || this.x < 16 || this.x > level.cols * VIEWPORT.TILE - 26) {
          this.dir *= -1;
        }
        this.vx = this.dir * 0.72;
        const targetY = this.baseY + Math.sin(this.animTick * 0.08) * 8;
        this.vy = (targetY - this.y) * 0.15;

        if (absDx < 96 && absDy < 64 && this.attackCooldown <= 0) {
          this.aiState = "WINDUP";
          this.aiTimer = 22;
        }
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

    if (this.type === "mage") {
      this.dir = Math.sign(dx) || 1;
      if (this.knockbackTimer > 0) {
        this.vx *= 0.8;
      } else if (this.aiState === "WINDUP") {
        this.vx = 0;
        this.aiTimer--;
        if (this.aiTimer <= 0) {
          const angle = Math.atan2(dy - 2, dx);
          this.spawnProjectile(Math.cos(angle) * 2.25, Math.sin(angle) * 2.25, PALETTE.soulCyan, 90);
          this.spawnProjectile(
            Math.cos(angle + 0.22) * 1.95,
            Math.sin(angle + 0.22) * 1.95,
            PALETTE.enemyEye,
            90
          );
          player.game.sound.playWaveCast();
          this.aiState = "COOLDOWN";
          this.aiTimer = 30;
          this.attackCooldown = 75;
        }
      } else if (this.aiState === "COOLDOWN") {
        this.vx = 0;
        this.aiTimer--;
        if (this.aiTimer <= 0) {

          if (absDx < 56) {
            const blinkOffsets = [-40, 40, -24, 24];
            for (const off of blinkOffsets) {
              const tx = this.x + off;
              if (
                tx > 16 &&
                tx < level.cols * VIEWPORT.TILE - 24 &&
                !level.collideSolid(tx, this.y, this.w, this.h) &&
                level.collideSolid(tx, this.y + 2, this.w, this.h) &&
                !level.collideSpike(tx, this.y, this.w, this.h)
              ) {
                player.game.particles.spawnBurst(this.x + 5, this.y + 6, PALETTE.soulCyan, PALETTE.white, 10);
                this.x = tx;
                player.game.particles.spawnBurst(this.x + 5, this.y + 6, PALETTE.soulCyan, PALETTE.white, 10);
                break;
              }
            }
          }
          this.aiState = "PATROL";
        }
      } else {
        this.vx *= 0.8;
        if (absDx < 115 && absDy < 56 && this.attackCooldown <= 0) {
          this.aiState = "WINDUP";
          this.aiTimer = 26;
        }
      }

      this.vy = Math.min(3.5, this.vy + 0.22);
      this.moveX(this.vx, level, () => {
        this.vx = 0;
      });
      this.moveY(this.vy, level, () => {
        this.vy = 0;
      });
      return;
    }

    if (this.knockbackTimer > 0) {
      this.vx *= 0.82;
    } else if (this.aiState === "WINDUP") {
      this.vx *= 0.65;
      this.dir = Math.sign(dx) || this.dir;
      this.aiTimer--;
      if (this.aiTimer <= 0) {
        this.aiState = "ATTACK";
        if (this.type === "duelist") {
          this.aiTimer = 14;
          this.vx = this.dir * 3.45;
          this.vy = -0.9;
          player.game.sound.playSwing(2);
        } else if (this.type === "charger") {
          this.aiTimer = 18;
          this.vx = this.dir * 2.85;
          player.game.sound.playDash();
        } else {

          this.aiTimer = 13;
          this.vx = this.dir * 2.35;
          this.vy = -1.5;
          player.game.sound.playSwing(0);
        }
      }
    } else if (this.aiState === "ATTACK") {
      this.aiTimer--;

      const lookAheadX = this.dir === 1 ? this.x + this.w + 2 : this.x - 3;
      const groundAhead = level.collideSolid(lookAheadX, this.y + this.h + 2, 2, 4);
      if (this.onGround && !groundAhead) {
        this.vx = 0;
        this.aiTimer = 0;
      }
      if (this.aiTimer <= 0) {
        this.aiState = "COOLDOWN";
        this.aiTimer = this.type === "duelist" ? 16 : 22;
        this.attackCooldown = this.type === "duelist" ? 36 : 52;
        this.vx *= 0.35;
      }
    } else if (this.aiState === "COOLDOWN") {
      this.vx *= 0.78;
      this.aiTimer--;
      if (this.aiTimer <= 0) {
        this.aiState = "PATROL";
      }
    } else {

      const detectRange = this.type === "duelist" ? 96 : this.type === "charger" ? 92 : 64;
      const strikeRange = this.type === "duelist" ? 58 : this.type === "charger" ? 52 : 42;

      if (absDx < detectRange && absDy < 26) {
        this.aggro = true;
        this.dir = Math.sign(dx) || 1;
        const lookAheadX = this.dir === 1 ? this.x + this.w + 1 : this.x - 2;
        const groundAhead = level.collideSolid(lookAheadX, this.y + this.h + 1, 1, 2);

        if (absDx <= strikeRange && this.attackCooldown <= 0 && groundAhead) {
          this.aiState = "WINDUP";
          this.aiTimer = this.type === "duelist" ? 15 : this.type === "charger" ? 18 : 20;
          this.vx = 0;
        } else if (groundAhead) {
          const chaseSpeed = this.type === "duelist" ? 1.35 : this.type === "charger" ? 1.15 : 0.88;
          this.vx += (this.dir * chaseSpeed - this.vx) * 0.2;
        } else {
          this.vx = 0;
        }
      } else {
        this.aggro = false;
        const lookAheadX = this.dir === 1 ? this.x + this.w + 1 : this.x - 2;
        const groundAhead = level.collideSolid(lookAheadX, this.y + this.h + 1, 1, 2);
        const wallAhead = level.collideSolid(this.x + this.dir, this.y, this.w, this.h);

        if ((this.onGround && !groundAhead) || wallAhead) {
          this.dir *= -1;
        }
        this.vx = this.dir * 0.65;
      }
    }

    this.vy = Math.min(3.5, this.vy + 0.22);

    this.moveX(this.vx, level, () => {
      this.vx = 0;
      if (this.aiState === "PATROL") this.dir *= -1;
    });
    this.moveY(this.vy, level, () => {
      this.vy = 0;
    });

    if (
      level.collideSpike(this.x, this.y, this.w, this.h) ||
      this.y > level.rows * VIEWPORT.TILE + 8
    ) {
      this.takeHit(this.dir, 0, player.game, 4);
    }
  }

  draw(ctx) {
    if (this.dead) return;

    for (const p of this.projectiles) {
      const px = Math.round(p.x);
      const py = Math.round(p.y);
      ctx.fillStyle = p.color;
      ctx.fillRect(px, py, p.w, p.h);
      ctx.fillStyle = PALETTE.white;
      ctx.fillRect(px + 1, py + 1, p.w - 2, p.h - 2);
    }

    const shakeX =
      (this.knockbackTimer > 0 && this.isDummy) || this.aiState === "WINDUP"
        ? this.animTick % 2 === 0
          ? 1
          : -1
        : 0;
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

    if (this.aiState === "WINDUP") {
      ctx.fillStyle = this.animTick % 4 < 2 ? PALETTE.swordGlow : PALETTE.enemyEye;
      ctx.fillRect(rx + 4, ry - 6, 2, 3);
      ctx.fillRect(rx + 4, ry - 2, 2, 1);
    }

    if (this.isFlyer) {
      const wingFlap = Math.sin(this.animTick * 0.35) > 0 ? -2 : 2;
      ctx.fillStyle = this.aiState === "WINDUP" ? PALETTE.swordGlow : PALETTE.playerNoDash;
      ctx.fillRect(rx - 3, ry + 3 + wingFlap, 3, 3);
      ctx.fillRect(rx + this.w, ry + 3 + wingFlap, 3, 3);

      ctx.fillStyle = PALETTE.enemyFlyer;
      ctx.fillRect(rx + 1, ry + 1, this.w - 2, this.h - 2);
      ctx.fillStyle = "#273c75";
      ctx.fillRect(rx + 2, ry + this.h - 2, this.w - 4, 2);

      ctx.fillStyle = this.aiState === "WINDUP" ? PALETTE.white : PALETTE.swordGlow;
      ctx.fillRect(rx + 3, ry + 3, 4, 3);
      return;
    }

    if (this.type === "mage") {
      const hover = Math.round(Math.sin(this.animTick * 0.14) * 1);

      ctx.fillStyle = "#2c224e";
      ctx.fillRect(rx + 1, ry + 2 + hover, this.w - 2, this.h - 2);
      ctx.fillStyle = PALETTE.enemyBody;
      ctx.fillRect(rx + 2, ry + hover, this.w - 4, 4);

      ctx.fillStyle = PALETTE.soulCyan;
      const eyeX = this.dir === 1 ? rx + 5 : rx + 2;
      ctx.fillRect(eyeX, ry + 2 + hover, 3, 2);

      const orbX = this.dir === 1 ? rx + this.w + 1 : rx - 3;
      ctx.fillStyle = this.aiState === "WINDUP" ? PALETTE.white : PALETTE.soulCyan;
      ctx.fillRect(orbX, ry + 3 + hover, 3, 3);
      return;
    }

    if (this.type === "duelist") {
      const crouch = this.aiState === "WINDUP" ? 2 : 0;

      ctx.fillStyle = "#1e272e";
      ctx.fillRect(rx + 2, ry + this.h - 3, 2, 3);
      ctx.fillRect(rx + this.w - 4, ry + this.h - 3, 2, 3);

      ctx.fillStyle = "#20bf6b";
      ctx.fillRect(rx + 1, ry + 2 + crouch, this.w - 2, this.h - 5 - crouch);

      ctx.fillStyle = PALETTE.white;
      ctx.fillRect(rx + 2, ry + crouch, this.w - 4, 3);
      ctx.fillRect(rx + 1, ry - 2 + crouch, 2, 2);
      ctx.fillRect(rx + this.w - 3, ry - 2 + crouch, 2, 2);
      ctx.fillStyle = PALETTE.enemyEye;
      const eyeX = this.dir === 1 ? rx + 5 : rx + 2;
      ctx.fillRect(eyeX, ry + 1 + crouch, 2, 2);

      ctx.fillStyle = this.aiState === "ATTACK" ? PALETTE.white : PALETTE.relicCyan;
      const bladeX = this.dir === 1 ? rx + this.w : rx - 4;
      const bladeW = this.aiState === "ATTACK" ? 7 : 3;
      ctx.fillRect(
        this.dir === 1 ? bladeX : rx - bladeW,
        ry + 4 + crouch,
        bladeW,
        2
      );
      return;
    }

    const bounce = this.aiState === "WINDUP" ? 1 : Math.sin(this.animTick * 0.22) > 0.3 ? 1 : 0;
    const isCharger = this.type === "charger";

    ctx.fillStyle = "#1e272e";
    const step = Math.floor(this.animTick / 5) % 2;
    ctx.fillRect(rx + 1 + step, ry + this.h - 2, 2, 2);
    ctx.fillRect(rx + this.w - 3 - step, ry + this.h - 2, 2, 2);

    ctx.fillStyle = isCharger ? PALETTE.enemyCharger : PALETTE.enemyBody;
    ctx.fillRect(rx, ry + bounce, this.w, this.h - 2 - bounce);

    ctx.fillStyle = isCharger ? PALETTE.swordGlow : PALETTE.enemyEye;
    ctx.fillRect(rx + 1, ry - 2 + bounce, 2, 2);
    ctx.fillRect(rx + this.w - 3, ry - 2 + bounce, 2, 2);

    ctx.fillStyle = PALETTE.white;
    const eyeOffset = this.dir === 1 ? 5 : 1;
    ctx.fillRect(rx + eyeOffset, ry + 3 + bounce, 4, 2);
    ctx.fillStyle = PALETTE.enemyEye;
    ctx.fillRect(rx + eyeOffset + (this.dir === 1 ? 2 : 0), ry + 3 + bounce, 2, 2);

    if (isCharger) {
      const shieldX = this.dir === 1 ? rx + this.w - 1 : rx - 2;
      ctx.fillStyle = PALETTE.swordGlow;
      ctx.fillRect(shieldX, ry + 2 + bounce, 3, 6);
      if (this.aiState === "ATTACK") {
        ctx.fillStyle = PALETTE.white;
        const lanceX = this.dir === 1 ? rx + this.w + 2 : rx - 6;
        ctx.fillRect(lanceX, ry + 4, 4, 2);
      }
    }
  }
}
