import {
  PLAYER_CONFIG,
  SHRINE_CHAPTERS,
  STAGE_METADATA,
  VIEWPORT
} from "../config/constants.js";
import { PALETTE } from "../config/palette.js";
import { drawPixelText, drawPixelTextCentered } from "../graphics/PixelFont.js";

const HEART_BITMAP = [
  "0110110",
  "1111111",
  "1111111",
  "0111110",
  "0011100",
  "0001000"
];

export function formatFramesToTime(frames) {
  const totalSeconds = Math.floor(frames / 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const centis = Math.floor(((frames % 60) / 60) * 100);
  const mm = String(mins).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  const cc = String(centis).padStart(2, "0");
  return `${mm}:${ss}.${cc}`;
}

export class HUDRenderer {
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
