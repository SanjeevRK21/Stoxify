let ctx: AudioContext | null = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function ramp(g: GainNode, from: number, to: number, start: number, end: number) {
  g.gain.setValueAtTime(from, start);
  g.gain.linearRampToValueAtTime(to, end);
}

export function playLike() {
  try {
    const ac = getCtx();
    const o = ac.createOscillator(); const g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(440, ac.currentTime);
    o.frequency.linearRampToValueAtTime(880, ac.currentTime + 0.15);
    ramp(g, 0, 0.18, ac.currentTime, ac.currentTime + 0.01);
    ramp(g, 0.18, 0, ac.currentTime + 0.1, ac.currentTime + 0.25);
    o.start(ac.currentTime); o.stop(ac.currentTime + 0.25);
  } catch {}
}

export function playDislike() {
  try {
    const ac = getCtx();
    const o = ac.createOscillator(); const g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(280, ac.currentTime);
    o.frequency.linearRampToValueAtTime(90, ac.currentTime + 0.2);
    ramp(g, 0, 0.15, ac.currentTime, ac.currentTime + 0.01);
    ramp(g, 0.15, 0, ac.currentTime + 0.1, ac.currentTime + 0.3);
    o.start(ac.currentTime); o.stop(ac.currentTime + 0.3);
  } catch {}
}

export function playClick() {
  try {
    const ac = getCtx();
    const o = ac.createOscillator(); const g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(700, ac.currentTime);
    o.frequency.linearRampToValueAtTime(500, ac.currentTime + 0.08);
    ramp(g, 0, 0.12, ac.currentTime, ac.currentTime + 0.005);
    ramp(g, 0.12, 0, ac.currentTime + 0.03, ac.currentTime + 0.12);
    o.start(ac.currentTime); o.stop(ac.currentTime + 0.12);
  } catch {}
}

export function playSelect() {
  try {
    const ac = getCtx();
    [0, 0.07].forEach((delay, i) => {
      const o = ac.createOscillator(); const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'triangle';
      o.frequency.value = i === 0 ? 480 : 720;
      ramp(g, 0, 0.12, ac.currentTime + delay, ac.currentTime + delay + 0.01);
      ramp(g, 0.12, 0, ac.currentTime + delay + 0.05, ac.currentTime + delay + 0.18);
      o.start(ac.currentTime + delay); o.stop(ac.currentTime + delay + 0.18);
    });
  } catch {}
}

export function playReveal() {
  try {
    const ac = getCtx();
    [220, 330, 440, 660, 880].forEach((f, i) => {
      const o = ac.createOscillator(); const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine';
      o.frequency.value = f;
      ramp(g, 0, 0.12, ac.currentTime + i * 0.09, ac.currentTime + i * 0.09 + 0.02);
      ramp(g, 0.12, 0, ac.currentTime + i * 0.09 + 0.12, ac.currentTime + i * 0.09 + 0.4);
      o.start(ac.currentTime + i * 0.09); o.stop(ac.currentTime + i * 0.09 + 0.4);
    });
  } catch {}
}

export function playWhoosh() {
  try {
    const ac = getCtx();
    const bufferSize = Math.floor(ac.sampleRate * 0.9);
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ac.currentTime);
    filter.frequency.linearRampToValueAtTime(150, ac.currentTime + 0.9);
    filter.Q.value = 0.8;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ac.currentTime + 0.2);
    gain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.9);
    src.connect(filter); filter.connect(gain); gain.connect(ac.destination);
    src.start(ac.currentTime); src.stop(ac.currentTime + 0.9);
  } catch {}
}

export function playChime() {
  try {
    const ac = getCtx();
    [523, 659, 784].forEach((f, i) => {
      const o = ac.createOscillator(); const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'triangle';
      o.frequency.value = f;
      ramp(g, 0, 0.08, ac.currentTime + i * 0.12, ac.currentTime + i * 0.12 + 0.01);
      ramp(g, 0.08, 0, ac.currentTime + i * 0.12 + 0.1, ac.currentTime + i * 0.12 + 0.5);
      o.start(ac.currentTime + i * 0.12); o.stop(ac.currentTime + i * 0.12 + 0.5);
    });
  } catch {}
}

export function playOrbitPing() {
  try {
    const ac = getCtx();
    const o = ac.createOscillator(); const g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(1200, ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(600, ac.currentTime + 0.3);
    ramp(g, 0, 0.08, ac.currentTime, ac.currentTime + 0.01);
    ramp(g, 0.08, 0, ac.currentTime + 0.1, ac.currentTime + 0.3);
    o.start(ac.currentTime); o.stop(ac.currentTime + 0.3);
  } catch {}
}
