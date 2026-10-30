import { SoundEngine } from "../audio/SoundEngine.js";
import { GAME_STATE, PLAYER_CONFIG, STAGE_METADATA, VIEWPORT } from "../config/constants.js";
import { Player } from "../entities/Player.js";
import { BackgroundRenderer } from "../graphics/BackgroundRenderer.js";
import { HUDRenderer } from "../ui/HUDRenderer.js";
import { LevelManager } from "../world/LevelManager.js";
import { Camera } from "./Camera.js";
import { InputManager } from "./InputManager.js";
import { ParticleSystem } from "./ParticleSystem.js";
import { SaveManager } from "./SaveManager.js";

/**
 * Primary game coordinator managing the fixed-timestep loop,
 * state transitions, menus, and death/victory sequences.
 */
export class Game {
  constructor(canvas, viewportFrame) {
    this.canvas = canvas;
    this.viewportFrame = viewportFrame;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;

    this.saveManager = new SaveManager();
    this.sound = new SoundEngine(this.saveManager.data.muted);
    this.input = new InputManager(this.sound);
    this.camera = new Camera();
    this.particles = new ParticleSystem();
    this.background = new BackgroundRenderer();
    this.player = new Player(32, 120, this);
    this.level = new LevelManager(this);
    this.hud = new HUDRenderer(this);

    if (this.saveManager.data.relicsFound.length >= 3) {
      this.player.maxHp = PLAYER_CONFIG.MAX_HP;
      this.player.hp = this.player.maxHp;
    }

    this.applyCRTPreference();

    this.state = GAME_STATE.TITLE;
    this.menuIndex = 0;
    this.uiTick = 0;

    this.hitstop = 0;
    this.runFrames = 0;
    this.runDeaths = 0;
    this.victoryDelayTimer = 0;

    this.checkpointStage = null;
    this.checkpointX = 0;
    this.checkpointY = 0;

    this.deathSequence = {
      active: false,
      timer: 0,
      x: 0,
      y: 0,
      shards: [],
      fadeAlpha: 0
    };

    // Preload background stage for title screen ambiance
    this.level.load(this.saveManager.data.lastStagePlayed || 0);

    this.lastTime = performance.now();
    this.accumulator = 0;

    requestAnimationFrame((t) => this.loop(t));
  }

  applyCRTPreference() {
    if (!this.viewportFrame) return;
    if (this.saveManager.data.crtEnabled) {
      this.viewportFrame.classList.add("crt-enabled");
    } else {
      this.viewportFrame.classList.remove("crt-enabled");
    }
  }

  toggleCRT() {
    this.saveManager.data.crtEnabled = !this.saveManager.data.crtEnabled;
    this.saveManager.save();
    this.applyCRTPreference();
    return this.saveManager.data.crtEnabled;
  }

  toggleMute() {
    const muted = this.sound.toggleMute();
    this.saveManager.data.muted = muted;
    this.saveManager.save();
    return muted;
  }

  getTitleMenuItems() {
    const lastStage = this.saveManager.data.lastStagePlayed || 0;
    const meta = STAGE_METADATA[lastStage] || STAGE_METADATA[0];
    return [
      `CONTINUE (CH.${meta.numeral})`,
      "NEW JOURNEY",
      "SELECT CHAPTER",
      "CONTROLS & GUIDE",
      `AUDIO: ${this.sound.muted ? "MUTED" : "ON"}`
    ];
  }

  getPauseMenuItems() {
    return [
      "RESUME GAME",
      "RETRY STAGE",
      "SELECT CHAPTER",
      `AUDIO: ${this.sound.muted ? "MUTED" : "ON"}`,
      `CRT SCANLINES: ${this.saveManager.data.crtEnabled ? "ON" : "OFF"}`,
      "RETURN TO TITLE"
    ];
  }

  startNewJourney() {
    this.runFrames = 0;
    this.runDeaths = 0;
    this.checkpointStage = null;
    this.player.soul = 0;
    this.level.load(0, false);
    this.state = GAME_STATE.PLAYING;
  }

  continueJourney() {
    const stageIdx = this.saveManager.data.lastStagePlayed || 0;
    this.level.load(stageIdx, false);
    this.state = GAME_STATE.PLAYING;
  }

  onBossDefeated() {
    this.victoryDelayTimer = 95;
    this.saveManager.recordVictory(this.runFrames, this.runDeaths);
  }

  startDeathSequence(worldX, worldY) {
    this.deathSequence.active = true;
    this.deathSequence.timer = 0;
    this.deathSequence.x = Math.round(worldX - this.camera.x);
    this.deathSequence.y = Math.round(worldY - this.camera.y);
    this.deathSequence.shards = [];
    this.sound.duckMusic = true;
    this.hitstop = 10;
    this.runDeaths++;
    this.saveManager.recordDeath();
  }

