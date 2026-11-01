const ACTION_BINDINGS = Object.freeze({
  left: ["ArrowLeft", "KeyA"],
  right: ["ArrowRight", "KeyD"],
  up: ["ArrowUp", "KeyW"],
  down: ["ArrowDown", "KeyS"],
  jump: ["KeyZ", "Space", "KeyK"],
  attack: ["KeyX", "KeyJ"],
  dash: ["KeyC", "ShiftLeft", "ShiftRight", "KeyL"],
  skill: ["KeyV", "KeyF", "KeyU", "KeyI"],
  pause: ["Escape", "KeyP"],
  mute: ["KeyM"],
  retry: ["KeyR"],
  crt: ["KeyT"],
  confirm: ["Enter", "KeyZ", "Space", "KeyJ"]
});

const PREVENT_DEFAULT_CODES = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Space",
  "KeyZ",
  "KeyX",
  "KeyC",
  "KeyV"
]);

export class InputManager {
  constructor(soundEngine) {
    this.soundEngine = soundEngine;
    this.keys = Object.create(null);
    this.justPressed = Object.create(null);
    this.prevPadButtons = Object.create(null);

    window.addEventListener("keydown", (e) => {
      const active = document.activeElement;
      const isPageControl =
        active &&
        active.id !== "game" &&
        (active.tagName === "BUTTON" ||
          active.tagName === "A" ||
          active.tagName === "SUMMARY" ||
          active.tagName === "INPUT" ||
          active.tagName === "SELECT" ||
          active.tagName === "TEXTAREA" ||
          active.isContentEditable);

      if (isPageControl) {
        return;
      }

      const canvas = document.getElementById("game");
      const canvasFocused =
        !canvas ||
        document.activeElement === canvas ||
        !!document.fullscreenElement;

      if (!canvasFocused) {
        return;
      }

      if (this.soundEngine) {
        this.soundEngine.unlock();
      }
      const code = e.code;
      if (PREVENT_DEFAULT_CODES.has(code)) {
        e.preventDefault();
      }
      if (!this.keys[code]) {
        this.justPressed[code] = true;
      }
      this.keys[code] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    window.addEventListener("blur", () => {
      this.keys = Object.create(null);
      this.justPressed = Object.create(null);
    });
  }

  pollGamepad() {
    if (!navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    const pad = pads && pads[0];
    if (!pad) return;

    const mapBtn = (idx, virtualCode) => {
      const pressed = !!(pad.buttons[idx] && pad.buttons[idx].pressed);
      if (pressed && !this.prevPadButtons[virtualCode]) {
        this.justPressed[virtualCode] = true;
      }
      this.keys[virtualCode] = pressed;
      this.prevPadButtons[virtualCode] = pressed;
    };

    mapBtn(0, "PadJump");
    mapBtn(2, "PadAttack");
    mapBtn(1, "PadDash");
    mapBtn(3, "PadSkill");
    mapBtn(9, "PadPause");
    mapBtn(12, "PadUp");
    mapBtn(13, "PadDown");
    mapBtn(14, "PadLeft");
    mapBtn(15, "PadRight");

    const axX = pad.axes[0] || 0;
    const axY = pad.axes[1] || 0;
    this.keys.StickLeft = axX < -0.4;
    this.keys.StickRight = axX > 0.4;
    this.keys.StickUp = axY < -0.4;
    this.keys.StickDown = axY > 0.4;
  }

  isDown(code) {
    return !!this.keys[code];
  }

  pressed(code) {
    return !!this.justPressed[code];
  }

  actionDown(action) {
    const codes = ACTION_BINDINGS[action];
    if (!codes) return false;
    for (let i = 0; i < codes.length; i++) {
      if (this.keys[codes[i]]) return true;
    }
    if (action === "left" && (this.keys.PadLeft || this.keys.StickLeft)) return true;
    if (action === "right" && (this.keys.PadRight || this.keys.StickRight)) return true;
    if (action === "up" && (this.keys.PadUp || this.keys.StickUp)) return true;
    if (action === "down" && (this.keys.PadDown || this.keys.StickDown)) return true;
    if (action === "jump" && this.keys.PadJump) return true;
    if (action === "attack" && this.keys.PadAttack) return true;
    if (action === "dash" && this.keys.PadDash) return true;
    if (action === "skill" && this.keys.PadSkill) return true;
    return false;
  }

  actionPressed(action) {
    const codes = ACTION_BINDINGS[action];
    if (!codes) return false;
    for (let i = 0; i < codes.length; i++) {
      if (this.justPressed[codes[i]]) return true;
    }
    if (action === "jump" && this.justPressed.PadJump) return true;
    if (action === "attack" && this.justPressed.PadAttack) return true;
    if (action === "dash" && this.justPressed.PadDash) return true;
    if (action === "skill" && this.justPressed.PadSkill) return true;
    if (action === "pause" && this.justPressed.PadPause) return true;
    if (action === "up" && this.justPressed.PadUp) return true;
    if (action === "down" && this.justPressed.PadDown) return true;
    if (action === "left" && this.justPressed.PadLeft) return true;
    if (action === "right" && this.justPressed.PadRight) return true;
    if (action === "confirm" && this.justPressed.PadJump) return true;
    return false;
  }

  endFrame() {
    this.justPressed = Object.create(null);
  }
}
