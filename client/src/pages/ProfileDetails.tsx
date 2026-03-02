import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { Navbar } from "@/components/layout/Navbar";
import { useParams, Link } from "wouter";
import { ChevronLeft, TrendingUp, AlertTriangle, ActivitySquare, Loader2, Target, Globe, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { api, buildUrl } from "@shared/routes";

export default function ProfileDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading: isLoadingProfile } = useProfile(Number(id));
  
  const { data: recommendation, isLoading: isLoadingRec } = useQuery({
    queryKey: [api.recommend.generate.path, { profileId: Number(id), mode: 'diversify' }],
    enabled: !!profile,
  });

  if (isLoadingProfile || isLoadingRec) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-white font-medium">Loading profile details...</p>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center text-red-500 mt-20">Profile not found.</div>;
  }

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <Link href="/">
          <Button variant="ghost" className="mb-8 text-muted-foreground hover:text-white">
            <ChevronLeft className="mr-2 w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle className="text-2xl font-display font-bold text-white">{profile.profileName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Target className="w-4 h-4" />
                    <span>Goal</span>
                  </div>
                  <span className="text-white font-medium">{profile.investmentGoal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="w-4 h-4" />
                    <span>Geography</span>
                  </div>
                  <span className="text-white font-medium">{profile.geography}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Wallet className="w-4 h-4" />
                    <span>Capital</span>
                  </div>
                  <span className="text-white font-mono font-medium">${profile.capital?.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">Sectors</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {profile.preferredSectors?.map(sector => (
                  <span key={sector} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                    {sector}
                  </span>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {recommendation && (
              <>
                <Card className="glass-card border-white/5">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white">Target Allocation</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={recommendation.allocations}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="allocationPercent"
                          nameKey="stock.ticker"
                        >
                          {recommendation.allocations.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Allocation Details</h3>
                  <div className="grid gap-4">
                    {recommendation.allocations.map((item: any, index: number) => (
                      <Card key={item.stock.id} className="glass-card border-white/5 hover:border-white/10 transition-all">
                        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h4 className="text-2xl font-display font-bold text-white">{item.stock.ticker}</h4>
                            <p className="text-muted-foreground">{item.stock.name}</p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Shares</p>
                              <p className="text-lg font-mono text-white font-medium">{item.shares}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Investment</p>
                              <p className="text-lg font-mono text-primary font-medium">${item.investmentAmount.toLocaleString()}</p>
                            </div>
                            <div className="hidden md:block">
                              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Score</p>
                              <p className="text-lg font-mono text-cyan-400 font-medium">{item.score.toFixed(2)}</p>
                            </div>
                          </div>
                        </CardContent>
                        <CardContent className="px-6 pb-6 pt-0 border-t border-white/5 mt-4">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">CAGR</p>
                              <p className="text-sm font-mono text-emerald-400">{(item.stock.cagr * 100).toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Volatility</p>
                              <p className="text-sm font-mono text-amber-400">{(item.stock.volatility * 100).toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Skewness</p>
                              <p className="text-sm font-mono text-blue-400">{item.stock.skewness.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Alpha</p>
                              <p className="text-sm font-mono text-purple-400">{(item.stock.alpha * 100).toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Recovery</p>
                              <p className="text-sm font-mono text-orange-400">{item.stock.recoveryTime}d</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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