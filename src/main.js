import { GAME_STATE, STAGE_METADATA, VIEWPORT } from "./config/constants.js";
import { Game } from "./core/Game.js";
import { formatFramesToTime } from "./ui/HUDRenderer.js";

const SCHEME_KEYCAPS = {
  classic: [
    { key: "ARROWS", label: "MOVE / AIM" },
    { key: "Z / SPACE", label: "JUMP" },
    { key: "X", label: "3-HIT SLASH" },
    { key: "DOWN + X", label: "AERIAL POGO" },
    { key: "C / SHIFT", label: "ASTRAL DASH" },
    { key: "TAP V", label: "SOUL WAVE" },
    { key: "HOLD V", label: "FOCUS HEAL" },
    { key: "ESC", label: "PAUSE" }
  ],
  wasd: [
    { key: "W A S D", label: "MOVE / AIM" },
    { key: "SPACE / K", label: "JUMP" },
    { key: "J", label: "3-HIT SLASH" },
    { key: "S + J", label: "AERIAL POGO" },
    { key: "L / SHIFT", label: "ASTRAL DASH" },
    { key: "TAP I / U", label: "SOUL WAVE" },
    { key: "HOLD I / U", label: "FOCUS HEAL" },
    { key: "ESC / P", label: "PAUSE" }
  ],
  gamepad: [
    { key: "D-PAD / L-STICK", label: "MOVE / AIM" },
    { key: "SOUTH (A / CROSS)", label: "JUMP" },
    { key: "WEST (X / SQUARE)", label: "3-HIT SLASH" },
    { key: "DOWN + WEST", label: "AERIAL POGO" },
    { key: "EAST (B / CIRCLE)", label: "ASTRAL DASH" },
    { key: "TAP NORTH (Y)", label: "SOUL WAVE" },
    { key: "HOLD NORTH (Y)", label: "FOCUS HEAL" },
    { key: "START", label: "PAUSE" }
  ]
};

function renderEditorialPlates(game) {
  const plateConfigs = [
    {
      id: "plate-lead-sanctum",
      stageIndex: 11,
      width: 960,
      height: 540,
      playerX: 88,
      playerY: 96,
      facing: 1,
      caption: "CH. XII // ECLIPSE SANCTUM — SERAPH VAEL ARENA"
    },
    {
      id: "plate-sub-bastion",
      stageIndex: 4,
      width: 480,
      height: 300,
      playerX: 138,
      playerY: 196,
      facing: 1,
      caption: "CH. V // CRIMSON BASTION — VANGUARD KEEP"
    },
    {
      id: "plate-sub-cloister",
      stageIndex: 6,
      width: 480,
      height: 300,
      playerX: 112,
      playerY: 96,
      facing: 1,
      caption: "CH. VII // MANTIS CLOISTER — SCYTHE DUELISTS"
    },
    {
      id: "plate-sub-observatory",
      stageIndex: 8,
      width: 480,
      height: 300,
      playerX: 98,
      playerY: 96,
      facing: 1,
      caption: "CH. IX // ASTRAL OBSERVATORY — VOID SCHOLARS"
    }
  ];

  const offscreen = document.createElement("canvas");
  offscreen.width = VIEWPORT.WIDTH;
  offscreen.height = VIEWPORT.HEIGHT;
  const octx = offscreen.getContext("2d");
  if (!octx) return;
  octx.imageSmoothingEnabled = false;

  const outCanvas = document.createElement("canvas");
  const outCtx = outCanvas.getContext("2d");
  if (!outCtx) return;

  const savedStage = game.level.currentIndex;
  const savedState = game.state;
  const savedX = game.player.x;
  const savedY = game.player.y;
  const savedFacing = game.player.facing;
  const savedHasSword = game.player.hasSword;
  const savedCamX = game.camera.x;
  const savedCamY = game.camera.y;

  try {
    for (const cfg of plateConfigs) {
      const imgEl = document.getElementById(cfg.id);
      if (!imgEl) continue;

      game.level.load(cfg.stageIndex, false, false);
      game.player.hasSword = true;
      game.player.x = cfg.playerX;
      game.player.y = cfg.playerY;
      game.player.facing = cfg.facing;
      game.player.updateScarf();
      game.camera.snapTo(
        game.player,
        game.level.cols * VIEWPORT.TILE,
        game.level.rows * VIEWPORT.TILE
      );

      octx.clearRect(0, 0, VIEWPORT.WIDTH, VIEWPORT.HEIGHT);
      game.background.draw(octx, game.camera.x, cfg.stageIndex);
      octx.save();
      octx.translate(-game.camera.x, -game.camera.y);
      game.level.draw(octx, game.player);
      game.player.draw(octx);
      octx.restore();
      game.background.drawMotes(octx, cfg.stageIndex);

      outCanvas.width = cfg.width;
      outCanvas.height = cfg.height;
      outCtx.imageSmoothingEnabled = false;
      outCtx.drawImage(offscreen, 0, 0, cfg.width, cfg.height);

      const imgData = outCtx.getImageData(0, 0, cfg.width, cfg.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const boosted = Math.max(0, Math.min(255, (lum - 24) * 1.48 + 18));
        const row = Math.floor(i / 4 / cfg.width);
        const scanFactor = row % 3 === 0 ? 0.84 : 1.0;
        const v = Math.round(boosted * scanFactor);
        data[i] = Math.round(v * 0.95);
        data[i + 1] = Math.min(255, Math.round(v * 1.02));
        data[i + 2] = Math.round(v * 0.97);
      }
      outCtx.putImageData(imgData, 0, 0);

      imgEl.src = outCanvas.toDataURL("image/png");
    }
  } catch {
    // Fallback inline SVG remains intact if canvas readback fails
  } finally {
    game.level.load(savedStage, true, true);
    game.player.x = savedX;
    game.player.y = savedY;
    game.player.facing = savedFacing;
    game.player.hasSword = savedHasSword;
    game.camera.x = savedCamX;
    game.camera.y = savedCamY;
    game.state = savedState;
  }
}

