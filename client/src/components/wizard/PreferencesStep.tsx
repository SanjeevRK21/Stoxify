import { useState } from "react";
import { motion } from "framer-motion";
import { useSubmitPreferences } from "@/hooks/use-wizard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, DollarSign, Target, Globe, Layers } from "lucide-react";
import { playClick, playSelect } from "@/lib/sounds";

const SECTORS = ['Tech', 'Health', 'Finance', 'Energy', 'Consumer', 'Industrials'];

// ice-themed section card
function IcePanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{
      background: 'rgba(0,20,60,0.7)',
      border: '1px solid rgba(100,160,255,0.12)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(100,180,255,0.06)',
    }}>
      {children}
    </div>
  );
}

function IceLabel({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <Label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-3" style={{ color: 'rgba(120,180,255,0.7)' }}>
      <Icon className="w-3.5 h-3.5" style={{ color: '#60a5fa' }} /> {children}
    </Label>
  );
}

export function PreferencesStep({ profileId, onNext }: { profileId: number; onNext: () => void }) {
  const [goal, setGoal] = useState<'Capital Preservation' | 'Wealth Growth' | 'Short-term'>('Wealth Growth');
  const [sectors, setSectors] = useState<string[]>(['Tech', 'Health']);
  const [geography, setGeography] = useState('All Markets');
  const [capital, setCapital] = useState<string>("100000");

  const { mutate: submitPreferences, isPending } = useSubmitPreferences();

  const toggleSector = (sector: string) => {
    playSelect();
    setSectors(prev => prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]);
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

  const iceSelect = "w-full h-12 rounded-xl text-sm font-medium appearance-none px-4 focus:outline-none transition-all duration-200";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-xl mx-auto mt-6"
    >
      {/* aurora shimmer header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3" style={{
          background: 'rgba(80,140,255,0.1)', border: '1px solid rgba(80,140,255,0.2)'
        }}>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Ice Planet — Structural Layer</span>
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-1">Investment Preferences</h2>
        <p className="text-sm text-slate-400">Define your constraints to calibrate the allocation engine.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Capital */}
          <IcePanel>
            <IceLabel icon={DollarSign}>Capital ($)</IceLabel>
            <Input
              type="number" min="1"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              required
              className="h-12 text-xl font-mono text-white placeholder:text-slate-600"
              style={{ background: 'rgba(0,10,40,0.6)', border: '1px solid rgba(80,130,255,0.15)', borderRadius: 12 }}
            />
          </IcePanel>

          {/* Goal */}
          <IcePanel>
            <IceLabel icon={Target}>Primary Goal</IceLabel>
            <select
              value={goal}
              onChange={(e) => { playSelect(); setGoal(e.target.value as any); }}
              required
              className={iceSelect}
              style={{ background: 'rgba(0,10,40,0.6)', border: '1px solid rgba(80,130,255,0.15)', color: '#e2e8f0' }}
            >
              <option value="Wealth Growth">Wealth Growth</option>
              <option value="Capital Preservation">Capital Preservation</option>
              <option value="Short-term">Short-term Alpha</option>
            </select>
          </IcePanel>

          {/* Geography */}
          <IcePanel className="md:col-span-2">
            <IceLabel icon={Globe}>Geography</IceLabel>
            <select
              value={geography}
              onChange={(e) => { playSelect(); setGeography(e.target.value); }}
              required
              className={iceSelect}
              style={{ background: 'rgba(0,10,40,0.6)', border: '1px solid rgba(80,130,255,0.15)', color: '#e2e8f0' }}
            >
              <option value="All Markets">All Markets</option>
              <option value="US">US Markets Only</option>
              <option value="India">Indian Markets</option>
              <option value="Global">Global Developed</option>
              <option value="Emerging">Emerging Markets</option>
            </select>
          </IcePanel>
        </div>

        {/* Sectors */}
        <IcePanel>
          <IceLabel icon={Layers}>Preferred Sectors</IceLabel>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map(sector => {
              const sel = sectors.includes(sector);
              return (
                <button
                  key={sector}
                  type="button"
                  onClick={() => toggleSector(sector)}
                  className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200"
                  style={sel ? {
                    background: 'rgba(60,130,255,0.2)',
                    border: '1px solid rgba(60,130,255,0.5)',
                    color: '#93c5fd',
                    boxShadow: '0 0 12px rgba(60,130,255,0.2)',
                  } : {
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(148,163,184,0.7)',
                  }}
                >
                  {sector}
                </button>
              );
            })}
          </div>
          {sectors.length === 0 && (
            <p className="text-red-400/70 text-xs mt-2">Select at least one sector</p>
          )}
        </IcePanel>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isPending || sectors.length === 0 || !capital}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-14 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, rgba(60,130,255,0.8), rgba(100,60,255,0.7))',
            border: '1px solid rgba(80,150,255,0.3)',
            color: '#fff',
            boxShadow: '0 0 30px rgba(60,130,255,0.2)',
          }}
        >
          {isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Generating Engine Weights...</>
          ) : (
            'Engage Portfolio Engine →'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
