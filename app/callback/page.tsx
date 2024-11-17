// app/callback/page.tsx

"use client";

import { useState } from "react";
import { AuthProvider } from "../contexts/AuthContext";
import CallbackHandler from "../components/CallbackHandler";
import LoginComponent from "../components/LoginComponent";
import ProjectSelectionComponent from "../components/ProjectSelectionComponent";
import PlanSelectionComponent from "../components/PlanSelectionComponent";

export default function Page() {
  const [step, setStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState<string>("");

  const goToNextStep = () => setStep((prev) => prev + 1);
  const goToPreviousStep = () => setStep((prev) => prev - 1);

  return (
    <AuthProvider>
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
        <style jsx global>{`
          html,
          body {
            margin: 0;
            padding: 0;
            border: 0;
            overflow: hidden;
          }
        `}</style>
        <div
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
          style={{ minHeight: "550px", width: "450px" }}
        >
          <img src="/falkor_logo.png" alt="Falkor Logo" width={96} height={96} className="mx-auto mb-6" />

          <CallbackHandler />

          {step === 1 && <LoginComponent onNext={goToNextStep} />}
          {step === 2 && (
            <ProjectSelectionComponent
              onNext={goToNextStep}
              onBack={goToPreviousStep}
              setSelectedProject={setSelectedProject}
            />
          )}
          {step === 3 && (
            <PlanSelectionComponent onBack={goToPreviousStep} selectedProject={selectedProject} />
          )}
        </div>
      </div>
    </AuthProvider>
  );
}
