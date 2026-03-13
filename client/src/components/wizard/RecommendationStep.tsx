import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGenerateRecommendation, useSubmitFeedback } from "@/hooks/use-wizard";
import { useLocation } from "wouter";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Loader2, PieChart as PieIcon, Crosshair, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playClick, playReveal } from "@/lib/sounds";

const COLORS = ['#00E676', '#00B8D4', '#2979FF', '#651FFF', '#D500F9'];

function BlackHoleLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="black-hole relative w-40 h-40 mb-10 flex items-center justify-center">
        {/* outer glow disk */}
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(ellipse at 40% 35%, rgba(0,229,118,0.25) 0%, transparent 60%)',
          animation: 'vortexSpin 4s linear infinite',
        }} />
        {/* rings */}
        {[120, 96, 72, 50, 32].map((size, i) => (
          <div
            key={i}
            className="black-hole-ring absolute rounded-full"
            style={{
              width: size, height: size,
              borderColor: i === 0
                ? `rgba(0,229,118,${0.5 - i * 0.05})`
                : i === 1
                  ? `rgba(0,184,212,${0.6 - i * 0.08})`
                  : `rgba(41,121,255,${0.7 - i * 0.1})`,
              borderWidth: i === 0 ? 2 : 1,
              '--dur': `${1.2 + i * 0.35}s`,
              '--op': 0.7 - i * 0.1,
              top: `calc(50% - ${size / 2}px)`,
              left: `calc(50% - ${size / 2}px)`,
            } as React.CSSProperties}
          />
        ))}
        {/* core black hole */}
        <div className="w-10 h-10 rounded-full relative z-10" style={{
          background: 'radial-gradient(circle, #000 40%, rgba(0,229,118,0.3) 100%)',
          boxShadow: '0 0 30px rgba(0,229,118,0.5), 0 0 60px rgba(0,0,0,0.8)',
        }} />
      </div>
      <h3 className="text-2xl font-display font-bold text-white mb-2 text-gradient">Running Hybrid Engine</h3>
      <p className="text-muted-foreground animate-pulse text-sm">Computing final tensor weights across dimensions...</p>
    </div>
  );
}

function BeamReveal({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  const rays = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  return (
    <div className="beam-reveal">
      {/* radiating light rays */}
      {rays.map((angle, i) => (
        <div
          key={i}
          className="light-ray"
          style={{
            '--angle': `${angle}deg`,
            animationDelay: `${i * 0.04}s`,
          } as React.CSSProperties}
        />
      ))}
      {/* central burst */}
      <div
        style={{
          position: 'absolute',
          width: 80, height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(0,229,118,0.6) 40%, transparent 70%)',
          boxShadow: '0 0 60px 20px rgba(0,229,118,0.5)',
          animation: 'sparkBurst 1.2s ease-out forwards',
        }}
      />
    </div>
  );
}

