"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import InstanceCreationForm from "./InstanceCreationForm";

interface PlanSelectionComponentProps {
  onBack: () => void;
}

export default function PlanSelectionComponent({ onBack }: PlanSelectionComponentProps) {
  const { selectedProject, subscriptionId, setSubscriptionId } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasBasicPlan, setHasBasicPlan] = useState<boolean>(!!subscriptionId);
  const [existingInstanceIds, setExistingInstanceIds] = useState<string[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [instancePassword, setInstancePassword] = useState<string>("");
  const [showInstanceForm, setShowInstanceForm] = useState<boolean>(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || null;

  useEffect(() => {
    const fetchSubscriptionsAndInstances = async () => {
      try {
        setIsLoading(true);

        const response = await fetch("/api/subscriptions", {
          method: "GET",
          credentials: "include", // Inclui automaticamente o cookie de sessão
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Erro ao obter assinaturas.");
        }

        const basicSubscription = data.subscriptions?.find(
          (sub: any) => sub.productTierId === "pt-YhJSEGRCYv" && sub.status === "ACTIVE"
        );

        if (basicSubscription) {
          setHasBasicPlan(true);
          setSubscriptionId(basicSubscription.id);

          const instancesResponse = await fetch(
            `/api/instances?subscriptionId=${basicSubscription.id}`,
            {
              method: "GET",
              credentials: "include", // Inclui automaticamente o cookie de sessão
            }
          );

          const instancesData = await instancesResponse.json();

          if (!instancesResponse.ok) {
            throw new Error(instancesData.message || "Erro ao obter instâncias.");
          }

          setExistingInstanceIds(instancesData.ids || []);
        } else {
          setHasBasicPlan(false);
        }
      } catch (error: any) {
        setErrorMessage(error.message || "Erro ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionsAndInstances();
  }, [setSubscriptionId]);

  const handleCreateSubscription = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      if (!selectedProject) {
        throw new Error("Projeto selecionado não encontrado.");
      }

      const response = await fetch("/api/subscriptions", {
        method: "POST",
        credentials: "include", // Inclui automaticamente o cookie de sessão
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productTierId: "pt-YhJSEGRCYv",
          projectId: selectedProject,
          serviceId: "s-KgFDwg5vBS",
        }),
      });

      const data = await response.text();

      if (!response.ok) {
        throw new Error("Erro ao criar assinatura.");
      }

      setSubscriptionId(data);
      setHasBasicPlan(true);

      const instancesResponse = await fetch(`/api/instances?subscriptionId=${data}`, {
        method: "GET",
        credentials: "include", // Inclui automaticamente o cookie de sessão
      });

      const instancesData = await instancesResponse.json();

      if (!instancesResponse.ok) {
        throw new Error(instancesData.message || "Erro ao obter instâncias da nova assinatura.");
      }

      setExistingInstanceIds(instancesData.ids || []);
    } catch (error: any) {
      setErrorMessage(error.message || "Erro ao criar assinatura.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectInstance = async () => {
    if (!selectedInstanceId || !instancePassword) {
      setErrorMessage("Por favor, selecione uma instância e insira a senha.");
      return;
    }

    try {
      setIsLoading(true);

      const instanceDetailsResponse = await fetch(
        `/api/instances?subscriptionId=${subscriptionId}&instanceId=${selectedInstanceId}`,
        {
          method: "GET",
          credentials: "include", // Inclui automaticamente o cookie de sessão
        }
      );

      const instanceDetails = await instanceDetailsResponse.json();

      if (!instanceDetailsResponse.ok) {
        throw new Error(instanceDetails.message || "Erro ao obter detalhes da instância.");
      }

      const user = instanceDetails.createdByUserName;

      if (!user) {
        throw new Error("Usuário não encontrado nos detalhes da instância.");
      }

      await handleSaveInstanceCredentials(user, instancePassword);
    } catch (error: any) {
      setErrorMessage(error.message || "Erro ao selecionar a instância.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveInstanceCredentials = async (user: string, password: string) => {
    try {
      if (!selectedProject) {
        throw new Error("Projeto selecionado não encontrado.");
      }

      const saveResponse = await fetch("/api/save-token-to-env", {
        method: "POST",
        credentials: "include", // Inclui automaticamente o cookie de sessão
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variables: [
            { key: "FALKORDB_USER", value: user },
            { key: "FALKORDB_PASSWORD", value: password },
          ],
          projectId: selectedProject,
        }),
      });

      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(saveData.message || "Erro ao salvar as variáveis de ambiente.");
      }

      setSuccessMessage("Instância criada e configurada com sucesso!");
      if (next) {
        router.push(next);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Erro ao salvar as credenciais.");
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
          {existingInstanceIds.length > 0 && (
            <>
              <label htmlFor="existingInstances" className="block font-medium">
                Instâncias Existentes
              </label>
              <select
                id="existingInstances"
                className="w-full p-2 border rounded mb-4"
                value={selectedInstanceId || ""}
                onChange={(e) => setSelectedInstanceId(e.target.value)}
              >
                <option value="">Selecione uma instância</option>
                {existingInstanceIds.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </>
          )}
          {showInstanceForm ? (
            <InstanceCreationForm
              subscriptionId={subscriptionId!}
              selectedProject={selectedProject!}
              onSuccess={handleSaveInstanceCredentials}
              onCancel={() => setShowInstanceForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowInstanceForm(true)}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Criar Nova Instância
            </button>
          )}
        </div>
      </div>
      <button onClick={onBack} className="mt-4">
        Voltar
      </button>
    </div>
  );
}
