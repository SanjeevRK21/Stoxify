import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRandomStocks } from "@/hooks/use-stocks";
import { useSubmitBehavioral } from "@/hooks/use-wizard";
import { X, Heart, TrendingUp, AlertTriangle, ArrowRight, Loader2, ActivitySquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BehavioralStep({ onNext }: { onNext: (profileId: number) => void }) {
  const [started, setStarted] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [interactions, setInteractions] = useState<{ stockId: number; liked: boolean }[]>([]);

  const { data: stocks, isLoading, isError } = useRandomStocks();
  const { mutate: submitBehavioral, isPending: isSubmitting } = useSubmitBehavioral();

  const handleStart = () => {
    if (profileName.trim().length > 0) {
      setStarted(true);
    }
  };

  const handleInteraction = (liked: boolean) => {
    if (!stocks || currentIndex >= stocks.length) return;
    
    const newInteractions = [...interactions, { stockId: stocks[currentIndex].id, liked }];
    setInteractions(newInteractions);
    
    if (currentIndex + 1 >= 10) {
      // Finished all 10
      submitBehavioral(
        { profileName, interactions: newInteractions },
        { onSuccess: (data) => onNext(data.id) }
      );
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  if (!started) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto mt-20 p-8 glass-card rounded-2xl"
      >
        <h2 className="text-2xl font-display font-bold text-white mb-2">Name your profile</h2>
        <p className="text-muted-foreground mb-6">
          We'll start by analyzing your behavioral risk tolerance through a series of rapid stock choices.
        </p>
        <div className="space-y-4">
          <Input 
            placeholder="e.g. Aggressive Tech 2025" 
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            className="bg-secondary/50 border-white/10 h-12 text-lg focus:ring-primary"
            autoFocus
          />
          <Button 
            className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
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
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
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
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h3 className="text-2xl font-display font-bold text-white">Analyzing Behavioral Vector</h3>
        <p className="text-muted-foreground mt-2">Computing your inherent risk preferences...</p>
      </div>
    );
  }

  const currentStock = stocks[currentIndex];

  return (
    <div className="max-w-sm mx-auto mt-10 relative h-[500px]">
      <div className="absolute top-0 left-0 w-full flex justify-between px-4 z-10 text-sm font-semibold text-muted-foreground">
        <span>Behavioral Assessment</span>
        <span>{currentIndex + 1} / 10</span>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentStock.id}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute inset-0 mt-8 glass-card rounded-3xl p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-4xl font-display font-bold text-white tracking-tight">{currentStock.ticker}</h2>
                <p className="text-lg text-muted-foreground">{currentStock.name}</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-secondary text-xs font-medium border border-white/5">
                {currentStock.sector}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-2xl p-4 border border-white/5">
                <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                <p className="text-2xl font-mono font-semibold text-white">
                  ${currentStock.price.toFixed(2)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/30 rounded-xl p-3 border border-white/5">
                  <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">CAGR</span>
                  </div>
                  <p className="text-lg font-mono text-emerald-400 font-medium">
                    {(currentStock.cagr * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-3 border border-white/5">
                  <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Vol.</span>
                  </div>
                  <p className="text-lg font-mono text-amber-400 font-medium">
                    {(currentStock.volatility * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-3 border border-white/5">
                  <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                    <ActivitySquare className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Skew</span>
                  </div>
                  <p className="text-lg font-mono text-blue-400 font-medium">
                    {currentStock.skewness.toFixed(2)}
                  </p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-3 border border-white/5">
                  <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Alpha</span>
                  </div>
                  <p className="text-lg font-mono text-purple-400 font-medium">
                    {(currentStock.alpha * 100).toFixed(1)}%
                  </p>
                </div>
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

          <div className="flex justify-between gap-4 mt-8">
            <button
              onClick={() => handleInteraction(false)}
              className="flex-1 bg-secondary/50 hover:bg-destructive/20 border border-white/5 hover:border-destructive/50 h-16 rounded-2xl flex items-center justify-center group transition-all duration-300"
            >
              <X className="w-8 h-8 text-muted-foreground group-hover:text-destructive group-hover:scale-110 transition-all" />
            </button>
            <button
              onClick={() => handleInteraction(true)}
              className="flex-1 bg-secondary/50 hover:bg-primary/20 border border-white/5 hover:border-primary/50 h-16 rounded-2xl flex items-center justify-center group transition-all duration-300"
            >
              <Heart className="w-8 h-8 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
