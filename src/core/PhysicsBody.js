import { PLAYER_CONFIG } from "../config/constants.js";

/**
 * Base AABB kinematic body with sub-pixel remainder accumulation
 * and upward ceiling corner-correction.
 */
export class PhysicsBody {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = 0;
    this.vy = 0;
    this.remX = 0;
    this.remY = 0;
    this.onGround = false;
  }

  intersects(other) {
    return (
      this.x < other.x + other.w &&
      this.x + this.w > other.x &&
      this.y < other.y + other.h &&
      this.y + this.h > other.y
    );
  }

  moveX(amount, level, onCollide) {
    this.remX += amount;
    let move = Math.round(this.remX);
    if (move !== 0) {
      this.remX -= move;
      const sign = Math.sign(move);
      while (move !== 0) {
        if (!level.collideSolid(this.x + sign, this.y, this.w, this.h)) {
          this.x += sign;
          move -= sign;
        } else {
          if (onCollide) onCollide(sign);
          break;
        }
      }
    }
  }

  moveY(amount, level, onCollide, allowCornerCorrection = false) {
    this.remY += amount;
    let move = Math.round(this.remY);
    if (move !== 0) {
      this.remY -= move;
      const sign = Math.sign(move);
      while (move !== 0) {
        if (!level.collideSolid(this.x, this.y + sign, this.w, this.h)) {
          this.y += sign;
          move -= sign;
        } else {
          // Upward jump corner correction: nudge horizontally if only clipping by a few pixels
          if (allowCornerCorrection && sign < 0) {
            let corrected = false;
            const maxNudge = PLAYER_CONFIG.CORNER_CORRECTION_PX;
            for (let nudge = 1; nudge <= maxNudge; nudge++) {
              if (!level.collideSolid(this.x + nudge, this.y + sign, this.w, this.h)) {
                this.x += nudge;
                this.y += sign;
                move -= sign;
                corrected = true;
                break;
              }
              if (!level.collideSolid(this.x - nudge, this.y + sign, this.w, this.h)) {
                this.x -= nudge;
                this.y += sign;
                move -= sign;
                corrected = true;
                break;
              }
            }
            if (corrected) continue;
          }
          if (onCollide) onCollide(sign);
          break;
        }
      }
    }
  }
}
