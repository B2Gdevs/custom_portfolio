/**
 * Stable HSL border tint per slug so preset cards read as siblings but distinct.
 */
export function listenPresetCardBorderAccent(slug: string): { borderColor: string } {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hue = Math.abs(h) % 360;
  const sat = 38 + (Math.abs(h >> 8) % 18);
  const light = 52 + (Math.abs(h >> 16) % 12);
  return {
    borderColor: `hsla(${hue}, ${sat}%, ${light}%, 0.55)`,
  };
}
