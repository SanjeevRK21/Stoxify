const NEON = [
  'rgba(0,229,118,0.9)',    // electric green
  'rgba(0,184,212,0.9)',    // cyan
  'rgba(41,121,255,0.9)',   // blue
  'rgba(190,0,255,0.9)',    // violet
  'rgba(255,0,110,0.9)',    // hot pink
  'rgba(255,230,0,0.9)',    // yellow
  'rgba(255,107,0,0.9)',    // orange
  'rgba(0,255,255,0.9)',    // aqua
  'rgba(255,0,51,0.9)',     // red
  'rgba(57,255,20,0.9)',    // neon lime
];

const BEAM_NEON = [
  ['rgba(0,229,118,0)', 'rgba(0,229,118,1)', 'rgba(0,229,118,0)'],
  ['rgba(0,184,212,0)', 'rgba(0,184,212,1)', 'rgba(0,184,212,0)'],
  ['rgba(190,0,255,0)', 'rgba(190,0,255,1)', 'rgba(190,0,255,0)'],
  ['rgba(255,0,110,0)', 'rgba(255,0,110,1)', 'rgba(255,0,110,0)'],
  ['rgba(255,230,0,0)', 'rgba(255,230,0,1)', 'rgba(255,230,0,0)'],
  ['rgba(255,107,0,0)', 'rgba(255,107,0,1)', 'rgba(255,107,0,0)'],
  ['rgba(41,121,255,0)', 'rgba(41,121,255,1)', 'rgba(41,121,255,0)'],
  ['rgba(57,255,20,0)', 'rgba(57,255,20,1)', 'rgba(57,255,20,0)'],
];

const GLOW_COLORS = [
  'rgba(0,229,118,0.6)',
  'rgba(0,184,212,0.6)',
  'rgba(190,0,255,0.6)',
  'rgba(255,0,110,0.6)',
  'rgba(255,230,0,0.6)',
  'rgba(255,107,0,0.6)',
];

export function ElectricBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* multi-color neon grid */}
      <div className="laser-grid" />
      <div className="laser-grid-pink" />

      {/* scanner lines - multiple colors */}
      <div className="scanner-line scanner-green" />
      <div className="scanner-line scanner-pink" style={{ animationDelay: '1.5s', animationDuration: '5s' }} />
      <div className="scanner-line scanner-violet" style={{ animationDelay: '3s', animationDuration: '6s' }} />

      {/* horizontal neon laser beams */}
      {Array.from({ length: 12 }).map((_, i) => {
        const colors = BEAM_NEON[i % BEAM_NEON.length];
        return (
          <div
            key={`hbeam-${i}`}
            className="laser-beam"
            style={{
              top: `${7 + i * 8}%`,
              '--dur': `${3.5 + (i % 5) * 0.7}s`,
              '--delay': `${i * 0.6}s`,
              background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
              boxShadow: `0 0 8px 2px ${colors[1].replace('0.9', '0.5')}`,
            } as React.CSSProperties}
          />
        );
      })}

      {/* vertical data streams - neon colors */}
      {Array.from({ length: 14 }).map((_, i) => {
        const color = NEON[i % NEON.length];
        const glow = GLOW_COLORS[i % GLOW_COLORS.length];
        return (
          <div
            key={`stream-${i}`}
            className="data-stream"
            style={{
              left: `${i * 7 + 2}%`,
              '--dur': `${2.5 + (i % 5) * 0.6}s`,
              '--delay': `${i * 0.4}s`,
              background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
              boxShadow: `0 0 6px ${glow}`,
            } as React.CSSProperties}
          />
        );
      })}

      {/* floating neon particles */}
      {Array.from({ length: 24 }).map((_, i) => {
        const color = NEON[i % NEON.length];
        return (
          <div
            key={`particle-${i}`}
            className="particle"
            style={{
              left: `${(i * 4.2 + 1) % 100}%`,
              '--dur': `${4 + (i % 6)}s`,
              '--delay': `${(i * 0.5) % 5}s`,
              background: color,
              boxShadow: `0 0 8px ${color}, 0 0 20px ${color.replace('0.9', '0.4')}`,
              width: i % 4 === 0 ? '4px' : '2px',
              height: i % 4 === 0 ? '4px' : '2px',
            } as React.CSSProperties}
          />
        );
      })}

      {/* corner arc flares */}
      <div className="corner-flare corner-tl" />
      <div className="corner-flare corner-tr" />
      <div className="corner-flare corner-bl" />
      <div className="corner-flare corner-br" />

      {/* ambient color blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[180px]"
        style={{ background: 'radial-gradient(ellipse, rgba(0,229,118,0.06) 0%, transparent 70%)' }} />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full blur-[150px]"
        style={{ background: 'radial-gradient(ellipse, rgba(190,0,255,0.07) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full blur-[160px]"
        style={{ background: 'radial-gradient(ellipse, rgba(255,0,110,0.06) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] rounded-full blur-[130px]"
        style={{ background: 'radial-gradient(ellipse, rgba(255,230,0,0.05) 0%, transparent 70%)' }} />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(ellipse, rgba(0,184,212,0.05) 0%, transparent 70%)' }} />
    </div>
  );
}