  updateDeathSequence() {
    const ds = this.deathSequence;
    ds.timer++;

    if (ds.timer === 18) {
      this.sound.playHeartCrack();
    }

    if (ds.timer === 40) {
      this.sound.playHeartShatter();
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.4;
        const speed = 1.4 + Math.random() * 2.2;
        ds.shards.push({
          x: ds.x + (i % 2 === 0 ? -2 : 2),
          y: ds.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          size: i % 2 === 0 ? 2 : 3
        });
      }
    }

    if (ds.timer > 40) {
      for (const s of ds.shards) {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.12;
      }
    }

    // Respawn on the current stage (or active checkpoint shrine) rather than wiping progress
    if (ds.timer >= 86) {
      ds.active = false;
      ds.fadeAlpha = 1.0;
      this.sound.duckMusic = false;

      const useCheckpoint = this.checkpointStage === this.level.currentIndex;
      this.level.load(this.level.currentIndex, useCheckpoint);
    }
  }

  updateMenus() {
    this.background.update();

    if (this.state === GAME_STATE.TITLE) {
      const items = this.getTitleMenuItems();
      if (this.input.actionPressed("up")) {
        this.menuIndex = (this.menuIndex - 1 + items.length) % items.length;
        this.sound.playMenuMove();
      } else if (this.input.actionPressed("down")) {
        this.menuIndex = (this.menuIndex + 1) % items.length;
        this.sound.playMenuMove();
      } else if (this.input.actionPressed("confirm")) {
        this.sound.playMenuSelect();
        if (this.menuIndex === 0) {
          this.continueJourney();
        } else if (this.menuIndex === 1) {
          this.startNewJourney();
        } else if (this.menuIndex === 2) {
          this.state = GAME_STATE.STAGE_SELECT;
          this.menuIndex = this.saveManager.data.lastStagePlayed || 0;
        } else if (this.menuIndex === 3) {
          this.state = GAME_STATE.CONTROLS;
        } else if (this.menuIndex === 4) {
          this.toggleMute();
        }
      }
    } else if (this.state === GAME_STATE.STAGE_SELECT) {
      const total = STAGE_METADATA.length;
      if (this.input.actionPressed("up")) {
        this.menuIndex = (this.menuIndex - 1 + total) % total;
        this.sound.playMenuMove();
      } else if (this.input.actionPressed("down")) {
        this.menuIndex = (this.menuIndex + 1) % total;
        this.sound.playMenuMove();
      } else if (this.input.actionPressed("left") || this.input.actionPressed("right")) {
        this.menuIndex = (this.menuIndex + 5) % total;
        this.sound.playMenuMove();
      } else if (this.input.actionPressed("confirm")) {
        if (this.menuIndex <= this.saveManager.data.highestStageUnlocked) {
          this.sound.playMenuSelect();
          this.level.load(this.menuIndex, false);
          this.state = GAME_STATE.PLAYING;
        } else {
          this.sound.playHurt();
        }
      } else if (this.input.actionPressed("pause") || this.input.actionPressed("attack")) {
        this.sound.playMenuMove();
        this.state = GAME_STATE.TITLE;
        this.menuIndex = 0;
      }
    } else if (this.state === GAME_STATE.CONTROLS) {
      if (
        this.input.actionPressed("confirm") ||
        this.input.actionPressed("pause") ||
        this.input.actionPressed("attack")
      ) {
        this.sound.playMenuMove();
        this.state = GAME_STATE.TITLE;
        this.menuIndex = 0;
      }
    } else if (this.state === GAME_STATE.PAUSED) {
      const items = this.getPauseMenuItems();
      if (this.input.actionPressed("pause")) {
        this.sound.playMenuMove();
        this.state = GAME_STATE.PLAYING;
        return;
      }
      if (this.input.actionPressed("up")) {
        this.menuIndex = (this.menuIndex - 1 + items.length) % items.length;
        this.sound.playMenuMove();
      } else if (this.input.actionPressed("down")) {
        this.menuIndex = (this.menuIndex + 1) % items.length;
        this.sound.playMenuMove();
      } else if (this.input.actionPressed("confirm")) {
        this.sound.playMenuSelect();
        if (this.menuIndex === 0) {
          this.state = GAME_STATE.PLAYING;
        } else if (this.menuIndex === 1) {
          const useCheckpoint = this.checkpointStage === this.level.currentIndex;
          this.level.load(this.level.currentIndex, useCheckpoint);
          this.state = GAME_STATE.PLAYING;
        } else if (this.menuIndex === 2) {
          this.state = GAME_STATE.STAGE_SELECT;
          this.menuIndex = this.level.currentIndex;
        } else if (this.menuIndex === 3) {
          this.toggleMute();
        } else if (this.menuIndex === 4) {
          this.toggleCRT();
        } else if (this.menuIndex === 5) {
          this.state = GAME_STATE.TITLE;
          this.menuIndex = 0;
        }
      }
    } else if (this.state === GAME_STATE.VICTORY) {
      const count = 3;
      if (this.input.actionPressed("up")) {
        this.menuIndex = (this.menuIndex - 1 + count) % count;
        this.sound.playMenuMove();
      } else if (this.input.actionPressed("down")) {
        this.menuIndex = (this.menuIndex + 1) % count;
        this.sound.playMenuMove();
      } else if (this.input.actionPressed("confirm")) {
        this.sound.playMenuSelect();
        if (this.menuIndex === 0) {
          this.startNewJourney();
        } else if (this.menuIndex === 1) {
          this.state = GAME_STATE.STAGE_SELECT;
          this.menuIndex = 0;
        } else {
          this.state = GAME_STATE.TITLE;
          this.menuIndex = 0;
        }
      }
    }
  }

  update() {
    this.uiTick++;
    this.input.pollGamepad();

    // Global hotkeys for Mute [M] and CRT Scanline Filter [T]
    if (this.input.actionPressed("mute")) {
      this.toggleMute();
    }
    if (this.input.actionPressed("crt")) {
      this.toggleCRT();
    }

    if (this.state !== GAME_STATE.PLAYING) {
      this.updateMenus();
      this.input.endFrame();
      return;
    }

    if (this.input.actionPressed("pause")) {
      this.sound.playMenuMove();
      this.state = GAME_STATE.PAUSED;
      this.menuIndex = 0;
      this.input.endFrame();
      return;
    }

    if (this.input.actionPressed("retry") && !this.deathSequence.active) {
      const useCheckpoint = this.checkpointStage === this.level.currentIndex;
      this.level.load(this.level.currentIndex, useCheckpoint);
      this.input.endFrame();
      return;
    }

    if (this.deathSequence.fadeAlpha > 0) {
      this.deathSequence.fadeAlpha = Math.max(0, this.deathSequence.fadeAlpha - 0.05);
    }

    if (this.hitstop > 0) {
      this.camera.update(
        this.player,
        this.level.cols * VIEWPORT.TILE,
        this.level.rows * VIEWPORT.TILE
      );
      this.hitstop--;
      this.input.endFrame();
      return;
    }

    if (this.deathSequence.active) {
      this.updateDeathSequence();
      this.input.endFrame();
      return;
    }

    this.runFrames++;

    if (this.victoryDelayTimer > 0) {
      this.victoryDelayTimer--;
      if (this.victoryDelayTimer === 0) {
        this.state = GAME_STATE.VICTORY;
        this.menuIndex = 0;
        this.input.endFrame();
        return;
      }
    }

    this.background.update();
    this.player.update(this.input, this.level);
    this.level.update(this.player);
    this.camera.update(
      this.player,
      this.level.cols * VIEWPORT.TILE,
      this.level.rows * VIEWPORT.TILE
    );
    this.particles.update();
    this.input.endFrame();
  }

  draw() {
    if (this.state === GAME_STATE.PLAYING && this.deathSequence.active) {
      this.hud.drawDeathOverlay(this.ctx, this.deathSequence);
      return;
    }

    this.background.draw(this.ctx, this.camera.x, this.level.currentIndex);

    if (this.state === GAME_STATE.TITLE) {
      this.background.drawMotes(this.ctx, this.level.currentIndex);
      this.hud.drawTitleScreen(this.ctx);
      return;
    }

    if (this.state === GAME_STATE.STAGE_SELECT) {
      this.hud.drawStageSelect(this.ctx);
      return;
    }

    if (this.state === GAME_STATE.CONTROLS) {
      this.hud.drawControlsScreen(this.ctx);
      return;
    }

    if (this.state === GAME_STATE.VICTORY) {
      this.background.drawMotes(this.ctx, 9);
      this.hud.drawVictoryScreen(this.ctx);
      return;
    }

    // Render active game world
    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);

    this.level.draw(this.ctx, this.player);
    this.player.draw(this.ctx);
    this.particles.draw(this.ctx, this.camera.x, this.camera.y);

    this.ctx.restore();

    this.background.drawMotes(this.ctx, this.level.currentIndex);
    this.hud.drawHUD(this.ctx);

    if (this.deathSequence.fadeAlpha > 0) {
      this.ctx.fillStyle = `rgba(0, 0, 0, ${this.deathSequence.fadeAlpha.toFixed(2)})`;
      this.ctx.fillRect(0, 0, VIEWPORT.WIDTH, VIEWPORT.HEIGHT);
    }

    if (this.state === GAME_STATE.PAUSED) {
      this.hud.drawPauseOverlay(this.ctx);
    }
  }

  loop(now) {
    let delta = now - this.lastTime;
    this.lastTime = now;
    if (delta > 100) delta = 100;

    this.accumulator += delta;
    while (this.accumulator >= VIEWPORT.STEP_MS) {
      this.update();
      this.accumulator -= VIEWPORT.STEP_MS;
    }

    this.draw();
    requestAnimationFrame((t) => this.loop(t));
  }
}
