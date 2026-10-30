import { Game } from "./core/Game.js";

function bootstrap() {
  if (window.__celestialBlade) return;
  const canvas = document.getElementById("game");
  const viewportFrame = document.getElementById("viewport-frame");
  if (!canvas) return;

  const game = new Game(canvas, viewportFrame);

  const muteBtn = document.getElementById("btn-mute");
  const crtBtn = document.getElementById("btn-crt");
  const fsBtn = document.getElementById("btn-fullscreen");

  const syncButtons = () => {
    if (muteBtn) {
      muteBtn.textContent = game.sound.muted ? "AUDIO: OFF [M]" : "AUDIO: ON [M]";
    }
    if (crtBtn) {
      crtBtn.textContent = game.saveManager.data.crtEnabled ? "CRT: ON [T]" : "CRT: OFF [T]";
    }
  };

  syncButtons();

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      game.sound.unlock();
      game.toggleMute();
      syncButtons();
      canvas.focus();
    });
  }

  if (crtBtn) {
    crtBtn.addEventListener("click", () => {
      game.toggleCRT();
      syncButtons();
      canvas.focus();
    });
  }

  if (fsBtn && viewportFrame) {
    fsBtn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        viewportFrame.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
      canvas.focus();
    });
  }

  window.addEventListener("keydown", () => {
    setTimeout(syncButtons, 10);
  });

  window.__celestialBlade = game;
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
