import { useAuth } from "@/hooks/use-auth";
import { useProfiles } from "@/hooks/use-profiles";
import { Navbar } from "@/components/layout/Navbar";
import { ElectricBackground } from "@/components/layout/ElectricBackground";
import { Link } from "wouter";
import { Plus, Briefcase, ChevronRight, ActivitySquare, AlertCircle, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { motion } from "framer-motion";

const NEON_COLORS = ['#00E576','#00B8D4','#BE00FF','#FF006E','#FFE600','#FF6B00'];

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
        {recommendation.allocations.slice(0, 3).map((item: any, i: number) => (
          <span
            key={item.stock.id}
            className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
            style={{
              background: `${NEON_COLORS[i % NEON_COLORS.length]}18`,
              borderColor: `${NEON_COLORS[i % NEON_COLORS.length]}40`,
              color: NEON_COLORS[i % NEON_COLORS.length],
              boxShadow: `0 0 10px ${NEON_COLORS[i % NEON_COLORS.length]}30`,
            }}
          >
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
        <motion.header
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 electric-border"
              style={{ background: 'rgba(0,229,118,0.05)' }}>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"
                style={{ boxShadow: '0 0 8px rgba(0,229,118,1)' }} />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Live Engine Active</span>
              <Zap className="w-3 h-3 text-yellow-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 text-gradient">
              Welcome back, {user?.firstName || 'Investor'}
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your behavioral portfolios and generate new AI-driven allocations.
            </p>
          </div>

          <Link href="/wizard">
            <Button className="h-12 px-6 rounded-xl font-semibold shadow-lg electric-border"
              style={{
                background: 'linear-gradient(135deg, #00E576, #00B8D4)',
                color: '#000',
                boxShadow: '0 0 20px rgba(0,229,118,0.3)',
              }}>
              <Plus className="mr-2 w-5 h-5" /> New Portfolio
            </Button>
          </Link>
        </motion.header>

        <section>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{ background: 'rgba(0,184,212,0.1)', borderColor: 'rgba(0,184,212,0.3)' }}>
              <Briefcase className="w-4 h-4" style={{ color: '#00B8D4' }} />
            </div>
            <h2 className="text-2xl font-display font-semibold text-white">Your Profiles</h2>
            <div className="h-px flex-1" style={{
              background: 'linear-gradient(90deg, rgba(0,184,212,0.4), rgba(190,0,255,0.2), transparent)',
            }} />
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-48 glass-card rounded-2xl animate-pulse bg-secondary/20 electric-border card-enter card-enter-${i}`} />
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-20 px-6 glass-card rounded-3xl electric-border"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 neon-pulse"
                style={{ background: 'rgba(190,0,255,0.1)', border: '1px solid rgba(190,0,255,0.2)' }}>
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
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile, idx) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="group glass-card p-6 rounded-2xl flex flex-col justify-between hover:border-white/20 transition-all duration-300 elec-card electric-border"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white line-clamp-1">{profile.profileName}</h3>
                      {profile.isActive ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold border neon-pulse"
                          style={{
                            background: 'rgba(0,229,118,0.1)',
                            borderColor: 'rgba(0,229,118,0.3)',
                            color: '#00E576',
                          }}>
                          ACTIVE
                        </span>
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
                        <span className="font-mono font-medium" style={{ color: '#00B8D4' }}>
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
                      <button className="text-sm font-semibold flex items-center gap-1 transition-all group/btn"
                        style={{ color: NEON_COLORS[idx % NEON_COLORS.length] }}>
                        View Details
                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
