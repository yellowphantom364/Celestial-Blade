(() => {
  "use strict";

  const VIEWPORT = Object.freeze({
    WIDTH: 320,
    HEIGHT: 180,
    TILE: 8,
    FPS: 60,
    STEP_MS: 1000 / 60
  });
  const GAME_STATE = Object.freeze({
    TITLE: "TITLE",
    PLAYING: "PLAYING",
    PAUSED: "PAUSED",
    STAGE_SELECT: "STAGE_SELECT",
    CONTROLS: "CONTROLS",
    VICTORY: "VICTORY"
  });
  const PLAYER_CONFIG = Object.freeze({
    WIDTH: 6,
    HEIGHT: 9,
    MAX_HP: 4,
    START_HP: 3,
    MAX_SOUL: 100,
    SOUL_PER_HIT: 18,
    SOUL_PER_KILL: 25,
    SOUL_WAVE_COST: 45,
    SOUL_HEAL_COST: 60,
    FOCUS_HOLD_THRESHOLD: 10,
    FOCUS_CHANNEL_FRAMES: 48,
    MAX_RUN_SPEED: 1.88,
    GROUND_ACCEL: 0.46,
    AIR_ACCEL: 0.34,
    GROUND_FRICTION: 0.54,
    AIR_FRICTION: 0.22,
    JUMP_FORCE: -3.68,
    POGO_FORCE: -3.58,
    WALL_SLIDE_MAX_VY: 1.15,
    WALL_JUMP_VX: 2.35,
    WALL_JUMP_VY: -3.45,
    GRAVITY_APEX: 0.10,
    GRAVITY_HOLD: 0.155,
    GRAVITY_FALL: 0.235,
    MAX_FALL_SPEED: 3.85,
    COYOTE_FRAMES: 6,
    JUMP_BUFFER_FRAMES: 6,
    CORNER_CORRECTION_PX: 3,
    DASH_SPEED: 4.35,
    DASH_FRAMES: 9,
    DASH_COOLDOWN: 14,
    ATTACK_FRAMES: 8,
    ATTACK_COOLDOWN: 10,
    COMBO_WINDOW_FRAMES: 28,
    INVULN_HURT_FRAMES: 36,
    INVULN_PARRY_FRAMES: 14
  });
  const SHRINE_CHAPTERS = Object.freeze([
    {
      id: "shrine_0",
      stageIndex: 0,
      numeral: "I",
      name: "SILENT PRECIPICE SHRINE",
      subtitle: "AWAKENING ALTAR"
    },
    {
      id: "shrine_4",
      stageIndex: 4,
      numeral: "V",
      name: "CRIMSON BASTION SHRINE",
      subtitle: "CITADEL KEEP ALTAR"
    },
    {
      id: "shrine_10",
      stageIndex: 10,
      numeral: "XI",
      name: "GRAND LABYRINTH SHRINE",
      subtitle: "SANCTUM NEXUS ALTAR"
    }
  ]);
  const STAGE_METADATA = Object.freeze([
    {
      index: 0,
      numeral: "I",
      title: "SILENT PRECIPICE",
      subtitle: "AWAKENING IN THE MIST",
      biome: "precipice",
      hasShrine: true
    },
    {
      index: 1,
      numeral: "II",
      title: "CELESTIAL SHRINE",
      subtitle: "THE ASTRAL BLADE",
      biome: "precipice"
    },
    {
      index: 2,
      numeral: "III",
      title: "FIRST BLOOD",
      subtitle: "WATCHERS OF THE RIDGE",
      biome: "precipice"
    },
    {
      index: 3,
      numeral: "IV",
      title: "WINDWARD CHASM",
      subtitle: "STRIKE UPON THE GALE",
      biome: "spire"
    },
    {
      index: 4,
      numeral: "V",
      title: "CRIMSON BASTION",
      subtitle: "THE IRON CITADEL",
      biome: "spire",
      hasShrine: true
    },
    {
      index: 5,
      numeral: "VI",
      title: "SHATTERED ARCHES",
      subtitle: "ASCENT OF THE SPIRE",
      biome: "spire"
    },
    {
      index: 6,
      numeral: "VII",
      title: "MANTIS CLOISTER",
      subtitle: "BLADES OF THE DUELISTS",
      biome: "spire"
    },
    {
      index: 7,
      numeral: "VIII",
      title: "TWIN CONDUITS",
      subtitle: "TRIAL OF MOMENTUM",
      biome: "labyrinth"
    },
    {
      index: 8,
      numeral: "IX",
      title: "ASTRAL OBSERVATORY",
      subtitle: "SCHOLARS OF THE VOID",
      biome: "labyrinth"
    },
    {
      index: 9,
      numeral: "X",
      title: "SANCTUM THRESHOLD",
      subtitle: "GAUNTLET OF SHADOWS",
      biome: "labyrinth"
    },
    {
      index: 10,
      numeral: "XI",
      title: "THE GRAND LABYRINTH",
      subtitle: "THREE SEALS OF UNION",
      biome: "labyrinth",
      hasShrine: true
    },
    {
      index: 11,
      numeral: "XII",
      title: "ECLIPSE SANCTUM",
      subtitle: "SERAPH VAEL, THE FALLEN WARDEN",
      biome: "eclipse"
    }
  ]);

  const PALETTE = Object.freeze({
    bgDeep: "#0d1021",
    bgMid: "#171c36",
    bgMountain: "#20284e",
    tileFill: "#1a2038",
    tileInner: "#14182b",
    tileEdge: "#3b4978",
    tileHighlight: "#5c75b8",
    spike: "#eb3b5a",
    spikeTip: "#ff7979",
    playerHair: "#ff3864",
    playerNoDash: "#54c6eb",
    playerBody: "#f5f6fa",
    playerCloak: "#3867d6",
    playerCloakDark: "#224292",
    swordGlow: "#fed330",
    swordCombo: "#ff9f1a",
    soulCyan: "#48dbfb",
    soulBright: "#c7ecee",
    enemyBody: "#8854d0",
    enemyCharger: "#b33771",
    enemyFlyer: "#4b7bec",
    enemyEye: "#ff3864",
    bossArmor: "#d1ccc0",
    bossCloak: "#833471",
    bossGold: "#fed330",
    bossCrimson: "#eb3b5a",
    relicCyan: "#7efff5",
    white: "#ffffff",
    textSubtle: "#7c8db5",
    textBright: "#e2e8f0",
    textShadow: "#090a14",
    heartEmpty: "#2c334d"
  });
  const BIOME_THEMES = Object.freeze({
    precipice: {
      skyTop: "#0b0e1d",
      skyBottom: "#141a33",
      moonColor: "#f5f6fa",
      moonGlow: "rgba(84, 198, 235, 0.12)",
      farPeak: "#151b35",
      midPeak: "#1e2749",
      pillarColor: "#12172c",
      tileFill: "#1a2038",
      tileEdge: "#3b4978",
      tileHighlight: "#5c75b8",
      moteColor: "rgba(226, 232, 240, 0.4)"
    },
    spire: {
      skyTop: "#110d24",
      skyBottom: "#1d163b",
      moonColor: "#fed330",
      moonGlow: "rgba(254, 211, 48, 0.11)",
      farPeak: "#1c1638",
      midPeak: "#2a2152",
      pillarColor: "#16112e",
      tileFill: "#211b3a",
      tileEdge: "#4c3f7c",
      tileHighlight: "#7b68c4",
      moteColor: "rgba(254, 211, 48, 0.38)"
    },
    labyrinth: {
      skyTop: "#090c18",
      skyBottom: "#13192e",
      moonColor: "#54c6eb",
      moonGlow: "rgba(84, 198, 235, 0.14)",
      farPeak: "#12182b",
      midPeak: "#1b243f",
      pillarColor: "#0f1425",
      tileFill: "#161d31",
      tileEdge: "#31446b",
      tileHighlight: "#487eb0",
      moteColor: "rgba(84, 198, 235, 0.42)"
    },
    eclipse: {
      skyTop: "#160814",
      skyBottom: "#290e22",
      moonColor: "#eb3b5a",
      moonGlow: "rgba(235, 59, 90, 0.20)",
      farPeak: "#241023",
      midPeak: "#381833",
      pillarColor: "#1c0b1b",
      tileFill: "#241326",
      tileEdge: "#5e2a55",
      tileHighlight: "#b33771",
      moteColor: "rgba(255, 56, 100, 0.48)"
    }
  });

  const PIXEL_FONT = Object.freeze({
    A: ["010", "101", "111", "101", "101"],
    B: ["110", "101", "110", "101", "110"],
    C: ["011", "100", "100", "100", "011"],
    D: ["110", "101", "101", "101", "110"],
    E: ["111", "100", "110", "100", "111"],
    F: ["111", "100", "110", "100", "100"],
    G: ["011", "100", "101", "101", "011"],
    H: ["101", "101", "111", "101", "101"],
    I: ["111", "010", "010", "010", "111"],
    J: ["001", "001", "001", "101", "010"],
    K: ["101", "101", "110", "101", "101"],
    L: ["100", "100", "100", "100", "111"],
    M: ["10001", "11011", "10101", "10001", "10001"],
    N: ["1001", "1101", "1011", "1001", "1001"],
    O: ["010", "101", "101", "101", "010"],
    P: ["110", "101", "110", "100", "100"],
    Q: ["010", "101", "101", "011", "001"],
    R: ["110", "101", "110", "101", "101"],
    S: ["011", "100", "010", "001", "110"],
    T: ["111", "010", "010", "010", "010"],
    U: ["101", "101", "101", "101", "111"],
    V: ["101", "101", "101", "101", "010"],
    W: ["10001", "10001", "10101", "11011", "10001"],
    X: ["101", "101", "010", "101", "101"],
    Y: ["101", "101", "010", "010", "010"],
    Z: ["111", "001", "010", "100", "111"],
    0: ["111", "101", "101", "101", "111"],
    1: ["010", "110", "010", "010", "111"],
    2: ["110", "001", "010", "100", "111"],
    3: ["110", "001", "010", "001", "110"],
    4: ["101", "101", "111", "001", "001"],
    5: ["111", "100", "110", "001", "110"],
    6: ["011", "100", "111", "101", "111"],
    7: ["111", "001", "010", "010", "010"],
    8: ["111", "101", "111", "101", "111"],
    9: ["111", "101", "111", "001", "110"],
    "[": ["11", "10", "10", "10", "11"],
    "]": ["11", "01", "01", "01", "11"],
    "(": ["01", "10", "10", "10", "01"],
    ")": ["10", "01", "01", "01", "10"],
    "/": ["001", "001", "010", "100", "100"],
    ">": ["100", "010", "001", "010", "100"],
    "<": ["001", "010", "100", "010", "001"],
    "-": ["000", "000", "111", "000", "000"],
    "+": ["000", "010", "111", "010", "000"],
    "&": ["010", "101", "010", "101", "011"],
    ":": ["0", "1", "0", "1", "0"],
    ".": ["0", "0", "0", "0", "1"],
    ",": ["0", "0", "0", "1", "1"],
    "!": ["1", "1", "1", "0", "1"],
    "?": ["110", "001", "010", "000", "010"],
    "%": ["101", "001", "010", "100", "101"],
    "*": ["101", "010", "111", "010", "101"],
    " ": ["00", "00", "00", "00", "00"]
  });
  function measurePixelText(text, scale = 1) {
    const str = String(text).toUpperCase();
    let width = 0;
    for (let i = 0; i < str.length; i++) {
      const glyph = PIXEL_FONT[str[i]] || PIXEL_FONT[" "];
      width += (glyph[0].length + 1) * scale;
    }
    return Math.max(0, width - scale);
  }
  function drawPixelText(
    ctx,
    text,
    x,
    y,
    color = PALETTE.textBright,
    shadowColor = PALETTE.textShadow,
    scale = 1
  ) {
    const str = String(text).toUpperCase();
    let cursorX = Math.round(x);
    const startY = Math.round(y);
  
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const glyph = PIXEL_FONT[ch] || PIXEL_FONT[" "];
      const gw = glyph[0].length;
  
      if (shadowColor) {
        ctx.fillStyle = shadowColor;
        for (let r = 0; r < 5; r++) {
          const row = glyph[r];
          for (let c = 0; c < gw; c++) {
            if (row[c] === "1") {
              ctx.fillRect(cursorX + c * scale + 1, startY + r * scale + 1, scale, scale);
            }
          }
        }
      }
  
      ctx.fillStyle = color;
      for (let r = 0; r < 5; r++) {
        const row = glyph[r];
        for (let c = 0; c < gw; c++) {
          if (row[c] === "1") {
            ctx.fillRect(cursorX + c * scale, startY + r * scale, scale, scale);
          }
        }
      }
  
      cursorX += (gw + 1) * scale;
    }
  }
  function drawPixelTextCentered(
    ctx,
    text,
    centerX,
    y,
    color = PALETTE.textBright,
    shadowColor = PALETTE.textShadow,
    scale = 1
  ) {
    const w = measurePixelText(text, scale);
    drawPixelText(ctx, text, Math.round(centerX - w / 2), y, color, shadowColor, scale);
  }

  const STORAGE_KEY = "celestial_blade_save_v2";
  
  const DEFAULT_SAVE = {
    highestStageUnlocked: 0,
    lastStagePlayed: 0,
    lastShrineStage: 0,
    unlockedShrines: [0],
    bestTimeFrames: null,
    lowestDeaths: null,
    relicsFound: [],
    totalDeaths: 0,
    totalKills: 0,
    muted: false,
    crtEnabled: false
  };
  class SaveManager {
    constructor() {
      this.data = this.load();
    }
  
    load() {
      try {
        const raw =
          window.localStorage.getItem(STORAGE_KEY) ||
          window.localStorage.getItem("celestial_blade_save_v1");
        if (!raw) return { ...DEFAULT_SAVE, relicsFound: [], unlockedShrines: [0] };
        const parsed = JSON.parse(raw);
        const unlockedShrines = Array.isArray(parsed.unlockedShrines)
          ? parsed.unlockedShrines
          : [0];
        if (!unlockedShrines.includes(0)) unlockedShrines.unshift(0);
        return {
          ...DEFAULT_SAVE,
          ...parsed,
          relicsFound: Array.isArray(parsed.relicsFound) ? parsed.relicsFound : [],
          unlockedShrines
        };
      } catch {
        return { ...DEFAULT_SAVE, relicsFound: [], unlockedShrines: [0] };
      }
    }
  
    save() {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch {
  
      }
    }
  
    unlockStage(stageIndex) {
      if (stageIndex > this.data.highestStageUnlocked) {
        this.data.highestStageUnlocked = stageIndex;
      }
      this.data.lastStagePlayed = stageIndex;
      this.save();
    }
  
    unlockShrine(stageIndex) {
      if (!this.data.unlockedShrines.includes(stageIndex)) {
        this.data.unlockedShrines.push(stageIndex);
        this.data.unlockedShrines.sort((a, b) => a - b);
      }
      this.data.lastShrineStage = stageIndex;
      this.save();
    }
  
    hasShrine(stageIndex) {
      return this.data.unlockedShrines.includes(stageIndex);
    }
  
    collectRelic(relicId) {
      if (!this.data.relicsFound.includes(relicId)) {
        this.data.relicsFound.push(relicId);
        this.save();
        return true;
      }
      return false;
    }
  
    hasRelic(relicId) {
      return this.data.relicsFound.includes(relicId);
    }
  
    recordDeath() {
      this.data.totalDeaths++;
      this.save();
    }
  
    recordKill() {
      this.data.totalKills++;
      this.save();
    }
  
    recordVictory(runTimeFrames, runDeaths) {
      if (this.data.bestTimeFrames === null || runTimeFrames < this.data.bestTimeFrames) {
        this.data.bestTimeFrames = runTimeFrames;
      }
      if (this.data.lowestDeaths === null || runDeaths < this.data.lowestDeaths) {
        this.data.lowestDeaths = runDeaths;
      }
      this.data.highestStageUnlocked = 11;
      this.save();
    }
  
    resetProgress() {
      const { muted, crtEnabled } = this.data;
      this.data = {
        ...DEFAULT_SAVE,
        relicsFound: [],
        unlockedShrines: [0],
        muted,
        crtEnabled
      };
      this.save();
    }
  }

  const ACTION_BINDINGS = Object.freeze({
    left: ["ArrowLeft", "KeyA"],
    right: ["ArrowRight", "KeyD"],
    up: ["ArrowUp", "KeyW"],
    down: ["ArrowDown", "KeyS"],
    jump: ["KeyZ", "Space", "KeyK"],
    attack: ["KeyX", "KeyJ"],
    dash: ["KeyC", "ShiftLeft", "ShiftRight", "KeyL"],
    skill: ["KeyV", "KeyF", "KeyU", "KeyI"],
    pause: ["Escape", "KeyP"],
    mute: ["KeyM"],
    retry: ["KeyR"],
    crt: ["KeyT"],
    confirm: ["Enter", "KeyZ", "Space", "KeyJ"]
  });
  
  const PREVENT_DEFAULT_CODES = new Set([
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Space",
    "KeyZ",
    "KeyX",
    "KeyC",
    "KeyV"
  ]);
  class InputManager {
    constructor(soundEngine) {
      this.soundEngine = soundEngine;
      this.keys = Object.create(null);
      this.justPressed = Object.create(null);
      this.prevPadButtons = Object.create(null);
  
      window.addEventListener("keydown", (e) => {
        if (this.soundEngine) {
          this.soundEngine.unlock();
        }
        const code = e.code;
        if (PREVENT_DEFAULT_CODES.has(code)) {
          e.preventDefault();
        }
        if (!this.keys[code]) {
          this.justPressed[code] = true;
        }
        this.keys[code] = true;
      });
  
      window.addEventListener("keyup", (e) => {
        this.keys[e.code] = false;
      });
  
      window.addEventListener("blur", () => {
        this.keys = Object.create(null);
        this.justPressed = Object.create(null);
      });
    }
  
    pollGamepad() {
      if (!navigator.getGamepads) return;
      const pads = navigator.getGamepads();
      const pad = pads && pads[0];
      if (!pad) return;
  
      const mapBtn = (idx, virtualCode) => {
        const pressed = !!(pad.buttons[idx] && pad.buttons[idx].pressed);
        if (pressed && !this.prevPadButtons[virtualCode]) {
          this.justPressed[virtualCode] = true;
        }
        this.keys[virtualCode] = pressed;
        this.prevPadButtons[virtualCode] = pressed;
      };
  
      mapBtn(0, "PadJump");
      mapBtn(2, "PadAttack");
      mapBtn(1, "PadDash");
      mapBtn(3, "PadSkill");
      mapBtn(9, "PadPause");
      mapBtn(12, "PadUp");
      mapBtn(13, "PadDown");
      mapBtn(14, "PadLeft");
      mapBtn(15, "PadRight");
  
      const axX = pad.axes[0] || 0;
      const axY = pad.axes[1] || 0;
      this.keys.StickLeft = axX < -0.4;
      this.keys.StickRight = axX > 0.4;
      this.keys.StickUp = axY < -0.4;
      this.keys.StickDown = axY > 0.4;
    }
  
    isDown(code) {
      return !!this.keys[code];
    }
  
    pressed(code) {
      return !!this.justPressed[code];
    }
  
    actionDown(action) {
      const codes = ACTION_BINDINGS[action];
      if (!codes) return false;
      for (let i = 0; i < codes.length; i++) {
        if (this.keys[codes[i]]) return true;
      }
      if (action === "left" && (this.keys.PadLeft || this.keys.StickLeft)) return true;
      if (action === "right" && (this.keys.PadRight || this.keys.StickRight)) return true;
      if (action === "up" && (this.keys.PadUp || this.keys.StickUp)) return true;
      if (action === "down" && (this.keys.PadDown || this.keys.StickDown)) return true;
      if (action === "jump" && this.keys.PadJump) return true;
      if (action === "attack" && this.keys.PadAttack) return true;
      if (action === "dash" && this.keys.PadDash) return true;
      if (action === "skill" && this.keys.PadSkill) return true;
      return false;
    }
  
    actionPressed(action) {
      const codes = ACTION_BINDINGS[action];
      if (!codes) return false;
      for (let i = 0; i < codes.length; i++) {
        if (this.justPressed[codes[i]]) return true;
      }
      if (action === "jump" && this.justPressed.PadJump) return true;
      if (action === "attack" && this.justPressed.PadAttack) return true;
      if (action === "dash" && this.justPressed.PadDash) return true;
      if (action === "skill" && this.justPressed.PadSkill) return true;
      if (action === "pause" && this.justPressed.PadPause) return true;
      if (action === "up" && this.justPressed.PadUp) return true;
      if (action === "down" && this.justPressed.PadDown) return true;
      if (action === "left" && this.justPressed.PadLeft) return true;
      if (action === "right" && this.justPressed.PadRight) return true;
      if (action === "confirm" && this.justPressed.PadJump) return true;
      return false;
    }
  
    endFrame() {
      this.justPressed = Object.create(null);
    }
  }

  class Camera {
    constructor() {
      this.x = 0;
      this.y = 0;
      this.scrollX = 0;
      this.scrollY = 0;
      this.lookAheadX = 0;
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeMag = 0;
      this.shakeTimer = 0;
    }
  
    shake(magnitude, frames) {
      this.shakeMag = Math.max(this.shakeMag, magnitude);
      this.shakeTimer = Math.max(this.shakeTimer, frames);
    }
  
    snapTo(target, mapWidth, mapHeight) {
      const maxX = Math.max(0, mapWidth - VIEWPORT.WIDTH);
      const maxY = Math.max(0, mapHeight - VIEWPORT.HEIGHT);
      this.lookAheadX = (target.facing || 1) * 14;
      this.scrollX = Math.max(
        0,
        Math.min(maxX, target.x + target.w / 2 + this.lookAheadX - VIEWPORT.WIDTH / 2)
      );
      this.scrollY = Math.max(
        0,
        Math.min(maxY, target.y + target.h / 2 - VIEWPORT.HEIGHT / 2)
      );
      this.x = Math.round(this.scrollX);
      this.y = Math.round(this.scrollY);
    }
  
    update(target, mapWidth = VIEWPORT.WIDTH, mapHeight = VIEWPORT.HEIGHT) {
      if (target) {
        const maxX = Math.max(0, mapWidth - VIEWPORT.WIDTH);
        const maxY = Math.max(0, mapHeight - VIEWPORT.HEIGHT);
        const targetLookAhead = (target.facing || 1) * 16;
        this.lookAheadX += (targetLookAhead - this.lookAheadX) * 0.08;
  
        const desiredX = Math.max(
          0,
          Math.min(maxX, target.x + target.w / 2 + this.lookAheadX - VIEWPORT.WIDTH / 2)
        );
        const desiredY = Math.max(
          0,
          Math.min(maxY, target.y + target.h / 2 - VIEWPORT.HEIGHT / 2)
        );
  
        this.scrollX += (desiredX - this.scrollX) * 0.15;
        this.scrollY += (desiredY - this.scrollY) * 0.15;
      }
  
      if (this.shakeTimer > 0) {
        this.shakeTimer--;
        const decay = this.shakeTimer / 10;
        const currentMag = this.shakeMag * Math.min(1, decay);
        this.shakeX = Math.round((Math.random() * 2 - 1) * currentMag);
        this.shakeY = Math.round((Math.random() * 2 - 1) * currentMag);
      } else {
        this.shakeX = 0;
        this.shakeY = 0;
        this.shakeMag = 0;
      }
  
      this.x = Math.round(this.scrollX) + this.shakeX;
      this.y = Math.round(this.scrollY) + this.shakeY;
    }
  }

  class PhysicsBody {
    constructor(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.vx = 0;
      this.vy = 0;
      this.remX = 0;
      this.remY = 0;
      this.onGround = false;
    }
  
    intersects(other) {
      return (
        this.x < other.x + other.w &&
        this.x + this.w > other.x &&
        this.y < other.y + other.h &&
        this.y + this.h > other.y
      );
    }
  
    moveX(amount, level, onCollide) {
      this.remX += amount;
      let move = Math.round(this.remX);
      if (move !== 0) {
        this.remX -= move;
        const sign = Math.sign(move);
        while (move !== 0) {
          if (!level.collideSolid(this.x + sign, this.y, this.w, this.h)) {
            this.x += sign;
            move -= sign;
          } else {
            if (onCollide) onCollide(sign);
            break;
          }
        }
      }
    }
  
    moveY(amount, level, onCollide, allowCornerCorrection = false) {
      this.remY += amount;
      let move = Math.round(this.remY);
      if (move !== 0) {
        this.remY -= move;
        const sign = Math.sign(move);
        while (move !== 0) {
          if (!level.collideSolid(this.x, this.y + sign, this.w, this.h)) {
            this.y += sign;
            move -= sign;
          } else {
  
            if (allowCornerCorrection && sign < 0) {
              let corrected = false;
              const maxNudge = PLAYER_CONFIG.CORNER_CORRECTION_PX;
              for (let nudge = 1; nudge <= maxNudge; nudge++) {
                if (!level.collideSolid(this.x + nudge, this.y + sign, this.w, this.h)) {
                  this.x += nudge;
                  this.y += sign;
                  move -= sign;
                  corrected = true;
                  break;
                }
                if (!level.collideSolid(this.x - nudge, this.y + sign, this.w, this.h)) {
                  this.x -= nudge;
                  this.y += sign;
                  move -= sign;
                  corrected = true;
                  break;
                }
              }
              if (corrected) continue;
            }
            if (onCollide) onCollide(sign);
            break;
          }
        }
      }
    }
  }

  const MINI_HEART = [
    "0110110",
    "1111111",
    "1111111",
    "0111110",
    "0011100",
    "0001000"
  ];
  class ParticleSystem {
    constructor() {
      this.particles = [];
      this.ghosts = [];
      this.floatingTexts = [];
      this.shockwaves = [];
      this.flyingHearts = [];
    }
  
    clear() {
      this.particles.length = 0;
      this.ghosts.length = 0;
      this.floatingTexts.length = 0;
      this.shockwaves.length = 0;
      this.flyingHearts.length = 0;
    }
  
    spawn(x, y, vx, vy, color, size, life, gravity = 0.08, drag = 0.94) {
      this.particles.push({
        x,
        y,
        vx,
        vy,
        color,
        size,
        life,
        maxLife: life,
        gravity,
        drag
      });
    }
  
    spawnHitSpray(x, y, dirX, dirY, count = 14, primaryColor = PALETTE.swordGlow) {
      const baseAngle = Math.atan2(dirY, dirX);
      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 1.15;
        const speed = 1.7 + Math.random() * 3.7;
        const vx = Math.cos(baseAngle + spread) * speed;
        const vy = Math.sin(baseAngle + spread) * speed - 0.45;
        const color =
          i % 3 === 0 ? PALETTE.white : i % 2 === 0 ? primaryColor : PALETTE.playerHair;
        const size = Math.random() > 0.4 ? 2 : 3;
        this.spawn(
          x,
          y,
          vx,
          vy,
          color,
          size,
          12 + Math.floor(Math.random() * 10),
          0.11,
          0.92
        );
      }
    }
  
    spawnBurst(x, y, color1, color2, count = 24) {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
        const speed = 1.0 + Math.random() * 3.3;
        const color = i % 2 === 0 ? color1 : color2;
        this.spawn(
          x,
          y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          color,
          Math.random() > 0.5 ? 2 : 3,
          16 + Math.floor(Math.random() * 14),
          0.09,
          0.94
        );
      }
    }
  
    addGhost(x, y, w, h, color) {
      this.ghosts.push({ x, y, w, h, color, life: 9, maxLife: 9 });
    }
  
    addShockwave(x, y, maxRadius, color = PALETTE.white, life = 14) {
      this.shockwaves.push({ x, y, radius: 2, maxRadius, color, life, maxLife: life });
    }
  
    addFloatingText(x, y, text, color = PALETTE.swordGlow, life = 34) {
      this.floatingTexts.push({
        x,
        y,
        text: String(text),
        color,
        life,
        maxLife: life
      });
    }
  
    spawnFlyingHeart(startScreenX, startScreenY, targetScreenX, targetScreenY, onArrive) {
      this.flyingHearts.push({
        startX: startScreenX,
        startY: startScreenY,
        x: startScreenX,
        y: startScreenY,
        targetX: targetScreenX,
        targetY: targetScreenY,
        ctrlX: (startScreenX + targetScreenX) * 0.5 - 18,
        ctrlY: Math.min(startScreenY, targetScreenY) - 28,
        progress: 0,
        duration: 28,
        trail: [],
        onArrive
      });
    }
  
    update() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.life--;
        if (p.life <= 0) this.particles.splice(i, 1);
      }
  
      for (let i = this.ghosts.length - 1; i >= 0; i--) {
        this.ghosts[i].life--;
        if (this.ghosts[i].life <= 0) this.ghosts.splice(i, 1);
      }
  
      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.life--;
        sw.radius = sw.maxRadius * (1 - sw.life / sw.maxLife);
        if (sw.life <= 0) this.shockwaves.splice(i, 1);
      }
  
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y -= 0.35;
        ft.life--;
        if (ft.life <= 0) this.floatingTexts.splice(i, 1);
      }
  
      for (let i = this.flyingHearts.length - 1; i >= 0; i--) {
        const fh = this.flyingHearts[i];
        fh.progress++;
        const t = Math.min(1, fh.progress / fh.duration);
  
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const inv = 1 - ease;
        fh.x = inv * inv * fh.startX + 2 * inv * ease * fh.ctrlX + ease * ease * fh.targetX;
        fh.y = inv * inv * fh.startY + 2 * inv * ease * fh.ctrlY + ease * ease * fh.targetY;
        fh.trail.push({ x: fh.x, y: fh.y, life: 8 });
        for (let j = fh.trail.length - 1; j >= 0; j--) {
          fh.trail[j].life--;
          if (fh.trail[j].life <= 0) fh.trail.splice(j, 1);
        }
  
        if (fh.progress >= fh.duration) {
          if (fh.onArrive) fh.onArrive();
          this.flyingHearts.splice(i, 1);
        }
      }
    }
  
    draw(ctx, camX = 0, camY = 0) {
      for (const sw of this.shockwaves) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, (sw.life / sw.maxLife) * 0.65);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(Math.round(sw.x), Math.round(sw.y), Math.round(sw.radius), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
  
      for (const g of this.ghosts) {
        if (
          g.x + g.w < camX - 16 ||
          g.x > camX + VIEWPORT.WIDTH + 16 ||
          g.y + g.h < camY - 16 ||
          g.y > camY + VIEWPORT.HEIGHT + 16
        ) {
          continue;
        }
        ctx.globalAlpha = (g.life / g.maxLife) * 0.45;
        ctx.fillStyle = g.color;
        ctx.fillRect(Math.round(g.x), Math.round(g.y), g.w, g.h);
      }
      ctx.globalAlpha = 1;
  
      for (const p of this.particles) {
        if (
          p.x < camX - 16 ||
          p.x > camX + VIEWPORT.WIDTH + 16 ||
          p.y < camY - 16 ||
          p.y > camY + VIEWPORT.HEIGHT + 16
        ) {
          continue;
        }
        const size = p.life < 4 ? Math.max(1, p.size - 1) : p.size;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x - size / 2), Math.round(p.y - size / 2), size, size);
      }
  
      for (const ft of this.floatingTexts) {
        if (ft.life < 8 && ft.life % 2 === 0) continue;
        drawPixelText(ctx, ft.text, Math.round(ft.x), Math.round(ft.y), ft.color, PALETTE.textShadow);
      }
    }
  
    drawScreenSpace(ctx) {
      for (const fh of this.flyingHearts) {
        for (const tr of fh.trail) {
          ctx.fillStyle = tr.life > 4 ? PALETTE.white : PALETTE.soulCyan;
          ctx.fillRect(Math.round(tr.x + 2), Math.round(tr.y + 2), 2, 2);
        }
  
        const hx = Math.round(fh.x);
        const hy = Math.round(fh.y);
  
        ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
        ctx.fillRect(hx - 1, hy - 1, 9, 8);
        for (let r = 0; r < MINI_HEART.length; r++) {
          for (let c = 0; c < 7; c++) {
            if (MINI_HEART[r][c] === "1") {
              ctx.fillStyle = fh.progress % 4 < 2 ? PALETTE.white : PALETTE.playerHair;
              ctx.fillRect(hx + c, hy + r, 1, 1);
            }
          }
        }
      }
    }
  }

  const TRACKS = Object.freeze({
    exploration: {
      stepDuration: 0.145,
      melody: [
        329.63, 0, 392.00, 493.88, 659.25, 0, 587.33, 493.88,
        392.00, 493.88, 587.33, 0, 493.88, 392.00, 329.63, 293.66,
        261.63, 0, 329.63, 392.00, 523.25, 0, 493.88, 392.00,
        293.66, 369.99, 440.00, 587.33, 523.25, 493.88, 392.00, 329.63
      ],
      bass: [
        82.41, 82.41, 164.81, 82.41, 73.42, 73.42, 146.83, 73.42,
        65.41, 65.41, 130.81, 65.41, 61.74, 61.74, 73.42, 82.41
      ],
      drums: [
        "K", "H", "H", "K", "S", "H", "K", "H",
        "K", "K", "H", "H", "S", "H", "K", "S"
      ],
      leadType: "triangle",
      bassType: "sawtooth"
    },
    bastion: {
      stepDuration: 0.13,
      melody: [
        293.66, 349.23, 440.00, 0, 587.33, 523.25, 440.00, 349.23,
        261.63, 329.63, 392.00, 0, 523.25, 493.88, 392.00, 329.63,
        233.08, 293.66, 349.23, 466.16, 587.33, 466.16, 349.23, 293.66,
        220.00, 277.18, 329.63, 440.00, 554.37, 659.25, 554.37, 440.00
      ],
      bass: [
        73.42, 73.42, 146.83, 73.42, 65.41, 65.41, 130.81, 65.41,
        58.27, 58.27, 116.54, 58.27, 55.00, 55.00, 110.00, 69.30
      ],
      drums: [
        "K", "H", "K", "H", "S", "H", "K", "K",
        "K", "H", "K", "H", "S", "K", "S", "H"
      ],
      leadType: "square",
      bassType: "sawtooth"
    },
    labyrinth: {
      stepDuration: 0.135,
      melody: [
        246.94, 293.66, 369.99, 493.88, 0, 440.00, 369.99, 293.66,
        220.00, 261.63, 329.63, 440.00, 0, 392.00, 329.63, 261.63,
        196.00, 246.94, 293.66, 392.00, 493.88, 392.00, 293.66, 246.94,
        185.00, 246.94, 311.13, 369.99, 493.88, 440.00, 369.99, 311.13
      ],
      bass: [
        61.74, 123.47, 61.74, 61.74, 55.00, 110.00, 55.00, 55.00,
        49.00, 98.00, 49.00, 49.00, 46.25, 92.50, 55.00, 61.74
      ],
      drums: [
        "K", "H", "H", "K", "S", "H", "K", "H",
        "K", "H", "K", "K", "S", "H", "H", "S"
      ],
      leadType: "triangle",
      bassType: "sawtooth"
    },
    boss: {
      stepDuration: 0.112,
      melody: [
        329.63, 329.63, 392.00, 493.88, 523.25, 493.88, 392.00, 329.63,
        369.99, 369.99, 440.00, 554.37, 587.33, 554.37, 440.00, 369.99,
        392.00, 493.88, 587.33, 659.25, 783.99, 659.25, 587.33, 493.88,
        311.13, 392.00, 466.16, 622.25, 740.00, 622.25, 493.88, 392.00
      ],
      bass: [
        82.41, 82.41, 164.81, 82.41, 92.50, 92.50, 185.00, 92.50,
        98.00, 98.00, 196.00, 98.00, 77.78, 77.78, 155.56, 82.41
      ],
      drums: [
        "K", "H", "K", "H", "S", "K", "H", "K",
        "K", "K", "H", "K", "S", "H", "S", "K"
      ],
      leadType: "sawtooth",
      bassType: "sawtooth"
    }
  });
  class SoundEngine {
    constructor(initialMuted = false) {
      this.ctx = null;
      this.masterGain = null;
      this.noiseBuffer = null;
      this.musicStarted = false;
      this.muted = initialMuted;
      this.duckMusic = false;
      this.currentTrackKey = "exploration";
      this.musicStep = 0;
      this.musicTimer = null;
    }
  
    unlock() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.muted ? 0 : 1;
        this.masterGain.connect(this.ctx.destination);
        this.createNoiseBuffer();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      if (this.ctx && !this.musicStarted) {
        this.startMusicLoop();
      }
    }
  
    setMuted(muted) {
      this.muted = !!muted;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1, this.ctx.currentTime);
      }
      return this.muted;
    }
  
    toggleMute() {
      return this.setMuted(!this.muted);
    }
  
    setTrack(trackKey) {
      if (TRACKS[trackKey] && this.currentTrackKey !== trackKey) {
        this.currentTrackKey = trackKey;
        this.musicStep = 0;
        if (this.musicStarted) {
          this.startMusicLoop();
        }
      }
    }
  
    triggerDrum(type, now) {
      if (!this.ctx || !this.masterGain) return;
      if (type === "K") {
  
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(135, now);
        osc.frequency.exponentialRampToValueAtTime(34, now + 0.11);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.12);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === "S") {
  
        const osc = this.ctx.createOscillator();
        const oGain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(195, now);
        osc.frequency.exponentialRampToValueAtTime(85, now + 0.07);
        oGain.gain.setValueAtTime(0.09, now);
        oGain.gain.exponentialRampToValueAtTime(0.004, now + 0.075);
        osc.connect(oGain);
        oGain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.075);
  
        if (this.noiseBuffer) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = "highpass";
          filter.frequency.setValueAtTime(1100, now);
          const nGain = this.ctx.createGain();
          nGain.gain.setValueAtTime(0.085, now);
          nGain.gain.exponentialRampToValueAtTime(0.003, now + 0.09);
          noise.connect(filter);
          filter.connect(nGain);
          nGain.connect(this.masterGain);
          noise.start(now);
          noise.stop(now + 0.09);
        }
      } else if (type === "H" && this.noiseBuffer) {
  
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.setValueAtTime(5200, now);
        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.032, now);
        nGain.gain.exponentialRampToValueAtTime(0.002, now + 0.035);
        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(this.masterGain);
        noise.start(now);
        noise.stop(now + 0.035);
      }
    }
  
    startMusicLoop() {
      this.musicStarted = true;
      if (this.musicTimer) {
        clearInterval(this.musicTimer);
      }
  
      const track = TRACKS[this.currentTrackKey] || TRACKS.exploration;
      const stepDuration = track.stepDuration;
  
      this.musicTimer = setInterval(() => {
        if (!this.ctx || this.ctx.state !== "running") return;
        if (this.muted || this.duckMusic) return;
  
        const activeTrack = TRACKS[this.currentTrackKey] || TRACKS.exploration;
        const dur = activeTrack.stepDuration;
        const now = this.ctx.currentTime;
        const step = this.musicStep++;
  
        const drumHit = activeTrack.drums[step % activeTrack.drums.length];
        if (drumHit) {
          this.triggerDrum(drumHit, now);
        }
  
        if (step % 2 === 0) {
          const bassFreq = activeTrack.bass[Math.floor(step / 2) % activeTrack.bass.length];
          if (bassFreq) {
            const bOsc = this.ctx.createOscillator();
            const bFilter = this.ctx.createBiquadFilter();
            const bGain = this.ctx.createGain();
            bOsc.type = activeTrack.bassType || "sawtooth";
            bOsc.frequency.setValueAtTime(bassFreq, now);
            bFilter.type = "lowpass";
            bFilter.frequency.setValueAtTime(420, now);
            bFilter.frequency.exponentialRampToValueAtTime(140, now + dur * 1.8);
            bGain.gain.setValueAtTime(0.075, now);
            bGain.gain.exponentialRampToValueAtTime(0.005, now + dur * 1.9);
            bOsc.connect(bFilter);
            bFilter.connect(bGain);
            bGain.connect(this.masterGain);
            bOsc.start(now);
            bOsc.stop(now + dur * 1.95);
          }
        }
  
        const leadFreq = activeTrack.melody[step % activeTrack.melody.length];
        if (leadFreq && leadFreq > 0) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = activeTrack.leadType;
          osc.frequency.setValueAtTime(leadFreq, now);
          const peakGain =
            activeTrack.leadType === "sawtooth" || activeTrack.leadType === "square"
              ? 0.026
              : 0.04;
          gain.gain.setValueAtTime(peakGain, now);
          gain.gain.exponentialRampToValueAtTime(0.002, now + dur * 0.92);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + dur * 0.96);
        }
      }, stepDuration * 1000);
    }
  
    createNoiseBuffer() {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.5);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
    }
  
    canPlay() {
      return !!(this.ctx && this.masterGain && !this.muted);
    }
  
    playMenuMove() {
      if (!this.canPlay()) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.045);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.045);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.045);
    }
  
    playMenuSelect() {
      if (!this.canPlay()) return;
      const now = this.ctx.currentTime;
      [523.25, 783.99].forEach((freq, i) => {
        const t = now + i * 0.045;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.005, t + 0.09);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.09);
      });
    }
  
    playJump() {
      if (!this.canPlay()) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(165, now);
      osc.frequency.exponentialRampToValueAtTime(490, now + 0.11);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.11);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.11);
    }
  
    playWallJump() {
      if (!this.canPlay()) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  
    playDash() {
      if (!this.canPlay()) return;
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1250, now);
      filter.frequency.exponentialRampToValueAtTime(280, now + 0.14);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.14);
    }
  
    playSwing(comboStep = 0) {
      if (!this.canPlay()) return;
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(850 + comboStep * 260, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15 + comboStep * 0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.08);
  
      if (comboStep === 2) {
        const osc = this.ctx.createOscillator();
        const oGain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.11);
        oGain.gain.setValueAtTime(0.12, now);
        oGain.gain.exponentialRampToValueAtTime(0.005, now + 0.11);
        osc.connect(oGain);
        oGain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.11);
      }
    }
  
    playHit(isFinisher = false) {
      if (!this.canPlay()) return;
      const now = this.ctx.currentTime;
  
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(isFinisher ? 440 : 320, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.095);
      oscGain.gain.setValueAtTime(isFinisher ? 0.44 : 0.34, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.095);
      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.095);
  
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1600, now);
      filter.Q.setValueAtTime(1.2, now);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.28, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.07);
    }
  
    playWaveCast() {
      if (!this.canPlay()) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(780, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.18);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.008, now + 0.18);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  
    playFocusTick(progressRatio = 0) {
      if (!this.canPlay()) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      const baseFreq = 320 + progressRatio * 440;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.12, now + 0.07);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.004, now + 0.075);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.075);
    }
  
    playHeal() {
      if (!this.canPlay()) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const now = this.ctx.currentTime + idx * 0.05;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.24);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.24);
      });
    }
  
    playDefeatPop() {
      if (!this.canPlay()) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  
    playPickup() {
      if (!this.canPlay()) return;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const now = this.ctx.currentTime + idx * 0.065;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.13, now);
        gain.gain.exponentialRampToValueAtTime(0.008, now + 0.18);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.18);
      });
    }
  
    playHurt() {
      if (!this.canPlay()) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.14);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.14);
    }
  
    playHeartCrack() {
      if (!this.canPlay()) return;
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2400, now);
      filter.Q.setValueAtTime(3.0, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.08);
  
      const osc = this.ctx.createOscillator();
      const oGain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
      oGain.gain.setValueAtTime(0.2, now);
      oGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(oGain);
      oGain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  
    playHeartShatter() {
      if (!this.canPlay()) return;
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(1100, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.32);
  
      const notes = [620, 480, 340, 210];
      notes.forEach((f, idx) => {
        const t = now + idx * 0.04;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.1);
        g.gain.setValueAtTime(0.16, t);
        g.gain.exponentialRampToValueAtTime(0.008, t + 0.1);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.1);
      });
    }
  
    playCheckpoint() {
      if (!this.canPlay()) return;
      const notes = [329.63, 440, 554.37, 659.25];
      notes.forEach((freq, idx) => {
        const now = this.ctx.currentTime + idx * 0.07;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.28);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.28);
      });
    }
  
    playKeyPickup() {
      if (!this.canPlay()) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const now = this.ctx.currentTime + idx * 0.055;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.17, now);
        gain.gain.exponentialRampToValueAtTime(0.008, now + 0.16);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.16);
      });
    }
  
    playBossRoar() {
      if (!this.canPlay()) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(65, now + 0.35);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.38);
    }
  
    playVictoryFanfare() {
      if (!this.canPlay()) return;
      const notes = [523.25, 659.25, 783.99, 1046.5, 987.77, 1046.5];
      notes.forEach((freq, idx) => {
        const now = this.ctx.currentTime + idx * 0.11;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.006, now + 0.35);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.35);
      });
    }
  }

  class BackgroundRenderer {
    constructor() {
      this.stars = Array.from({ length: 48 }, () => ({
        x: Math.floor(Math.random() * VIEWPORT.WIDTH),
        y: Math.floor(Math.random() * (VIEWPORT.HEIGHT - 36)),
        size: Math.random() > 0.82 ? 2 : 1,
        blinkOffset: Math.random() * 100
      }));
  
      this.motes = Array.from({ length: 24 }, () => ({
        x: Math.random() * VIEWPORT.WIDTH,
        y: Math.random() * VIEWPORT.HEIGHT,
        vx: 0.08 + Math.random() * 0.22,
        vy: -0.04 - Math.random() * 0.16,
        size: Math.random() > 0.85 ? 2 : 1
      }));
  
      this.tick = 0;
    }
  
    getTheme(levelIndex) {
      const meta = STAGE_METADATA[levelIndex] || STAGE_METADATA[0];
      return BIOME_THEMES[meta.biome] || BIOME_THEMES.precipice;
    }
  
    update() {
      this.tick++;
      for (const m of this.motes) {
        m.x = (m.x + m.vx + VIEWPORT.WIDTH) % VIEWPORT.WIDTH;
        m.y = (m.y + m.vy + VIEWPORT.HEIGHT) % VIEWPORT.HEIGHT;
      }
    }
  
    drawPixelCircle(ctx, cx, cy, r, color) {
      ctx.fillStyle = color;
      const rSq = r * r;
      for (let dy = -r; dy <= r; dy++) {
        const span = Math.floor(Math.sqrt(Math.max(0, rSq - dy * dy)));
        ctx.fillRect(Math.round(cx - span), Math.round(cy + dy), span * 2 + 1, 1);
      }
    }
  
    drawSteppedPeak(ctx, baseX, peakY, halfWidth, stepSize, color) {
      ctx.fillStyle = color;
      const totalWidth = halfWidth * 2;
      for (let dx = 0; dx < totalWidth; dx += stepSize) {
        const distFromCenter = Math.abs(dx + stepSize / 2 - halfWidth);
        const heightOffset = Math.floor(distFromCenter / stepSize) * stepSize;
        const colTop = Math.round(peakY + heightOffset);
        if (colTop < VIEWPORT.HEIGHT) {
          ctx.fillRect(Math.round(baseX + dx), colTop, stepSize, VIEWPORT.HEIGHT - colTop);
        }
      }
    }
  
    drawCelestialBody(ctx, theme, biome) {
      const mx = 250;
      const my = 34;
      const pulse = Math.sin(this.tick * 0.05) * 1.2;
  
      this.drawPixelCircle(ctx, mx, my, Math.round(23 + pulse), theme.moonGlow);
      this.drawPixelCircle(ctx, mx, my, Math.round(17 + pulse * 0.5), theme.moonGlow);
  
      if (biome === "eclipse") {
  
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8 + this.tick * 0.01;
          const rayLen = (i % 2 === 0 ? 18 : 15) + Math.sin(this.tick * 0.08 + i) * 2;
          const rx = Math.round(mx + Math.cos(angle) * rayLen);
          const ry = Math.round(my + Math.sin(angle) * rayLen);
          ctx.fillStyle = i % 2 === 0 ? PALETTE.bossCrimson : PALETTE.swordGlow;
          ctx.fillRect(rx - 1, ry - 1, 2, 2);
        }
        this.drawPixelCircle(ctx, mx, my, 13, PALETTE.bossCrimson);
        this.drawPixelCircle(ctx, mx, my, 11, PALETTE.swordGlow);
        this.drawPixelCircle(ctx, mx, my, 10, PALETTE.white);
        this.drawPixelCircle(ctx, mx, my, 8, "#08040b");
      } else if (biome === "spire") {
  
        this.drawPixelCircle(ctx, mx, my, 12, "rgba(254, 211, 48, 0.35)");
        this.drawPixelCircle(ctx, mx, my, 10, PALETTE.swordGlow);
        this.drawPixelCircle(ctx, mx - 1, my - 1, 8, PALETTE.white);
  
        ctx.fillStyle = PALETTE.swordCombo;
        ctx.fillRect(mx + 2, my + 2, 3, 2);
        ctx.fillRect(mx - 4, my + 3, 2, 2);
        ctx.fillRect(mx + 3, my - 3, 2, 2);
      } else {
  
        const r = 10;
        const shadowOffsetX = 4.2;
        const shadowOffsetY = -2.2;
        const shadowR = 8.8;
  
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            const dSq = dx * dx + dy * dy;
            if (dSq > r * r) continue;
  
            const sdx = dx - shadowOffsetX;
            const sdy = dy - shadowOffsetY;
            const inShadow = sdx * sdx + sdy * sdy <= shadowR * shadowR;
  
            if (inShadow) {
  
              ctx.fillStyle = biome === "labyrinth" ? "#16233b" : "#1c2442";
              ctx.fillRect(mx + dx, my + dy, 1, 1);
            } else {
  
              const isCrater =
                (dx === -4 && (dy === 1 || dy === 2)) ||
                (dx === -3 && dy === 2) ||
                (dx === -2 && dy === -4);
              const isRim = dSq >= (r - 1.2) * (r - 1.2);
              ctx.fillStyle = isCrater
                ? PALETTE.textSubtle
                : isRim
                  ? PALETTE.white
                  : theme.moonColor;
              ctx.fillRect(mx + dx, my + dy, 1, 1);
            }
          }
        }
      }
    }
  
    drawRuinedPillars(ctx, cameraX, levelIndex, color) {
      const parallax = Math.floor((cameraX * 0.24 + levelIndex * 30) / 2) * 2;
      ctx.fillStyle = color;
      for (let i = -1; i < 6; i++) {
        const px = i * 68 - (parallax % 68);
        const h = 44 + ((Math.abs(i) * 17) % 28);
        const topY = VIEWPORT.HEIGHT - h;
        ctx.fillRect(px, topY, 6, h);
        ctx.fillRect(px - 2, topY, 10, 3);
        ctx.fillRect(px - 1, topY + 6, 8, 2);
      }
    }
  
    draw(ctx, cameraX, levelIndex) {
      const theme = this.getTheme(levelIndex);
      const meta = STAGE_METADATA[levelIndex] || STAGE_METADATA[0];
  
      ctx.fillStyle = theme.skyTop;
      ctx.fillRect(0, 0, VIEWPORT.WIDTH, VIEWPORT.HEIGHT);
      ctx.fillStyle = theme.skyBottom;
      ctx.fillRect(0, Math.floor(VIEWPORT.HEIGHT * 0.45), VIEWPORT.WIDTH, VIEWPORT.HEIGHT);
  
      const mx = 250;
      const my = 34;
      for (const s of this.stars) {
        const dx = s.x - mx;
        const dy = s.y - my;
        if (dx * dx + dy * dy <= 14 * 14) continue;
        const alpha = 0.3 + 0.5 * Math.sin(this.tick * 0.04 + s.blinkOffset);
        ctx.fillStyle = `rgba(226, 232, 240, ${alpha.toFixed(2)})`;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }
  
      this.drawCelestialBody(ctx, theme, meta.biome);
  
      const parallax1 = Math.floor((cameraX * 0.08 + levelIndex * 20) / 2) * 2;
      for (let i = -1; i < 6; i++) {
        const peakX = i * 72 - (parallax1 % 72);
        const peakY = 62 + (Math.abs(i) % 2) * 16;
        this.drawSteppedPeak(ctx, peakX, peakY, 36, 4, theme.farPeak);
      }
  
      const parallax2 = Math.floor((cameraX * 0.16 + levelIndex * 40) / 2) * 2;
      for (let i = -1; i < 8; i++) {
        const peakX = i * 52 - (parallax2 % 52);
        const peakY = 96 + (Math.abs(i) % 3) * 8;
        this.drawSteppedPeak(ctx, peakX, peakY, 26, 2, theme.midPeak);
      }
  
      this.drawRuinedPillars(ctx, cameraX, levelIndex, theme.pillarColor);
    }
  
    drawMotes(ctx, levelIndex = 0) {
      const theme = this.getTheme(levelIndex);
      ctx.fillStyle = theme.moteColor;
      for (const m of this.motes) {
        ctx.fillRect(Math.round(m.x), Math.round(m.y), m.size, m.size);
      }
    }
  }

  class SpriteRenderer {
    static drawPlayer(ctx, player) {
  
      if (player.attackTimer > 0) {
        SpriteRenderer.drawSlashArc(ctx, player);
      }
  
      for (const wave of player.waves) {
        SpriteRenderer.drawAstralWave(ctx, wave);
      }
  
      if (player.invulnTimer > 0 && Math.floor(player.invulnTimer / 2) % 2 === 1) {
        return;
      }
  
      const isFocusing = player.focusTimer > 0;
      const isWhiteSilhouette =
        player.focusFlashTimer > 0 ||
        (isFocusing && (player.focusTimer > 12 || player.focusTimer % 4 < 3));
  
      const scarfColor = isWhiteSilhouette
        ? PALETTE.white
        : player.canDash
          ? PALETTE.playerHair
          : PALETTE.playerNoDash;
      if (player.scarfNodes && player.scarfNodes.length > 0) {
        ctx.fillStyle = scarfColor;
        for (let i = 0; i < player.scarfNodes.length; i++) {
          const node = player.scarfNodes[i];
          const size = i < 2 ? 2 : 1;
          ctx.fillRect(Math.round(node.x), Math.round(node.y), size, size);
        }
      }
  
      const cx = Math.round(player.x + player.w / 2);
      const by = Math.round(player.y + player.h);
      const dw = Math.max(4, Math.round(player.w * player.scaleX));
      const dh = Math.max(5, Math.round(player.h * player.scaleY));
      const dx = Math.round(cx - dw / 2);
      const dy = Math.round(by - dh);
  
      if (isFocusing) {
        const ratio = Math.min(1, player.focusTimer / PLAYER_CONFIG.FOCUS_CHANNEL_FRAMES);
        const ringRadius = Math.max(3, Math.round((1 - ratio) * 14));
        ctx.fillStyle = "rgba(72, 219, 251, 0.28)";
        ctx.fillRect(dx - 3, dy - 3, dw + 6, dh + 5);
        ctx.fillStyle = PALETTE.white;
        ctx.fillRect(cx - ringRadius, dy + 4, 2, 2);
        ctx.fillRect(cx + ringRadius - 1, dy + 4, 2, 2);
        ctx.fillRect(cx - 1, dy + 4 - ringRadius, 2, 2);
        ctx.fillRect(cx - 1, Math.min(by, dy + 4 + ringRadius), 2, 2);
  
        const pillarH = Math.round(ratio * (dh + 6));
        ctx.fillStyle = player.focusTimer % 4 < 2 ? PALETTE.white : PALETTE.soulCyan;
        ctx.fillRect(dx - 2, by - pillarH, 1, pillarH);
        ctx.fillRect(dx + dw + 1, by - pillarH, 1, pillarH);
      }
  
      const isMoving = Math.abs(player.vx) > 0.2;
      const breathOffset =
        player.onGround && !isMoving && Math.sin(player.animTick * 0.12) > 0.5 ? 1 : 0;
  
      if (isWhiteSilhouette) {
  
        ctx.fillStyle = PALETTE.soulCyan;
        ctx.fillRect(dx - 1, dy - 1 + breathOffset, dw + 2, dh + 1 - breathOffset);
        ctx.fillStyle = PALETTE.white;
        ctx.fillRect(dx, dy + breathOffset, dw, dh - breathOffset);
  
        ctx.fillStyle = PALETTE.soulCyan;
        const eyeX = player.facing === 1 ? dx + dw - 2 : dx;
        ctx.fillRect(eyeX, dy + 2 + breathOffset, 2, 2);
        return;
      }
  
      ctx.fillStyle = PALETTE.playerCloakDark;
      if (!player.onGround) {
        ctx.fillRect(dx + 1, by - 2, dw - 2, 2);
      } else if (isMoving) {
        const stride = Math.floor(player.animTick / 4) % 2;
        if (stride === 0) {
          ctx.fillRect(dx, by - 2, 2, 2);
          ctx.fillRect(dx + dw - 2, by - 1, 2, 1);
        } else {
          ctx.fillRect(dx, by - 1, 2, 1);
          ctx.fillRect(dx + dw - 2, by - 2, 2, 2);
        }
      } else {
        ctx.fillRect(dx + 1, by - 2, 2, 2);
        ctx.fillRect(dx + dw - 3, by - 2, 2, 2);
      }
  
      ctx.fillStyle = PALETTE.playerCloak;
      ctx.fillRect(dx, dy + 3 + breathOffset, dw, Math.max(2, dh - 4 - breathOffset));
  
      ctx.fillStyle = scarfColor;
      ctx.fillRect(dx, dy + 3 + breathOffset, dw, 1);
  
      ctx.fillStyle = scarfColor;
      ctx.fillRect(dx, dy + breathOffset, dw, 3);
      ctx.fillRect(dx - player.facing * 1, dy + 1 + breathOffset, 1, 2);
  
      ctx.fillStyle = PALETTE.playerBody;
      const eyeX = player.facing === 1 ? dx + dw - 2 : dx;
      ctx.fillRect(eyeX, dy + 1 + breathOffset, 2, 2);
  
      if (player.hasSword && player.attackTimer <= 0) {
        ctx.fillStyle = player.comboResetTimer > 0 && player.comboStep === 1 ? PALETTE.swordCombo : PALETTE.swordGlow;
        const sx = player.facing === 1 ? dx - 2 : dx + dw;
        ctx.fillRect(sx, dy + 1 + breathOffset, 2, 5);
        ctx.fillStyle = PALETTE.white;
        ctx.fillRect(sx, dy + 1 + breathOffset, 1, 2);
      }
  
      if (player.comboResetTimer > 0 && player.hasSword) {
        for (let i = 0; i < 3; i++) {
          const pipX = cx - 5 + i * 4;
          const pipY = dy - 5;
          const active = i <= player.comboStep;
          ctx.fillStyle = !active
            ? PALETTE.heartEmpty
            : i === 2
              ? PALETTE.swordCombo
              : PALETTE.swordGlow;
          ctx.fillRect(pipX, pipY, 2, 2);
        }
      }
    }
  
    static drawSlashArc(ctx, player) {
      const hb = player.getSlashBounds();
      const progress = 1 - player.attackTimer / player.attackMaxTimer;
      const isFlashFrame = player.attackTimer >= player.attackMaxTimer - 2;
      const isSecondHit = player.comboStep === 1;
      const isFinisher = player.comboStep === 2;
      const mainColor = isFlashFrame
        ? PALETTE.white
        : isFinisher
          ? PALETTE.swordCombo
          : isSecondHit
            ? PALETTE.soulCyan
            : PALETTE.swordGlow;
      const innerColor = isFinisher ? PALETTE.swordGlow : PALETTE.white;
      const thick = Math.max(2, Math.round((1 - progress * 0.65) * (isFinisher ? 7 : 5)));
  
      ctx.fillStyle = mainColor;
  
      if (player.atkDirY === -1) {
        ctx.fillRect(hb.x + 3, hb.y, hb.w - 6, thick + 2);
        ctx.fillRect(hb.x + 1, hb.y + 2, hb.w - 2, thick);
        ctx.fillRect(hb.x, hb.y + 4, thick, hb.h - 6);
        ctx.fillRect(hb.x + hb.w - thick, hb.y + 4, thick, hb.h - 6);
  
        ctx.fillStyle = innerColor;
        ctx.fillRect(hb.x + 4, hb.y + 1, hb.w - 8, 2);
      } else if (player.atkDirY === 1) {
        const bottomY = hb.y + hb.h;
        ctx.fillRect(hb.x + 3, bottomY - (thick + 2), hb.w - 6, thick + 2);
        ctx.fillRect(hb.x + 1, bottomY - 2 - thick, hb.w - 2, thick);
        ctx.fillRect(hb.x, hb.y + 2, thick, hb.h - 6);
        ctx.fillRect(hb.x + hb.w - thick, hb.y + 2, thick, hb.h - 6);
  
        ctx.fillStyle = innerColor;
        ctx.fillRect(hb.x + 4, bottomY - 3, hb.w - 8, 2);
      } else if (player.atkDirX === 1) {
        const rightX = hb.x + hb.w;
        ctx.fillRect(rightX - (thick + 3), hb.y + 3, thick + 3, hb.h - 6);
        ctx.fillRect(rightX - 2 - thick, hb.y + 1, thick, hb.h - 2);
        ctx.fillRect(hb.x + 2, hb.y, hb.w - 6, thick);
        ctx.fillRect(hb.x + 2, hb.y + hb.h - thick, hb.w - 6, thick);
  
        ctx.fillStyle = innerColor;
        ctx.fillRect(rightX - 3, hb.y + 4, 2, hb.h - 8);
        if (isFinisher) {
          ctx.fillStyle = PALETTE.bossCrimson;
          ctx.fillRect(rightX - 1, hb.y + 2, 2, hb.h - 4);
        }
      } else {
        ctx.fillRect(hb.x, hb.y + 3, thick + 3, hb.h - 6);
        ctx.fillRect(hb.x + 2, hb.y + 1, thick, hb.h - 2);
        ctx.fillRect(hb.x + 4, hb.y, hb.w - 6, thick);
        ctx.fillRect(hb.x + 4, hb.y + hb.h - thick, hb.w - 6, thick);
  
        ctx.fillStyle = innerColor;
        ctx.fillRect(hb.x + 1, hb.y + 4, 2, hb.h - 8);
        if (isFinisher) {
          ctx.fillStyle = PALETTE.bossCrimson;
          ctx.fillRect(hb.x - 1, hb.y + 2, 2, hb.h - 4);
        }
      }
    }
  
    static drawAstralWave(ctx, wave) {
      const rx = Math.round(wave.x);
      const ry = Math.round(wave.y);
      ctx.fillStyle = PALETTE.soulCyan;
      ctx.fillRect(rx, ry + 1, wave.w, wave.h - 2);
      ctx.fillStyle = PALETTE.white;
      const leadX = wave.dir > 0 ? rx + wave.w - 3 : rx + 1;
      ctx.fillRect(leadX, ry + 2, 2, wave.h - 4);
    }
  }

  class Enemy extends PhysicsBody {
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

  class Boss extends PhysicsBody {
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

  class Player extends PhysicsBody {
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

  function buildStage5CrimsonBastion() {
    const cols = 80;
    const rows = 36;
    const g = Array.from({ length: rows }, () => Array(cols).fill("."));
  
    const fillRect = (r1, c1, r2, c2, ch = "#") => {
      for (let r = Math.max(0, r1); r <= Math.min(rows - 1, r2); r++) {
        for (let c = Math.max(0, c1); c <= Math.min(cols - 1, c2); c++) {
          g[r][c] = ch;
        }
      }
    };
  
    fillRect(0, 0, rows - 1, cols - 1, "#");
    fillRect(2, 2, rows - 5, cols - 3, ".");
  
    fillRect(22, cols - 3, 25, cols - 1, ".");
    fillRect(26, 66, 31, cols - 1, "#");
  
    fillRect(28, 2, 31, 14, "#");
    g[27][5] = "P";
    g[27][11] = "E";
  
    fillRect(31, 15, 31, 25, "^");
    fillRect(26, 17, 27, 22, "#");
    g[25][19] = "C";
  
    fillRect(28, 26, 31, 38, "#");
    g[27][31] = "D";
    fillRect(22, 28, 23, 35, "#");
    fillRect(17, 22, 18, 27, "#");
    g[16][24] = "F";
  
    fillRect(12, 6, 13, 18, "#");
    fillRect(13, 19, 13, 22, "^");
    g[11][14] = "C";
    g[11][8] = "R";
  
    fillRect(18, 36, 20, 52, "#");
    g[17][43] = "K";
  
    fillRect(12, 48, 13, 60, "#");
    g[11][54] = "D";
    g[10][63] = "F";
  
    fillRect(31, 39, 31, 65, "^");
    fillRect(26, 44, 27, 51, "#");
    g[25][48] = "C";
  
    fillRect(26, 56, 27, 63, "#");
    g[25][60] = "D";
    g[20][59] = "F";
  
    fillRect(18, 66, 21, 79, "#");
    for (let r = 22; r <= 25; r++) {
      g[r][72] = "G";
    }
    g[25][68] = "C";
  
    return {
      exitY: 184,
      prompts: [
        { x: 32, y: 196, text: "CRIMSON CITADEL - FIND THE KEEP SHRINE" },
        { x: 310, y: 120, text: "SHRINE RESTORES HP & BINDS RESPAWN" }
      ],
      grid: g.map((row) => row.join(""))
    };
  }
  
  function buildStage11Labyrinth() {
    const cols = 120;
    const rows = 60;
    const g = Array.from({ length: rows }, () => Array(cols).fill("."));
  
    const fillRect = (r1, c1, r2, c2, ch = "#") => {
      for (let r = Math.max(0, r1); r <= Math.min(rows - 1, r2); r++) {
        for (let c = Math.max(0, c1); c <= Math.min(cols - 1, c2); c++) {
          g[r][c] = ch;
        }
      }
    };
  
    fillRect(0, 0, rows - 1, cols - 1, "#");
    fillRect(2, 2, rows - 4, cols - 3, ".");
  
    fillRect(19, 2, 20, cols - 3, "#");
    fillRect(39, 2, 40, cols - 3, "#");
  
    fillRect(18, 28, 41, 35, ".");
    fillRect(18, 76, 41, 83, ".");
  
    fillRect(35, 2, 38, 27, "#");
    g[34][6] = "P";
    g[34][15] = "K";
  
    fillRect(35, 30, 35, 33, "#");
    fillRect(30, 28, 30, 31, "#");
    fillRect(25, 32, 25, 35, "#");
    fillRect(20, 29, 20, 32, "#");
  
    fillRect(35, 36, 38, 75, "#");
    fillRect(36, 44, 38, 50, ".");
    fillRect(38, 44, 38, 50, "^");
    fillRect(32, 45, 32, 49, "#");
  
    fillRect(36, 58, 38, 65, ".");
    fillRect(38, 58, 38, 65, "^");
    g[31][61] = "F";
  
    g[34][53] = "D";
    g[34][71] = "C";
  
    fillRect(35, 78, 35, 81, "#");
    fillRect(30, 76, 30, 79, "#");
    fillRect(25, 80, 25, 83, "#");
    fillRect(20, 77, 20, 80, "#");
  
    fillRect(21, 84, 30, 119, "#");
    fillRect(35, 84, 38, 119, "#");
    fillRect(31, 84, 34, 119, ".");
    for (let r = 31; r <= 34; r++) {
      g[r][96] = "L";
    }
  
    fillRect(15, 18, 15, 25, "#");
    fillRect(12, 10, 12, 15, "#");
    fillRect(9, 3, 9, 8, "#");
    fillRect(18, 3, 18, 26, "^");
    g[8][5] = "Q";
    g[11][12] = "M";
    g[10][21] = "F";
  
    fillRect(15, 38, 18, 45, "#");
    fillRect(15, 52, 18, 58, "#");
    fillRect(18, 46, 18, 51, "^");
    g[14][55] = "C";
  
    fillRect(15, 64, 18, 74, "#");
    fillRect(18, 59, 18, 63, "^");
    g[11][61] = "F";
    g[14][69] = "M";
  
    fillRect(15, 85, 18, 92, "#");
    fillRect(18, 93, 18, 106, "^");
    g[12][96] = "F";
    g[10][102] = "F";
    fillRect(11, 107, 18, 116, "#");
    g[10][112] = "Q";
  
    fillRect(45, 29, 45, 33, "#");
    fillRect(50, 28, 50, 32, "#");
    fillRect(55, 20, 58, 38, "#");
  
    fillRect(55, 4, 58, 15, "#");
    fillRect(56, 16, 56, 19, "^");
    g[54][9] = "D";
    g[54][5] = "R";
  
    fillRect(55, 44, 58, 54, "#");
    fillRect(56, 39, 56, 43, "^");
    g[54][49] = "C";
  
    fillRect(55, 62, 58, 74, "#");
    fillRect(56, 55, 56, 61, "^");
    g[51][58] = "F";
    g[54][68] = "M";
  
    fillRect(45, 78, 45, 82, "#");
    fillRect(50, 77, 50, 81, "#");
    fillRect(55, 75, 58, 86, "#");
  
    fillRect(56, 87, 56, 105, "^");
    fillRect(52, 91, 52, 95, "#");
    g[49][99] = "F";
    fillRect(52, 106, 58, 116, "#");
    g[51][109] = "D";
    g[51][114] = "Q";
  
    return {
      exitY: 260,
      prompts: [{ x: 96, y: 248, text: "FIND 3 SANCTUM KEYS" }],
      grid: g.map((row) => row.join(""))
    };
  }
  const STAGES = [
  
    {
      exitY: 124,
      prompts: [
        { x: 14, y: 112, text: "[ARROWS/WASD] MOVE   SHRINE ATTUNES RESPAWN" },
        { x: 108, y: 92, text: "[Z/SPACE] JUMP" },
        { x: 204, y: 102, text: "[C/SHIFT] DASH" }
      ],
      grid: [
        "########################################",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#.......................................",
        "#.........######..#####.................",
        "#.........######..#####.................",
        "#..P...K..######..#####.................",
        "############################^^^^########",
        "########################################",
        "########################################",
        "########################################",
        "########################################"
      ]
    },
  
    {
      exitY: 108,
      prompts: [
        { x: 74, y: 58, text: "[X/J] 3-HIT SOLAR COMBO!", reqSword: true },
        { x: 182, y: 82, text: "[DOWN+X] POGO BOUNCE", reqSword: true }
      ],
      grid: [
        "########################################",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#...............S......................#",
        "######........#######.......############",
        "#..................................G....",
        "#..P...............................G....",
        "#######..#####.......#####.........G....",
        "#######....................#############",
        "#######^^^^^###^^^^^###^^^^#############",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################"
      ]
    },
  
    {
      exitY: 108,
      prompts: [
        { x: 16, y: 98, text: "TAP [V/F] SOUL WAVE   HOLD [V/F] FOCUS HEAL" }
      ],
      grid: [
        "########################################",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#...R..................................#",
        "#..####................................#",
        "#......................................#",
        "#........####..........................#",
        "#......................................#",
        "#.........................E............#",
        "#......................########........#",
        "#.......................................",
        "#..P..........E.........................",
        "########...########............#########",
        "########...########^^^^#####^^^#########",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################"
      ]
    },
  
    {
      exitY: 100,
      prompts: [{ x: 64, y: 54, text: "[DOWN+X] POGO REFRESHES DASH" }],
      grid: [
        "########################################",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#.....................F.................",
        "#...........F...........................",
        "#..P....................................",
        "#######..................#######...#####",
        "#######....#####.........#######...#####",
        "#######^^^^#####^^^^^^^^^#######^^^#####",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################"
      ]
    },
  
    buildStage5CrimsonBastion(),
  
    {
      exitY: 84,
      prompts: [],
      grid: [
        "########################################",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#....R.................................#",
        "#...###................................#",
        "#......................................#",
        "#......................................#",
        "#.........................F............#",
        "#.......................................",
        "#..............F........................",
        "#................................#####..",
        "#........#####...................#####..",
        "#..P.....#####.......E...........#####..",
        "######...#####....#######........#####..",
        "######...#####....#######........#####..",
        "######^^^#####^^^^#######^^^^^^^^#####..",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################"
      ]
    },
  
    {
      exitY: 100,
      prompts: [{ x: 36, y: 56, text: "BEWARE THE MANTIS DUELISTS" }],
      grid: [
        "########################################",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#................D.....................#",
        "#.............#######..................#",
        "#......................................#",
        "#.............................##########",
        "#..................................G....",
        "#..................................G....",
        "#..P..........D.............D......G....",
        "#######....#######.......#######.#######",
        "#######....#######.......#######.#######",
        "#######^^^^#######^^^^^^^#######^#######",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################"
      ]
    },
  
    {
      exitY: 100,
      prompts: [],
      grid: [
        "########################################",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#...................F..................#",
        "#.............................##########",
        "#..................................G....",
        "#..................................G....",
        "#..P............C........C.........G....",
        "########....########..#######..#########",
        "########....########..#######..#########",
        "########^^^^########^^#######^^#########",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################"
      ]
    },
  
    {
      exitY: 92,
      prompts: [{ x: 40, y: 44, text: "SLASH ENEMY ORBS TO PARRY & GAIN SOUL" }],
      grid: [
        "########################################",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#............M............M............#",
        "#.........######.......######..........#",
        "#......................................#",
        "#.............................##########",
        "#..................................G....",
        "#..................................G....",
        "#..P..........D............M.......#####",
        "#######....#######.....#######.#########",
        "#######....#######.....#######.#########",
        "#######^^^^#######^^^^^#######^#########",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################"
      ]
    },
  
    {
      exitY: 92,
      prompts: [],
      grid: [
        "########################################",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#..................R...................#",
        "#.................###..................#",
        "#......................................#",
        "#......................................#",
        "#.........................F............#",
        "#.............................##########",
        "#..............F...................G....",
        "#..................................G....",
        "#..................................G....",
        "#..P..........C........D...........#####",
        "########..#######....#######..##########",
        "########..#######....#######..##########",
        "########^^#######^^^^#######^^##########",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################"
      ]
    },
  
    buildStage11Labyrinth(),
  
    {
      exitY: 108,
      prompts: [{ x: 96, y: 38, text: "VANQUISH SERAPH VAEL" }],
      grid: [
        "########################################",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#.......#####..............#####.......#",
        "#......................................#",
        "#......................................#",
        "#......................................#",
        "#...P.........................B........#",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################",
        "########################################"
      ]
    }
  ];

  class LevelManager {
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
  
      for (const p of this.prompts) {
        if (p.reqSword && !player.hasSword) continue;
        if (p.hideOnSword && player.hasSword) continue;
        if (player.x > p.x + 150) continue;
        const bobY = p.y + Math.round(Math.sin(this.tick * 0.06) * 1.5);
        const color = p.reqSword ? PALETTE.swordGlow : PALETTE.textSubtle;
        drawPixelText(ctx, p.text, p.x, bobY, color, PALETTE.textShadow);
      }
  
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
  
      if (this.boss && !this.boss.dead) {
        this.boss.draw(ctx);
      }
    }
  }

  const HEART_BITMAP = [
    "0110110",
    "1111111",
    "1111111",
    "0111110",
    "0011100",
    "0001000"
  ];
  function formatFramesToTime(frames) {
    const totalSeconds = Math.floor(frames / 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const centis = Math.floor(((frames % 60) / 60) * 100);
    const mm = String(mins).padStart(2, "0");
    const ss = String(secs).padStart(2, "0");
    const cc = String(centis).padStart(2, "0");
    return `${mm}:${ss}.${cc}`;
  }
  class HUDRenderer {
    constructor(game) {
      this.game = game;
    }
  
    drawHeartIcon(ctx, x, y, filled) {
      for (let r = 0; r < HEART_BITMAP.length; r++) {
        const row = HEART_BITMAP[r];
        for (let c = 0; c < row.length; c++) {
          if (row[c] === "1") {
            ctx.fillStyle = PALETTE.textShadow;
            ctx.fillRect(x + c + 1, y + r + 1, 1, 1);
            ctx.fillStyle = filled ? PALETTE.playerHair : PALETTE.heartEmpty;
            ctx.fillRect(x + c, y + r, 1, 1);
          }
        }
      }
    }
  
    drawHUD(ctx) {
      const { player, level, saveManager } = this.game;
  
      const meta = STAGE_METADATA[level.currentIndex] || STAGE_METADATA[0];
      drawPixelText(ctx, `CH.${meta.numeral}`, 8, 7, PALETTE.swordGlow, PALETTE.textShadow);
      drawPixelText(
        ctx,
        formatFramesToTime(this.game.runFrames),
        42,
        7,
        PALETTE.textBright,
        PALETTE.textShadow
      );
  
      const relicsCount = saveManager.data.relicsFound.length;
      drawPixelText(ctx, `*${relicsCount}/5`, 8, 15, PALETTE.relicCyan, PALETTE.textShadow);
  
      const boundMeta = STAGE_METADATA[this.game.checkpointStage || 0] || STAGE_METADATA[0];
      drawPixelText(
        ctx,
        `SHRINE:${boundMeta.numeral}`,
        42,
        15,
        PALETTE.playerNoDash,
        PALETTE.textShadow
      );
  
      if (this.game.sound.muted) {
        drawPixelText(ctx, "MUTE", 98, 15, PALETTE.playerHair, PALETTE.textShadow);
      }
  
      const heartSpan = player.maxHp * 10;
      const startX = VIEWPORT.WIDTH - heartSpan - 6;
      const startY = 7;
      for (let i = 0; i < player.maxHp; i++) {
        this.drawHeartIcon(ctx, startX + i * 10, startY, i < player.hp);
      }
  
      const barW = heartSpan - 3;
      const barX = startX;
      const barY = startY + 9;
      ctx.fillStyle = PALETTE.textShadow;
      ctx.fillRect(barX + 1, barY + 1, barW, 4);
      ctx.fillStyle = PALETTE.heartEmpty;
      ctx.fillRect(barX, barY, barW, 4);
  
      const fillW = Math.round((player.soul / player.maxSoul) * (barW - 2));
      if (fillW > 0) {
        const canHeal = player.soul >= PLAYER_CONFIG.SOUL_HEAL_COST;
        const canWave = player.soul >= PLAYER_CONFIG.SOUL_WAVE_COST;
        ctx.fillStyle =
          player.focusTimer > 0 && player.focusTimer % 4 < 2
            ? PALETTE.white
            : canHeal
              ? PALETTE.white
              : canWave
                ? PALETTE.soulCyan
                : PALETTE.playerCloak;
        ctx.fillRect(barX + 1, barY + 1, fillW, 2);
      }
  
      if (player.focusTimer > 0) {
        const focusRatio = Math.min(1, player.focusTimer / PLAYER_CONFIG.FOCUS_CHANNEL_FRAMES);
        const focusW = Math.round(focusRatio * (barW - 2));
        ctx.fillStyle = PALETTE.textShadow;
        ctx.fillRect(barX, barY + 5, barW, 3);
        ctx.fillStyle = PALETTE.white;
        ctx.fillRect(barX + 1, barY + 6, focusW, 1);
      } else if (
        player.hp < player.maxHp &&
        player.soul >= PLAYER_CONFIG.SOUL_HEAL_COST &&
        this.game.uiTick % 40 < 26
      ) {
        drawPixelText(
          ctx,
          "HOLD [V/F] HEAL",
          startX - 48,
          barY + 5,
          PALETTE.soulCyan,
          PALETTE.textShadow
        );
      }
  
      for (let i = 0; i < player.keysCollected; i++) {
        const kx = startX + i * 10 + 1;
        const ky = startY + 16;
        ctx.fillStyle = PALETTE.textShadow;
        ctx.fillRect(kx + 1, ky + 1, 5, 5);
        ctx.fillStyle = PALETTE.swordGlow;
        ctx.fillRect(kx, ky, 3, 3);
        ctx.fillStyle = PALETTE.white;
        ctx.fillRect(kx + 1, ky + 3, 1, 3);
        ctx.fillRect(kx + 2, ky + 4, 2, 1);
      }
  
      if (level.bannerTimer > 0) {
        this.drawStageBanner(ctx, meta, level.bannerTimer);
      }
  
      if (level.boss && !level.boss.dead) {
        this.drawBossBar(ctx, level.boss);
      }
    }
  
    drawStageBanner(ctx, meta, timer) {
      let alpha = 1;
      if (timer > 110) alpha = (135 - timer) / 25;
      else if (timer < 30) alpha = timer / 30;
  
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = "rgba(9, 10, 20, 0.72)";
      ctx.fillRect(46, 26, VIEWPORT.WIDTH - 92, 25);
      ctx.fillStyle = PALETTE.swordGlow;
      ctx.fillRect(46, 26, VIEWPORT.WIDTH - 92, 1);
      ctx.fillRect(46, 50, VIEWPORT.WIDTH - 92, 1);
  
      drawPixelTextCentered(
        ctx,
        `CHAPTER ${meta.numeral} - ${meta.title}`,
        VIEWPORT.WIDTH / 2,
        31,
        PALETTE.swordGlow,
        PALETTE.textShadow
      );
      drawPixelTextCentered(
        ctx,
        meta.subtitle,
        VIEWPORT.WIDTH / 2,
        41,
        PALETTE.textBright,
        PALETTE.textShadow
      );
      ctx.restore();
    }
  
    drawBossBar(ctx, boss) {
      const barW = 180;
      const barH = 6;
      const bx = Math.floor((VIEWPORT.WIDTH - barW) / 2);
      const by = VIEWPORT.HEIGHT - 16;
  
      const title =
        boss.phase === 2
          ? "SERAPH VAEL - ASCENDED ECLIPSE"
          : "SERAPH VAEL, WARDEN OF THE ECLIPSE";
      drawPixelTextCentered(
        ctx,
        title,
        VIEWPORT.WIDTH / 2,
        by - 8,
        boss.phase === 2 ? PALETTE.bossCrimson : PALETTE.swordGlow,
        PALETTE.textShadow
      );
  
      ctx.fillStyle = "#090a14";
      ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
      ctx.fillStyle = PALETTE.heartEmpty;
      ctx.fillRect(bx, by, barW, barH);
  
      const fillW = Math.max(0, Math.round((boss.hp / boss.maxHp) * (barW - 2)));
      ctx.fillStyle = boss.phase === 2 ? PALETTE.bossCrimson : PALETTE.swordGlow;
      ctx.fillRect(bx + 1, by + 1, fillW, barH - 2);
    }
  
    drawTitleScreen(ctx) {
      const { menuIndex, saveManager, sound } = this.game;
  
      ctx.fillStyle = "rgba(9, 10, 20, 0.55)";
      ctx.fillRect(0, 0, VIEWPORT.WIDTH, VIEWPORT.HEIGHT);
  
      ctx.fillStyle = "#12172c";
      ctx.fillRect(0, 132, 78, 48);
      ctx.fillStyle = "#3b4978";
      ctx.fillRect(0, 132, 78, 2);
  
      const hx = 56;
      const hy = 122;
      ctx.fillStyle = PALETTE.playerCloak;
      ctx.fillRect(hx, hy + 3, 6, 7);
      ctx.fillStyle = PALETTE.playerHair;
      ctx.fillRect(hx, hy, 6, 3);
      const flutter = Math.round(Math.sin(this.game.uiTick * 0.12) * 1);
      ctx.fillRect(hx - 4, hy + 2 + flutter, 4, 2);
      ctx.fillRect(hx - 7, hy + 3 - flutter, 3, 1);
      ctx.fillStyle = PALETTE.swordGlow;
      ctx.fillRect(hx - 2, hy + 1, 2, 6);
  
      drawPixelTextCentered(
        ctx,
        "CELESTIAL BLADE",
        VIEWPORT.WIDTH / 2,
        24,
        PALETTE.swordGlow,
        PALETTE.textShadow,
        2
      );
      drawPixelTextCentered(
        ctx,
        "ECHOES OF THE ECLIPSE",
        VIEWPORT.WIDTH / 2,
        40,
        PALETTE.playerNoDash,
        PALETTE.textShadow,
        1
      );
  
      const boxW = 166;
      const boxH = 74;
      const boxX = Math.floor((VIEWPORT.WIDTH - boxW) / 2);
      const boxY = 56;
      ctx.fillStyle = "rgba(13, 16, 33, 0.88)";
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.fillStyle = PALETTE.tileEdge;
      ctx.fillRect(boxX, boxY, boxW, 1);
      ctx.fillRect(boxX, boxY + boxH - 1, boxW, 1);
      ctx.fillRect(boxX, boxY, 1, boxH);
      ctx.fillRect(boxX + boxW - 1, boxY, 1, boxH);
  
      const items = this.game.getTitleMenuItems();
      for (let i = 0; i < items.length; i++) {
        const selected = i === menuIndex;
        const iy = boxY + 9 + i * 12;
        const label = selected ? `> ${items[i]} <` : items[i];
        drawPixelTextCentered(
          ctx,
          label,
          VIEWPORT.WIDTH / 2,
          iy,
          selected ? PALETTE.swordGlow : PALETTE.textBright,
          PALETTE.textShadow
        );
      }
  
      const bestTime =
        saveManager.data.bestTimeFrames !== null
          ? formatFramesToTime(saveManager.data.bestTimeFrames)
          : "--:--.--";
      const relics = `${saveManager.data.relicsFound.length}/5`;
      drawPixelTextCentered(
        ctx,
        `BEST TIME: ${bestTime}   RELICS: ${relics}   AUDIO: ${sound.muted ? "OFF" : "ON"}`,
        VIEWPORT.WIDTH / 2,
        146,
        PALETTE.textSubtle,
        PALETTE.textShadow
      );
      drawPixelTextCentered(
        ctx,
        "[ARROWS/WASD] SELECT   [Z/SPACE/ENTER] CONFIRM",
        VIEWPORT.WIDTH / 2,
        162,
        PALETTE.textSubtle,
        PALETTE.textShadow
      );
    }
  
    drawStageSelect(ctx) {
      const { menuIndex, saveManager } = this.game;
      ctx.fillStyle = "rgba(9, 10, 20, 0.90)";
      ctx.fillRect(0, 0, VIEWPORT.WIDTH, VIEWPORT.HEIGHT);
  
      drawPixelTextCentered(
        ctx,
        "ATTUNEMENT SHRINE WARP",
        VIEWPORT.WIDTH / 2,
        14,
        PALETTE.swordGlow,
        PALETTE.textShadow
      );
      drawPixelTextCentered(
        ctx,
        "ONLY ATTUNED SHRINES CAN BE WARPED TO OR RESPAWNED AT",
        VIEWPORT.WIDTH / 2,
        26,
        PALETTE.playerNoDash,
        PALETTE.textShadow
      );
  
      for (let i = 0; i < SHRINE_CHAPTERS.length; i++) {
        const shrine = SHRINE_CHAPTERS[i];
        const isUnlocked = saveManager.hasShrine(shrine.stageIndex);
        const selected = i === menuIndex;
        const x = 40;
        const y = 44 + i * 34;
        const w = 240;
        const h = 26;
  
        ctx.fillStyle = selected ? "rgba(56, 103, 214, 0.38)" : "rgba(26, 32, 56, 0.72)";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = selected ? PALETTE.swordGlow : PALETTE.tileEdge;
        ctx.fillRect(x, y, w, 1);
        ctx.fillRect(x, y + h - 1, w, 1);
  
        ctx.fillStyle = isUnlocked ? PALETTE.playerNoDash : PALETTE.heartEmpty;
        ctx.fillRect(x + 10, y + 7, 4, 12);
        ctx.fillStyle = isUnlocked ? PALETTE.white : PALETTE.textSubtle;
        ctx.fillRect(x + 11, y + 4, 2, 3);
  
        const title = isUnlocked
          ? `CH.${shrine.numeral} - ${shrine.name}`
          : `CH.${shrine.numeral} - UNATTUNED SHRINE (LOCKED)`;
        const subtitle = isUnlocked
          ? `${shrine.subtitle} - FULL HP RESTORE`
          : "DISCOVER & ATTUNE THIS SHRINE IN THE REALM FIRST";
  
        drawPixelText(
          ctx,
          title,
          x + 22,
          y + 6,
          !isUnlocked ? PALETTE.textSubtle : selected ? PALETTE.swordGlow : PALETTE.textBright,
          PALETTE.textShadow
        );
        drawPixelText(
          ctx,
          subtitle,
          x + 22,
          y + 15,
          isUnlocked ? PALETTE.playerNoDash : PALETTE.heartEmpty,
          PALETTE.textShadow
        );
      }
  
      drawPixelTextCentered(
        ctx,
        "[Z/ENTER] WARP TO SHRINE   [ESC/X] BACK TO TITLE",
        VIEWPORT.WIDTH / 2,
        158,
        PALETTE.textSubtle,
        PALETTE.textShadow
      );
    }
  
    drawControlsScreen(ctx) {
      ctx.fillStyle = "rgba(9, 10, 20, 0.92)";
      ctx.fillRect(0, 0, VIEWPORT.WIDTH, VIEWPORT.HEIGHT);
  
      drawPixelTextCentered(
        ctx,
        "CONTROLS & COMBAT GUIDE",
        VIEWPORT.WIDTH / 2,
        12,
        PALETTE.swordGlow,
        PALETTE.textShadow
      );
  
      const lines = [
        ["MOVE / AIM:", "ARROW KEYS OR WASD"],
        ["JUMP / WALL-JUMP:", "Z, SPACE, OR K"],
        ["3-HIT SOLAR COMBO:", "X OR J (3RD HIT = 2X DMG)"],
        ["AERIAL POGO BOUNCE:", "HOLD DOWN + SLASH IN AIR"],
        ["ASTRAL DASH (I-FRAMES):", "C, SHIFT, OR L (HORIZONTAL)"],
        ["ASTRAL WAVE (TAP):", "TAP V, F, OR I (45% SOUL)"],
        ["SOUL FOCUS HEAL (HOLD):", "HOLD V/F ON GROUND (60% SOUL)"],
        ["SHRINES & DEATH:", "SHRINES HEAL & BIND RESPAWN"]
      ];
  
      for (let i = 0; i < lines.length; i++) {
        const y = 30 + i * 14;
        drawPixelText(ctx, lines[i][0], 18, y, PALETTE.playerNoDash, PALETTE.textShadow);
        drawPixelText(ctx, lines[i][1], 152, y, PALETTE.textBright, PALETTE.textShadow);
      }
  
      drawPixelTextCentered(
        ctx,
        "HP PERSISTS ACROSS STAGES! HOLD [V/F] STILL TO FOCUS HEAL!",
        VIEWPORT.WIDTH / 2,
        148,
        PALETTE.relicCyan,
        PALETTE.textShadow
      );
      drawPixelTextCentered(
        ctx,
        "[ESC / ENTER / Z] RETURN TO TITLE",
        VIEWPORT.WIDTH / 2,
        162,
        PALETTE.swordGlow,
        PALETTE.textShadow
      );
    }
  
    drawPauseOverlay(ctx) {
      const { menuIndex } = this.game;
      ctx.fillStyle = "rgba(9, 10, 20, 0.78)";
      ctx.fillRect(0, 0, VIEWPORT.WIDTH, VIEWPORT.HEIGHT);
  
      const boxW = 168;
      const boxH = 98;
      const boxX = Math.floor((VIEWPORT.WIDTH - boxW) / 2);
      const boxY = Math.floor((VIEWPORT.HEIGHT - boxH) / 2);
  
      ctx.fillStyle = "rgba(19, 25, 46, 0.95)";
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.fillStyle = PALETTE.swordGlow;
      ctx.fillRect(boxX, boxY, boxW, 1);
      ctx.fillRect(boxX, boxY + boxH - 1, boxW, 1);
  
      drawPixelTextCentered(
        ctx,
        "GAME PAUSED",
        VIEWPORT.WIDTH / 2,
        boxY + 10,
        PALETTE.swordGlow,
        PALETTE.textShadow
      );
  
      const items = this.game.getPauseMenuItems();
      for (let i = 0; i < items.length; i++) {
        const selected = i === menuIndex;
        const iy = boxY + 26 + i * 11;
        const label = selected ? `> ${items[i]} <` : items[i];
        drawPixelTextCentered(
          ctx,
          label,
          VIEWPORT.WIDTH / 2,
          iy,
          selected ? PALETTE.swordGlow : PALETTE.textBright,
          PALETTE.textShadow
        );
      }
    }
  
    drawVictoryScreen(ctx) {
      const { runFrames, runDeaths, saveManager, menuIndex } = this.game;
      ctx.fillStyle = "rgba(9, 10, 20, 0.88)";
      ctx.fillRect(0, 0, VIEWPORT.WIDTH, VIEWPORT.HEIGHT);
  
      drawPixelTextCentered(
        ctx,
        "ECLIPSE VANQUISHED",
        VIEWPORT.WIDTH / 2,
        20,
        PALETTE.swordGlow,
        PALETTE.textShadow,
        2
      );
      drawPixelTextCentered(
        ctx,
        "THE CELESTIAL REALM IS RESTORED",
        VIEWPORT.WIDTH / 2,
        38,
        PALETTE.playerNoDash,
        PALETTE.textShadow
      );
  
      const relics = saveManager.data.relicsFound.length;
      let rank = "B";
      if (runDeaths <= 2 && runFrames < 60 * 360) rank = "S";
      else if (runDeaths <= 6) rank = "A";
  
      const stats = [
        `FINAL TIME:     ${formatFramesToTime(runFrames)}`,
        `DEATHS THIS RUN: ${runDeaths}`,
        `STAR RELICS:     ${relics}/5`,
        `COMBAT RANK:     RANK ${rank}`
      ];
  
      for (let i = 0; i < stats.length; i++) {
        drawPixelTextCentered(
          ctx,
          stats[i],
          VIEWPORT.WIDTH / 2,
          58 + i * 13,
          i === 3 ? PALETTE.swordGlow : PALETTE.textBright,
          PALETTE.textShadow
        );
      }
  
      const options = ["PLAY AGAIN (NEW RUN)", "WARP TO SHRINE", "RETURN TO TITLE"];
      for (let i = 0; i < options.length; i++) {
        const selected = i === menuIndex;
        const label = selected ? `> ${options[i]} <` : options[i];
        drawPixelTextCentered(
          ctx,
          label,
          VIEWPORT.WIDTH / 2,
          122 + i * 12,
          selected ? PALETTE.swordGlow : PALETTE.textSubtle,
          PALETTE.textShadow
        );
      }
    }
  
    drawDeathOverlay(ctx, ds) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, VIEWPORT.WIDTH, VIEWPORT.HEIGHT);
  
      const hx = Math.round(ds.x - 3);
      const hy = Math.round(ds.y - 3);
  
      if (ds.timer < 18) {
        for (let r = 0; r < HEART_BITMAP.length; r++) {
          for (let c = 0; c < 7; c++) {
            if (HEART_BITMAP[r][c] === "1") {
              ctx.fillStyle = PALETTE.playerHair;
              ctx.fillRect(hx + c, hy + r, 1, 1);
            }
          }
        }
      } else if (ds.timer < 40) {
        for (let r = 0; r < HEART_BITMAP.length; r++) {
          for (let c = 0; c < 7; c++) {
            if (HEART_BITMAP[r][c] === "1") {
              const splitOffset = c < 3 ? -1 : c > 3 ? 1 : r % 2 === 0 ? -1 : 1;
              ctx.fillStyle = PALETTE.playerHair;
              ctx.fillRect(hx + c + splitOffset, hy + r, 1, 1);
            }
          }
        }
      } else {
        for (const s of ds.shards) {
          ctx.fillStyle = PALETTE.playerHair;
          ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
        }
        const boundMeta = STAGE_METADATA[this.game.checkpointStage || 0] || STAGE_METADATA[0];
        drawPixelTextCentered(
          ctx,
          `RETURNING TO SHRINE ${boundMeta.numeral} (${boundMeta.title})...`,
          VIEWPORT.WIDTH / 2,
          VIEWPORT.HEIGHT - 28,
          PALETTE.playerNoDash,
          PALETTE.textShadow
        );
      }
    }
  }

  class Game {
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
  
      this.checkpointStage = this.saveManager.data.lastShrineStage || 0;
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
  
      this.level.load(this.checkpointStage, true, true);
  
      this.lastTime = performance.now();
      this.accumulator = 0;
  
      requestAnimationFrame((t) => this.loop(t));
    }
  
    bindCheckpoint(stageIndex, x, y) {
      this.checkpointStage = stageIndex;
      this.checkpointX = x;
      this.checkpointY = y;
      this.saveManager.unlockShrine(stageIndex);
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
      const shrineStage = this.saveManager.data.lastShrineStage || 0;
      const meta = STAGE_METADATA[shrineStage] || STAGE_METADATA[0];
      return [
        `CONTINUE (SHRINE ${meta.numeral})`,
        "NEW JOURNEY",
        "WARP TO SHRINE",
        "CONTROLS & GUIDE",
        `AUDIO: ${this.sound.muted ? "MUTED" : "ON"}`
      ];
    }
  
    getPauseMenuItems() {
      return [
        "RESUME GAME",
        "RETURN TO LAST SHRINE",
        "WARP TO SHRINE",
        `AUDIO: ${this.sound.muted ? "MUTED" : "ON"}`,
        `CRT SCANLINES: ${this.saveManager.data.crtEnabled ? "ON" : "OFF"}`,
        "RETURN TO TITLE"
      ];
    }
  
    startNewJourney() {
      this.runFrames = 0;
      this.runDeaths = 0;
      this.checkpointStage = 0;
      this.saveManager.unlockShrine(0);
      this.player.soul = 0;
      this.level.load(0, true, true);
      this.state = GAME_STATE.PLAYING;
    }
  
    continueJourney() {
      const shrineStage = this.saveManager.data.lastShrineStage || 0;
      this.checkpointStage = shrineStage;
      this.level.load(shrineStage, true, true);
      this.state = GAME_STATE.PLAYING;
    }
  
    respawnAtActiveShrine() {
      const targetStage = this.checkpointStage !== null ? this.checkpointStage : 0;
      this.level.load(targetStage, true, true);
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
  
      if (ds.timer >= 86) {
        ds.active = false;
        ds.fadeAlpha = 1.0;
        this.sound.duckMusic = false;
        this.respawnAtActiveShrine();
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
            this.menuIndex = 0;
          } else if (this.menuIndex === 3) {
            this.state = GAME_STATE.CONTROLS;
          } else if (this.menuIndex === 4) {
            this.toggleMute();
          }
        }
      } else if (this.state === GAME_STATE.STAGE_SELECT) {
        const total = SHRINE_CHAPTERS.length;
        if (this.input.actionPressed("up")) {
          this.menuIndex = (this.menuIndex - 1 + total) % total;
          this.sound.playMenuMove();
        } else if (this.input.actionPressed("down")) {
          this.menuIndex = (this.menuIndex + 1) % total;
          this.sound.playMenuMove();
        } else if (this.input.actionPressed("confirm")) {
          const chosenShrine = SHRINE_CHAPTERS[this.menuIndex];
          if (chosenShrine && this.saveManager.hasShrine(chosenShrine.stageIndex)) {
            this.sound.playMenuSelect();
            this.checkpointStage = chosenShrine.stageIndex;
            this.saveManager.unlockShrine(chosenShrine.stageIndex);
            this.level.load(chosenShrine.stageIndex, true, true);
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
            this.respawnAtActiveShrine();
            this.state = GAME_STATE.PLAYING;
          } else if (this.menuIndex === 2) {
            this.state = GAME_STATE.STAGE_SELECT;
            this.menuIndex = 0;
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
        this.respawnAtActiveShrine();
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
        this.background.drawMotes(this.ctx, 11);
        this.hud.drawVictoryScreen(this.ctx);
        return;
      }
  
      this.ctx.save();
      this.ctx.translate(-this.camera.x, -this.camera.y);
  
      this.level.draw(this.ctx, this.player);
      this.player.draw(this.ctx);
      this.particles.draw(this.ctx, this.camera.x, this.camera.y);
  
      this.ctx.restore();
  
      this.background.drawMotes(this.ctx, this.level.currentIndex);
      this.hud.drawHUD(this.ctx);
      this.particles.drawScreenSpace(this.ctx);
  
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

  function bootstrap() {
    if (window.__celestialBlade) return;
    const canvas = document.getElementById("game");
    const viewportFrame = document.getElementById("viewport-frame");
    if (!canvas) return;
  
    const game = new Game(canvas, viewportFrame);
  
    const muteBtn = document.getElementById("btn-mute");
    const crtBtn = document.getElementById("btn-crt");
    const fsBtn = document.getElementById("btn-fullscreen");
  
    const syncButtons = () => {
      if (muteBtn) {
        muteBtn.textContent = game.sound.muted ? "AUDIO: OFF [M]" : "AUDIO: ON [M]";
      }
      if (crtBtn) {
        crtBtn.textContent = game.saveManager.data.crtEnabled ? "CRT: ON [T]" : "CRT: OFF [T]";
      }
    };
  
    syncButtons();
  
    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        game.sound.unlock();
        game.toggleMute();
        syncButtons();
        canvas.focus();
      });
    }
  
    if (crtBtn) {
      crtBtn.addEventListener("click", () => {
        game.toggleCRT();
        syncButtons();
        canvas.focus();
      });
    }
  
    if (fsBtn && viewportFrame) {
      fsBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
          viewportFrame.requestFullscreen?.().catch(() => {});
        } else {
          document.exitFullscreen?.().catch(() => {});
        }
        canvas.focus();
      });
    }
  
    window.addEventListener("keydown", () => {
      setTimeout(syncButtons, 10);
    });
  
    window.__celestialBlade = game;
  }
  
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();
