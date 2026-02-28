"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Truck, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepCompany } from "@/components/onboarding/step-company";
import { StepVehicle } from "@/components/onboarding/step-vehicle";
import { StepDriver } from "@/components/onboarding/step-driver";

const STEPS = [
  { id: 1, label: "Azienda" },
  { id: 2, label: "Mezzo" },
  { id: 3, label: "Autista" },
];

export default function OnboardingPage() {
  const { update } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [skipping, setSkipping] = useState(false);

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length));

  const complete = async () => {
    try {
      const res = await fetch("/api/onboarding/complete", { method: "POST" });
      const result = await res.json().catch(() => ({}));
      await update({
        onboardingCompleted: true,
        ...(result.companyId ? { companyId: result.companyId } : {}),
      });
    } catch {
      // ignora — il middleware gestirà lo stato
    }
    router.push("/");
    router.refresh();
  };

  const handleSkipAll = async () => {
    setSkipping(true);
    try {
      const res = await fetch("/api/onboarding/skip", { method: "POST" });
      const result = await res.json().catch(() => ({}));
      await update({
        onboardingCompleted: true,
        ...(result.companyId ? { companyId: result.companyId } : {}),
      });
    } catch {
      // ignora
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/20 border border-primary/30">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold">FleetMind</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Configurazione Iniziale
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkipAll}
            disabled={skipping}
            className="text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="h-3.5 w-3.5 mr-1.5" />
            {skipping ? "Salto..." : "Salta tutto"}
          </Button>
          <span className="text-sm text-muted-foreground">
            Step {currentStep} di {STEPS.length}
          </span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="px-6 pt-4">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          {STEPS.map((step) => (
            <div key={step.id} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`h-1.5 w-full rounded-full transition-colors ${
                  step.id <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
              <span
                className={`text-[10px] ${
                  step.id === currentStep
                    ? "text-primary font-medium"
                    : step.id < currentStep
                    ? "text-muted-foreground"
                    : "text-muted-foreground/50"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {currentStep === 1 && (
            <StepCompany
              onComplete={() => goNext()}
              onSkip={goNext}
            />
          )}
          {currentStep === 2 && (
            <StepVehicle
              onComplete={() => goNext()}
              onSkip={goNext}
            />
          )}
          {currentStep === 3 && (
            <StepDriver
              onComplete={complete}
              onSkip={complete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
