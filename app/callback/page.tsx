"use client";

import { useState } from "react";
import { AuthProvider } from "../contexts/AuthContext";
import CallbackHandler from "../components/CallbackHandler";
import LoginComponent from "../components/LoginComponent";
import ProjectSelectionComponent from "../components/ProjectSelectionComponent";
import PlanSelectionComponent from "../components/PlanSelectionComponent";
import InstanceCreationForm from "../components/InstanceCreationForm";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import MainImageLayout from "../components/NonDashboardComponents/Layout/MainImageLayout";
import FalkorLogo from "../../public/assets/images/falkor_logo.png";

export default function Page() {
  const [step, setStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState<string>(""); // Passado diretamente
  const [subscriptionId, setSubscriptionId] = useState<string>("");

  const goToNextStep = () => setStep((prev) => prev + 1);
  const goToPreviousStep = () => setStep((prev) => prev - 1);

  const goToInstanceCreation = (subscriptionId: string) => {
    setSubscriptionId(subscriptionId);
    setStep(4);
  };

  const handleFinish = () => {
    const nextUrl = new URLSearchParams(window.location.search).get("next") || "/dashboard";
    window.location.href = nextUrl;
  };

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <CallbackHandler />
        {step === 1 && (
          <MainImageLayout
            pageTitle="Login"
            orgName="FalkorDB"
            orgLogoURL={FalkorLogo.src}
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
            onNext={goToInstanceCreation}
            onBack={goToPreviousStep}
            onFinish={handleFinish}
            selectedProject={selectedProject} // Propaga o projeto selecionado
            setSubscriptionId={setSubscriptionId}
          />
        )}
        {step === 4 && (
          <InstanceCreationForm
            subscriptionId={subscriptionId}
            selectedProject={selectedProject} // Propaga o projeto selecionado
            onCancel={goToPreviousStep}
            onSuccess={(user, password) => {
              console.log("Instância criada com sucesso!", { user, password });
              handleFinish();
            }}
          />
        )}
      </AuthProvider>
    </ThemeProvider>
  );
}
