import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { BehavioralStep } from "@/components/wizard/BehavioralStep";
import { PreferencesStep } from "@/components/wizard/PreferencesStep";
import { RecommendationStep } from "@/components/wizard/RecommendationStep";
import { motion, AnimatePresence } from "framer-motion";

const STEP_THEMES = {
  1: {
    label: 'Volcanic Planet',
    sublabel: 'Behavioral Analysis',
    dot: 'bg-orange-500',
    containerClass: 'atmo-volcanic',
  },
  2: {
    label: 'Ice Planet',
    sublabel: 'Investment Preferences',
    dot: 'bg-blue-400',
    containerClass: 'atmo-ice',
  },
  3: {
    label: 'Black Hole',
    sublabel: 'Portfolio Engine',
    dot: 'bg-purple-400',
    containerClass: 'atmo-blackhole',
  },
};

// ── Step-specific atmospheric decorations ──────────────
function VolcanicDecor() {
  return (
    <>
      <div className="lava-glow" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="lava-crack" style={{
          width: `${60 + i * 40}px`,
          height: `${2 + (i % 2)}px`,
          top: `${70 + i * 6}%`,
          left: `${5 + i * 18}%`,
          '--angle': `${10 + i * 8}deg`,
          '--delay': `${i * 0.8}s`,
        } as React.CSSProperties} />
      ))}
      {/* floating embers */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${2 + (i % 3)}px`, height: `${2 + (i % 3)}px`,
          borderRadius: '50%',
          background: i % 2 === 0 ? '#ff8800' : '#ff4400',
          boxShadow: `0 0 4px ${i % 2 === 0 ? '#ff8800' : '#ff4400'}`,
          left: `${5 + i * 8}%`,
          bottom: `${5 + (i % 4) * 8}%`,
          animation: `floatEmber ${4 + (i % 4)}s ease-in-out infinite`,
          animationDelay: `${i * 0.4}s`,
          pointerEvents: 'none',
        }} />
      ))}
      <style>{`
        @keyframes floatEmber {
          0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
          50% { transform: translateY(-${30}px) rotate(20deg); opacity: 1; }
        }
      `}</style>
    </>
  );
}

function IceDecor() {
  return (
    <>
      <div className="aurora" />
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} className="ice-crystal" style={{
          left: `${(i * 7.1 + 2) % 100}%`,
          height: `${20 + (i % 4) * 20}px`,
          top: `${10 + (i % 5) * 8}%`,
          '--dur': `${5 + (i % 4)}s`,
          '--delay': `${i * 0.3}s`,
          opacity: 0.3 + (i % 3) * 0.2,
        } as React.CSSProperties} />
      ))}
    </>
  );
}

function BlackHoleDecor() {
  return (
    <>
      <div className="grav-lens" />
      {/* outer accretion rings */}
      {[500, 380, 260, 160].map((size, i) => (
        <div key={i} className="accretion-disk" style={{
          width: size, height: size * 0.25,
          top: `calc(50% - ${size * 0.125}px)`,
          left: `calc(50% - ${size / 2}px)`,
          border: `1px solid rgba(${i % 2 === 0 ? '120,0,255' : '80,0,200'},${0.15 - i * 0.02})`,
          boxShadow: `0 0 ${20 - i * 4}px rgba(100,0,220,${0.08 - i * 0.01})`,
          transform: 'translate(0,0)',
          animation: `horizonSpin ${6 + i * 3}s linear ${i % 2 === 0 ? 'normal' : 'reverse'} infinite`,
          borderRadius: '50%',
        }} />
      ))}
      {/* center void */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 80, height: 80,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #000 50%, rgba(60,0,120,0.3) 80%, transparent 100%)',
        boxShadow: '0 0 60px 20px rgba(60,0,120,0.15)',
        pointerEvents: 'none',
      }} />
    </>
  );
}

// ── Stars for all wizard steps ────────────────────────
function WizardStars() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="stars-layer" style={{ opacity: 0.6 }} />
      <div className="stars-layer-2" style={{ opacity: 0.4 }} />
    </div>
  );
}

export default function Wizard() {
  const [step, setStep] = useState(1);
  const [profileId, setProfileId] = useState<number | null>(null);

  const theme = STEP_THEMES[step as keyof typeof STEP_THEMES];

  const renderStep = () => {
    switch (step) {
      case 1: return <BehavioralStep onNext={(id) => { setProfileId(id); setStep(2); }} />;
      case 2: return profileId && <PreferencesStep profileId={profileId} onNext={() => setStep(3)} />;
      case 3: return profileId && <RecommendationStep profileId={profileId} />;
      default: return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className={`min-h-screen flex flex-col relative overflow-hidden ${theme.containerClass}`}
      >
        <WizardStars />

        {/* Step-specific atmosphere decorations */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {step === 1 && <VolcanicDecor />}
          {step === 2 && <IceDecor />}
          {step === 3 && <BlackHoleDecor />}
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 relative">
            {/* Planet status bar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-lg mx-auto mb-8"
            >
              {/* Planet indicators */}
              <div className="flex items-center justify-center gap-3 mb-4">
                {[1,2,3].map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                      s < step ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]' :
                      s === step ? `${theme.dot} animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]` :
                      'bg-white/15'
                    }`} />
                    {s < 3 && <div className={`w-8 h-px ${s < step ? 'bg-emerald-400/60' : 'bg-white/10'} transition-colors duration-500`} />}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">{theme.sublabel}</p>
                <p className="text-sm font-semibold text-white/70">{theme.label}</p>
              </div>
            </motion.div>

            {/* Step content */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderStep()}
            </motion.div>
          </main>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
