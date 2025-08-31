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

export class Tweened {
  value: number;
  prev: number;
  next: number;
  progress = 1;
  duration: number;
  ease: (t: number) => number;
  constructor(value: number, duration = 0.5, ease = easing.easeOutCubic) {
    this.value = value;
    this.prev = value;
    this.next = value;
    this.ease = ease;
    this.duration = duration;
  }

  update(target: number, dt: number) {
    if (target !== this.next) {
      const current =
        this.progress >= 1
          ? this.next
          : this.prev + (this.next - this.prev) * this.ease(this.progress);

      this.prev = current;
      this.next = target;
      this.progress = 0;
    }

    if (this.progress >= 1) return;

    this.progress += dt / this.duration;
    if (this.progress >= 1) {
      this.progress = 1;
      this.value = this.next;
    } else {
      this.value =
        this.prev + (this.next - this.prev) * this.ease(this.progress);
    }
  }
}

export const easing = {
  easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
  },
  linear(t: number) {
    return t;
  },
  parabolic(t: number) {
    return 4 * t * (1 - t);
  },

  // easeInQuad(t: number) {
  //   return t * t;
  // },

  // easeOutQuad(t: number) {
  //   return t * (2 - t);
  // },

  // easeInOutQuad(t: number) {
  //   return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  // },
};

export class Splitmix32 {
  seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }

  rnd() {
    this.seed |= 0;
    this.seed = (this.seed + 0x9e3779b9) | 0;
    let t = this.seed ^ (this.seed >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
  }

  float(min: number = 0, max: number = 1) {
    return this.rnd() * (max - min) + min;
  }

  int(min: number, max: number) {
    return Math.floor(this.rnd() * (max - min + 1)) + min;
  }
}

export const toRad = (deg: number) => (deg * Math.PI) / 180;
