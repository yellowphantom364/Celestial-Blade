import { VIEWPORT, STAGE_METADATA } from "../config/constants.js";
import { BIOME_THEMES, PALETTE } from "../config/palette.js";

/**
 * Multi-layer parallax background renderer with biome palettes,
 * celestial moon/eclipse, stepped peaks, ruined pillars, and drifting motes.
 */
export class BackgroundRenderer {
  constructor() {
    this.stars = Array.from({ length: 42 }, () => ({
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

  drawCelestialBody(ctx, theme, isEclipse) {
    const mx = 252;
    const my = 34;

    // Outer atmospheric halo
    ctx.fillStyle = theme.moonGlow;
    ctx.fillRect(mx - 18, my - 18, 36, 36);
    ctx.fillRect(mx - 14, my - 14, 28, 28);

    if (isEclipse) {
      // Blood-gold solar eclipse corona
      ctx.fillStyle = PALETTE.swordGlow;
      ctx.fillRect(mx - 9, my - 9, 18, 18);
      ctx.fillStyle = theme.moonColor;
      ctx.fillRect(mx - 8, my - 8, 16, 16);
      ctx.fillStyle = theme.skyTop;
      ctx.fillRect(mx - 6, my - 6, 12, 12);
    } else {
      // Crisp pixel moon with crescent shadow
      ctx.fillStyle = theme.moonColor;
      ctx.fillRect(mx - 7, my - 7, 14, 14);
      ctx.fillStyle = theme.skyTop;
      ctx.fillRect(mx - 3, my - 6, 8, 10);
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

    // Two-tone stepped sky backdrop
    ctx.fillStyle = theme.skyTop;
    ctx.fillRect(0, 0, VIEWPORT.WIDTH, VIEWPORT.HEIGHT);
    ctx.fillStyle = theme.skyBottom;
    ctx.fillRect(0, Math.floor(VIEWPORT.HEIGHT * 0.45), VIEWPORT.WIDTH, VIEWPORT.HEIGHT);

    // Stars
    for (const s of this.stars) {
      const alpha = 0.3 + 0.5 * Math.sin(this.tick * 0.04 + s.blinkOffset);
      ctx.fillStyle = `rgba(226, 232, 240, ${alpha.toFixed(2)})`;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }

    // Moon or Eclipse
    this.drawCelestialBody(ctx, theme, meta.biome === "eclipse");

    // Far mountain range
    const parallax1 = Math.floor((cameraX * 0.08 + levelIndex * 20) / 2) * 2;
    for (let i = -1; i < 6; i++) {
      const mx = i * 72 - (parallax1 % 72);
      const peakY = 62 + (Math.abs(i) % 2) * 16;
      this.drawSteppedPeak(ctx, mx, peakY, 36, 4, theme.farPeak);
    }

    // Mid mountain range
    const parallax2 = Math.floor((cameraX * 0.16 + levelIndex * 40) / 2) * 2;
    for (let i = -1; i < 8; i++) {
      const mx = i * 52 - (parallax2 % 52);
      const peakY = 96 + (Math.abs(i) % 3) * 8;
      this.drawSteppedPeak(ctx, mx, peakY, 26, 2, theme.midPeak);
    }

    // Ancient background pillars
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
