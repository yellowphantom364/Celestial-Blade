import { PLAYER_CONFIG } from "../config/constants.js";
import { PALETTE } from "../config/palette.js";

export class SpriteRenderer {
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
