import { ArrowRight, Activity, Cpu, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background font-sans overflow-hidden">
      {/* Left Panel: Branding & Hero */}
      <div className="w-full md:w-[55%] relative flex flex-col justify-between p-8 md:p-16 lg:p-24 border-r border-white/5">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-screen pointer-events-none"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-2xl tracking-wide text-white">
              Stoxify
            </span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-display font-bold text-white leading-[1.1] mb-6 tracking-tight">
            The Hybrid <br />
            <span className="text-gradient">Allocation Engine</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-lg leading-relaxed mb-12">
            Stoxify combines quantitative market metrics with your distinct
            behavioral footprint to construct highly personalized,
            high-conviction portfolios.
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center border border-white/5">
                <Cpu className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="font-bold text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]">
                  Tensor-weighted Scoring
                </h4>
                <p className="text-sm text-muted-foreground">
                  Advanced normalization of CAGR, volatility & alpha.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center border border-white/5">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-gradient drop-shadow-[0_0_8px_#22d3ee]">
                  Behavioral Alignment
                </h4>
                <p className="text-sm text-muted-foreground">
                  Portfolio constraints driven by your actual risk tolerance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-20 text-sm text-muted-foreground/60 font-medium">
          © {new Date().getFullYear()} Stoxify Capital. Institutional grade
          tooling.
        </div>
      </div>

      {/* Right Panel: Auth CTA */}
      <div className="w-full md:w-[45%] flex items-center justify-center p-8 md:p-16 relative bg-secondary/10">
        <div className="w-full max-w-md space-y-8 relative z-10 glass-card p-10 rounded-3xl">
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold text-white mb-3">
              Initialize Session
            </h2>
            <p className="text-muted-foreground">
              Secure connection via Replit Identity to access your investment
              profiles.
            </p>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full h-14 text-lg rounded-xl bg-white hover:bg-white/90 text-black font-semibold flex items-center justify-center group"
          >
            Authenticate{" "}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <div className="text-center mt-6">
            <p className="text-xs text-muted-foreground">
              By authenticating, you agree to our Terms of Service and Risk
              Disclosures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
