/**
 * Color palette and biome atmospheric definitions.
 */

export const PALETTE = Object.freeze({
  bgDeep: "#0d1021",
  bgMid: "#171c36",
  bgMountain: "#20284e",
  tileFill: "#1a2038",
  tileInner: "#14182b",
  tileEdge: "#3b4978",
  tileHighlight: "#5c75b8",
  spike: "#eb3b5a",
  spikeTip: "#ff7979",
  playerHair: "#ff3864",
  playerNoDash: "#54c6eb",
  playerBody: "#f5f6fa",
  playerCloak: "#3867d6",
  playerCloakDark: "#224292",
  swordGlow: "#fed330",
  swordCombo: "#ff9f1a",
  soulCyan: "#48dbfb",
  soulBright: "#c7ecee",
  enemyBody: "#8854d0",
  enemyCharger: "#b33771",
  enemyFlyer: "#4b7bec",
  enemyEye: "#ff3864",
  bossArmor: "#d1ccc0",
  bossCloak: "#833471",
  bossGold: "#fed330",
  bossCrimson: "#eb3b5a",
  relicCyan: "#7efff5",
  white: "#ffffff",
  textSubtle: "#7c8db5",
  textBright: "#e2e8f0",
  textShadow: "#090a14",
  heartEmpty: "#2c334d"
});

export const BIOME_THEMES = Object.freeze({
  precipice: {
    skyTop: "#0b0e1d",
    skyBottom: "#141a33",
    moonColor: "#f5f6fa",
    moonGlow: "rgba(84, 198, 235, 0.12)",
    farPeak: "#151b35",
    midPeak: "#1e2749",
    pillarColor: "#12172c",
    tileFill: "#1a2038",
    tileEdge: "#3b4978",
    tileHighlight: "#5c75b8",
    moteColor: "rgba(226, 232, 240, 0.4)"
  },
  spire: {
    skyTop: "#110d24",
    skyBottom: "#1d163b",
    moonColor: "#fed330",
    moonGlow: "rgba(254, 211, 48, 0.11)",
    farPeak: "#1c1638",
    midPeak: "#2a2152",
    pillarColor: "#16112e",
    tileFill: "#211b3a",
    tileEdge: "#4c3f7c",
    tileHighlight: "#7b68c4",
    moteColor: "rgba(254, 211, 48, 0.38)"
  },
  labyrinth: {
    skyTop: "#090c18",
    skyBottom: "#13192e",
    moonColor: "#54c6eb",
    moonGlow: "rgba(84, 198, 235, 0.14)",
    farPeak: "#12182b",
    midPeak: "#1b243f",
    pillarColor: "#0f1425",
    tileFill: "#161d31",
    tileEdge: "#31446b",
    tileHighlight: "#487eb0",
    moteColor: "rgba(84, 198, 235, 0.42)"
  },
  eclipse: {
    skyTop: "#160814",
    skyBottom: "#290e22",
    moonColor: "#eb3b5a",
    moonGlow: "rgba(235, 59, 90, 0.20)",
    farPeak: "#241023",
    midPeak: "#381833",
    pillarColor: "#1c0b1b",
    tileFill: "#241326",
    tileEdge: "#5e2a55",
    tileHighlight: "#b33771",
    moteColor: "rgba(255, 56, 100, 0.48)"
  }
});
