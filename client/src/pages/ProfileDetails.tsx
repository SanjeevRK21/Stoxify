import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/hooks/use-profiles";
import { Navbar } from "@/components/layout/Navbar";
import { useParams, Link, useLocation } from "wouter";
import { ChevronLeft, TrendingUp, AlertTriangle, ActivitySquare, Loader2, Target, Globe, Wallet, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { playChime, playClick } from "@/lib/sounds";

const COLORS = ['#a0b4d0', '#7090c0', '#9080d0', '#6090b0', '#8070c0'];

// ── Moon dust particles ───────────────────────────────
function MoonDust() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="stars-layer" style={{ opacity: 0.5 }} />
      <div className="stars-layer-2" style={{ opacity: 0.3 }} />
      <div className="moonbeam" />
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className="moon-dust" style={{
          width: `${1 + (i % 3)}px`,
          height: `${1 + (i % 3)}px`,
          left: `${(i * 5.6 + 3) % 98}%`,
          top: `${(i * 7.3 + 10) % 90}%`,
          '--dur': `${7 + (i % 5)}s`,
          '--delay': `${i * 0.4}s`,
        } as React.CSSProperties} />
      ))}
    </div>
  );
}

// ── Crater-style stat card ─────────────────────────────
function CraterCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 crater-card ${className}`}>
      {children}
    </div>
  );
}

// ── Moon stat row ─────────────────────────────────────
function MoonStat({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/4 last:border-0">
      <div className="flex items-center gap-2.5 text-slate-500">
        <Icon className="w-4 h-4 text-slate-600" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-slate-200 font-medium text-sm">{value}</span>
    </div>
  );
}

export default function ProfileDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: isLoadingProfile } = useProfile(Number(id));

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", buildUrl(api.profiles.delete.path, { id: Number(id) }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.list.path] });
      toast({ title: "Profile deleted", description: "The investment profile has been removed." });
      setLocation("/");
    }
  });

  const { data: recommendation, isLoading: isLoadingRec } = useQuery({
    queryKey: [api.recommend.generate.path, { profileId: Number(id), mode: 'diversify' }],
    enabled: !!profile && !profile.confirmedPortfolio,
  });

  const finalAllocations = profile?.confirmedPortfolio || recommendation?.allocations;
  const totalInvested = finalAllocations?.reduce((sum: number, item: any) => sum + item.investmentAmount, 0) || 0;

  if (isLoadingProfile || (isLoadingRec && !profile?.confirmedPortfolio)) {
    return (
      <div className="min-h-screen atmo-moon flex flex-col items-center justify-center">
        <MoonDust />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full mb-6 relative" style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(160,180,210,0.3) 0%, rgba(80,90,120,0.15) 60%, transparent 100%)',
            border: '1px solid rgba(160,180,210,0.15)',
            boxShadow: '0 0 40px rgba(100,130,200,0.1)',
          }}>
            <div className="absolute inset-2 rounded-full border border-slate-600/30 animate-spin" style={{ borderTopColor: 'rgba(160,180,210,0.6)' }} />
          </div>
          <p className="text-slate-400 text-sm animate-pulse">Loading from lunar orbit...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center text-red-500 mt-20">Profile not found.</div>;
  }

  return (
    <div className="min-h-screen atmo-moon flex flex-col relative">
      <MoonDust />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
        {/* Back / Delete bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <Link href="/">
            <button
              onClick={() => playChime()}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-200 transition-colors px-3 py-2 rounded-xl moon-btn"
            >
              <ChevronLeft className="w-4 h-4" /> Return to System
            </button>
          </Link>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this profile?")) {
                playClick();
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2 text-xs font-bold text-red-400/70 hover:text-red-400 transition-colors px-3 py-2 rounded-xl border border-red-500/10 hover:border-red-500/20 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleteMutation.isPending ? 'Deleting...' : 'Discard Profile'}
          </button>
        </motion.div>

        {/* Moon badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex items-center gap-2 mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full" style={{
            background: 'rgba(80,100,160,0.12)',
            border: '1px solid rgba(120,140,200,0.15)',
          }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(160,180,210,0.7)', boxShadow: '0 0 4px rgba(160,180,210,0.5)' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lunar Archive — Profile Details</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left sidebar ── */}
          <div className="space-y-4">
            {/* Profile identity card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <CraterCard>
                <div className="flex items-start gap-3 mb-4">
                  {/* Moon sphere icon */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full" style={{
                    background: 'radial-gradient(circle at 35% 35%, rgba(180,190,220,0.25) 0%, rgba(80,90,120,0.15) 60%, transparent 100%)',
                    border: '1px solid rgba(140,160,200,0.15)',
                    boxShadow: '0 0 20px rgba(100,130,200,0.08)',
                  }} />
                  <div>
                    <h1 className="text-2xl font-display font-bold text-white">{profile.profileName}</h1>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                      profile.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-white/5 text-slate-500 border border-white/8'
                    }`}>{profile.isActive ? 'ACTIVE' : 'DRAFT'}</span>
                  </div>
                </div>
                <MoonStat label="Goal" value={profile.investmentGoal || '—'} icon={Target} />
                <MoonStat label="Geography" value={profile.geography || '—'} icon={Globe} />
                <MoonStat label="Capital" value={profile.capital ? `$${profile.capital.toLocaleString()}` : '—'} icon={Wallet} />
              </CraterCard>
            </motion.div>

            {/* Sectors */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <CraterCard>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">Preferred Sectors</p>
                <div className="flex flex-wrap gap-2">
                  {profile.preferredSectors?.map(sector => (
                    <span key={sector} className="px-3 py-1 rounded-full text-xs font-bold" style={{
                      background: 'rgba(80,100,160,0.12)',
                      border: '1px solid rgba(120,140,200,0.15)',
                      color: 'rgba(160,180,220,0.8)',
                    }}>
                      {sector}
                    </span>
                  ))}
                </div>
              </CraterCard>
            </motion.div>

            {/* Portfolio status */}
            {profile.confirmedPortfolio && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <CraterCard>
                  <div className="flex items-center gap-2 mb-1">
                    <ActivitySquare className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Confirmed Portfolio</p>
                  </div>
                  <p className="text-xs text-slate-600">{profile.confirmedPortfolio.length} assets locked in</p>
                </CraterCard>
              </motion.div>
            )}
          </div>

          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-6">
            {finalAllocations ? (
              <>
                {/* Allocation chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.6 }}
                >
                  <CraterCard>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-4">Target Allocation</p>
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={finalAllocations}
                            cx="50%" cy="50%"
                            innerRadius={55} outerRadius={85}
                            paddingAngle={4}
                            dataKey="investmentAmount"
                            nameKey="stock.ticker"
                            stroke="none"
                          >
                            {finalAllocations.map((_, index: number) => (
                              <Cell
                                key={index}
                                fill={COLORS[index % COLORS.length]}
                                style={{ filter: `drop-shadow(0 0 6px ${COLORS[index % COLORS.length]}88)` }}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }: any) => {
                              if (active && payload?.length) {
                                const d = payload[0].payload;
                                return (
                                  <div style={{
                                    background: 'rgba(12,12,28,0.95)',
                                    border: '1px solid rgba(120,140,200,0.2)',
                                    borderRadius: 10, padding: '10px 14px',
                                  }}>
                                    <p className="text-white font-bold text-sm">{d.stock.ticker}</p>
                                    <p className="text-slate-400 text-xs">${d.investmentAmount.toLocaleString()}</p>
                                    <p className="text-slate-500 text-xs">{d.shares} shares</p>
                                    <p className="text-xs" style={{ color: '#a0b4d0' }}>{(d.investmentAmount / totalInvested * 100).toFixed(1)}%</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend
                            formatter={(value: string) => (
                              <span style={{ color: 'rgba(148,163,184,0.7)', fontSize: 11 }}>{value}</span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between mt-4 pt-4 border-t border-white/5">
                      <div>
                        <p className="text-xs text-slate-600 uppercase font-bold mb-1">Total Invested</p>
                        <p className="font-mono text-white font-medium">${totalInvested.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-600 uppercase font-bold mb-1">Remaining</p>
                        <p className="font-mono text-slate-300 font-medium">${((profile.capital || 0) - totalInvested).toLocaleString()}</p>
                      </div>
                    </div>
                  </CraterCard>
                </motion.div>

                {/* Asset list */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-3 flex items-center gap-2">
                    <ActivitySquare className="w-3.5 h-3.5" />
                    {profile.confirmedPortfolio ? 'Confirmed Portfolio' : 'Recommended Portfolio'}
                  </p>
                  <div className="space-y-3">
                    {finalAllocations.map((item: any, index: number) => (
                      <motion.div
                        key={item.stock.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.08, duration: 0.4 }}
                      >
                        <CraterCard className="hover:border-slate-600/30 transition-all duration-300">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-10 rounded-full" style={{
                                backgroundColor: COLORS[index % COLORS.length],
                                boxShadow: `0 0 8px ${COLORS[index % COLORS.length]}66`,
                              }} />
                              <div>
                                <h4 className="text-xl font-display font-bold text-white">{item.stock.ticker}</h4>
                                <p className="text-slate-500 text-xs">{item.stock.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-slate-200 font-medium">${item.investmentAmount.toLocaleString()}</p>
                              <p className="text-xs text-slate-600 mt-0.5">{item.shares} shares</p>
                            </div>
                          </div>

                          {/* Metrics row */}
                          <div className="grid grid-cols-5 gap-2 pt-3 border-t border-white/4">
                            {[
                              { label: 'CAGR', value: `${(item.stock.cagr * 100).toFixed(1)}%`, color: '#6ee7b7' },
                              { label: 'Vol', value: `${(item.stock.volatility * 100).toFixed(1)}%`, color: '#fcd34d' },
                              { label: 'Skew', value: item.stock.skewness.toFixed(2), color: '#93c5fd' },
                              { label: 'Alpha', value: `${(item.stock.alpha * 100).toFixed(1)}%`, color: '#c4b5fd' },
                              { label: 'Rec', value: `${item.stock.recoveryTime}d`, color: '#fdba74' },
                            ].map(({ label, value, color }) => (
                              <div key={label} className="text-center">
                                <p className="text-[9px] uppercase font-bold text-slate-700 mb-1">{label}</p>
                                <p className="text-xs font-mono font-medium" style={{ color }}>{value}</p>
                              </div>
                            ))}
                          </div>

                          {profile.isActive && (
                            <div className="mt-3 pt-2 border-t border-white/4 flex items-center gap-1.5">
                              <ActivitySquare className="w-3 h-3 text-emerald-500/60" />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/60">Confirmed Asset</span>
                            </div>
                          )}
                        </CraterCard>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <CraterCard className="text-center py-12">
                <Loader2 className="w-8 h-8 text-slate-600 animate-spin mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Computing allocation from lunar orbit...</p>
              </CraterCard>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
