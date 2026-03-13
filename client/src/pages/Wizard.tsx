import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { BehavioralStep } from "@/components/wizard/BehavioralStep";
import { PreferencesStep } from "@/components/wizard/PreferencesStep";
import { RecommendationStep } from "@/components/wizard/RecommendationStep";

export default function Wizard() {
  const [step, setStep] = useState(1);
  const [profileId, setProfileId] = useState<number | null>(null);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <BehavioralStep onNext={(id) => { setProfileId(id); setStep(2); }} />;
      case 2:
        return profileId && <PreferencesStep profileId={profileId} onNext={() => setStep(3)} />;
      case 3:
        return profileId && <RecommendationStep profileId={profileId} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Background ambient light */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        {/* Progress Bar */}
        <div className="max-w-sm mx-auto mb-12">
          <div className="flex justify-between mb-2 px-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>Behavioral</span>
            <span className={`text-xs font-bold uppercase tracking-wider ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>Structural</span>
            <span className={`text-xs font-bold uppercase tracking-wider ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>Engine</span>
          </div>
          <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden flex">
            <div className={`h-full bg-primary transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
          </div>
        </div>

        {renderStep()}
      </main>
    </div>
  );
}
