const TWO_PI = Math.PI * 2;

export const hashStringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const r = (hash & 0xff0000) >> 16;
  const g = (hash & 0x00ff00) >> 8;
  const b = hash & 0x0000ff;
  return `rgb(${r}, ${g}, ${b})`;
};

export const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
};

export const normalizeAngle = (angle: number) => {
  while (angle >= TWO_PI) angle -= TWO_PI;
  while (angle < 0) angle += TWO_PI;
  return angle;
};

export const relativeAngleDiff = (angle: number, targetAngle: number) => {
  // rotate the coordinate space so the target is at PI
  const diff = normalizeAngle(angle + Math.PI - targetAngle);
  return Math.PI - diff;
};
