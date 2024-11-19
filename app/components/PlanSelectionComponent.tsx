"use client";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import MainImageLayout from "../components/NonDashboardComponents/Layout/MainImageLayout";
import Card, { CardTitle } from "@components/NonDashboardComponents/Card";
import Button from "@components/NonDashboardComponents/Button";
import Select from "@components/NonDashboardComponents/FormElementsV2/Select";
import MenuItem from "@components/NonDashboardComponents/FormElementsV2/MenuItem";
import { Box, Typography, Stack, CircularProgress, TextField } from "@mui/material";

interface PlanSelectionComponentProps {
  onNext: (subscriptionId?: string) => void;
  onBack: () => void;
  onFinish: () => void;
  selectedProject: string;
}

export default function PlanSelectionComponent({
  onNext,
  onBack,
  onFinish,
}: PlanSelectionComponentProps) {
  const { selectedProject } = useAuth();
  const { setSubscriptionId } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [instancePassword, setInstancePassword] = useState<string>("");
  const [activeFreeSubscription, setActiveFreeSubscription] = useState<any | null>(null);

  useEffect(() => {
    const fetchSubscriptionsAndInstances = async () => {
      try {
        setIsLoading(true);
        const subscriptionResponse = await fetch("/api/subscriptions", {
          method: "GET",
          credentials: "include",
        });
        const subscriptionData = await subscriptionResponse.json();

        if (!subscriptionResponse.ok) {
          throw new Error(subscriptionData.message || "Erro ao buscar subscrições.");
        }

        setSubscriptions(subscriptionData.subscriptions);

        const freeSubscription = subscriptionData.subscriptions?.find(
          (sub: any) => sub.productTierId === "pt-YhJSEGRCYv" && sub.status === "ACTIVE"
        );
        setActiveFreeSubscription(freeSubscription);

        if (freeSubscription) {
          setSubscriptionId(freeSubscription.id);
          console.log("freeSubscription.id mudou", freeSubscription.id);
          const instanceResponse = await fetch(
            `/api/instances?subscriptionId=${freeSubscription.id}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const instanceData = await instanceResponse.json();

          if (!instanceResponse.ok) {
            throw new Error(instanceData.message || "Erro ao buscar instâncias.");
          }

          setInstances(instanceData.ids || []);
        }
      } catch (error: any) {
        setErrorMessage(error.message || "Erro ao carregar informações.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionsAndInstances();
  }, []);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productTierId: "pt-YhJSEGRCYv",
          serviceId: "s-KgFDwg5vBS",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar subscrição.");
      }

      setActiveFreeSubscription(data);
      setSubscriptionId(data);
      console.log("data.id mudou", data);
      setInstances([]);
    } catch (error: any) {
      setErrorMessage(error.message || "Erro ao criar subscrição.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectInstance = async (e: React.FormEvent) => {
    e.preventDefault(); // Impede o comportamento padrão do formulário

    if (!selectedInstance || !instancePassword) {
      setErrorMessage("Por favor, selecione uma instância e insira a senha.");
      return;
    }

    try {
      setIsLoading(true);

      const instanceDetailsResponse = await fetch(
        `/api/instances?subscriptionId=${activeFreeSubscription.id}&instanceId=${selectedInstance}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const instanceDetails = await instanceDetailsResponse.json();

      if (!instanceDetailsResponse.ok) {
        throw new Error(instanceDetails.message || "Erro ao obter detalhes da instância.");
      }

      const instanceUser = instanceDetails.result_params?.falkordbUser;

      if (!instanceUser) {
        throw new Error("Usuário não encontrado nos detalhes da instância.");
      }

      const requestData = {
        variables: [
          { key: "FALKORDB_USER", value: instanceUser },
          { key: "FALKORDB_PASSWORD", value: instancePassword },
        ],
        projectId: selectedProject,
      };

      console.log("Dados enviados para salvar as variáveis de ambiente:", requestData);

      const response = await fetch("/api/save-token-to-env", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao salvar as variáveis de ambiente.");
      }

      
    } catch (error: any) {
      setErrorMessage(error.message || "Erro ao selecionar a instância.");
    } finally {
      setIsLoading(false);
      onFinish(); // Finaliza a instalação
    }
  };

  return (
    <MainImageLayout
      pageTitle="Seleção de Subscrição"
      orgName="FalkorDB"
      orgLogoURL="/assets/images/falkor_logo.png"
    >
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          {errorMessage && (
            <Typography color="error" textAlign="center">
              {errorMessage}
            </Typography>
          )}

<Card>
            <CardTitle>FalkorDB Free</CardTitle>
            <Typography variant="body1" color="#475467" mb={2}>
              The FalkorDB Free Tier provides a free FalkorDB instance for evaluation purposes.
              You can deploy, connect, and share the instance with minimal effort and no
              maintenance.
            </Typography>
            {activeFreeSubscription ? (
              <form onSubmit={handleSelectInstance}>
                <Select
                  value={selectedInstance || ""}
                  onChange={(e) => setSelectedInstance(e.target.value)}
                  displayEmpty
                  sx={{ marginBottom: 2 }}
                >
                  {instances.length === 0 ? (
                    <MenuItem disabled value="">
                      No instances found
                    </MenuItem>
                  ) : (
                    instances.map((id) => (
                      <MenuItem key={id} value={id}>
                        {id}
                      </MenuItem>
                    ))
                  )}
                </Select>

                {/* Renderizar o campo de senha somente se uma instância estiver selecionada */}
                {selectedInstance && (
                  <TextField
                    type="password"
                    placeholder="Enter the instance password"
                    value={instancePassword}
                    onChange={(e) => setInstancePassword(e.target.value)}
                    fullWidth
                    sx={{ marginBottom: 2 }}
                  />
                )}

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={() => onNext(activeFreeSubscription.id)}
                    disabled={instances.length > 0}
                  >
                    Create Instance
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={!selectedInstance || !instancePassword}
                  >
                    Select Instance
                  </Button>
                </Stack>
              </form>
            ) : (
              <Button variant="outlined" onClick={handleSubscribe}>
                Subscribe
              </Button>
            )}
          </Card>

          <Card>
            <CardTitle>FalkorDB Enterprise</CardTitle>
            <Typography variant="body1" color="#475467" mb={2}>
              Contact us for more information: Email: support@falkordb.com Discord:
              https://discord.com/invite/6M4QwDXn2w Forum:
              https://github.com/orgs/FalkorDB/discussions
            </Typography>
            <Button variant="outlined" disabled>
              Subscribe
            </Button>
          </Card>

          <Card>
            <CardTitle>FalkorDB Pro</CardTitle>
            <Typography variant="body1" color="#475467" mb={2}>
              The FalkorDB Pro Tier provides you with a production-ready FalkorDB deployment.
              Choose your deployment mode, connect, and share the instance with minimal effort
              and no maintenance. Pick your machine size, add...
            </Typography>
            <Button variant="outlined" disabled>
              Subscribe
            </Button>
          </Card>
        </Stack>
      )}
    </MainImageLayout>
  );  
}
