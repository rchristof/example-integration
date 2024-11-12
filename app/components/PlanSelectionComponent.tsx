// app/components/PlanSelectionComponent.tsx

"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { saveTokenToEnv } from "../actions/save-token-to-env";

interface PlanSelectionComponentProps {
  onBack: () => void;
  selectedProject: string;
}

export default function PlanSelectionComponent({ onBack, selectedProject }: PlanSelectionComponentProps) {
  const { jwtToken, accessToken, teamId } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || null;

  const handleSubscribe = async (plan: string) => {
    try {
      if (!jwtToken || !accessToken || !teamId) {
        throw new Error("Tokens de autenticação ausentes.");
      }

      if (plan === "Basic") {
        // Substitua pelas suas chamadas de API reais e lógica
        const subscriptionResponse = await fetch("https://api.omnistrate.cloud/2022-09-01-00/subscription", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "serviceId": "s-KgFDwg5vBS",
            "productTierId": "pt-YhJSEGRCYv"
          }),
        });

        const subscriptionData = await subscriptionResponse.json();

        if (!subscriptionResponse.ok) {
          throw new Error(subscriptionData.message || "Falha na assinatura.");
        }

        // Suponha que instanceDetails seja obtido após a assinatura
        const instanceDetails = { /* ... */ };

        await saveTokenToEnv(accessToken, JSON.stringify(instanceDetails), selectedProject, teamId);

        console.log("Assinatura bem-sucedida e detalhes da instância salvos.");
      }

      if (next) {
        router.push(next);
      } else {
        console.error("URL Next não fornecida");
      }
    } catch (error) {
      console.error("Erro ao processar a assinatura:", error);
      setErrorMessage("Erro ao processar a assinatura.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center mb-6">Escolha um Plano</h2>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold">Plano Básico</h2>
          <p className="mt-2">Descrição do plano básico.</p>
          <button
            className="bg-black text-white px-4 py-2 rounded mt-4"
            onClick={() => handleSubscribe("Basic")}
          >
            Assinar
          </button>
        </div>
        {/* Outros planos podem ser adicionados aqui */}
      </div>
      <button className="text-gray-500 mt-2" onClick={onBack}>
        Voltar
      </button>
    </div>
  );
}
