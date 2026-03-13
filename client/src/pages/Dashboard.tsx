import { useAuth } from "@/hooks/use-auth";
import { useProfiles } from "@/hooks/use-profiles";
import { Navbar } from "@/components/layout/Navbar";
import { Link, useLocation } from "wouter";
import { Plus, Briefcase, ChevronRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playWhoosh, playOrbitPing, playChime } from "@/lib/sounds";

// ─── Solar system data ────────────────────────────────
const PLANETS = [
  { name: 'Mercury', color: '#a8a8b0', size: 9,  orbit: 62,  speed: 4,  gradient: 'radial-gradient(circle at 35% 35%, #c8c8d0, #808090)' },
  { name: 'Venus',   color: '#e8cda0', size: 14, orbit: 98,  speed: 7,  gradient: 'radial-gradient(circle at 35% 35%, #f0e0b0, #c09050)' },
  { name: 'Earth',   color: '#4287f5', size: 15, orbit: 136, speed: 10, gradient: 'radial-gradient(circle at 35% 35%, #5ba0ff, #1a5090), radial-gradient(circle at 60% 70%, rgba(0,120,40,0.5), transparent)' },
  { name: 'Mars',    color: '#c1440e', size: 11, orbit: 174, speed: 14, gradient: 'radial-gradient(circle at 35% 35%, #e05020, #8b2000)' },
  { name: 'Jupiter', color: '#c88b3a', size: 30, orbit: 224, speed: 21, gradient: 'radial-gradient(circle at 50% 40%, #d4a060, #a86020, #c08040, #906020)', hasStripes: true },
  { name: 'Saturn',  color: '#e4c882', size: 25, orbit: 278, speed: 29, gradient: 'radial-gradient(circle at 35% 35%, #f0d898, #b89040)', hasRings: true, ringColor: 'rgba(220,185,100,0.45)' },
  { name: 'Neptune', color: '#2a52be', size: 20, orbit: 332, speed: 37, gradient: 'radial-gradient(circle at 35% 35%, #4070e0, #1030a0)' },
];

// ─── Star Field ───────────────────────────────────────
function SpaceBackground() {
  return (
    <div className="space-bg">
      <div className="stars-layer" />
      <div className="stars-layer-2" />
      <div className="nebula-1" />
      <div className="nebula-2" />
      {[0,1,2].map(i => (
        <div key={i} className="comet" style={{
          '--top': `${15 + i * 25}%`,
          '--dur': `${10 + i * 4}s`,
          '--delay': `${i * 5}s`,
        } as React.CSSProperties} />
      ))}
    </div>
  );
}

// ─── Individual Planet ────────────────────────────────
function Planet({ planet, startAngle }: { planet: typeof PLANETS[0]; startAngle: number }) {
  return (
    <div
      className="orbit-arm"
      style={{
        '--speed': `${planet.speed}s`,
        '--radius': `${planet.orbit}px`,
        transform: `rotate(${startAngle}deg)`,
        animationDelay: `-${(startAngle / 360) * planet.speed}s`,
      } as React.CSSProperties}
    >
      <div
        className="planet-wrap"
        style={{ '--radius': `${planet.orbit}px` } as React.CSSProperties}
        onMouseEnter={() => playOrbitPing()}
      >
        <div
          className="planet-body"
          style={{
            width: planet.size, height: planet.size,
            background: planet.gradient,
            boxShadow: `0 0 ${planet.size * 0.6}px ${planet.color}60, 0 0 ${planet.size * 1.5}px ${planet.color}20`,
          }}
        />
        {planet.hasRings && (
          <div className="saturn-ring" style={{
            width: planet.size * 2.2,
            height: planet.size * 0.45,
            borderColor: planet.ringColor,
            boxShadow: `0 0 8px ${planet.ringColor}`,
          }} />
        )}
        <div className="planet-label">{planet.name}</div>
      </div>
    </div>
  );
}

