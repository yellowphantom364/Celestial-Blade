import { VIEWPORT, STAGE_METADATA } from "../config/constants.js";
import { BIOME_THEMES, PALETTE } from "../config/palette.js";

export class BackgroundRenderer {
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
