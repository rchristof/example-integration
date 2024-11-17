// app/callback/page.tsx

"use client";

import { useState } from "react";
import { AuthProvider } from "../contexts/AuthContext";
import CallbackHandler from "../components/CallbackHandler";
import LoginComponent from "../components/LoginComponent";
import ProjectSelectionComponent from "../components/ProjectSelectionComponent";
import PlanSelectionComponent from "../components/PlanSelectionComponent";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import MainImageLayout from "../components/NonDashboardComponents/Layout/MainImageLayout";
import FalkorLogo from "../../public/assets/images/falkor_logo.png";
// import { useRouter } from "next/router";

export default function Page() {
  const [step, setStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState<string>("");

    const goToNextStep = () => setStep((prev) => prev + 1);
    const goToPreviousStep = () => setStep((prev) => prev - 1);

  // const router = useRouter();

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <CallbackHandler />
        {step === 1 && (
          <MainImageLayout
            pageTitle="Login"
            orgName="FalkorDB"
            orgLogoURL={FalkorLogo.src} // Substitua pelo caminho real do logotipo
          >
            <LoginComponent onNext={goToNextStep} />
          </MainImageLayout>
        )}
        {step === 2 && (
          <ProjectSelectionComponent
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            setSelectedProject={setSelectedProject}
          />
        )}
        {step === 3 && (
          <PlanSelectionComponent
            onBack={goToPreviousStep}
            selectedProject={selectedProject}
          />
        )}
      </AuthProvider>
    </ThemeProvider>
  );
}
