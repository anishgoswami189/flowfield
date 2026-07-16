// Color palettes for the flow field. Each palette is a set of stops the
// particle color is sampled from based on its speed. Backgrounds use a low
// alpha so trails fade gradually into ghostly ribbons.

export const PALETTES = [
  {
    name: "Aurora",
    background: "rgba(6, 10, 20, 0.06)",
    colors: ["#00ffa3", "#00d9ff", "#7a5cff", "#ff5cf0"],
  },
  {
    name: "Ember",
    background: "rgba(18, 6, 4, 0.06)",
    colors: ["#fff2b2", "#ffb03a", "#ff5722", "#c62828"],
  },
  {
    name: "Ocean",
    background: "rgba(2, 8, 20, 0.06)",
    colors: ["#caf0f8", "#48cae4", "#0096c7", "#023e8a"],
  },
  {
    name: "Mono",
    background: "rgba(4, 4, 6, 0.05)",
    colors: ["#ffffff", "#c7c7d1", "#8a8a99", "#4a4a55"],
  },
  {
    name: "Candy",
    background: "rgba(20, 6, 18, 0.06)",
    colors: ["#ffd1f2", "#ff8fd0", "#c77dff", "#5390ff"],
  },
];

// Parse "#rrggbb" into [r, g, b].
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Sample a palette at t in [0, 1], interpolating between adjacent stops.
export function sampleColor(colors, t) {
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (colors.length - 1);
  const i = Math.floor(scaled);
  const frac = scaled - i;
  const c0 = hexToRgb(colors[i]);
  const c1 = hexToRgb(colors[Math.min(i + 1, colors.length - 1)]);
  const r = Math.round(c0[0] + (c1[0] - c0[0]) * frac);
  const g = Math.round(c0[1] + (c1[1] - c0[1]) * frac);
  const b = Math.round(c0[2] + (c1[2] - c0[2]) * frac);
  return `rgb(${r}, ${g}, ${b})`;
}
