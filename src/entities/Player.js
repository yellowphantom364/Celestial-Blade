import { PLAYER_CONFIG, VIEWPORT } from "../config/constants.js";
import { PALETTE } from "../config/palette.js";
import { PhysicsBody } from "../core/PhysicsBody.js";
import { SpriteRenderer } from "../graphics/SpriteRenderer.js";

export class Player extends PhysicsBody {
  constructor(x, y, game) {
    super(x, y, PLAYER_CONFIG.WIDTH, PLAYER_CONFIG.HEIGHT);
    this.game = game;
    this.spawnX = x;
    this.spawnY = y;

    this.maxHp = PLAYER_CONFIG.START_HP;
    this.hp = this.maxHp;
    this.soul = 0;
    this.maxSoul = PLAYER_CONFIG.MAX_SOUL;
    this.keysCollected = 0;

    this.facing = 1;
    this.hasSword = false;
    this.swordShrineClaimed = false;

    this.coyoteTimer = 0;
    this.jumpBuffer = 0;
    this.pogoJumping = false;
    this.wallSliding = false;
    this.wallDir = 0;
    this.wallJumpLock = 0;

    this.canDash = true;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.dashDirX = 0;

    this.attackTimer = 0;
    this.attackMaxTimer = PLAYER_CONFIG.ATTACK_FRAMES;
    this.attackCooldown = 0;
    this.comboStep = 0;
    this.comboResetTimer = 0;
    this.atkDirX = 1;
    this.atkDirY = 0;
    this.swingHitTargets = new Set();
    this.swingDidRecoil = false;
    this.invulnTimer = 0;

    this.skillHoldTimer = 0;
    this.skillConsumedThisHold = false;
    this.focusTimer = 0;
    this.focusFlashTimer = 0;
    this.waves = [];

    this.animTick = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.scarfNodes = Array.from({ length: 5 }, () => ({ x, y }));
  }

