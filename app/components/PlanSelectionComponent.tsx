"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import InstanceCreationForm from "./InstanceCreationForm";

interface PlanSelectionComponentProps {
  onBack: () => void;
}

export default function PlanSelectionComponent({ onBack }: PlanSelectionComponentProps) {
  const { teamId, selectedProject, subscriptionId, setSubscriptionId } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasBasicPlan, setHasBasicPlan] = useState<boolean>(!!subscriptionId);
  const [existingInstanceIds, setExistingInstanceIds] = useState<string[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [instancePassword, setInstancePassword] = useState<string>("");
  const [showInstanceForm, setShowInstanceForm] = useState<boolean>(false);
  const [falkorDbUser, setFalkorDbUser] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || null;

  useEffect(() => {
    if (!teamId) {
      console.warn("teamId está ausente. Verifique o fluxo de autenticação.");
      setErrorMessage("Erro: O ID da equipe não foi encontrado.");
      return;
    }

    const fetchSubscriptionsAndInstances = async () => {
      try {
        const response = await fetch("/api/subscriptions", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Erro ao obter assinaturas.");
        }

        const basicSubscription = data.subscriptions?.find(
          (sub: any) => sub.productTierId === "pt-YhJSEGRCYv" && sub.status === "ACTIVE"
        );

        if (basicSubscription) {
          console.log("Assinatura básica encontrada:", basicSubscription);
          setHasBasicPlan(true);
          setSubscriptionId(basicSubscription.id);

          const instancesResponse = await fetch(
            `/api/instances?subscriptionId=${basicSubscription.id}`,
            { method: "GET", credentials: "include" }
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
      }
    };

    fetchSubscriptionsAndInstances();
  }, [teamId, setSubscriptionId]);

  const handleCreateSubscription = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      if (!teamId || !selectedProject) {
        throw new Error("Parâmetros obrigatórios ausentes: teamId ou selectedProject.");
      }

      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productTierId: "pt-YhJSEGRCYv",
          projectId: selectedProject,
          teamId,
          serviceId: "s-KgFDwg5vBS",
        }),
        credentials: "include",
      });

      const data = await response.text(); // A resposta é o ID direto como string

      if (!response.ok) {
        throw new Error("Erro ao criar assinatura.");
      }

      console.log("Nova assinatura criada:", data);
      setSubscriptionId(data); // Atualiza o contexto
      setHasBasicPlan(true);

      const instancesResponse = await fetch(`/api/instances?subscriptionId=${data}`, {
        method: "GET",
        credentials: "include",
      });

      const instancesData = await instancesResponse.json();

      if (!instancesResponse.ok) {
        throw new Error(instancesData.message || "Erro ao obter instâncias da nova assinatura.");
      }

      setExistingInstanceIds(instancesData.ids || []);
    } catch (error: any) {
      console.error("Erro ao criar assinatura:", error);
      setErrorMessage(error.message || "Erro ao criar assinatura.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveInstanceCredentials = async (user: string, password: string) => {
    try {
      if (!teamId || !selectedProject) {
        throw new Error("Parâmetros obrigatórios ausentes: teamId ou selectedProject.");
      }

      const saveResponse = await fetch("/api/save-token-to-env", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variables: [
            { key: "FALKORDB_USER", value: user },
            { key: "FALKORDB_PASSWORD", value: password },
          ],
          projectId: selectedProject,
          teamId,
        }),
        credentials: "include",
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
      console.error("Erro ao salvar as credenciais da instância:", error);
      setErrorMessage(error.message || "Erro ao salvar as credenciais.");
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
        { method: "GET", credentials: "include" }
      );

      const instanceDetails = await instanceDetailsResponse.json();

      if (!instanceDetailsResponse.ok) {
        throw new Error(instanceDetails.message || "Erro ao obter detalhes da instância.");
      }

      const user = instanceDetails.createdByUserName; 


      if (!user) {
        throw new Error("Usuário não encontrado nos detalhes da instância.");
      }

      setFalkorDbUser(user);

      await handleSaveInstanceCredentials(user, instancePassword);
    } catch (error: any) {
      console.error("Erro ao selecionar a instância:", error);
      setErrorMessage(error.message || "Erro ao selecionar a instância.");
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
              {selectedInstanceId && (
                <>
                  <input
                    type="password"
                    className="w-full p-2 border rounded mb-4"
                    placeholder="Senha da Instância"
                    value={instancePassword}
                    onChange={(e) => setInstancePassword(e.target.value)}
                  />
                  <button
                    onClick={handleSelectInstance}
                    className="bg-black text-white px-4 py-2 rounded"
                  >
                    Configurar Instância Selecionada
                  </button>
                </>
              )}
            </>
          )}
          {showInstanceForm ? (
            <InstanceCreationForm
              subscriptionId={subscriptionId!}
              selectedProject={selectedProject!}
              teamId={teamId!}
              onSuccess={handleSaveInstanceCredentials}
              onCancel={() => setShowInstanceForm(false)}
            />
          ) : (
            <button onClick={() => setShowInstanceForm(true)} className="mt-4">
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
