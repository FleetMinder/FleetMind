"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Truck, Brain, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepCompany } from "@/components/onboarding/step-company";
import { StepDriver } from "@/components/onboarding/step-driver";
import { StepVehicle } from "@/components/onboarding/step-vehicle";
import { StepApiKey } from "@/components/onboarding/step-apikey";
import { StepSummary } from "@/components/onboarding/step-summary";

const steps = [
  { id: 1, label: "Azienda" },
  { id: 2, label: "Autista" },
  { id: 3, label: "Mezzo" },
  { id: 4, label: "API Key" },
  { id: 5, label: "Riepilogo" },
];

export interface OnboardingData {
  companyCreated: boolean;
  companyName: string;
  driverCreated: boolean;
  driverName: string;
  vehicleCreated: boolean;
  vehiclePlate: string;
  apiKeySet: boolean;
}

export default function OnboardingPage() {
  const { update } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [skipping, setSkipping] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    companyCreated: false,
    companyName: "",
    driverCreated: false,
    driverName: "",
    vehicleCreated: false,
    vehiclePlate: "",
    apiKeySet: false,
  });

  const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 5));
  const handleSkip = () => setCurrentStep((s) => Math.min(s + 1, 5));

  const handleComplete = async () => {
    try {
      const res = await fetch("/api/onboarding/complete", { method: "POST" });
      if (!res.ok) throw new Error();
      const result = await res.json();

      // Aggiorna sessione con companyId (se creato) e onboarding completato
      await update({
        onboardingCompleted: true,
        ...(result.companyId ? { companyId: result.companyId } : {}),
      });

      router.push("/");
      router.refresh();
    } catch {
      router.push("/");
    }
  };

  const handleSkipAll = async () => {
    setSkipping(true);
    try {
      const res = await fetch("/api/onboarding/skip", { method: "POST" });
      if (!res.ok) throw new Error();
      const result = await res.json();

      await update({
        onboardingCompleted: true,
        ...(result.companyId ? { companyId: result.companyId } : {}),
      });

      router.push("/");
      router.refresh();
    } catch {
      router.push("/");
    }
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
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Step {currentStep} di {steps.length}
            </span>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="px-6 pt-4">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex-1 flex flex-col items-center gap-1"
            >
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
              onComplete={(name) => {
                setData((d) => ({
                  ...d,
                  companyCreated: true,
                  companyName: name,
                }));
                handleNext();
              }}
              onSkip={handleSkip}
            />
          )}
          {currentStep === 2 && (
            <StepDriver
              onComplete={(name) => {
                setData((d) => ({
                  ...d,
                  driverCreated: true,
                  driverName: name,
                }));
                handleNext();
              }}
              onSkip={handleSkip}
            />
          )}
          {currentStep === 3 && (
            <StepVehicle
              onComplete={(plate) => {
                setData((d) => ({
                  ...d,
                  vehicleCreated: true,
                  vehiclePlate: plate,
                }));
                handleNext();
              }}
              onSkip={handleSkip}
            />
          )}
          {currentStep === 4 && (
            <StepApiKey
              onComplete={() => {
                setData((d) => ({ ...d, apiKeySet: true }));
                handleNext();
              }}
              onSkip={handleSkip}
            />
          )}
          {currentStep === 5 && (
            <StepSummary data={data} onComplete={handleComplete} />
          )}
        </div>
      </div>
    </div>
  );
}