function bootstrap() {
  if (window.__celestialBlade) return;
  const canvas = document.getElementById("game");
  const viewportFrame = document.getElementById("viewport-frame");
  if (!canvas) return;

  const game = new Game(canvas, viewportFrame);
  window.__celestialBlade = game;

  renderEditorialPlates(game);

  const muteBtn = document.getElementById("btn-mute");
  const crtBtn = document.getElementById("btn-crt");
  const fsBtn = document.getElementById("btn-fullscreen");
  const focusStatusEl = document.getElementById("viewport-focus-status");
  const activeStageLabelEl = document.getElementById("viewport-stage-label");

  const syncButtonsAndTelemetry = () => {
    if (muteBtn) {
      muteBtn.textContent = game.sound.muted ? "AUDIO: OFF [M]" : "AUDIO: ON [M]";
      muteBtn.setAttribute("aria-pressed", String(!game.sound.muted));
    }
    if (crtBtn) {
      crtBtn.textContent = game.saveManager.data.crtEnabled ? "CRT: ON [T]" : "CRT: OFF [T]";
      crtBtn.setAttribute("aria-pressed", String(!!game.saveManager.data.crtEnabled));
    }

    const meta = STAGE_METADATA[game.level.currentIndex] || STAGE_METADATA[0];
    if (activeStageLabelEl) {
      activeStageLabelEl.textContent = `CH.${meta.numeral} // ${meta.title}`;
    }

    const stageButtons = document.querySelectorAll("[data-load-stage]");
    stageButtons.forEach((btn) => {
      const idx = Number(btn.getAttribute("data-load-stage"));
      const isCurrent = idx === game.level.currentIndex && game.state === GAME_STATE.PLAYING;
      btn.classList.toggle("is-active", isCurrent);
      btn.setAttribute("aria-pressed", String(isCurrent));
    });

    const save = game.saveManager.data;
    const bestTimeEl = document.getElementById("telemetry-best-time");
    const lowestDeathsEl = document.getElementById("telemetry-lowest-deaths");
    const relicsEl = document.getElementById("telemetry-relics");
    const killsEl = document.getElementById("telemetry-kills");
    const shrinesEl = document.getElementById("telemetry-shrines");

    if (bestTimeEl) {
      bestTimeEl.textContent =
        save.bestTimeFrames !== null ? formatFramesToTime(save.bestTimeFrames) : "--:--.--";
    }
    if (lowestDeathsEl) {
      lowestDeathsEl.textContent =
        save.lowestDeaths !== null ? String(save.lowestDeaths) : "--";
    }
    if (relicsEl) {
      relicsEl.textContent = `${save.relicsFound.length} / 5`;
    }
    if (killsEl) {
      killsEl.textContent = String(save.totalKills || 0);
    }
    if (shrinesEl) {
      const numerals = (save.unlockedShrines || [0])
        .map((s) => STAGE_METADATA[s]?.numeral || "I")
        .join(", ");
      shrinesEl.textContent = `CH. ${numerals}`;
    }
  };

  const syncFocusIndicator = () => {
    const isFocused = document.activeElement === canvas || !!document.fullscreenElement;
    if (focusStatusEl) {
      focusStatusEl.textContent = isFocused
        ? "INPUT: ARMED [KEYS CAPTURED]"
        : "INPUT: STANDBY [CLICK CANVAS]";
      focusStatusEl.classList.toggle("is-armed", isFocused);
    }
    if (viewportFrame) {
      viewportFrame.classList.toggle("is-focused", isFocused);
    }
  };

  syncButtonsAndTelemetry();
  syncFocusIndicator();

  canvas.addEventListener("focus", syncFocusIndicator);
  canvas.addEventListener("blur", syncFocusIndicator);
  document.addEventListener("fullscreenchange", syncFocusIndicator);

  if (viewportFrame) {
    viewportFrame.addEventListener("pointerdown", () => {
      game.sound.unlock();
      canvas.focus({ preventScroll: true });
      syncFocusIndicator();
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      game.sound.unlock();
      game.toggleMute();
      syncButtonsAndTelemetry();
      canvas.focus({ preventScroll: true });
    });
  }

  if (crtBtn) {
    crtBtn.addEventListener("click", () => {
      game.toggleCRT();
      syncButtonsAndTelemetry();
      canvas.focus({ preventScroll: true });
    });
  }

  if (fsBtn && viewportFrame) {
    fsBtn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        viewportFrame.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
      canvas.focus({ preventScroll: true });
    });
  }

  const focusTriggers = document.querySelectorAll("[data-focus-game]");
  focusTriggers.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const targetStageAttr = btn.getAttribute("data-target-stage");
      const viewportSection = document.getElementById("play-viewport");
      if (viewportSection) {
        e.preventDefault();
        viewportSection.scrollIntoView({ behavior: "auto", block: "start" });
      }
      game.sound.unlock();
      if (targetStageAttr !== null && targetStageAttr !== "") {
        const stageIdx = Number(targetStageAttr);
        if (!Number.isNaN(stageIdx)) {
          game.level.load(stageIdx, false, true);
          game.state = GAME_STATE.PLAYING;
        }
      }
      canvas.focus({ preventScroll: true });
      syncButtonsAndTelemetry();
      syncFocusIndicator();
    });
  });

  const stageButtons = document.querySelectorAll("[data-load-stage]");
  stageButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-load-stage"));
      if (Number.isNaN(idx)) return;
      game.sound.unlock();
      game.level.load(idx, false, true);
      game.state = GAME_STATE.PLAYING;
      const viewportSection = document.getElementById("play-viewport");
      if (viewportSection) {
        const rect = viewportSection.getBoundingClientRect();
        if (rect.top < -120 || rect.bottom > window.innerHeight + 120) {
          viewportSection.scrollIntoView({ behavior: "auto", block: "start" });
        }
      }
      canvas.focus({ preventScroll: true });
      syncButtonsAndTelemetry();
      syncFocusIndicator();
    });
  });

  const schemeRecords = document.querySelectorAll("[data-scheme-record]");
  const keycapBar = document.getElementById("status-keycaps");
  const renderKeycaps = (scheme) => {
    if (!keycapBar) return;
    const list = SCHEME_KEYCAPS[scheme] || SCHEME_KEYCAPS.classic;
    keycapBar.innerHTML = list
      .map(
        (item) =>
          `<span class="status-pill"><kbd>${item.key}</kbd> ${item.label}</span>`
      )
      .join("");
  };

  schemeRecords.forEach((row) => {
    const activateScheme = () => {
      const scheme = row.getAttribute("data-scheme-record") || "classic";
      schemeRecords.forEach((r) => {
        const selected = r === row;
        r.classList.toggle("is-selected", selected);
        r.setAttribute("aria-checked", String(selected));
      });
      renderKeycaps(scheme);
    };

    row.addEventListener("click", activateScheme);
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activateScheme();
      }
    });
  });

  const actRecords = document.querySelectorAll("[data-act-record]");
  actRecords.forEach((row) => {
    const activateAct = (e) => {
      if (e && e.target && e.target.closest("[data-load-stage]")) {
        return;
      }
      actRecords.forEach((r) => {
        const selected = r === row;
        r.classList.toggle("is-selected", selected);
        r.setAttribute("aria-checked", String(selected));
      });
    };

    row.addEventListener("click", activateAct);
    row.addEventListener("keydown", (e) => {
      if (e.target !== row) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activateAct(e);
      }
    });
  });

  window.addEventListener("keydown", () => {
    setTimeout(syncButtonsAndTelemetry, 16);
  });

  setInterval(syncButtonsAndTelemetry, 1000);
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
