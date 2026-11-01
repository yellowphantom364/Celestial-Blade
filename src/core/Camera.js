import { VIEWPORT } from "../config/constants.js";

export class Camera {
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
