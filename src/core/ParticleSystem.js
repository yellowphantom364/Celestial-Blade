import { VIEWPORT } from "../config/constants.js";
import { PALETTE } from "../config/palette.js";
import { drawPixelText } from "../graphics/PixelFont.js";

const MINI_HEART = [
  "0110110",
  "1111111",
  "1111111",
  "0111110",
  "0011100",
  "0001000"
];

export class ParticleSystem {
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
