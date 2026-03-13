import { useAuth } from "@/hooks/use-auth";
import { useProfiles } from "@/hooks/use-profiles";
import { Navbar } from "@/components/layout/Navbar";
import { Link } from "wouter";
import { Plus, Briefcase, ChevronRight, ActivitySquare, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useEffect, useRef } from "react";

function ElectricBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="laser-grid" />
      <div className="scanner-line" />

      {/* floating particles */}
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${(i * 5.7 + 3) % 100}%`,
            '--dur': `${5 + (i % 5)}s`,
            '--delay': `${(i * 0.7) % 5}s`,
            background: i % 3 === 0 ? 'rgba(0,184,212,0.9)' : i % 3 === 1 ? 'rgba(41,121,255,0.9)' : 'rgba(0,229,118,0.9)',
            boxShadow: i % 3 === 0 ? '0 0 6px rgba(0,184,212,1)' : i % 3 === 1 ? '0 0 6px rgba(41,121,255,1)' : '0 0 6px rgba(0,229,118,1)',
          } as React.CSSProperties}
        />
      ))}

      {/* horizontal laser beams */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="laser-beam"
          style={{
            top: `${15 + i * 14}%`,
            '--dur': `${4 + i * 0.8}s`,
            '--delay': `${i * 0.9}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* data streams (vertical) */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="data-stream"
          style={{
            left: `${i * 10 + 5}%`,
            '--dur': `${3 + (i % 4)}s`,
            '--delay': `${i * 0.5}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500/4 rounded-full blur-[90px]" />
    </div>
  );
}

function ProfileRecommendations({ profileId }: { profileId: number }) {
  const { data: recommendation } = useQuery({
    queryKey: [api.recommend.generate.path, { profileId, mode: 'diversify' }],
    staleTime: 1000 * 60 * 5,
  });

  if (!recommendation?.allocations?.length) return null;

  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 flex items-center gap-1">
        <TrendingUp className="w-3 h-3" /> Confirmed Assets
      </p>
      <div className="flex flex-wrap gap-1.5">
        {recommendation.allocations.slice(0, 3).map((item: any) => (
          <span key={item.stock.id} className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/20 neon-pulse">
            {item.stock.ticker}
          </span>
        ))}
        {recommendation.allocations.length > 3 && (
          <span className="text-[10px] text-muted-foreground font-medium">
            +{recommendation.allocations.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profiles, isLoading, error } = useProfiles();

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <ElectricBackground />
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full relative z-10">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Live Engine Active</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 text-gradient">
              Welcome back, {user?.firstName || 'Investor'}
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your behavioral portfolios and generate new AI-driven allocations.
            </p>
          </div>
          
          <Link href="/wizard">
            <Button className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 electric-border neon-pulse">
              <Plus className="mr-2 w-5 h-5" /> New Portfolio
            </Button>
          </Link>
        </header>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <Briefcase className="w-4 h-4 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-white">Your Profiles</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 glass-card rounded-2xl animate-pulse bg-secondary/20 electric-border" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
              <div>
                <h3 className="text-lg font-bold text-white">Failed to load profiles</h3>
                <p className="text-muted-foreground">There was an issue communicating with the engine.</p>
              </div>
            </div>
          ) : !profiles || profiles.length === 0 ? (
            <div className="text-center py-20 px-6 glass-card rounded-3xl border-dashed electric-border">
              <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6 neon-pulse">
                <ActivitySquare className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-2">No profiles yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Create your first investment profile to capture your unique behavioral footprint and generate an optimal portfolio.
              </p>
              <Link href="/wizard">
                <Button className="h-12 px-8 bg-white hover:bg-white/90 text-black font-semibold rounded-xl">
                  Start Analysis
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map(profile => (
                <div key={profile.id} className="group glass-card p-6 rounded-2xl flex flex-col justify-between hover:border-white/20 transition-all duration-300 elec-card electric-border">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white line-clamp-1">{profile.profileName}</h3>
                      {profile.isActive ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 neon-pulse">ACTIVE</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-bold">DRAFT</span>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Goal</span>
                        <span className="text-white font-medium">{profile.investmentGoal || 'Pending'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Capital</span>
                        <span className="text-white font-mono font-medium">
                          {profile.capital ? `$${profile.capital.toLocaleString()}` : 'Pending'}
                        </span>
                      </div>
                    </div>

                    {profile.isActive && <ProfileRecommendations profileId={profile.id} />}
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-6">
                    <span className="text-xs text-muted-foreground">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </span>
                    <Link href={`/profile/${profile.id}`}>
                      <button className="text-sm font-semibold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1">
                        View Details <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
