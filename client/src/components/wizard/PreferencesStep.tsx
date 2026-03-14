import { useState } from "react";
import { motion } from "framer-motion";
import { useSubmitPreferences } from "@/hooks/use-wizard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, DollarSign, Target, Globe, Layers, Zap } from "lucide-react";
import { playClick, playSelect } from "@/lib/sounds";

const SECTORS = ['Tech', 'Health', 'Finance', 'Energy', 'Consumer', 'Industrials'];
const SECTOR_NEON = ['#00E576', '#00B8D4', '#BE00FF', '#FF006E', '#FFE600', '#FF6B00'];

export function PreferencesStep({ profileId, onNext }: { profileId: number, onNext: () => void }) {
  const [goal, setGoal] = useState<'Capital Preservation' | 'Wealth Growth' | 'Short-term'>('Wealth Growth');
  const [sectors, setSectors] = useState<string[]>(['Tech', 'Health']);
  const [geography, setGeography] = useState('All Markets');
  const [capital, setCapital] = useState<string>("100000");

  const { mutate: submitPreferences, isPending } = useSubmitPreferences();

  const toggleSector = (sector: string) => {
    playSelect();
    setSectors(prev =>
      prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sectors.length === 0 || !capital) return;
    playClick();
    submitPreferences(
      { profileId, investmentGoal: goal, preferredSectors: sectors, geography, capital: parseFloat(capital) },
      { onSuccess: onNext }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-2xl mx-auto mt-10 p-8 glass-card rounded-3xl electric-border relative overflow-hidden"
    >
      {/* top neon accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(90deg, #00E576, #00B8D4, #BE00FF, #FF006E, #FFE600)',
          backgroundSize: '300% 100%',
          animation: 'rainbowBorder 3s linear infinite',
        }}
      />

      {/* animated corner sparks */}
      <div className="absolute top-4 right-4 w-16 h-16 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(190,0,255,0.8) 0%, transparent 70%)' }} />
      <div className="absolute bottom-4 left-4 w-12 h-12 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(255,0,110,0.8) 0%, transparent 70%)' }} />

      <div className="mb-8 relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
            style={{ background: 'rgba(0,229,118,0.1)', borderColor: 'rgba(0,229,118,0.3)' }}>
            <Zap className="w-5 h-5 text-primary neon-text-green" />
          </div>
          <div>
            <h2 className="text-3xl font-display font-bold text-gradient">Investment Preferences</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Constraint Engine v2.0</p>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          Your behavioral profile is set. Now define your constraints to finalize the allocation engine.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Capital Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" style={{ color: '#00E576' }} /> Capital ($)
            </Label>
            <div className="relative">
              <Input
                type="number" min="1"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                className="h-14 text-xl font-mono bg-secondary/30 border-white/10 focus:ring-primary pl-4 pr-4"
                style={{ borderColor: 'rgba(0,229,118,0.2)' }}
                required
              />
              <div className="absolute inset-0 rounded-md pointer-events-none"
                style={{ boxShadow: '0 0 15px rgba(0,229,118,0.08) inset' }} />
            </div>
          </motion.div>

          {/* Goal Select */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="space-y-3"
          >
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" style={{ color: '#00B8D4' }} /> Primary Goal
            </Label>
            <select
              value={goal}
              onChange={(e) => { playSelect(); setGoal(e.target.value as any); }}
              className="w-full h-14 rounded-xl text-lg bg-secondary/30 border focus:outline-none px-4 text-white appearance-none transition-all"
              style={{ borderColor: 'rgba(0,184,212,0.25)' }}
              required
            >
              <option value="Wealth Growth">Wealth Growth</option>
              <option value="Capital Preservation">Capital Preservation</option>
              <option value="Short-term">Short-term Alpha</option>
            </select>
          </motion.div>

          {/* Geography Select */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Globe className="w-4 h-4" style={{ color: '#BE00FF' }} /> Geography
            </Label>
            <select
              value={geography}
              onChange={(e) => { playSelect(); setGeography(e.target.value); }}
              className="w-full h-14 rounded-xl text-lg bg-secondary/30 border focus:outline-none px-4 text-white appearance-none transition-all"
              style={{ borderColor: 'rgba(190,0,255,0.25)' }}
              required
            >
              <option value="All Markets">All Markets</option>
              <option value="US">US Markets Only</option>
              <option value="India">Indian Markets</option>
              <option value="Global">Global Developed</option>
              <option value="Emerging">Emerging Markets</option>
            </select>
          </motion.div>
        </div>

        {/* Sectors Multi-select */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="space-y-4 border-t border-white/5 pt-8"
        >
          <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4" style={{ color: '#FF006E' }} /> Preferred Sectors
          </Label>
          <div className="flex flex-wrap gap-3">
            {SECTORS.map((sector, i) => {
              const isSelected = sectors.includes(sector);
              const neon = SECTOR_NEON[i % SECTOR_NEON.length];
              return (
                <motion.button
                  key={sector}
                  type="button"
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSector(sector)}
                  className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border"
                  style={isSelected ? {
                    background: `${neon}18`,
                    borderColor: `${neon}60`,
                    color: neon,
                    boxShadow: `0 0 16px ${neon}30, 0 0 30px ${neon}10 inset`,
                  } : {
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {sector}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <Button
            type="submit"
            disabled={isPending || sectors.length === 0 || !capital}
            className="w-full h-16 text-lg rounded-2xl font-bold transition-all duration-300 electric-border"
            style={{
              background: 'linear-gradient(135deg, #00E576, #00B8D4, #BE00FF)',
              color: '#000',
              boxShadow: '0 0 30px rgba(0,229,118,0.3), 0 0 60px rgba(0,184,212,0.1)',
            }}
          >
            {isPending ? (
              <><Loader2 className="mr-2 w-6 h-6 animate-spin" /> Generating Engine Weights...</>
            ) : (
              <><Zap className="mr-2 w-5 h-5" /> Generate Portfolio</>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
