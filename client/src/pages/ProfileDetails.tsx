import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { Navbar } from "@/components/layout/Navbar";
import { ElectricBackground } from "@/components/layout/ElectricBackground";
import { useParams, Link, useLocation } from "wouter";
import { ChevronLeft, TrendingUp, AlertTriangle, ActivitySquare, Loader2, Target, Globe, Wallet, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";

const NEON_COLORS = ['#00E576', '#00B8D4', '#BE00FF', '#FF006E', '#FFE600'];

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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative">
        <ElectricBackground />
        <div className="relative z-10 flex flex-col items-center">
          <div className="black-hole relative w-32 h-32 mb-8 flex items-center justify-center">
            {[96, 72, 50, 32].map((size, i) => (
              <div key={i} className="black-hole-ring absolute rounded-full"
                style={{
                  width: size, height: size,
                  borderColor: NEON_COLORS[i],
                  borderWidth: 1,
                  '--dur': `${1.2 + i * 0.35}s`,
                  top: `calc(50% - ${size / 2}px)`,
                  left: `calc(50% - ${size / 2}px)`,
                } as React.CSSProperties}
              />
            ))}
            <div className="w-6 h-6 rounded-full" style={{
              background: 'radial-gradient(circle, #000 30%, rgba(0,229,118,0.4) 100%)',
              boxShadow: '0 0 20px rgba(0,229,118,0.7)',
            }} />
          </div>
          <p className="text-white font-medium text-gradient">Loading profile details...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center text-red-500 mt-20">Profile not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <ElectricBackground />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-white group">
              <ChevronLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </Button>
          </Link>

          <Button
            variant="destructive" size="sm"
            onClick={() => { if (confirm("Are you sure you want to delete this profile?")) deleteMutation.mutate(); }}
            disabled={deleteMutation.isPending}
            className="rounded-xl border border-red-500/30 hover:border-red-400"
            style={{ boxShadow: '0 0 15px rgba(255,0,51,0.2)' }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleteMutation.isPending ? "Deleting..." : "Delete Profile"}
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card border-white/5 electric-border overflow-hidden">
                <div className="h-1 w-full" style={{
                  background: 'linear-gradient(90deg, #00E576, #00B8D4, #BE00FF, #FF006E)',
                  backgroundSize: '200% 100%',
                  animation: 'rainbowBorder 3s linear infinite',
                }} />
                <CardHeader>
                  <CardTitle className="text-2xl font-display font-bold text-gradient">
                    {profile.profileName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { icon: Target, label: 'Goal', value: profile.investmentGoal, color: '#00E576' },
                    { icon: Globe, label: 'Geography', value: profile.geography, color: '#00B8D4' },
                    { icon: Wallet, label: 'Capital', value: `$${profile.capital?.toLocaleString()}`, color: '#BE00FF' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
                      <div className="flex items-center gap-2" style={{ color: `${color}99` }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                        <span className="text-sm">{label}</span>
                      </div>
                      <span className="font-medium font-mono text-white text-sm">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-card border-white/5 electric-border">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" /> Sectors
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {profile.preferredSectors?.map((sector, i) => (
                    <span key={sector} className="px-3 py-1 rounded-full text-xs font-bold border"
                      style={{
                        background: `${NEON_COLORS[i % NEON_COLORS.length]}12`,
                        borderColor: `${NEON_COLORS[i % NEON_COLORS.length]}40`,
                        color: NEON_COLORS[i % NEON_COLORS.length],
                        boxShadow: `0 0 10px ${NEON_COLORS[i % NEON_COLORS.length]}20`,
                      }}>
                      {sector}
                    </span>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            {finalAllocations && (
              <>
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className="glass-card border-white/5 electric-border overflow-hidden">
                    <div className="h-1 w-full" style={{
                      background: 'linear-gradient(90deg, #BE00FF, #00B8D4, #00E576)',
                      backgroundSize: '200% 100%',
                      animation: 'rainbowBorder 4s linear infinite',
                    }} />
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gradient-pink">Target Allocation</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={finalAllocations}
                            cx="50%" cy="50%"
                            innerRadius={60} outerRadius={90}
                            paddingAngle={4}
                            dataKey="investmentAmount"
                            nameKey="stock.ticker"
                            isAnimationActive
                            animationBegin={0}
                            animationDuration={900}
                          >
                            {finalAllocations.map((_: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={NEON_COLORS[index % NEON_COLORS.length]}
                                style={{ filter: `drop-shadow(0 0 8px ${NEON_COLORS[index % NEON_COLORS.length]}88)` }}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }: any) => {
                              if (active && payload && payload.length > 0) {
                                const data = payload[0].payload;
                                const percentage = (data.investmentAmount / totalInvested * 100).toFixed(1);
                                const color = NEON_COLORS[finalAllocations.indexOf(data) % NEON_COLORS.length];
                                return (
                                  <div className="backdrop-blur-sm rounded-lg p-3 shadow-xl border"
                                    style={{ background: 'rgba(10,14,26,0.9)', borderColor: `${color}40` }}>
                                    <p className="font-bold text-sm" style={{ color }}>{data.stock.ticker}</p>
                                    <p className="text-xs mt-1 text-cyan-400">${data.investmentAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                    <p className="text-xs text-emerald-400">{data.shares} shares</p>
                                    <p className="text-xs" style={{ color }}>{percentage}% of portfolio</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                <div className="space-y-4">
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold text-white flex items-center gap-2"
                  >
                    <ActivitySquare className="w-5 h-5 text-primary" />
                    {profile.confirmedPortfolio ? (
                      <span className="text-gradient">Confirmed Portfolio</span>
                    ) : (
                      <span className="text-gradient-pink">Recommended Portfolio</span>
                    )}
                  </motion.h3>

                  <div className="grid gap-4">
                    {finalAllocations.map((item: any, index: number) => {
                      const neon = NEON_COLORS[index % NEON_COLORS.length];
                      return (
                        <motion.div
                          key={item.stock.id}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.08, duration: 0.45 }}
                        >
                          <Card className="glass-card border-white/5 hover:border-white/10 transition-all elec-card overflow-hidden"
                            style={{ '--neon': neon } as React.CSSProperties}>
                            <div className="h-0.5 w-full" style={{
                              background: `linear-gradient(90deg, transparent, ${neon}, transparent)`,
                              boxShadow: `0 0 8px ${neon}`,
                            }} />
                            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-2 h-12 rounded-full"
                                  style={{ background: neon, boxShadow: `0 0 12px ${neon}` }} />
                                <div>
                                  <h4 className="text-2xl font-display font-bold" style={{ color: neon, textShadow: `0 0 20px ${neon}60` }}>
                                    {item.stock.ticker}
                                  </h4>
                                  <p className="text-muted-foreground">{item.stock.name}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Shares</p>
                                  <p className="text-lg font-mono text-white font-medium">{item.shares}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Investment</p>
                                  <p className="text-lg font-mono font-medium" style={{ color: neon }}>${item.investmentAmount.toLocaleString()}</p>
                                </div>
                                <div className="hidden md:block">
                                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Score</p>
                                  <p className="text-lg font-mono text-cyan-400 font-medium">{item.score.toFixed(2)}</p>
                                </div>
                              </div>
                            </CardContent>

                            {profile.isActive && (
                              <CardContent className="px-6 pb-4 pt-0 flex justify-end">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider"
                                  style={{ color: neon, background: `${neon}10`, borderColor: `${neon}30` }}>
                                  <ActivitySquare className="w-3.5 h-3.5" />
                                  Confirmed Asset
                                </div>
                              </CardContent>
                            )}

                            <CardContent className="px-6 pb-6 pt-0 border-t border-white/5">
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                                {[
                                  { label: 'CAGR', value: `${(item.stock.cagr * 100).toFixed(1)}%`, cls: 'stat-neon-1' },
                                  { label: 'Volatility', value: `${(item.stock.volatility * 100).toFixed(1)}%`, cls: 'stat-neon-2' },
                                  { label: 'Skewness', value: item.stock.skewness.toFixed(2), cls: 'stat-neon-3' },
                                  { label: 'Alpha', value: `${(item.stock.alpha * 100).toFixed(1)}%`, cls: 'stat-neon-4' },
                                  { label: 'Recovery', value: `${item.stock.recoveryTime}d`, cls: 'stat-neon-5' },
                                ].map(({ label, value, cls }) => (
                                  <div key={label}>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">{label}</p>
                                    <p className={`text-sm font-mono font-medium ${cls}`}>{value}</p>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