  resetToSpawn() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.remX = 0;
    this.remY = 0;
    this.dashTimer = 0;
    this.attackTimer = 0;
    this.skillHoldTimer = 0;
    this.skillConsumedThisHold = false;
    this.focusTimer = 0;
    this.focusFlashTimer = 0;
    this.pogoJumping = false;
    this.wallSliding = false;
    this.canDash = true;
    this.invulnTimer = 24;
    this.waves.length = 0;
    for (const node of this.scarfNodes) {
      node.x = this.x + this.w / 2;
      node.y = this.y + 3;
    }
  }

  addSoul(amount) {
    this.soul = Math.min(this.maxSoul, this.soul + amount);
  }

  takeDamage(amount = 1) {
    if (this.invulnTimer > 0 || this.game.deathSequence.active) return;
    this.hp = Math.max(0, this.hp - amount);
    if (this.focusTimer > 0) {
      this.focusTimer = 0;
      this.skillConsumedThisHold = true;
      this.game.particles.addFloatingText(this.x - 12, this.y - 8, "FOCUS BROKEN!", PALETTE.playerHair, 28);
    }
    if (this.hp <= 0) {
      this.die();
    } else {
      this.invulnTimer = PLAYER_CONFIG.INVULN_HURT_FRAMES;
      this.dashTimer = 0;
      this.vy = -2.2;
      this.vx = -this.facing * 1.6;
      this.game.sound.playHurt();
      this.game.camera.shake(4, 8);
      this.game.hitstop = 3;
      this.game.particles.spawnBurst(
        this.x + 3,
        this.y + 4,
        PALETTE.playerHair,
        PALETTE.white,
        14
      );
    }
  }

  die() {
    if (this.game.deathSequence.active) return;
    this.hp = 0;
    this.focusTimer = 0;
    this.game.startDeathSequence(this.x + this.w / 2, this.y + this.h / 2);
  }

  castAstralWave() {
    this.soul -= PLAYER_CONFIG.SOUL_WAVE_COST;
    this.game.sound.playWaveCast();
    this.game.camera.shake(2.5, 5);
    this.waves.push({
      x: this.facing === 1 ? this.x + this.w : this.x - 10,
      y: this.y + 1,
      w: 10,
      h: 7,
      vx: this.facing * 4.8,
      dir: this.facing,
      life: 36,
      hitSet: new Set()
    });
  }

  completeFocusHeal() {
    this.soul = Math.max(0, this.soul - PLAYER_CONFIG.SOUL_HEAL_COST);
    this.focusTimer = 0;
    this.focusFlashTimer = 18;
    this.skillConsumedThisHold = true;
    this.scaleX = 1.35;
    this.scaleY = 0.72;

    this.game.sound.playHeal();
    this.game.hitstop = 5;
    this.game.camera.shake(3.5, 9);
    this.game.particles.spawnBurst(this.x + 3, this.y + 4, PALETTE.white, PALETTE.soulCyan, 28);
    this.game.particles.addShockwave(this.x + 3, this.y + 4, 26, PALETTE.white, 16);
    this.game.particles.addFloatingText(this.x - 10, this.y - 10, "SOUL FOCUS!", PALETTE.white, 38);

    const targetHeartIndex = Math.min(this.maxHp - 1, this.hp);
    const heartSpan = this.maxHp * 10;
    const hudStartX = VIEWPORT.WIDTH - heartSpan - 6;
    const targetScreenX = hudStartX + targetHeartIndex * 10;
    const targetScreenY = 7;

    const startScreenX = Math.round(this.x - this.game.camera.x);
    const startScreenY = Math.round(this.y - this.game.camera.y);

    this.game.particles.spawnFlyingHeart(
      startScreenX,
      startScreenY,
      targetScreenX,
      targetScreenY,
      () => {
        this.hp = Math.min(this.maxHp, this.hp + 1);
        this.game.sound.playMenuSelect();
        this.game.camera.shake(2, 4);
      }
    );
  }

  getSlashBounds() {
    const px = Math.round(this.x);
    const py = Math.round(this.y);
    const finisherBonus = this.comboStep === 2 ? 6 : 0;

    if (this.atkDirY === -1) {
      return {
        x: px - 8 - finisherBonus / 2,
        y: py - 20 - finisherBonus,
        w: this.w + 16 + finisherBonus,
        h: 22 + finisherBonus
      };
    } else if (this.atkDirY === 1) {
      return {
        x: px - 8,
        y: py + this.h - 2,
        w: this.w + 16,
        h: 22
      };
    } else if (this.atkDirX === 1) {
      return {
        x: px + this.w - 2,
        y: py - 4 - (this.comboStep === 2 ? 2 : 0),
        w: 24 + finisherBonus,
        h: this.h + 8 + (this.comboStep === 2 ? 4 : 0)
      };
    } else {
      return {
        x: px - 22 - finisherBonus,
        y: py - 4 - (this.comboStep === 2 ? 2 : 0),
        w: 24 + finisherBonus,
        h: this.h + 8 + (this.comboStep === 2 ? 4 : 0)
      };
    }
  }

  updateScarf() {
    const anchorX = this.x + (this.facing === 1 ? 1 : this.w - 2);
    const anchorY = this.y + 3;
    this.scarfNodes[0].x = anchorX;
    this.scarfNodes[0].y = anchorY;

    for (let i = 1; i < this.scarfNodes.length; i++) {
      const prev = this.scarfNodes[i - 1];
      const cur = this.scarfNodes[i];
      const windX = -this.facing * 1.3 + Math.sin(this.animTick * 0.15 + i) * 0.35;
      const windY = Math.cos(this.animTick * 0.12 + i) * 0.25;

      cur.x += (prev.x + windX - cur.x) * 0.48;
      cur.y += (prev.y + windY - cur.y) * 0.48;
    }
  }

  updateWaves(level) {
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const w = this.waves[i];
      w.x += w.vx;
      w.life--;

      if (this.animTick % 2 === 0) {
        this.game.particles.spawn(
          w.x + w.w / 2,
          w.y + w.h / 2,
          -w.vx * 0.2,
          (Math.random() - 0.5) * 0.6,
          PALETTE.soulCyan,
          2,
          8,
          0
        );
      }

      for (const enemy of level.enemies) {
        if (enemy.dead || w.hitSet.has(enemy)) continue;
        if (
          w.x < enemy.x + enemy.w &&
          w.x + w.w > enemy.x &&
          w.y < enemy.y + enemy.h &&
          w.y + w.h > enemy.y
        ) {
          w.hitSet.add(enemy);
          enemy.takeHit(w.dir, 0, this.game, 2);
        }
      }

      if (level.boss && !level.boss.dead && !w.hitSet.has(level.boss)) {
        const b = level.boss;
        if (w.x < b.x + b.w && w.x + w.w > b.x && w.y < b.y + b.h && w.y + w.h > b.y) {
          w.hitSet.add(b);
          b.takeHit(w.dir, 0, this.game, 2);
        }
      }

      if (w.life <= 0 || level.collideSolid(w.x, w.y + 2, w.w, w.h - 4)) {
        this.game.particles.spawnBurst(w.x + w.w / 2, w.y + w.h / 2, PALETTE.soulCyan, PALETTE.white, 8);
        this.waves.splice(i, 1);
      }
    }
  }

  update(input, level) {
    this.animTick++;
    if (this.invulnTimer > 0) this.invulnTimer--;
    if (this.dashCooldown > 0) this.dashCooldown--;
    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.wallJumpLock > 0) this.wallJumpLock--;
    if (this.focusFlashTimer > 0) this.focusFlashTimer--;
    if (this.comboResetTimer > 0) {
      this.comboResetTimer--;
      if (this.comboResetTimer === 0) this.comboStep = 0;
    }

    this.scaleX += (1 - this.scaleX) * 0.25;
    this.scaleY += (1 - this.scaleY) * 0.25;

    const wasOnGround = this.onGround;
    this.onGround = level.collideSolid(this.x, this.y + 1, this.w, this.h);

    if (this.onGround) {
      this.coyoteTimer = PLAYER_CONFIG.COYOTE_FRAMES;
      this.pogoJumping = false;
      this.wallSliding = false;
      if (!this.canDash && this.dashTimer <= 0) {
        this.canDash = true;
      }
      if (!wasOnGround && this.vy >= 0) {
        this.scaleX = 1.3;
        this.scaleY = 0.7;
        this.game.particles.spawn(this.x + 1, this.y + this.h, -0.6, -0.2, PALETTE.textBright, 1, 8, 0);
        this.game.particles.spawn(
          this.x + this.w - 1,
          this.y + this.h,
          0.6,
          -0.2,
          PALETTE.textBright,
          1,
          8,
          0
        );
      }
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer--;
    }

    if (this.vy >= 0) {
      this.pogoJumping = false;
    }

    if (input.actionPressed("jump")) {
      this.jumpBuffer = PLAYER_CONFIG.JUMP_BUFFER_FRAMES;
    } else if (this.jumpBuffer > 0) {
      this.jumpBuffer--;
    }

    const rawMove = (input.actionDown("right") ? 1 : 0) - (input.actionDown("left") ? 1 : 0);

    const skillDown = input.actionDown("skill");
    const canStartFocus =
      this.hasSword &&
      this.onGround &&
      this.dashTimer <= 0 &&
      this.attackTimer <= 0 &&
      this.hp < this.maxHp &&
      this.soul >= PLAYER_CONFIG.SOUL_HEAL_COST;

    if (skillDown && this.hasSword) {
      this.skillHoldTimer++;

      if (!this.skillConsumedThisHold && canStartFocus && this.skillHoldTimer >= PLAYER_CONFIG.FOCUS_HOLD_THRESHOLD) {

        this.focusTimer++;
        this.vx = 0;

        if (this.focusTimer === 1) {
          this.game.particles.addFloatingText(this.x - 10, this.y - 8, "FOCUSING...", PALETTE.soulCyan, 22);
        }

        if (this.focusTimer % 5 === 0) {
          const progressRatio = this.focusTimer / PLAYER_CONFIG.FOCUS_CHANNEL_FRAMES;
          this.game.sound.playFocusTick(progressRatio);

          const offsetX = (Math.random() - 0.5) * 18;
          const offsetY = (Math.random() - 0.5) * 14;
          this.game.particles.spawn(
            this.x + this.w / 2 + offsetX,
            this.y + this.h / 2 + offsetY,
            -offsetX * 0.08,
            -0.45 - Math.random() * 0.4,
            this.focusTimer % 10 === 0 ? PALETTE.white : PALETTE.soulCyan,
            2,
            14,
            -0.01,
            0.95
          );
        }

        if (input.actionPressed("jump") || input.actionPressed("dash") || input.actionPressed("attack") || !this.onGround) {
          this.focusTimer = 0;
          this.skillConsumedThisHold = true;
        } else if (this.focusTimer >= PLAYER_CONFIG.FOCUS_CHANNEL_FRAMES) {
          this.completeFocusHeal();
        }
      } else if (!this.skillConsumedThisHold && this.skillHoldTimer === 1 && !canStartFocus) {

        if (this.soul >= PLAYER_CONFIG.SOUL_WAVE_COST) {
          this.castAstralWave();
          this.skillConsumedThisHold = true;
        }
      }
    } else {

      if (
        this.hasSword &&
        !this.skillConsumedThisHold &&
        this.skillHoldTimer > 0 &&
        this.skillHoldTimer < PLAYER_CONFIG.FOCUS_HOLD_THRESHOLD + 6 &&
        this.soul >= PLAYER_CONFIG.SOUL_WAVE_COST
      ) {
        this.castAstralWave();
      }
      this.skillHoldTimer = 0;
      this.skillConsumedThisHold = false;
      this.focusTimer = 0;
    }

    const isFocusing = this.focusTimer > 0;
    const moveInput = isFocusing ? 0 : this.wallJumpLock > 0 ? this.facing : rawMove;
    if (!isFocusing && rawMove !== 0 && this.attackTimer <= 0 && this.wallJumpLock <= 0) {
      this.facing = rawMove;
    }

    if (!isFocusing && input.actionPressed("dash") && this.canDash && this.dashCooldown <= 0) {
      this.canDash = false;
      this.pogoJumping = false;
      this.wallSliding = false;
      this.dashTimer = PLAYER_CONFIG.DASH_FRAMES;
      this.dashCooldown = PLAYER_CONFIG.DASH_COOLDOWN;

      if (rawMove !== 0) this.facing = rawMove;
      this.dashDirX = this.facing;

      this.vx = this.dashDirX * PLAYER_CONFIG.DASH_SPEED;
      this.vy = 0;

      this.scaleX = 1.4;
      this.scaleY = 0.7;

      this.game.sound.playDash();
      this.game.camera.shake(2.5, 5);
      this.game.hitstop = 2;
      this.game.particles.spawnBurst(this.x + 3, this.y + 4, PALETTE.playerNoDash, PALETTE.white, 10);
    }

    if (this.dashTimer > 0) {
      this.dashTimer--;
      this.vx = this.dashDirX * PLAYER_CONFIG.DASH_SPEED;
      this.vy = 0;
      if (this.dashTimer % 2 === 0) {
        this.game.particles.addGhost(this.x, this.y, this.w, this.h, PALETTE.playerNoDash);
      }
      if (this.dashTimer === 0) {
        this.vx *= 0.5;
      }
    } else if (isFocusing) {

      this.vx = 0;
      this.vy = Math.min(PLAYER_CONFIG.MAX_FALL_SPEED, this.vy + PLAYER_CONFIG.GRAVITY_FALL);
    } else {
      const maxRun = PLAYER_CONFIG.MAX_RUN_SPEED;
      const accel = this.onGround ? PLAYER_CONFIG.GROUND_ACCEL : PLAYER_CONFIG.AIR_ACCEL;
      const fric = this.onGround ? PLAYER_CONFIG.GROUND_FRICTION : PLAYER_CONFIG.AIR_FRICTION;

      if (moveInput !== 0) {
        if (Math.sign(this.vx) !== 0 && Math.sign(this.vx) !== moveInput) {
          this.vx += moveInput * (accel * 1.6);
        } else if (Math.abs(this.vx) < maxRun) {
          this.vx = Math.min(maxRun, Math.max(-maxRun, this.vx + moveInput * accel));
        } else {
          this.vx += (moveInput * maxRun - this.vx) * 0.15;
        }
      } else {
        if (Math.abs(this.vx) <= fric) {
          this.vx = 0;
        } else {
          this.vx -= Math.sign(this.vx) * fric;
        }
      }

      this.wallSliding = false;
      this.wallDir = 0;
      if (!this.onGround && this.vy > 0 && rawMove !== 0) {
        if (level.collideSolid(this.x + rawMove, this.y + 1, this.w, this.h - 2)) {
          this.wallSliding = true;
          this.wallDir = rawMove;
          if (this.animTick % 4 === 0) {
            this.game.particles.spawn(
              rawMove === 1 ? this.x + this.w : this.x,
              this.y + 4,
              -rawMove * 0.3,
              -0.3,
              PALETTE.textSubtle,
              1,
              10,
              0.02
            );
          }
        }
      }

      if (this.jumpBuffer > 0) {
        if (this.coyoteTimer > 0) {
          this.vy = PLAYER_CONFIG.JUMP_FORCE;
          this.pogoJumping = false;
          this.jumpBuffer = 0;
          this.coyoteTimer = 0;
          this.onGround = false;
          this.scaleX = 0.72;
          this.scaleY = 1.32;
          this.game.sound.playJump();
          for (let i = 0; i < 5; i++) {
            this.game.particles.spawn(
              this.x + 3,
              this.y + this.h,
              (Math.random() - 0.5) * 1.5,
              -Math.random() * 0.8,
              PALETTE.white,
              2,
              10,
              0.04
            );
          }
        } else if (
          this.wallSliding ||
          level.collideSolid(this.x + 1, this.y + 1, this.w, this.h - 2) ||
          level.collideSolid(this.x - 1, this.y + 1, this.w, this.h - 2)
        ) {
          const wallSide = this.wallDir !== 0
            ? this.wallDir
            : level.collideSolid(this.x + 1, this.y + 1, this.w, this.h - 2)
              ? 1
              : -1;
          this.facing = -wallSide;
          this.vx = -wallSide * PLAYER_CONFIG.WALL_JUMP_VX;
          this.vy = PLAYER_CONFIG.WALL_JUMP_VY;
          this.wallJumpLock = 7;
          this.wallSliding = false;
          this.pogoJumping = false;
          this.jumpBuffer = 0;
          this.scaleX = 0.72;
          this.scaleY = 1.32;
          this.game.sound.playWallJump();
          this.game.particles.spawnBurst(
            wallSide === 1 ? this.x + this.w : this.x,
            this.y + 5,
            PALETTE.white,
            PALETTE.textBright,
            7
          );
        }
      }

      if (!this.pogoJumping && !input.actionDown("jump") && this.vy < -1.0) {
        this.vy *= 0.54;
      }

      const isApex = !this.onGround && Math.abs(this.vy) < 0.65;
      const holdingLift = !this.onGround && this.vy < -0.5 && (input.actionDown("jump") || this.pogoJumping);
      const gravity = isApex
        ? PLAYER_CONFIG.GRAVITY_APEX
        : holdingLift
          ? PLAYER_CONFIG.GRAVITY_HOLD
          : PLAYER_CONFIG.GRAVITY_FALL;
      const maxFall = this.wallSliding ? PLAYER_CONFIG.WALL_SLIDE_MAX_VY : PLAYER_CONFIG.MAX_FALL_SPEED;
      this.vy = Math.min(maxFall, this.vy + gravity);
    }

    if (!isFocusing && this.hasSword && input.actionPressed("attack") && this.attackCooldown <= 0) {
      if (this.comboResetTimer > 0) {
        this.comboStep = (this.comboStep + 1) % 3;
      } else {
        this.comboStep = 0;
      }
      this.comboResetTimer = PLAYER_CONFIG.COMBO_WINDOW_FRAMES;

      this.attackTimer = this.attackMaxTimer;
      this.attackCooldown = PLAYER_CONFIG.ATTACK_COOLDOWN;
      this.swingHitTargets.clear();
      this.swingDidRecoil = false;
      this.game.sound.playSwing(this.comboStep);

      if (input.actionDown("down") && !this.onGround) {
        this.atkDirX = 0;
        this.atkDirY = 1;
      } else if (input.actionDown("up")) {
        this.atkDirX = 0;
        this.atkDirY = -1;
      } else {
        if (rawMove !== 0) this.facing = rawMove;
        this.atkDirX = this.facing;
        this.atkDirY = 0;

        if (this.comboStep === 2 && this.onGround) {
          this.vx = this.facing * 2.1;
          this.game.particles.spawnBurst(
            this.x + this.w / 2,
            this.y + this.h / 2,
            PALETTE.swordCombo,
            PALETTE.white,
            10
          );
        }
      }
    }

    this.moveX(this.vx, level, () => {
      this.vx = 0;
    });
    this.moveY(
      this.vy,
      level,
      () => {
        this.vy = 0;
      },
      true
    );

    this.updateScarf();
    this.updateWaves(level);

    if (this.attackTimer > 0) {
      this.checkActiveSlash(level);
      this.attackTimer--;
    }

    if (this.y > level.rows * VIEWPORT.TILE + 8) {
      this.die();
      return;
    }

    const pogoSavedFromSpikes =
      (this.pogoJumping || (this.swingDidRecoil && this.atkDirY === 1)) && this.vy < 0;
    if (!pogoSavedFromSpikes && level.collideSpike(this.x, this.y, this.w, this.h)) {
      this.takeDamage(1);
      return;
    }

    if (level.pedestal && !this.swordShrineClaimed) {
      const ped = level.pedestal;
      if (
        this.x < ped.x + 12 &&
        this.x + this.w > ped.x - 4 &&
        this.y < ped.y + 12 &&
        this.y + this.h > ped.y - 8
      ) {
        this.swordShrineClaimed = true;
        this.hasSword = true;
        this.addSoul(50);
        this.game.sound.playPickup();
        this.game.hitstop = 6;
        this.game.camera.shake(4, 12);
        this.game.particles.spawnBurst(ped.x + 4, ped.y, PALETTE.swordGlow, PALETTE.white, 30);
        this.game.particles.addShockwave(ped.x + 4, ped.y + 2, 28, PALETTE.swordGlow, 18);
        this.game.particles.addFloatingText(ped.x - 24, ped.y - 10, "CELESTIAL BLADE AWAKENED", PALETTE.swordGlow, 50);
      }
    }

    if (level.checkpoint) {
      const cp = level.checkpoint;
      if (
        this.x < cp.x + 14 &&
        this.x + this.w > cp.x - 6 &&
        this.y < cp.y + 16 &&
        this.y + this.h > cp.y - 16
      ) {
        const needsHealOrBind =
          !cp.activated ||
          this.hp < this.maxHp ||
          this.game.checkpointStage !== level.currentIndex;

        if (needsHealOrBind) {
          cp.activated = true;
          this.spawnX = cp.x;
          this.spawnY = cp.y - 1;
          this.hp = this.maxHp;
          this.addSoul(40);
          this.game.bindCheckpoint(level.currentIndex, cp.x, cp.y - 1);
          this.game.sound.playCheckpoint();
          this.game.camera.shake(3, 8);
          this.game.particles.spawnBurst(cp.x + 4, cp.y, PALETTE.playerNoDash, PALETTE.white, 26);
          this.game.particles.addShockwave(cp.x + 4, cp.y, 26, PALETTE.playerNoDash, 16);
          this.game.particles.addFloatingText(
            cp.x - 22,
            cp.y - 10,
            "SHRINE ATTUNED - HP RESTORED",
            PALETTE.playerNoDash,
            46
          );
        }
      }
    }

    for (const r of level.relics) {
      if (!r.collected) {
        if (
          this.x < r.x + 10 &&
          this.x + this.w > r.x - 2 &&
          this.y < r.y + 10 &&
          this.y + this.h > r.y - 2
        ) {
          r.collected = true;
          this.addSoul(35);
          this.game.saveManager.collectRelic(r.id);
          const totalRelics = this.game.saveManager.data.relicsFound.length;
          if (totalRelics >= 3 && this.maxHp < PLAYER_CONFIG.MAX_HP) {
            this.maxHp = PLAYER_CONFIG.MAX_HP;
            this.hp = this.maxHp;
            this.game.particles.addFloatingText(r.x - 24, r.y - 12, "MAX HEARTS UPGRADED!", PALETTE.swordGlow, 55);
          } else {
            this.game.particles.addFloatingText(r.x - 18, r.y - 10, `STAR RELIC ${totalRelics}/5`, PALETTE.relicCyan, 45);
          }
          this.game.sound.playPickup();
          this.game.hitstop = 4;
          this.game.camera.shake(3, 8);
          this.game.particles.spawnBurst(r.x + 4, r.y + 4, PALETTE.relicCyan, PALETTE.white, 24);
        }
      }
    }

    for (const k of level.keys) {
      if (!k.collected) {
        if (
          this.x < k.x + 10 &&
          this.x + this.w > k.x - 2 &&
          this.y < k.y + 10 &&
          this.y + this.h > k.y - 2
        ) {
          k.collected = true;
          this.keysCollected++;
          this.addSoul(20);
          this.game.sound.playKeyPickup();
          this.game.hitstop = 3;
          this.game.camera.shake(3, 6);
          this.game.particles.spawnBurst(k.x + 4, k.y + 4, PALETTE.swordGlow, PALETTE.white, 20);
          this.game.particles.addFloatingText(
            k.x - 12,
            k.y - 8,
            `SANCTUM KEY ${this.keysCollected}/3`,
            PALETTE.swordGlow,
            40
          );
        }
      }
    }

    for (const enemy of level.enemies) {
      if (!enemy.dead && enemy.isKeyGate && this.keysCollected >= 3) {
        if (
          this.x < enemy.x + enemy.w + 6 &&
          this.x + this.w > enemy.x - 6 &&
          this.y < enemy.y + enemy.h &&
          this.y + this.h > enemy.y
        ) {
          enemy.unlockGrandGate(this.game);
        }
      }
    }

    if (this.invulnTimer <= 0 && this.dashTimer <= 0) {
      for (const enemy of level.enemies) {
        if (!enemy.dead && !enemy.isDummy && enemy.knockbackTimer <= 0 && this.intersects(enemy)) {
          this.takeDamage(1);
          return;
        }
        if (enemy.projectiles && enemy.projectiles.length > 0) {
          for (let i = enemy.projectiles.length - 1; i >= 0; i--) {
            const proj = enemy.projectiles[i];
            if (
              this.x < proj.x + proj.w &&
              this.x + this.w > proj.x &&
              this.y < proj.y + proj.h &&
              this.y + this.h > proj.y
            ) {
              enemy.projectiles.splice(i, 1);
              this.takeDamage(1);
              return;
            }
          }
        }
      }
      if (level.boss && !level.boss.dead && this.intersects(level.boss)) {
        this.takeDamage(1);
        return;
      }
      if (level.boss && !level.boss.dead) {
        for (let i = level.boss.projectiles.length - 1; i >= 0; i--) {
          const proj = level.boss.projectiles[i];
          if (
            this.x < proj.x + proj.w &&
            this.x + this.w > proj.x &&
            this.y < proj.y + proj.h &&
            this.y + this.h > proj.y
          ) {
            level.boss.projectiles.splice(i, 1);
            this.takeDamage(1);
            return;
          }
        }
      }
    }
  }

  checkActiveSlash(level) {
    const hb = this.getSlashBounds();
    const isFinisher = this.comboStep === 2;
    const damage = isFinisher ? 2 : 1;
    let hitEnemyThisFrame = false;

    for (const enemy of level.enemies) {
      if (enemy.dead) continue;

      if (enemy.projectiles && enemy.projectiles.length > 0) {
        for (let i = enemy.projectiles.length - 1; i >= 0; i--) {
          const proj = enemy.projectiles[i];
          if (
            hb.x < proj.x + proj.w &&
            hb.x + hb.w > proj.x &&
            hb.y < proj.y + proj.h &&
            hb.y + hb.h > proj.y
          ) {
            enemy.projectiles.splice(i, 1);
            hitEnemyThisFrame = true;
            this.addSoul(16);
            this.invulnTimer = Math.max(this.invulnTimer, PLAYER_CONFIG.INVULN_PARRY_FRAMES);
            this.game.sound.playHit(true);
            this.game.particles.spawnBurst(proj.x + 2, proj.y + 2, PALETTE.soulCyan, PALETTE.white, 12);
            this.game.particles.addFloatingText(proj.x - 8, proj.y - 6, "PARRY!", PALETTE.soulCyan, 24);
          }
        }
      }

      if (this.swingHitTargets.has(enemy)) continue;
      if (
        hb.x < enemy.x + enemy.w &&
        hb.x + hb.w > enemy.x &&
        hb.y < enemy.y + enemy.h &&
        hb.y + hb.h > enemy.y
      ) {
        this.swingHitTargets.add(enemy);
        hitEnemyThisFrame = true;
        enemy.takeHit(this.atkDirX, this.atkDirY, this.game, damage);
        if (isFinisher && !enemy.isDummy) {
          this.game.particles.addFloatingText(
            enemy.x - 10,
            enemy.y - 8,
            "SOLAR FINISHER! 2X",
            PALETTE.swordCombo,
            30
          );
        }
      }
    }

    if (level.boss && !level.boss.dead) {
      const b = level.boss;
      if (
        !this.swingHitTargets.has(b) &&
        hb.x < b.x + b.w &&
        hb.x + hb.w > b.x &&
        hb.y < b.y + b.h &&
        hb.y + hb.h > b.y
      ) {
        this.swingHitTargets.add(b);
        hitEnemyThisFrame = true;
        b.takeHit(this.atkDirX, this.atkDirY, this.game, damage);
        if (isFinisher) {
          this.game.particles.addFloatingText(b.x - 10, b.y - 10, "SOLAR FINISHER! 2X", PALETTE.swordCombo, 30);
        }
      }

      for (let i = b.projectiles.length - 1; i >= 0; i--) {
        const proj = b.projectiles[i];
        if (
          hb.x < proj.x + proj.w &&
          hb.x + hb.w > proj.x &&
          hb.y < proj.y + proj.h &&
          hb.y + hb.h > proj.y
        ) {
          b.projectiles.splice(i, 1);
          hitEnemyThisFrame = true;
          this.addSoul(22);
          this.invulnTimer = Math.max(this.invulnTimer, PLAYER_CONFIG.INVULN_PARRY_FRAMES);
          this.game.sound.playHit(true);
          this.game.particles.spawnBurst(proj.x + 3, proj.y + 3, PALETTE.soulCyan, PALETTE.white, 14);
          this.game.particles.addFloatingText(proj.x - 8, proj.y - 6, "PARRY!", PALETTE.soulCyan, 26);
        }
      }
    }

    let pogoSpike = false;
    if (!this.swingDidRecoil && this.atkDirY === 1 && level.collideSpike(hb.x, hb.y, hb.w, hb.h)) {
      pogoSpike = true;
      this.game.sound.playHit(false);
      this.game.hitstop = Math.max(this.game.hitstop, 3);
      this.game.camera.shake(3.5, 6);
      this.game.particles.spawnHitSpray(this.x + this.w / 2, this.y + this.h + 6, 0, 1, 14);
    }

    if ((hitEnemyThisFrame || pogoSpike) && !this.swingDidRecoil) {
      this.swingDidRecoil = true;
      this.invulnTimer = Math.max(this.invulnTimer, 12);
      this.dashTimer = 0;

      if (this.atkDirY === 1) {
        this.vy = PLAYER_CONFIG.POGO_FORCE;
        this.pogoJumping = true;
        this.canDash = true;
        this.onGround = false;
        this.scaleX = 0.75;
        this.scaleY = 1.32;
      } else if (this.atkDirY === -1) {
        if (this.vy < 0) {
          this.vy = 0.7;
        } else {
          this.vy = Math.min(this.vy + 0.85, 2.2);
        }
      } else {
        this.vx = -this.atkDirX * 1.35;
        if (!this.onGround && this.vy > 0) {
          this.vy = -0.85;
        }
      }
    }
  }

  draw(ctx) {
    SpriteRenderer.drawPlayer(ctx, this);
  }
}
