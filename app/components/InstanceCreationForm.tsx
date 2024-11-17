// app/components/InstanceCreationForm.tsx

"use client";

import { useState } from "react";

interface InstanceCreationFormProps {
  subscriptionId: string;
  accessToken: string;
  selectedProject: string;
  teamId?: string;
  jwtToken: string;
  onSuccess: (instanceUser: string, instancePassword: string) => void;
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
  const [instanceName, setInstanceName] = useState<string>("");
  const [instanceUser, setInstanceUser] = useState<string>("");
  const [instancePassword, setInstancePassword] = useState<string>("");

  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Opções fixas de provedores
  const providers = [
    { id: "aws", name: "AWS" },
    { id: "gcp", name: "GCP" },
  ];

  // Opções de regiões dependentes do provedor selecionado
  const regions = {
    aws: [
      { id: "ap-south-1", name: "Asia Pacific (Mumbai)" },
      { id: "eu-west-1", name: "EU (Ireland)" },
      { id: "us-east-1", name: "US East (N. Virginia)" },
      { id: "us-east-2", name: "US East (Ohio)" },
      { id: "us-west-2", name: "US West (Oregon)" },
    ],
    gcp: [
      { id: "asia-south1", name: "Mumbai" },
      { id: "europe-west1", name: "Belgium" },
      { id: "me-west1", name: "Tel Aviv" },
      { id: "us-central1", name: "Iowa" },
      { id: "us-east1", name: "South Carolina" },
    ],
  };

  const handleCreateInstance = async () => {
    try {
      if (
        !selectedProvider ||
        !selectedRegion ||
        !instanceName ||
        !instanceUser ||
        !instancePassword
      ) {
        setErrorMessage("Por favor, preencha todos os campos.");
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      // Dados para a criação da instância
      const instanceData = {
        cloud_provider: selectedProvider,
        region: selectedRegion,
        requestParams: {
          name: instanceName,
          falkordbUser: instanceUser,
          falkordbPassword: instancePassword,
        },
      };

      // Construir a URL correta para criar a instância, incluindo subscriptionId como query parameter
      const createInstanceUrl = `https://api.omnistrate.cloud/2022-09-01-00/resource-instance/sp-JvkxkPhinN/falkordb/v1/prod/falkordb-free-customer-hosted/falkordb-free-falkordb-customer-hosted-model-omnistrate-multi-tenancy/free?subscriptionId=${subscriptionId}`;

      // Fazer a chamada para criar a instância
      const response = await fetch(createInstanceUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(instanceData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar a instância.");
      }

      const instanceId = data.instanceId || data.id;
      if (!instanceId) {
        throw new Error("ID da instância não retornado pela API.");
      }

      console.log("Instância criada com sucesso:", instanceId);

      // Chamar a função onSuccess passando os dados necessários
      onSuccess(instanceUser, instancePassword);
    } catch (error: any) {
      console.error("Erro ao criar a instância:", error);
      setErrorMessage(error.message || "Erro ao criar a instância.");
    } finally {
      setIsLoading(false);
    }
  };

  // Obter as regiões disponíveis com base no provedor selecionado
  const availableRegions = selectedProvider ? regions[selectedProvider] : [];

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Criar Nova Instância</h3>
      {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
      <div className="mt-2">
        <label className="block font-medium">Provedor</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedProvider}
          onChange={(e) => {
            setSelectedProvider(e.target.value);
            setSelectedRegion(""); // Resetar a região ao mudar o provedor
          }}
        >
          <option value="">Selecione um provedor</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-2">
        <label className="block font-medium">Região</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          disabled={!selectedProvider}
        >
          <option value="">Selecione uma região</option>
          {availableRegions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name} ({region.id})
            </option>
          ))}
        </select>
      </div>
      <div className="mt-2">
        <label className="block font-medium">Nome da Instância</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={instanceName}
          onChange={(e) => setInstanceName(e.target.value)}
          placeholder="Digite o nome da instância"
        />
      </div>
      <div className="mt-2">
        <label className="block font-medium">Usuário da Instância</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={instanceUser}
          onChange={(e) => setInstanceUser(e.target.value)}
          placeholder="Digite o usuário da instância"
        />
      </div>
      <div className="mt-2">
        <label className="block font-medium">Senha da Instância</label>
        <input
          type="password"
          className="w-full p-2 border rounded"
          value={instancePassword}
          onChange={(e) => setInstancePassword(e.target.value)}
          placeholder="Digite a senha da instância"
        />
      </div>
      <div className="mt-4">
        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={handleCreateInstance}
          disabled={isLoading}
        >
          {isLoading ? "Criando..." : "Criar Instância"}
        </button>
        <button className="ml-2 px-4 py-2 rounded" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
