import { useState } from "react";
import { motion } from "framer-motion";
import { useSubmitPreferences } from "@/hooks/use-wizard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, DollarSign, Target, Globe, Layers } from "lucide-react";
import { playClick, playSelect } from "@/lib/sounds";

const SECTORS = ['Tech', 'Health', 'Finance', 'Energy', 'Consumer', 'Industrials'];

export function PreferencesStep({ profileId, onNext }: { profileId: number, onNext: () => void }) {
  const [goal, setGoal] = useState<'Capital Preservation' | 'Wealth Growth' | 'Short-term'>('Wealth Growth');
  const [sectors, setSectors] = useState<string[]>(['Tech', 'Health']);
  const [geography, setGeography] = useState('All Markets');
  const [capital, setCapital] = useState<string>("100000");

  const { mutate: submitPreferences, isPending } = useSubmitPreferences();

  const toggleSector = (sector: string) => {
    playSelect();
    setSectors(prev =>
      prev.includes(sector)
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sectors.length === 0 || !capital) return;
    playClick();
    
    submitPreferences(
      {
        profileId,
        investmentGoal: goal,
        preferredSectors: sectors,
        geography,
        capital: parseFloat(capital)
      },
      { onSuccess: onNext }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto mt-10 p-8 glass-card rounded-3xl"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-white mb-2">Investment Preferences</h2>
        <p className="text-muted-foreground">
          Your behavioral profile is set. Now define your constraints to finalize the allocation engine.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Capital Input */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" /> Capital ($)
            </Label>
            <Input 
              type="number" 
              min="1"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="h-14 text-xl font-mono bg-secondary/30 border-white/10 focus:ring-primary pl-4"
              required
            />
          </div>

          {/* Goal Select */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Primary Goal
            </Label>
            <select
              value={goal}
                      onChange={(e) => { playSelect(); setGoal(e.target.value as any); }}
              className="w-full h-14 rounded-xl text-lg bg-secondary/30 border border-white/10 focus:ring-2 focus:ring-primary focus:outline-none px-4 text-white appearance-none"
              required
            >
              <option value="Wealth Growth">Wealth Growth</option>
              <option value="Capital Preservation">Capital Preservation</option>
              <option value="Short-term">Short-term Alpha</option>
            </select>
          </div>

          {/* Geography Select */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Geography
            </Label>
            <select
              value={geography}
              onChange={(e) => { playSelect(); setGeography(e.target.value); }}
              className="w-full h-14 rounded-xl text-lg bg-secondary/30 border border-white/10 focus:ring-2 focus:ring-primary focus:outline-none px-4 text-white appearance-none"
              required
            >
              <option value="All Markets">All Markets</option>
              <option value="US">US Markets Only</option>
              <option value="India">Indian Markets</option>
              <option value="Global">Global Developed</option>
              <option value="Emerging">Emerging Markets</option>
            </select>
          </div>
        </div>

        {/* Sectors Multi-select */}
        <div className="space-y-4 border-t border-white/5 pt-8">
          <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-primary" /> Preferred Sectors
          </Label>
          <div className="flex flex-wrap gap-3">
            {SECTORS.map(sector => {
              const isSelected = sectors.includes(sector);
              return (
                <button
                  key={sector}
                  type="button"
                  onClick={() => toggleSector(sector)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                    isSelected 
                      ? 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_15px_rgba(0,255,128,0.2)]' 
                      : 'bg-secondary/40 text-muted-foreground border-white/5 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {sector}
                </button>
              );
            })}
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isPending || sectors.length === 0 || !capital}
          className="w-full h-16 text-lg rounded-2xl bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
        >
          {isPending ? (
            <><Loader2 className="mr-2 w-6 h-6 animate-spin" /> Generating Engine Weights...</>
          ) : (
            'Generate Portfolio'
          )}
        </Button>
      </form>
    </motion.div>
  );
}
