import { useAuth } from "@/hooks/use-auth";
import { Activity, LogOut, User as UserIcon, Zap } from "lucide-react";
import { Link } from "wouter";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl navbar-glow">
      {/* top neon line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,229,118,0.8), rgba(0,184,212,0.8), rgba(190,0,255,0.8), rgba(255,0,110,0.8), rgba(255,230,0,0.8), transparent)",
          animation: "rainbowBorder 4s linear infinite",
          backgroundSize: "400% 100%",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center space-x-2 group cursor-pointer"
          >
            <div
              className="relative w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110"
              style={{
                background:
                  "linear-gradient(135deg, #00E576, #00B8D4, #BE00FF)",
                boxShadow:
                  "0 0 15px rgba(0,229,118,0.4), 0 0 30px rgba(0,184,212,0.2)",
              }}
            >
              <Activity className="w-5 h-5 text-black" />
              {/* pulse ring */}
              <div
                className="absolute inset-0 rounded-xl border border-primary/30 animate-ping"
                style={{ animationDuration: "2s" }}
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-xl tracking-wide text-gradient group-hover:text-white transition-colors">
                Stoxify
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-primary" />
                Engine Live
              </span>
            </div>
          </Link>

          {user && (
            <div className="flex items-center space-x-4">
              <div
                className="hidden md:flex items-center space-x-3 px-4 py-1.5 rounded-full border electric-border"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div className="relative">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-6 h-6 rounded-full ring-1 ring-primary/40"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center">
                      <UserIcon className="w-3 h-3 text-black" />
                    </div>
                  )}
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary"
                    style={{ boxShadow: "0 0 6px rgba(0,229,118,0.9)" }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {user.firstName || user.email}
                </span>
              </div>
              <button
                onClick={() => logout()}
                className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors group px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                <LogOut className="w-4 h-4 group-hover:text-pink-400 transition-colors" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
