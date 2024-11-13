// app/components/PlanSelectionComponent.tsx

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { saveTokenToEnv } from "../actions/save-token-to-env";
import InstanceCreationForm from "./InstanceCreationForm";

interface PlanSelectionComponentProps {
  onBack: () => void;
  selectedProject: string;
}

export default function PlanSelectionComponent({ onBack, selectedProject }: PlanSelectionComponentProps) {
  const { jwtToken, accessToken, teamId } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasBasicPlan, setHasBasicPlan] = useState<boolean>(false);
  const [basicSubscriptionId, setBasicSubscriptionId] = useState<string | null>(null);
  const [showInstanceForm, setShowInstanceForm] = useState<boolean>(false);
  const [hasFreeInstance, setHasFreeInstance] = useState<boolean>(false);
  const [existingInstanceId, setExistingInstanceId] = useState<string | null>(null);
  const [showInstanceOptions, setShowInstanceOptions] = useState<boolean>(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || null;

  // Fetch user's subscriptions on component mount
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        if (!jwtToken) {
          throw new Error("Token de autenticação ausente.");
        }

        const response = await fetch("https://api.omnistrate.cloud/2022-09-01-00/subscription", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Erro ao obter assinaturas.");
        }

        console.log("Assinaturas do Usuário:", data);

        // Verificar se o usuário possui o plano básico
        if (data.subscriptions && Array.isArray(data.subscriptions)) {
          const basicSubscription = data.subscriptions.find(
            (sub: any) => sub.productTierId === "pt-YhJSEGRCYv" && sub.status === "ACTIVE"
          );

          if (basicSubscription) {
            setHasBasicPlan(true);
            setBasicSubscriptionId(basicSubscription.id);
          } else {
            setHasBasicPlan(false);
          }
        } else if (data.ids && Array.isArray(data.ids)) {
          // Se a resposta contém ids, precisamos buscar os detalhes das assinaturas
          if (data.ids.length === 0) {
            setHasBasicPlan(false);
          } else {
            // Buscar detalhes de cada assinatura
            const subscriptionsPromises = data.ids.map(async (id: string) => {
              const subResponse = await fetch(`https://api.omnistrate.cloud/2022-09-01-00/subscription/${id}`, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${jwtToken}`,
                  "Content-Type": "application/json",
                },
              });
              if (!subResponse.ok) {
                const subData = await subResponse.json();
                throw new Error(subData.message || "Erro ao obter detalhes da assinatura.");
              }
              return subResponse.json();
            });

            const subscriptions = await Promise.all(subscriptionsPromises);

            // Agora, procurar o plano básico nas assinaturas detalhadas
            const basicSubscription = subscriptions.find(
              (sub: any) => sub.productTierId === "pt-YhJSEGRCYv" && sub.status === "ACTIVE"
            );

            if (basicSubscription) {
              setHasBasicPlan(true);
              setBasicSubscriptionId(basicSubscription.id);
            } else {
              setHasBasicPlan(false);
            }
          }
        } else {
          // Formato de resposta inesperado
          throw new Error("Formato de resposta da API de assinaturas inválido.");
        }
      } catch (error: any) {
        console.error("Erro ao obter assinaturas:", error);
        setErrorMessage(error.message || "Erro ao obter assinaturas.");
      }
    };

    fetchSubscriptions();
  }, [jwtToken]);

  const handleSubscribe = async () => {
    try {
      if (!jwtToken || !accessToken || !teamId) {
        throw new Error("Tokens de autenticação ausentes.");
      }

      setIsLoading(true);
      setErrorMessage(null);

      // Create a new subscription
      const subscriptionResponse = await fetch("https://api.omnistrate.cloud/2022-09-01-00/subscription", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: "s-KgFDwg5vBS",
          productTierId: "pt-YhJSEGRCYv",
        }),
      });

      const subscriptionDataRaw = await subscriptionResponse.text();
      console.log("Dados da Assinatura (raw):", subscriptionDataRaw);

      if (!subscriptionResponse.ok) {
        console.error("Erro na resposta da API de assinatura:", subscriptionDataRaw);
        throw new Error(subscriptionDataRaw || "Falha na assinatura.");
      }

      // Remove any extra quotes from the subscriptionId
      let subscriptionId;
      try {
        subscriptionId = JSON.parse(subscriptionDataRaw);
      } catch (e) {
        subscriptionId = subscriptionDataRaw.replace(/^"|"$/g, "");
      }

      if (!subscriptionId) {
        throw new Error("subscriptionId não encontrado na resposta da API.");
      }

      console.log("Subscription ID:", subscriptionId);
      setBasicSubscriptionId(subscriptionId);
      setHasBasicPlan(true);
      // Proceed to instance creation form
      setShowInstanceForm(true);
    } catch (error: any) {
      console.error("Erro ao processar a assinatura:", error);
      setErrorMessage(error.message || "Erro ao processar a assinatura.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    try {
      if (!jwtToken || !basicSubscriptionId) {
        throw new Error("Tokens de autenticação ou ID de assinatura ausentes.");
      }

      setIsLoading(true);
      setErrorMessage(null);

      // Check if the user already has a free instance
      const response = await fetch(
        `https://api.omnistrate.cloud/2022-09-01-00/resource-instance/` +
          `sp-JvkxkPhinN/falkordb/v1/dev/falkordb-free-customer-hosted/` +
          `falkordb-free-falkordb-customer-hosted-model-omnistrate-multi-tenancy/` +
          `free?subscriptionId=${basicSubscriptionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Erro ao verificar instâncias existentes:", data);
        throw new Error(data.message || "Erro ao verificar instâncias existentes.");
      }

      console.log("Instâncias Gratuitas Existentes:", data);

      // Check if there is any existing instance
      if (data.ids && data.ids.length > 0) {
        const instanceId = data.ids[0]; // Assumindo que só há uma instância gratuita
        setHasFreeInstance(true);
        setExistingInstanceId(instanceId);
        setShowInstanceOptions(true);
      } else {
        // Nenhuma instância existente, mostrar o formulário de criação de instância
        setShowInstanceForm(true);
      }
    } catch (error: any) {
      console.error("Erro ao verificar instâncias existentes:", error);
      setErrorMessage(error.message || "Erro ao verificar instâncias existentes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseExistingInstance = async () => {
    try {
      if (!jwtToken || !basicSubscriptionId || !existingInstanceId || !accessToken || !teamId) {
        throw new Error("Tokens de autenticação ou IDs ausentes.");
      }

      setIsLoading(true);
      setErrorMessage(null);

      // Obter detalhes da instância existente
      const instanceDetailsResponse = await fetch(
        `https://api.omnistrate.cloud/2022-09-01-00/resource-instance/` +
          `sp-JvkxkPhinN/falkordb/v1/dev/falkordb-free-customer-hosted/` +
          `falkordb-free-falkordb-customer-hosted-model-omnistrate-multi-tenancy/` +
          `free/instance/${existingInstanceId}?subscriptionId=${basicSubscriptionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const instanceDetails = await instanceDetailsResponse.json();

      if (!instanceDetailsResponse.ok) {
        console.error("Erro ao obter detalhes da instância:", instanceDetails);
        throw new Error(instanceDetails.message || "Falha ao obter detalhes da instância.");
      }

      // Imprimir os detalhes da instância no console
      console.log("Detalhes da instância existente:", instanceDetails);

      // Salvar os detalhes da instância nas variáveis de ambiente do projeto Vercel
      await saveTokenToEnv(accessToken, JSON.stringify(instanceDetails), selectedProject, teamId);

      console.log("Detalhes da instância salvos com sucesso.");

      setSuccessMessage("Detalhes da instância existentes salvos com sucesso!");

      // Redirecionar o usuário se a URL 'next' estiver disponível
      if (next) {
        router.push(next);
      } else {
        console.error("URL Next não fornecida");
      }
    } catch (error: any) {
      console.error("Erro ao usar instância existente:", error);
      setErrorMessage(error.message || "Erro ao usar instância existente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExistingInstance = async () => {
    try {
      if (!jwtToken || !basicSubscriptionId || !existingInstanceId) {
        throw new Error("Tokens de autenticação ou IDs ausentes.");
      }

      setIsLoading(true);
      setErrorMessage(null);

      // Apagar a instância existente
      const response = await fetch(
        `https://api.omnistrate.cloud/2022-09-01-00/resource-instance/` +
          `sp-JvkxkPhinN/falkordb/v1/prod/falkordb-free-customer-hosted/` +
          `falkordb-free-falkordb-customer-hosted-model-omnistrate-multi-tenancy/` +
          `free/instance/${existingInstanceId}?subscriptionId=${basicSubscriptionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.text();

      if (!response.ok) {
        console.error("Erro ao deletar a instância:", data);
        throw new Error(data || "Erro ao deletar a instância.");
      }

      console.log("Instância deletada com sucesso:", data);

      // Resetar o estado
      setHasFreeInstance(false);
      setExistingInstanceId(null);
      setShowInstanceOptions(false);

      // Mostrar o formulário de criação de instância
      setShowInstanceForm(true);
    } catch (error: any) {
      console.error("Erro ao deletar a instância:", error);
      setErrorMessage(error.message || "Erro ao deletar a instância.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    setSuccessMessage("Instância implantada com sucesso!");
    setShowInstanceForm(false);
    setShowInstanceOptions(false);
  };

  const handleCancel = () => {
    // Resetar estados
    setShowInstanceForm(false);
    setShowInstanceOptions(false);
  };

  const handleCancelSubscription = async () => {
    try {
      if (!jwtToken || !basicSubscriptionId) {
        throw new Error("Tokens de autenticação ou ID de assinatura ausentes.");
      }

      setIsLoading(true);
      setErrorMessage(null);

      const response = await fetch(
        `https://api.omnistrate.cloud/2022-09-01-00/subscription/${basicSubscriptionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.text();
      console.log("Resposta do Cancelamento:", data);

      if (!response.ok) {
        throw new Error(data || "Erro ao cancelar a assinatura.");
      }

      setHasBasicPlan(false);
      setBasicSubscriptionId(null);
      setSuccessMessage("Assinatura cancelada com sucesso.");
    } catch (error: any) {
      console.error("Erro ao cancelar a assinatura:", error);
      setErrorMessage(error.message || "Erro ao cancelar a assinatura.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center mb-6">Planos</h2>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold">Plano Básico</h2>
          <p className="mt-2">Descrição do plano básico.</p>

          {showInstanceForm ? (
            // Exibir o formulário de criação de instância
            basicSubscriptionId && accessToken && teamId && jwtToken ? (
              <InstanceCreationForm
                subscriptionId={basicSubscriptionId}
                accessToken={accessToken}
                selectedProject={selectedProject}
                teamId={teamId}
                jwtToken={jwtToken}
                onSuccess={handleSuccess}
                onCancel={handleCancel}
              />
            ) : (
              <p>Informações de autenticação ausentes.</p>
            )
          ) : showInstanceOptions ? (
            // Exibir as opções para instância existente
            <div className="mt-4 space-y-4">
              <p>Você já possui uma instância gratuita ativa.</p>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleDeleteExistingInstance}
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : "Apagar Instância e Criar Nova"}
              </button>
              <button
                className="bg-black text-white px-4 py-2 rounded"
                onClick={handleUseExistingInstance}
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : "Continuar com Instância Existente"}
              </button>
              <button className="text-gray-500 mt-2" onClick={handleCancel}>
                Cancelar
              </button>
            </div>
          ) : hasBasicPlan ? (
            // Se o usuário já tem o plano básico
            <div className="mt-4 space-y-4">
              <p>Você já possui uma assinatura ativa do Plano Básico.</p>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleCancelSubscription}
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : "Cancelar Assinatura"}
              </button>
              <button
                className="bg-black text-white px-4 py-2 rounded"
                onClick={handleContinue}
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : "Continuar para Criar Instância"}
              </button>
            </div>
          ) : (
            // Se o usuário não tem o plano básico
            <div className="mt-4 space-y-4">
              <button
                className="bg-black text-white px-4 py-2 rounded"
                onClick={handleSubscribe}
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : "Assinar Plano Básico"}
              </button>
            </div>
          )}
        </div>
      </div>
      <button className="text-gray-500 mt-2" onClick={onBack}>
        Voltar
      </button>
    </div>
  );
}