export function RecommendationStep({ profileId }: { profileId: number }) {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<'single' | 'diversify' | null>(null);
  const [showBeam, setShowBeam] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const { mutate: generate, data: recData, isPending: isGenerating } = useGenerateRecommendation();
  const { mutate: feedback, isPending: isSaving } = useSubmitFeedback();

  const handleSelectMode = (selectedMode: 'single' | 'diversify') => {
    playClick();
    setMode(selectedMode);
    generate({ profileId, mode: selectedMode });
  };

  useEffect(() => {
    if (recData && !isGenerating) {
      setShowBeam(true);
      playReveal();
    }
  }, [recData, isGenerating]);

  const handleFinish = (confirmed: boolean) => {
    playClick();
    feedback(
      {
        profileId,
        confirmed,
        portfolio: confirmed ? recData.allocations : undefined
      },
      { onSuccess: () => setLocation("/") }
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      const percentage = (data.investmentAmount / recData.totalInvested * 100).toFixed(1);
      return (
        <div className="bg-secondary/90 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-white font-bold text-sm">{data.stock.ticker}</p>
          <p className="text-cyan-400 text-xs mt-1">${data.investmentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="text-emerald-400 text-xs">{data.shares} shares</p>
          <p className="text-primary text-xs">{percentage}% of portfolio</p>
        </div>
      );
    }
    return null;
  };

  if (!mode) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto mt-12 text-center">
        <h2 className="text-4xl font-display font-bold text-white mb-4 text-gradient">Choose Strategy</h2>
        <p className="text-muted-foreground mb-12">How would you like the engine to allocate your capital?</p>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.button
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelectMode('single')}
            className="group glass-card p-10 rounded-3xl text-left electric-border elec-card cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform neon-pulse border border-cyan-500/20">
              <Crosshair className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Absolute Conviction</h3>
            <p className="text-muted-foreground leading-relaxed">
              Find the single highest-scoring stock that perfectly matches your behavioral and structural constraints. All capital allocated to one asset.
            </p>
          </motion.button>

          <motion.button
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelectMode('diversify')}
            className="group glass-card p-10 rounded-3xl text-left electric-border elec-card cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform neon-pulse border border-primary/20">
              <PieIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Diversified Basket</h3>
            <p className="text-muted-foreground leading-relaxed">
              Create a balanced portfolio of the top 5 highest-scoring stocks. Capital is proportionally weighted by the engine's conviction score.
            </p>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (isGenerating || (!recData && !showResults)) {
    return <BlackHoleLoader />;
  }

  return (
    <>
      {/* Black hole → beam reveal overlay */}
      <AnimatePresence>
        {showBeam && !showResults && (
          <BeamReveal onDone={() => { setShowBeam(false); setShowResults(true); }} />
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {showResults && recData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl mx-auto mt-8"
          >
            <div className="glass-card rounded-3xl overflow-hidden flex flex-col md:flex-row electric-border">

              {/* Left Side: Chart */}
              <div className="md:w-1/2 p-8 bg-secondary/20 flex flex-col justify-center items-center border-r border-white/5 relative overflow-hidden">
                {/* background shimmer */}
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="laser-beam"
                      style={{
                        top: `${30 + i * 20}%`,
                        '--dur': `${5 + i}s`,
                        '--delay': `${i * 1.2}s`,
                      } as React.CSSProperties}
                    />
                  ))}
                </div>

                <h3 className="text-xl font-display font-bold text-white mb-6 self-start w-full text-gradient">
                  Allocation Map
                </h3>
                <motion.div
                  className="w-full h-[300px]"
                  initial={{ scale: 0, rotate: -30, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.7, type: 'spring', stiffness: 120 }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={recData.allocations}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={4}
                        dataKey="investmentAmount"
                        nameKey="stock.ticker"
                        stroke="none"
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {recData.allocations.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            style={{ filter: `drop-shadow(0 0 6px ${COLORS[index % COLORS.length]}88)` }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>

                <div className="w-full flex justify-between items-center mt-6 p-4 rounded-2xl bg-secondary/40 border border-white/5">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Invested</p>
                    <p className="text-xl font-mono text-white">${recData.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Remaining Cash</p>
                    <p className="text-xl font-mono text-white">${recData.remainingCapital.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>

              {/* Right Side: Data Table */}
              <div className="md:w-1/2 p-8 flex flex-col">
                <h3 className="text-xl font-display font-bold text-white mb-6 text-gradient">Selected Assets</h3>
                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                  {recData.allocations.map((alloc, i) => (
                    <motion.div
                      key={alloc.stock.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                      className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-white/5 hover:border-white/15 transition-all elec-card"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-2 h-10 rounded-full"
                          style={{
                            backgroundColor: COLORS[i % COLORS.length],
                            boxShadow: `0 0 10px ${COLORS[i % COLORS.length]}88`,
                          }}
                        />
                        <div>
                          <h4 className="font-bold text-white text-lg leading-none">{alloc.stock.ticker}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{alloc.stock.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-white font-medium">${alloc.investmentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p className="text-sm text-muted-foreground mt-1">{alloc.shares} shares @ ${alloc.stock.price.toFixed(2)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleFinish(false)}
                    disabled={isSaving}
                    className="flex-1 h-14 bg-transparent border-white/10 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  >
                    <X className="mr-2 w-4 h-4" /> Discard
                  </Button>
                  <Button
                    onClick={() => handleFinish(true)}
                    disabled={isSaving}
                    className="flex-1 h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold neon-pulse electric-border"
                  >
                    <Check className="mr-2 w-5 h-5" /> Confirm Portfolio
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
