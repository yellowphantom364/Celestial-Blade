import { PALETTE } from "../config/palette.js";

export const PIXEL_FONT = Object.freeze({
  A: ["010", "101", "111", "101", "101"],
  B: ["110", "101", "110", "101", "110"],
  C: ["011", "100", "100", "100", "011"],
  D: ["110", "101", "101", "101", "110"],
  E: ["111", "100", "110", "100", "111"],
  F: ["111", "100", "110", "100", "100"],
  G: ["011", "100", "101", "101", "011"],
  H: ["101", "101", "111", "101", "101"],
  I: ["111", "010", "010", "010", "111"],
  J: ["001", "001", "001", "101", "010"],
  K: ["101", "101", "110", "101", "101"],
  L: ["100", "100", "100", "100", "111"],
  M: ["10001", "11011", "10101", "10001", "10001"],
  N: ["1001", "1101", "1011", "1001", "1001"],
  O: ["010", "101", "101", "101", "010"],
  P: ["110", "101", "110", "100", "100"],
  Q: ["010", "101", "101", "011", "001"],
  R: ["110", "101", "110", "101", "101"],
  S: ["011", "100", "010", "001", "110"],
  T: ["111", "010", "010", "010", "010"],
  U: ["101", "101", "101", "101", "111"],
  V: ["101", "101", "101", "101", "010"],
  W: ["10001", "10001", "10101", "11011", "10001"],
  X: ["101", "101", "010", "101", "101"],
  Y: ["101", "101", "010", "010", "010"],
  Z: ["111", "001", "010", "100", "111"],
  0: ["111", "101", "101", "101", "111"],
  1: ["010", "110", "010", "010", "111"],
  2: ["110", "001", "010", "100", "111"],
  3: ["110", "001", "010", "001", "110"],
  4: ["101", "101", "111", "001", "001"],
  5: ["111", "100", "110", "001", "110"],
  6: ["011", "100", "111", "101", "111"],
  7: ["111", "001", "010", "010", "010"],
  8: ["111", "101", "111", "101", "111"],
  9: ["111", "101", "111", "001", "110"],
  "[": ["11", "10", "10", "10", "11"],
  "]": ["11", "01", "01", "01", "11"],
  "(": ["01", "10", "10", "10", "01"],
  ")": ["10", "01", "01", "01", "10"],
  "/": ["001", "001", "010", "100", "100"],
  ">": ["100", "010", "001", "010", "100"],
  "<": ["001", "010", "100", "010", "001"],
  "-": ["000", "000", "111", "000", "000"],
  "+": ["000", "010", "111", "010", "000"],
  "&": ["010", "101", "010", "101", "011"],
  ":": ["0", "1", "0", "1", "0"],
  ".": ["0", "0", "0", "0", "1"],
  ",": ["0", "0", "0", "1", "1"],
  "!": ["1", "1", "1", "0", "1"],
  "?": ["110", "001", "010", "000", "010"],
  "%": ["101", "001", "010", "100", "101"],
  "*": ["101", "010", "111", "010", "101"],
  " ": ["00", "00", "00", "00", "00"]
});

export function measurePixelText(text, scale = 1) {
  const str = String(text).toUpperCase();
  let width = 0;
  for (let i = 0; i < str.length; i++) {
    const glyph = PIXEL_FONT[str[i]] || PIXEL_FONT[" "];
    width += (glyph[0].length + 1) * scale;
  }
  return Math.max(0, width - scale);
}

export function drawPixelText(
  ctx,
  text,
  x,
  y,
  color = PALETTE.textBright,
  shadowColor = PALETTE.textShadow,
  scale = 1
) {
  const str = String(text).toUpperCase();
  let cursorX = Math.round(x);
  const startY = Math.round(y);

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const glyph = PIXEL_FONT[ch] || PIXEL_FONT[" "];
    const gw = glyph[0].length;

    if (shadowColor) {
      ctx.fillStyle = shadowColor;
      for (let r = 0; r < 5; r++) {
        const row = glyph[r];
        for (let c = 0; c < gw; c++) {
          if (row[c] === "1") {
            ctx.fillRect(cursorX + c * scale + 1, startY + r * scale + 1, scale, scale);
          }
        }
      }
    }

    ctx.fillStyle = color;
    for (let r = 0; r < 5; r++) {
      const row = glyph[r];
      for (let c = 0; c < gw; c++) {
        if (row[c] === "1") {
          ctx.fillRect(cursorX + c * scale, startY + r * scale, scale, scale);
        }
      }
    }

    cursorX += (gw + 1) * scale;
  }
}

export function drawPixelTextCentered(
  ctx,
  text,
  centerX,
  y,
  color = PALETTE.textBright,
  shadowColor = PALETTE.textShadow,
  scale = 1
) {
  const w = measurePixelText(text, scale);
  drawPixelText(ctx, text, Math.round(centerX - w / 2), y, color, shadowColor, scale);
}
