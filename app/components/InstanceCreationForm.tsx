"use client";

import { useState } from "react";

interface InstanceCreationFormProps {
  subscriptionId: string;
  selectedProject: string;
  teamId?: string;
  onSuccess: (user: string, password: string) => void;
  onCancel: () => void;
}

export default function InstanceCreationForm({
  subscriptionId,
  selectedProject,
  teamId,
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

  const providers = [
    { id: "aws", name: "AWS" },
    { id: "gcp", name: "GCP" },
  ];

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
      if (!selectedProvider || !selectedRegion || !instanceName || !instanceUser || !instancePassword) {
        setErrorMessage("Por favor, preencha todos os campos.");
        console.error("Campos ausentes:", {
          selectedProvider,
          selectedRegion,
          instanceName,
          instanceUser,
          instancePassword,
        });
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      const instanceData = {
        cloud_provider: selectedProvider,
        region: selectedRegion,
        requestParams: {
          name: instanceName,
          falkordbUser: instanceUser,
          falkordbPassword: instancePassword,
        },
      };

      const requestBody = {
        subscriptionId,
        instanceData,
      };

      console.log("Enviando dados da instância:", requestBody);

      const response = await fetch("/api/instances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Erro na resposta da API:", data);
        throw new Error(data.message || "Erro ao criar a instância.");
      }

      console.log("Instância criada com sucesso:", data);
      onSuccess(instanceUser, instancePassword);
    } catch (error: any) {
      console.error("Erro ao criar a instância:", error);
      setErrorMessage(error.message || "Erro ao criar a instância.");
    } finally {
      setIsLoading(false);
    }
  };

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
            setSelectedRegion("");
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
