/**
 * Core display, physics, and gameplay tuning constants.
 */

export const VIEWPORT = Object.freeze({
  WIDTH: 320,
  HEIGHT: 180,
  TILE: 8,
  FPS: 60,
  STEP_MS: 1000 / 60
});

export const GAME_STATE = Object.freeze({
  TITLE: "TITLE",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  STAGE_SELECT: "STAGE_SELECT",
  CONTROLS: "CONTROLS",
  VICTORY: "VICTORY"
});

export const PLAYER_CONFIG = Object.freeze({
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

export const SHRINE_CHAPTERS = Object.freeze([
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

export const STAGE_METADATA = Object.freeze([
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
