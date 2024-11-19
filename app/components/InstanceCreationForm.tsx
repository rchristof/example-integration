"use client";

import { useAuth } from "../contexts/AuthContext";
import { use, useState } from "react";
import MainImageLayout from "../components/NonDashboardComponents/Layout/MainImageLayout";
import Select from "@components/NonDashboardComponents/FormElementsV2/Select";
import MenuItem from "@components/NonDashboardComponents/FormElementsV2/MenuItem";
import Button from "@components/NonDashboardComponents/Button";
import TextField from "@components/NonDashboardComponents/FormElementsV2/TextField";
import { Box, Typography, CircularProgress, Stack } from "@mui/material";

interface InstanceCreationFormProps {
  subscriptionId: string;
  selectedProject: string;
  teamId?: string;
  onSuccess: (user: string, password: string) => void;
  onCancel: () => void;
}

export default function InstanceCreationForm({
  // subscriptionId,
  // selectedProject,
  teamId,
  onSuccess,
  onCancel,
}: InstanceCreationFormProps) {
  const selectedProject = useAuth().selectedProject;
  const subscriptionId = useAuth().subscriptionId;
  console.log("oioi", useAuth());
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
        throw new Error(data.message || "Erro ao criar a instância.");
      }

      const variables = [
        { key: "FALKORDB_USER", value: instanceUser },
        { key: "FALKORDB_PASSWORD", value: instancePassword },
      ];
  
      const saveVariablesResponse = await fetch("/api/save-token-to-env", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          variables,
          projectId: selectedProject,
        }),
      });
  
      if (!saveVariablesResponse.ok) {
        const saveErrorData = await saveVariablesResponse.json();
        console.error("Erro ao salvar variáveis de ambiente:", saveErrorData);
        throw new Error(saveErrorData.message || "Erro ao salvar as variáveis de ambiente.");
      }
  
      console.log("Variáveis de ambiente salvas com sucesso.");

      onSuccess(instanceUser, instancePassword);
    } catch (error: any) {
      setErrorMessage(error.message || "Erro ao criar a instância.");
    } finally {
      setIsLoading(false);
    }
  };

  const availableRegions = selectedProvider ? regions[selectedProvider] : [];

  return (
    <MainImageLayout
      pageTitle="Criar Instância"
      orgName="FalkorDB"
      orgLogoURL="/assets/images/falkor_logo.png"
    >
      <Stack spacing={3}>
        <Typography variant="h5" fontWeight="bold" textAlign="center">
          Criar Nova Instância
        </Typography>

        {errorMessage && (
          <Typography color="error" textAlign="center">
            {errorMessage}
          </Typography>
        )}

        <Select
          value={selectedProvider}
          onChange={(e) => {
            setSelectedProvider(e.target.value);
            setSelectedRegion("");
          }}
          displayEmpty
          fullWidth
        >
          <MenuItem value="">Select a Cloud Provider</MenuItem>
          {providers.map((provider) => (
            <MenuItem key={provider.id} value={provider.id}>
              {provider.name}
            </MenuItem>
          ))}
        </Select>

        <Select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          displayEmpty
          fullWidth
          disabled={!selectedProvider}
        >
          <MenuItem value="">Select a Region</MenuItem>
          {availableRegions.map((region) => (
            <MenuItem key={region.id} value={region.id}>
              {region.name} ({region.id})
            </MenuItem>
          ))}
        </Select>

        <TextField
          label="Name"
          InputLabelProps={{ shrink: true }} // Garante que o label seja exibido acima do campo
          placeholder="Digite o nome da instância"
          value={instanceName}
          onChange={(e) => setInstanceName(e.target.value)}
          fullWidth
        />

        <TextField
          label="User"
          InputLabelProps={{ shrink: true }} // Garante que o label seja exibido acima do campo
          placeholder="Digite o usuário da instância"
          value={instanceUser}
          onChange={(e) => setInstanceUser(e.target.value)}
          fullWidth
        />

        <TextField
          label="Password"
          InputLabelProps={{ shrink: true }} // Garante que o label seja exibido acima do campo
          placeholder="Digite a senha da instância"
          type="password"
          value={instancePassword}
          onChange={(e) => setInstancePassword(e.target.value)}
          fullWidth
        />

        <Stack direction="row" justifyContent="space-between">
          <Button
            onClick={handleCreateInstance}
            isLoading={isLoading}
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? "Criando..." : "Create Instance"}
          </Button>
          <Button variant="outlined" onClick={onCancel} disabled={isLoading} fullWidth>
            Cancel
          </Button>
        </Stack>
      </Stack>
    </MainImageLayout>
  );
}
