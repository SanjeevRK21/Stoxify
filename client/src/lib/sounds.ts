let ctx: AudioContext | null = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function ramp(g: GainNode, from: number, to: number, start: number, end: number) {
  g.gain.setValueAtTime(from, start);
  g.gain.linearRampToValueAtTime(to, end);
}

export function playLike() {
  try {
    const ac = getCtx();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(440, ac.currentTime);
    o.frequency.linearRampToValueAtTime(880, ac.currentTime + 0.15);
    ramp(g, 0, 0.3, ac.currentTime, ac.currentTime + 0.01);
    ramp(g, 0.3, 0, ac.currentTime + 0.1, ac.currentTime + 0.25);
    o.start(ac.currentTime);
    o.stop(ac.currentTime + 0.25);
  } catch {}
}

export function playDislike() {
  try {
    const ac = getCtx();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(300, ac.currentTime);
    o.frequency.linearRampToValueAtTime(100, ac.currentTime + 0.2);
    ramp(g, 0, 0.25, ac.currentTime, ac.currentTime + 0.01);
    ramp(g, 0.25, 0, ac.currentTime + 0.1, ac.currentTime + 0.3);
    o.start(ac.currentTime);
    o.stop(ac.currentTime + 0.3);
  } catch {}
}

export function playClick() {
  try {
    const ac = getCtx();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = 'square';
    o.frequency.setValueAtTime(600, ac.currentTime);
    o.frequency.linearRampToValueAtTime(800, ac.currentTime + 0.05);
    ramp(g, 0, 0.15, ac.currentTime, ac.currentTime + 0.005);
    ramp(g, 0.15, 0, ac.currentTime + 0.02, ac.currentTime + 0.1);
    o.start(ac.currentTime);
    o.stop(ac.currentTime + 0.1);
  } catch {}
}

export function playSelect() {
  try {
    const ac = getCtx();
    [0, 0.07].forEach((delay, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'triangle';
      o.frequency.value = i === 0 ? 520 : 780;
      ramp(g, 0, 0.2, ac.currentTime + delay, ac.currentTime + delay + 0.01);
      ramp(g, 0.2, 0, ac.currentTime + delay + 0.05, ac.currentTime + delay + 0.15);
      o.start(ac.currentTime + delay);
      o.stop(ac.currentTime + delay + 0.15);
    });
  } catch {}
}

export function playReveal() {
  try {
    const ac = getCtx();
    const freqs = [220, 330, 440, 660, 880];
    freqs.forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(f, ac.currentTime + i * 0.08);
      ramp(g, 0, 0.18, ac.currentTime + i * 0.08, ac.currentTime + i * 0.08 + 0.02);
      ramp(g, 0.18, 0, ac.currentTime + i * 0.08 + 0.1, ac.currentTime + i * 0.08 + 0.35);
      o.start(ac.currentTime + i * 0.08);
      o.stop(ac.currentTime + i * 0.08 + 0.35);
    });
  } catch {}
}
