import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGenerateRecommendation, useSubmitFeedback } from "@/hooks/use-wizard";
import { useLocation } from "wouter";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Loader2, PieChart as PieIcon, Crosshair, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = ['#00E676', '#00B8D4', '#2979FF', '#651FFF', '#D500F9'];

export function RecommendationStep({ profileId }: { profileId: number }) {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<'single' | 'diversify' | null>(null);
  
  const { mutate: generate, data: recData, isPending: isGenerating } = useGenerateRecommendation();
  const { mutate: feedback, isPending: isSaving } = useSubmitFeedback();

  const handleSelectMode = (selectedMode: 'single' | 'diversify') => {
    setMode(selectedMode);
    generate({ profileId, mode: selectedMode });
  };

  const handleFinish = (confirmed: boolean) => {
    feedback(
      { 
        profileId, 
        confirmed,
        portfolio: confirmed ? recData.allocations : undefined 
      },
      { onSuccess: () => setLocation("/") }
    );
  };

  if (!mode) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto mt-12 text-center">
        <h2 className="text-4xl font-display font-bold text-white mb-4">Choose Strategy</h2>
        <p className="text-muted-foreground mb-12">How would you like the engine to allocate your capital?</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <button 
            onClick={() => handleSelectMode('single')}
            className="group glass-card p-10 rounded-3xl text-left hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Crosshair className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Absolute Conviction</h3>
            <p className="text-muted-foreground leading-relaxed">
              Find the single highest-scoring stock that perfectly matches your behavioral and structural constraints. All capital allocated to one asset.
            </p>
          </button>

          <button 
            onClick={() => handleSelectMode('diversify')}
            className="group glass-card p-10 rounded-3xl text-left hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <PieIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Diversified Basket</h3>
            <p className="text-muted-foreground leading-relaxed">
              Create a balanced portfolio of the top 5 highest-scoring stocks. Capital is proportionally weighted by the engine's conviction score.
            </p>
          </button>
        </div>
      </motion.div>
    );
  }

  if (isGenerating || !recData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          <ActivityPulse />
        </div>
        <h3 className="text-2xl font-display font-bold text-white mb-2 text-gradient">Running Hybrid Engine</h3>
        <p className="text-muted-foreground animate-pulse">Computing final tensor weights across dimensions...</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      const percentage = (data.investmentAmount / recData.totalInvested * 100).toFixed(1);
      return (
        <div className="bg-secondary/80 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-white font-bold text-sm">{data.stock.ticker}</p>
          <p className="text-cyan-400 text-xs mt-1">${data.investmentAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          <p className="text-emerald-400 text-xs">{data.shares} shares</p>
          <p className="text-primary text-xs">{percentage}% of portfolio</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto mt-8">
      <div className="glass-card rounded-3xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Chart */}
        <div className="md:w-1/2 p-8 bg-secondary/20 flex flex-col justify-center items-center border-r border-white/5">
          <h3 className="text-xl font-display font-bold text-white mb-6 self-start w-full">Allocation Map</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={recData.allocations}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="investmentAmount"
                  nameKey="stock.ticker"
                  stroke="none"
                >
                  {recData.allocations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full flex justify-between items-center mt-6 p-4 rounded-2xl bg-secondary/40 border border-white/5">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Invested</p>
              <p className="text-xl font-mono text-white">${recData.totalInvested.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Remaining Cash</p>
              <p className="text-xl font-mono text-white">${recData.remainingCapital.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Data Table */}
        <div className="md:w-1/2 p-8 flex flex-col">
          <h3 className="text-xl font-display font-bold text-white mb-6">Selected Assets</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {recData.allocations.map((alloc, i) => (
              <div key={alloc.stock.id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-10 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <div>
                    <h4 className="font-bold text-white text-lg leading-none">{alloc.stock.ticker}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{alloc.stock.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-white font-medium">${alloc.investmentAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  <p className="text-sm text-muted-foreground mt-1">{alloc.shares} shares @ ${alloc.stock.price.toFixed(2)}</p>
                </div>
              </div>
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
              className="flex-1 h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              <Check className="mr-2 w-5 h-5" /> Confirm Portfolio
            </Button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

// Minimal pulse animation component
function ActivityPulse() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-8 h-8 bg-primary/20 rounded-full animate-ping"></div>
      <div className="absolute w-4 h-4 bg-primary rounded-full"></div>
    </div>
  );
}
