// app/components/InstanceCreationForm.tsx

"use client";

import { useState } from "react";
import { saveTokenToEnv } from "../actions/save-token-to-env";
import { useRouter, useSearchParams } from "next/navigation";

interface InstanceCreationFormProps {
  subscriptionId: string;
  accessToken: string;
  selectedProject: string;
  teamId: string;
  jwtToken: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function InstanceCreationForm({
  subscriptionId,
  accessToken,
  selectedProject,
  teamId,
  jwtToken,
  onSuccess,
  onCancel,
}: InstanceCreationFormProps) {
  const [cloudProvider, setCloudProvider] = useState<string>("aws");
  const [region, setRegion] = useState<string>("us-east-1");
  const [instanceName, setInstanceName] = useState<string>("");
  const [falkorDBUser, setFalkorDBUser] = useState<string>("");
  const [falkorDBPassword, setFalkorDBPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || null;

  const handleCreateInstance = async () => {
    try {
      if (!jwtToken || !accessToken || !teamId) {
        throw new Error("Tokens de autenticação ausentes.");
      }

      if (!instanceName || !falkorDBUser || !falkorDBPassword) {
        setErrorMessage("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      //1: Deploy the free instance
      const deployInstanceResponse = await fetch(
        `https://api.omnistrate.cloud/2022-09-01-00/resource-instance/` +
          `sp-JvkxkPhinN/falkordb/v1/dev/falkordb-free-customer-hosted/` +
          `falkordb-free-falkordb-customer-hosted-model-omnistrate-multi-tenancy/` +
          `free?subscriptionId=${subscriptionId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cloud_provider: cloudProvider,
            region: region,
            requestParams: {
              name: instanceName,
              falkordbPassword: falkorDBPassword,
              falkordbUser: falkorDBUser,
            },
          }),
        }
      );

      const deployInstanceDataRaw = await deployInstanceResponse.text();
      console.log("Deploy Instance Data (raw):", deployInstanceDataRaw);

      if (!deployInstanceResponse.ok) {
        console.error("Erro na implantação da instância:", deployInstanceDataRaw);
        throw new Error(deployInstanceDataRaw || "Falha ao implantar a instância gratuita.");
      }

      // Extract instanceId from the response
      let instanceId;
      try {
        const deployInstanceData = JSON.parse(deployInstanceDataRaw);
        instanceId = deployInstanceData.instanceId || deployInstanceData.id;
      } catch (e) {
        instanceId = deployInstanceDataRaw.replace(/^"|"$/g, "");
      }

      if (!instanceId) {
        throw new Error("instanceId não encontrado na resposta da API.");
      }

      console.log("Instance ID:", instanceId);

      //2: Save the instance name and password instead of fetching details
      const instanceDetails = {
        instanceId,
        instanceName,
        falkorDBUser,
        falkorDBPassword,
      };

      console.log("Instance Details to Save:", instanceDetails);

      // Salve os detalhes da instância
      await saveTokenToEnv(accessToken, JSON.stringify(instanceDetails), selectedProject, teamId);

      console.log("Instância implantada e detalhes salvos com sucesso.");

      onSuccess(); // Chamar o callback onSuccess

      // Redirecionar para next, se necessário
      if (next) {
        router.push(next);
      } else {
        console.error("URL Next não fornecida");
      }
    } catch (error: any) {
      console.error("Erro ao criar a instância:", error);
      setErrorMessage(error.message || "Erro ao criar a instância.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <div>
        <label className="block font-medium">Cloud Provider</label>
        <select
          className="w-full p-2 border rounded"
          value={cloudProvider}
          onChange={(e) => setCloudProvider(e.target.value)}
        >
          <option value="aws">AWS</option>
          <option value="google cloud">Google Cloud</option>
        </select>
      </div>
      <div>
        <label className="block font-medium">Região</label>
        <select
          className="w-full p-2 border rounded"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          <option value="ap-south-1">ap-south-1</option>
          <option value="eu-west-1">eu-west-1</option>
          <option value="us-east-1">us-east-1</option>
          <option value="us-east-2">us-east-2</option>
          <option value="us-west-1">us-west-1</option>
        </select>
      </div>
      <div>
        <label className="block font-medium">Nome da Instância</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={instanceName}
          onChange={(e) => setInstanceName(e.target.value)}
          placeholder="Digite o nome da instância"
        />
      </div>
      <div>
        <label className="block font-medium">Usuário FalkorDB</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={falkorDBUser}
          onChange={(e) => setFalkorDBUser(e.target.value)}
          placeholder="Digite o usuário FalkorDB"
        />
      </div>
      <div>
        <label className="block font-medium">Senha FalkorDB</label>
        <input
          type="password"
          className="w-full p-2 border rounded"
          value={falkorDBPassword}
          onChange={(e) => setFalkorDBPassword(e.target.value)}
          placeholder="Digite a senha FalkorDB"
        />
      </div>

      <button
        className="bg-black text-white px-4 py-2 rounded mt-4"
        onClick={handleCreateInstance}
        disabled={isLoading}
      >
        {isLoading ? "Processando..." : "Criar Instância"}
      </button>
      <button className="text-gray-500 mt-2" onClick={onCancel} disabled={isLoading}>
        Cancelar
      </button>
    </div>
  );
}
