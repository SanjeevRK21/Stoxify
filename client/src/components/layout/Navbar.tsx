import { useAuth } from "@/hooks/use-auth";
import { Activity, LogOut, User as UserIcon } from "lucide-react";
import { Link } from "wouter";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl tracking-wide text-foreground group-hover:text-primary transition-colors">
              Aura
            </span>
          </Link>

          {user && (
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-3 bg-secondary/50 px-4 py-1.5 rounded-full border border-white/5">
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="Profile" className="w-6 h-6 rounded-full" />
                ) : (
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium text-foreground">{user.firstName || user.email}</span>
              </div>
              <button
                onClick={() => logout()}
                className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