// ─── Solar System ─────────────────────────────────────
function SolarSystem() {
  return (
    <div className="solar-system">
      {/* Orbit tracks */}
      {PLANETS.map(p => (
        <div key={p.name + '-track'} className="orbit-track" style={{
          width: p.orbit * 2, height: p.orbit * 2,
        }} />
      ))}

      {/* Sun */}
      <div className="sun" />

      {/* Planets with staggered start angles */}
      {PLANETS.map((p, i) => (
        <Planet key={p.name} planet={p} startAngle={(i * 51) % 360} />
      ))}
    </div>
  );
}

// ─── Profile recommendations ──────────────────────────
function ProfileRecommendations({ profileId }: { profileId: number }) {
  const { data: rec } = useQuery({
    queryKey: [api.recommend.generate.path, { profileId, mode: 'diversify' }],
    staleTime: 1000 * 60 * 5,
  });
  if (!rec?.allocations?.length) return null;
  return (
    <div className="mt-3 pt-3 border-t border-white/5">
      <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1">
        <TrendingUp className="w-3 h-3" /> Confirmed Assets
      </p>
      <div className="flex flex-wrap gap-1.5">
        {rec.allocations.slice(0, 4).map((item: any) => (
          <span key={item.stock.id} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
            {item.stock.ticker}
          </span>
        ))}
        {rec.allocations.length > 4 && (
          <span className="text-[10px] text-slate-500 font-medium">+{rec.allocations.length - 4}</span>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const { data: profiles, isLoading } = useProfiles();
  const [, navigate] = useLocation();
  const [transitioning, setTransitioning] = useState(false);

  const handleNewPortfolio = () => {
    playWhoosh();
    setTransitioning(true);
    setTimeout(() => navigate('/wizard'), 900);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-x-hidden">
      <SpaceBackground />

      {/* Planet transition overlay */}
      <AnimatePresence>
        {transitioning && (
          <div className="planet-transition">
            <div
              className="planet-transition-ball"
              style={{ background: 'radial-gradient(circle, #e05020 0%, #8b2000 60%, #3d0900 100%)' }}
            />
          </div>
        )}
      </AnimatePresence>

      <Navbar />

      <main className="flex-1 relative z-10 flex flex-col">
        {/* ── Solar System hero ── */}
        <div className="flex flex-col items-center pt-6 pb-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            <SolarSystem />
          </motion.div>

          {/* Headline overlaid below sun */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-center -mt-16 mb-8 z-10 relative"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Welcome back, {user?.firstName || 'Investor'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Your Investment Universe
            </h1>
            <button
              onClick={handleNewPortfolio}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/40"
            >
              <Plus className="w-4 h-4" /> Launch New Portfolio
            </button>
          </motion.div>
        </div>

        {/* ── Profile cards ── */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-display font-semibold text-white">Your Profiles</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map(i => (
                <div key={i} className="h-44 rounded-2xl animate-pulse bg-white/3 border border-white/5" />
              ))}
            </div>
          ) : !profiles?.length ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 rounded-3xl bg-white/3 border border-white/5"
            >
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2">No profiles yet</h3>
              <p className="text-slate-500 mb-6 text-sm">Launch a portfolio to begin your cosmic investment journey.</p>
              <button onClick={handleNewPortfolio} className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:bg-white/90 transition-colors">
                Start Journey
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {profiles.map((profile, i) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 cursor-default elec-card"
                  style={{
                    background: 'rgba(12,12,28,0.8)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-white">{profile.profileName}</h3>
                      {profile.isActive ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">ACTIVE</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-500 text-[10px] font-bold">DRAFT</span>
                      )}
                    </div>
                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Goal</span>
                        <span className="text-slate-200">{profile.investmentGoal || '—'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Capital</span>
                        <span className="text-slate-200 font-mono">{profile.capital ? `$${profile.capital.toLocaleString()}` : '—'}</span>
                      </div>
                    </div>
                    {profile.isActive && <ProfileRecommendations profileId={profile.id} />}
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-4">
                    <span className="text-xs text-slate-600">{new Date(profile.createdAt).toLocaleDateString()}</span>
                    <Link href={`/profile/${profile.id}`}>
                      <button
                        onClick={() => playChime()}
                        className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 transition-colors"
                      >
                        View Details <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
