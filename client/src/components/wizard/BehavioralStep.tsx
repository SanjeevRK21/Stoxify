import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRandomStocks } from "@/hooks/use-stocks";
import { useSubmitBehavioral } from "@/hooks/use-wizard";
import { X, Heart, TrendingUp, AlertTriangle, ArrowRight, Loader2, ActivitySquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { playLike, playDislike, playClick } from "@/lib/sounds";

export function BehavioralStep({ onNext }: { onNext: (profileId: number) => void }) {
  const [started, setStarted] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [interactions, setInteractions] = useState<{ stockId: number; liked: boolean }[]>([]);
  const [flash, setFlash] = useState<'like' | 'dislike' | null>(null);
  const [spark, setSpark] = useState<'like' | 'dislike' | null>(null);

  const { data: stocks, isLoading, isError } = useRandomStocks();
  const { mutate: submitBehavioral, isPending: isSubmitting } = useSubmitBehavioral();

  const handleStart = () => {
    if (profileName.trim().length > 0) {
      playClick();
      setStarted(true);
    }
  };

  const handleInteraction = useCallback((liked: boolean) => {
    if (!stocks || currentIndex >= stocks.length) return;
    if (liked) { playLike(); setFlash('like'); setSpark('like'); }
    else { playDislike(); setFlash('dislike'); setSpark('dislike'); }
    setTimeout(() => { setFlash(null); setSpark(null); }, 450);

    const newInteractions = [...interactions, { stockId: stocks[currentIndex].id, liked }];
    setInteractions(newInteractions);

    if (currentIndex + 1 >= 10) {
      submitBehavioral(
        { profileName, interactions: newInteractions },
        { onSuccess: (data) => onNext(data.id) }
      );
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [stocks, currentIndex, interactions, profileName, submitBehavioral, onNext]);

  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto mt-16 p-8 rounded-3xl relative overflow-hidden"
        style={{
          background: 'rgba(30,8,2,0.85)',
          border: '1px solid rgba(255,100,30,0.2)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 60px rgba(200,50,0,0.15), 0 20px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* volcanic glow accent */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, transparent, rgba(255,80,0,0.8), rgba(255,150,0,0.6), transparent)',
        }} />
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
            background: 'rgba(255,80,0,0.15)',
            border: '1px solid rgba(255,80,0,0.3)',
          }}>
            <ActivitySquare className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white">Name your profile</h2>
            <p className="text-xs text-orange-400/70">Entering volcanic analysis zone</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-6">
          We'll analyze your behavioral risk tolerance through a series of rapid stock assessments.
        </p>
        <div className="space-y-4">
          <Input
            placeholder="e.g. Aggressive Tech 2025"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            className="bg-black/40 border-orange-500/20 h-12 text-lg focus:border-orange-500/50 text-white placeholder:text-slate-600"
            autoFocus
          />
          <button
            disabled={!profileName.trim()}
            onClick={handleStart}
            className="w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, rgba(255,100,0,0.8), rgba(200,50,0,0.6))',
              border: '1px solid rgba(255,100,0,0.4)',
              color: '#fff',
              boxShadow: '0 0 20px rgba(255,80,0,0.2)',
            }}
          >
            Begin Analysis <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[55vh]">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-orange-500/30 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-orange-400/60 animate-spin" style={{ borderTopColor: 'transparent' }} />
          <div className="absolute inset-4 rounded-full bg-orange-500/20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-orange-400" />
          </div>
        </div>
        <p className="text-orange-400/80 animate-pulse text-sm font-medium">Curating behavioral scenarios...</p>
      </div>
    );
  }

  if (isError || !stocks) {
    return <div className="text-center text-red-500 mt-20">Failed to load stocks. Please try again.</div>;
  }

  if (isSubmitting || currentIndex >= 10) {
    return (
      <div className="flex flex-col items-center justify-center h-[55vh]">
        <div className="relative w-24 h-24 mb-8">
          {[60, 44, 28].map((size, i) => (
            <div key={i} className="absolute rounded-full" style={{
              width: size, height: size,
              top: `calc(50% - ${size/2}px)`, left: `calc(50% - ${size/2}px)`,
              border: `2px solid rgba(255,${100 + i * 40},0,${0.7 - i * 0.15})`,
              animation: `vortexSpin ${1 + i * 0.4}s linear infinite`,
            }} />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-orange-400" style={{ boxShadow: '0 0 15px rgba(255,150,0,0.8)' }} />
          </div>
        </div>
        <h3 className="text-xl font-display font-bold text-white mb-2">Processing Vector</h3>
        <p className="text-orange-400/70 animate-pulse text-sm">Computing behavioral profile...</p>
      </div>
    );
  }

  const currentStock = stocks[currentIndex];
  const progress = (currentIndex / 10) * 100;

  return (
    <div className="max-w-sm mx-auto mt-6 relative">
      {/* screen flash overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 pointer-events-none z-50"
            style={{
              background: flash === 'like'
                ? 'radial-gradient(ellipse at center, rgba(255,150,0,0.12) 0%, transparent 70%)'
                : 'radial-gradient(ellipse at center, rgba(239,68,68,0.15) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-400/70">Behavioral Assessment</span>
        <span className="text-xs font-mono text-orange-300">{currentIndex + 1} / 10</span>
      </div>

      {/* progress bar */}
      <div className="w-full h-1 rounded-full mb-4 overflow-hidden" style={{ background: 'rgba(255,100,0,0.12)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #ff6600, #ffaa00)', boxShadow: '0 0 8px rgba(255,120,0,0.8)' }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 28 }}
        />
      </div>

      <div className="relative h-[490px]">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentStock.id}
            initial={{ scale: 0.88, opacity: 0, rotateY: -12 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.88, opacity: 0, rotateY: 12 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className={`absolute inset-0 rounded-3xl p-6 flex flex-col justify-between ${flash === 'like' ? 'flash-green' : flash === 'dislike' ? 'flash-red' : ''}`}
            style={{
              background: 'rgba(20,5,0,0.88)',
              border: spark ? `1px solid ${spark === 'like' ? 'rgba(255,150,0,0.8)' : 'rgba(239,68,68,0.8)'}` : '1px solid rgba(255,100,0,0.12)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,100,0,0.05)',
              transition: 'border-color 0.2s',
            }}
          >
            {/* lava crack accent top */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(255,80,0,0.6), rgba(255,150,0,0.4), transparent)',
              borderRadius: '12px 12px 0 0',
            }} />

            <div>
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="text-4xl font-display font-bold text-white tracking-tight">{currentStock.ticker}</h2>
                  <p className="text-slate-400 text-sm mt-0.5">{currentStock.name}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{
                  background: 'rgba(255,100,0,0.1)', border: '1px solid rgba(255,100,0,0.2)', color: 'rgba(255,150,80,0.9)'
                }}>{currentStock.sector}</span>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl p-4" style={{ background: 'rgba(255,100,0,0.06)', border: '1px solid rgba(255,100,0,0.1)' }}>
                  <p className="text-xs text-slate-500 mb-1">Current Price</p>
                  <p className="text-2xl font-mono font-semibold text-white">${currentStock.price.toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'CAGR', value: `${(currentStock.cagr * 100).toFixed(1)}%`, color: '#4ade80', Icon: TrendingUp },
                    { label: 'Vol.', value: `${(currentStock.volatility * 100).toFixed(1)}%`, color: '#fbbf24', Icon: AlertTriangle },
                    { label: 'Skew', value: currentStock.skewness.toFixed(2), color: '#60a5fa', Icon: ActivitySquare },
                    { label: 'Alpha', value: `${(currentStock.alpha * 100).toFixed(1)}%`, color: '#c084fc', Icon: TrendingUp },
                  ].map(({ label, value, color, Icon }) => (
                    <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,100,0,0.04)', border: '1px solid rgba(255,100,0,0.08)' }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className="w-3 h-3" style={{ color }} />
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">{label}</span>
                      </div>
                      <p className="text-base font-mono font-medium" style={{ color }}>{value}</p>
                    </div>
                  ))}
                  <div className="col-span-2 rounded-xl p-3" style={{ background: 'rgba(255,100,0,0.04)', border: '1px solid rgba(255,100,0,0.08)' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Loader2 className="w-3 h-3 text-orange-400" />
                      <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Recovery Time</span>
                    </div>
                    <p className="text-base font-mono text-orange-400 font-medium">{currentStock.recoveryTime} Days</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => handleInteraction(false)}
                className="flex-1 h-14 rounded-2xl flex items-center justify-center group transition-all duration-200 relative overflow-hidden"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
              >
                <X className="w-7 h-7 text-red-400/60 group-hover:text-red-400 group-hover:scale-125 transition-all duration-200 relative z-10" />
              </button>
              <button
                onClick={() => handleInteraction(true)}
                className="flex-1 h-14 rounded-2xl flex items-center justify-center group transition-all duration-200 relative overflow-hidden"
                style={{ background: 'rgba(255,100,0,0.08)', border: '1px solid rgba(255,100,0,0.2)' }}
              >
                <Heart className="w-7 h-7 text-orange-400/60 group-hover:text-orange-400 group-hover:scale-125 transition-all duration-200 relative z-10" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
