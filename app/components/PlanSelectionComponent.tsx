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
  const [existingInstanceIds, setExistingInstanceIds] = useState<string[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || null;

  // Fetch user's subscriptions and related instances on component mount
  useEffect(() => {
    const fetchSubscriptionsAndInstances = async () => {
      try {
        if (!jwtToken) {
          throw new Error("Token de autenticação ausente.");
        }

        // 1. Buscar assinaturas do usuário
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

        // 2. Verificar se o usuário possui o plano básico
        let basicSubscription = null;

        if (data.subscriptions && Array.isArray(data.subscriptions)) {
          basicSubscription = data.subscriptions.find(
            (sub: any) => sub.productTierId === "pt-YhJSEGRCYv" && sub.status === "ACTIVE"
          );
        } else if (data.ids && Array.isArray(data.ids)) {
          if (data.ids.length > 0) {
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

            // Procurar o plano básico nas assinaturas detalhadas
            basicSubscription = subscriptions.find(
              (sub: any) => sub.productTierId === "pt-YhJSEGRCYv" && sub.status === "ACTIVE"
            );
          }
        }

        if (basicSubscription) {
          setHasBasicPlan(true);
          setBasicSubscriptionId(basicSubscription.id);

          // 3. Buscar instâncias relacionadas a essa assinatura
          const fetchInstances = async () => {
            try {
              const instancesResponse = await fetch(
                `https://api.omnistrate.cloud/2022-09-01-00/resource-instance/sp-JvkxkPhinN/falkordb/v1/dev/falkordb-free-customer-hosted/falkordb-free-falkordb-customer-hosted-model-omnistrate-multi-tenancy/free?subscriptionId=${basicSubscription.id}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              // Verifique se o Content-Type é JSON antes de parsear
              const contentType = instancesResponse.headers.get("Content-Type");
              let instancesData;
              if (contentType && contentType.includes("application/json")) {
                instancesData = await instancesResponse.json();
              } else {
                // Se não for JSON, ler como texto para debug
                const text = await instancesResponse.text();
                throw new Error(`Resposta inesperada da API: ${text}`);
              }

              if (!instancesResponse.ok) {
                throw new Error(instancesData.message || "Erro ao obter instâncias.");
              }

              console.log("Instâncias Existentes:", instancesData);

              if (instancesData.ids && Array.isArray(instancesData.ids) && instancesData.ids.length > 0) {
                setExistingInstanceIds(instancesData.ids);
              } else {
                setExistingInstanceIds([]);
              }
            } catch (error: any) {
              console.error("Erro ao obter instâncias existentes:", error);
              setErrorMessage(error.message || "Erro ao obter instâncias existentes.");
            }
          };

          await fetchInstances();
        } else {
          setHasBasicPlan(false);
        }
      } catch (error: any) {
        console.error("Erro ao obter assinaturas:", error);
        setErrorMessage(error.message || "Erro ao obter assinaturas.");
      }
    };

    fetchSubscriptionsAndInstances();
  }, [jwtToken]);

  const handleSubscribe = async () => {
    try {
      if (!jwtToken || !accessToken || !teamId) {
        throw new Error("Tokens de autenticação ausentes.");
      }

      setIsLoading(true);
      setErrorMessage(null);

      // 1. Criar uma nova assinatura
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

      // Remover quaisquer aspas extras do subscriptionId
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

      // 2. Buscar instâncias relacionadas a essa nova assinatura
      const fetchInstances = async () => {
        try {
          const instancesResponse = await fetch(
            `https://api.omnistrate.cloud/2022-09-01-00/resource-instance/sp-JvkxkPhinN/falkordb/v1/dev/falkordb-free-customer-hosted/falkordb-free-falkordb-customer-hosted-model-omnistrate-multi-tenancy/free?subscriptionId=${subscriptionId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          // Verifique se o Content-Type é JSON antes de parsear
          const contentType = instancesResponse.headers.get("Content-Type");
          let instancesData;
          if (contentType && contentType.includes("application/json")) {
            instancesData = await instancesResponse.json();
          } else {
            // Se não for JSON, ler como texto para debug
            const text = await instancesResponse.text();
            throw new Error(`Resposta inesperada da API: ${text}`);
          }

          if (!instancesResponse.ok) {
            throw new Error(instancesData.message || "Erro ao obter instâncias.");
          }

          console.log("Instâncias Existentes:", instancesData);

          if (instancesData.ids && Array.isArray(instancesData.ids) && instancesData.ids.length > 0) {
            setExistingInstanceIds(instancesData.ids);
          } else {
            setExistingInstanceIds([]);
          }
        } catch (error: any) {
          console.error("Erro ao obter instâncias existentes:", error);
          setErrorMessage(error.message || "Erro ao obter instâncias existentes.");
        }
      };

      await fetchInstances();
      // 3. Exibir o formulário para criação de uma nova instância
      setShowInstanceForm(true);
    } catch (error: any) {
      console.error("Erro ao processar a assinatura:", error);
      setErrorMessage(error.message || "Erro ao processar a assinatura.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectInstance = async () => {
    try {
      if (!selectedInstanceId) {
        setErrorMessage("Por favor, selecione uma instância.");
        return;
      }

      if (!accessToken || !teamId) {
        throw new Error("Tokens de autenticação ausentes.");
      }

      setIsLoading(true);
      setErrorMessage(null);

      // Salvar o ID da instância selecionada
      await saveTokenToEnv(accessToken, selectedInstanceId, selectedProject, teamId);

      console.log("ID da instância selecionada salvo com sucesso.");

      setSuccessMessage("Instância selecionada salva com sucesso!");

      // Redirecionar o usuário se a URL 'next' estiver disponível
      if (next) {
        router.push(next);
      } else {
        console.error("URL Next não fornecida");
      }
    } catch (error: any) {
      console.error("Erro ao selecionar a instância:", error);
      setErrorMessage(error.message || "Erro ao selecionar a instância.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewInstance = () => {
    setShowInstanceForm(true);
  };

  const handleSuccess = () => {
    setSuccessMessage("Instância implantada com sucesso!");
    setShowInstanceForm(false);
    setSelectedInstanceId(null);
    
    // Recarregar a lista de instâncias após a criação
    const fetchInstances = async () => {
      try {
        if (!basicSubscriptionId) return;

        const instancesResponse = await fetch(
          `https://api.omnistrate.cloud/2022-09-01-00/resource-instance/sp-JvkxkPhinN/falkordb/v1/dev/falkordb-free-customer-hosted/falkordb-free-falkordb-customer-hosted-model-omnistrate-multi-tenancy/free?subscriptionId=${basicSubscriptionId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const contentType = instancesResponse.headers.get("Content-Type");
        let instancesData;
        if (contentType && contentType.includes("application/json")) {
          instancesData = await instancesResponse.json();
        } else {
          const text = await instancesResponse.text();
          throw new Error(`Resposta inesperada da API: ${text}`);
        }

        if (!instancesResponse.ok) {
          throw new Error(instancesData.message || "Erro ao obter instâncias.");
        }

        console.log("Instâncias Existentes:", instancesData);

        if (instancesData.ids && Array.isArray(instancesData.ids) && instancesData.ids.length > 0) {
          setExistingInstanceIds(instancesData.ids);
        } else {
          setExistingInstanceIds([]);
        }
      } catch (error: any) {
        console.error("Erro ao obter instâncias existentes:", error);
        setErrorMessage(error.message || "Erro ao obter instâncias existentes.");
      }
    };

    fetchInstances();
  };

  const handleCancel = () => {
    // Resetar estados
    setShowInstanceForm(false);
    setSelectedInstanceId(null);
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
      setExistingInstanceIds([]);
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
          ) : hasBasicPlan ? (
            existingInstanceIds.length > 0 ? (
              // Se há instâncias existentes, listar e permitir seleção
              <div className="mt-4 space-y-4">
                <p>Selecione uma instância existente:</p>
                <div className="space-y-2">
                  {existingInstanceIds.map((id) => (
                    <div key={id} className="flex items-center">
                      <input
                        type="radio"
                        id={id}
                        name="existingInstance"
                        value={id}
                        checked={selectedInstanceId === id}
                        onChange={(e) => setSelectedInstanceId(e.target.value)}
                        className="mr-2"
                      />
                      <label htmlFor={id} className="cursor-pointer">
                        {id}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedInstanceId && (
                  <div>
                    <button
                      className="bg-black text-white px-4 py-2 rounded mt-4"
                      onClick={handleSelectInstance}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processando..." : "Usar Instância Selecionada"}
                    </button>
                  </div>
                )}
                <div>
                  <button
                    className="bg-black text-white px-4 py-2 rounded mt-4"
                    onClick={handleCreateNewInstance}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processando..." : "Criar Nova Instância"}
                  </button>
                </div>
              </div>
            ) : (
              // Se não há instâncias existentes, mostrar a opção de criar uma
              <div className="mt-4 space-y-4">
                <p>Você não possui instâncias existentes.</p>
                <button
                  className="bg-black text-white px-4 py-2 rounded mt-4"
                  onClick={handleCreateNewInstance}
                  disabled={isLoading}
                >
                  {isLoading ? "Processando..." : "Criar Instância"}
                </button>
              </div>
            )
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
