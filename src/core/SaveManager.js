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

export class SaveManager {
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
