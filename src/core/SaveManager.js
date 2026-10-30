const STORAGE_KEY = "celestial_blade_save_v1";

const DEFAULT_SAVE = {
  highestStageUnlocked: 0,
  lastStagePlayed: 0,
  bestTimeFrames: null,
  lowestDeaths: null,
  relicsFound: [],
  totalDeaths: 0,
  totalKills: 0,
  muted: false,
  crtEnabled: false
};

/**
 * Manages persistent player progress and preferences in localStorage.
 */
export class SaveManager {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SAVE, relicsFound: [] };
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SAVE,
        ...parsed,
        relicsFound: Array.isArray(parsed.relicsFound) ? parsed.relicsFound : []
      };
    } catch {
      return { ...DEFAULT_SAVE, relicsFound: [] };
    }
  }

  save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Ignore storage quota or private browsing restrictions
    }
  }

  unlockStage(stageIndex) {
    if (stageIndex > this.data.highestStageUnlocked) {
      this.data.highestStageUnlocked = stageIndex;
    }
    this.data.lastStagePlayed = stageIndex;
    this.save();
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
    this.data.highestStageUnlocked = 9;
    this.save();
  }

  resetProgress() {
    const { muted, crtEnabled } = this.data;
    this.data = {
      ...DEFAULT_SAVE,
      relicsFound: [],
      muted,
      crtEnabled
    };
    this.save();
  }
}
