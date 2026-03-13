import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRandomStocks } from "@/hooks/use-stocks";
import { useSubmitBehavioral } from "@/hooks/use-wizard";
import { X, Heart, TrendingUp, AlertTriangle, ArrowRight, Loader2, ActivitySquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { playLike, playDislike, playClick } from "@/lib/sounds";

function SparkRing({ color }: { color: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-2xl"
      style={{
        border: `2px solid ${color}`,
        animation: 'sparkBurst 0.45s ease-out forwards',
      }}
    />
  );
}

export function BehavioralStep({ onNext }: { onNext: (profileId: number) => void }) {
  const [started, setStarted] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [interactions, setInteractions] = useState<{ stockId: number; liked: boolean }[]>([]);
  const [flash, setFlash] = useState<'like' | 'dislike' | null>(null);
  const [spark, setSpark] = useState<'like' | 'dislike' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

    if (liked) {
      playLike();
      setFlash('like');
      setSpark('like');
    } else {
      playDislike();
      setFlash('dislike');
      setSpark('dislike');
    }
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto mt-20 p-8 glass-card rounded-2xl electric-border"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 neon-pulse">
            <ActivitySquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white">Name your profile</h2>
            <p className="text-xs text-muted-foreground">Behavioral analysis initializing...</p>
          </div>
        </div>
        <p className="text-muted-foreground mb-6 text-sm">
          We'll start by analyzing your behavioral risk tolerance through a series of rapid stock choices.
        </p>
        <div className="space-y-4">
          <Input
            placeholder="e.g. Aggressive Tech 2025"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            className="bg-secondary/50 border-white/10 h-12 text-lg focus:ring-primary"
            autoFocus
          />
          <Button
            className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold electric-border"
            disabled={!profileName.trim()}
            onClick={handleStart}
          >
            Start Analysis <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="black-hole w-32 h-32 mb-8">
          {[80, 64, 48, 32].map((size, i) => (
            <div
              key={i}
              className="black-hole-ring absolute"
              style={{
                width: size, height: size,
                borderColor: `rgba(0,229,118,${0.8 - i * 0.15})`,
                '--dur': `${1.5 + i * 0.4}s`,
                '--op': 0.8 - i * 0.15,
                top: `calc(50% - ${size / 2}px)`,
                left: `calc(50% - ${size / 2}px)`,
              } as React.CSSProperties}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_20px_rgba(0,229,118,1)]" />
          </div>
        </div>
        <p className="text-lg text-muted-foreground font-medium animate-pulse">Curating behavioral scenarios...</p>
      </div>
    );
  }

  if (isError || !stocks) {
    return <div className="text-center text-red-500 mt-20">Failed to load stocks. Please try again.</div>;
  }

  if (isSubmitting || currentIndex >= 10) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="black-hole w-32 h-32 mb-8">
          {[80, 60, 40, 24].map((size, i) => (
            <div
              key={i}
              className="black-hole-ring absolute"
              style={{
                width: size, height: size,
                borderColor: `rgba(0,229,118,${0.8 - i * 0.15})`,
                '--dur': `${1 + i * 0.3}s`,
                top: `calc(50% - ${size / 2}px)`,
                left: `calc(50% - ${size / 2}px)`,
              } as React.CSSProperties}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_20px_rgba(0,229,118,1)]" />
          </div>
        </div>
        <h3 className="text-2xl font-display font-bold text-white text-gradient">Analyzing Behavioral Vector</h3>
        <p className="text-muted-foreground mt-2 animate-pulse">Computing your inherent risk preferences...</p>
      </div>
    );
  }

  const currentStock = stocks[currentIndex];
  const progress = (currentIndex / 10) * 100;

  return (
    <div className="max-w-sm mx-auto mt-10 relative">
      {/* flash overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 pointer-events-none z-50"
            style={{
              background: flash === 'like'
                ? 'radial-gradient(ellipse at center, rgba(0,229,118,0.15) 0%, transparent 70%)'
                : 'radial-gradient(ellipse at center, rgba(239,68,68,0.15) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center px-1 mb-4 z-10 relative">
        <span className="text-sm font-semibold text-muted-foreground">Behavioral Assessment</span>
        <span className="text-sm font-mono text-primary">{currentIndex + 1} / 10</span>
      </div>

      {/* progress bar */}
      <div className="w-full h-1 bg-secondary/40 rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
          style={{ boxShadow: '0 0 8px rgba(0,229,118,0.8)' }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        />
      </div>

      <div className="relative h-[500px]">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentStock.id}
            ref={cardRef}
            initial={{ scale: 0.85, opacity: 0, rotateY: -15 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.85, opacity: 0, rotateY: 15 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className={`absolute inset-0 glass-card rounded-3xl p-6 flex flex-col justify-between electric-border ${
              flash === 'like' ? 'flash-green' : flash === 'dislike' ? 'flash-red' : ''
            }`}
          >
            {spark && (
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  border: `2px solid ${spark === 'like' ? 'rgba(0,229,118,0.9)' : 'rgba(239,68,68,0.9)'}`,
                  animation: 'sparkBurst 0.45s ease-out forwards',
                  boxShadow: spark === 'like'
                    ? '0 0 30px rgba(0,229,118,0.5) inset'
                    : '0 0 30px rgba(239,68,68,0.5) inset',
                }}
              />
            )}

            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-4xl font-display font-bold text-white tracking-tight text-gradient">
                    {currentStock.ticker}
                  </h2>
                  <p className="text-lg text-muted-foreground">{currentStock.name}</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-secondary text-xs font-medium border border-white/5">
                  {currentStock.sector}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-secondary/30 rounded-2xl p-4 border border-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
                  <p className="text-sm text-muted-foreground mb-1 relative">Current Price</p>
                  <p className="text-2xl font-mono font-semibold text-white relative">
                    ${currentStock.price.toFixed(2)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'CAGR', value: `${(currentStock.cagr * 100).toFixed(1)}%`, color: 'text-emerald-400', Icon: TrendingUp, iconColor: 'text-emerald-400' },
                    { label: 'Vol.', value: `${(currentStock.volatility * 100).toFixed(1)}%`, color: 'text-amber-400', Icon: AlertTriangle, iconColor: 'text-amber-400' },
                    { label: 'Skew', value: currentStock.skewness.toFixed(2), color: 'text-blue-400', Icon: ActivitySquare, iconColor: 'text-blue-400' },
                    { label: 'Alpha', value: `${(currentStock.alpha * 100).toFixed(1)}%`, color: 'text-purple-400', Icon: TrendingUp, iconColor: 'text-purple-400' },
                  ].map(({ label, value, color, Icon, iconColor }) => (
                    <div key={label} className="bg-secondary/30 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                        <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
                      </div>
                      <p className={`text-lg font-mono ${color} font-medium`}>{value}</p>
                    </div>
                  ))}
                  <div className="col-span-2 bg-secondary/30 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                      <Loader2 className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Recovery Time</span>
                    </div>
                    <p className="text-lg font-mono text-orange-400 font-medium">
                      {currentStock.recoveryTime} Days
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-4 mt-6">
              <button
                onClick={() => handleInteraction(false)}
                data-testid="button-dislike"
                className="relative flex-1 bg-secondary/50 hover:bg-destructive/20 border border-white/5 hover:border-destructive/50 h-16 rounded-2xl flex items-center justify-center group transition-all duration-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <X className="w-8 h-8 text-muted-foreground group-hover:text-destructive group-hover:scale-125 transition-all duration-200 relative z-10" />
              </button>
              <button
                onClick={() => handleInteraction(true)}
                data-testid="button-like"
                className="relative flex-1 bg-secondary/50 hover:bg-primary/20 border border-white/5 hover:border-primary/50 h-16 rounded-2xl flex items-center justify-center group transition-all duration-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Heart className="w-8 h-8 text-muted-foreground group-hover:text-primary group-hover:scale-125 transition-all duration-200 relative z-10" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
