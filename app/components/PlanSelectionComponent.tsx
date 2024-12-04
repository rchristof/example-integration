"use client";

import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import MainImageLayout from "../components/NonDashboardComponents/Layout/MainImageLayout";
import Card, { CardTitle } from "@components/NonDashboardComponents/Card";
import Button from "@components/NonDashboardComponents/Button";
import Select from "@components/NonDashboardComponents/FormElementsV2/Select";
import MenuItem from "@components/NonDashboardComponents/FormElementsV2/MenuItem";
import { Box, Typography, Stack, CircularProgress } from "@mui/material";

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
  const { selectedProject, setSubscriptionId } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [activeFreeSubscription, setActiveFreeSubscription] = useState<any | null>(null);

  useEffect(() => {
    const fetchSubscriptionsAndInstances = async () => {
      try {
        setIsLoading(true);

        const jwtToken = sessionStorage.getItem("jwtToken");
        if (!jwtToken) {
          throw new Error("Token JWT ausente. Certifique-se de que está logado.");
        }

        const subscriptionResponse = await fetch("/api/subscriptions", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
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

          const instanceResponse = await fetch(
            `/api/instances?subscriptionId=${freeSubscription.id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${jwtToken}`,
              },
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
  }, [setSubscriptionId]);

  // Subscribe to a new plan
  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
  
      const jwtToken = sessionStorage.getItem("jwtToken");
      if (!jwtToken) {
        throw new Error("Token JWT ausente.");
      }
  
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productTierId: "pt-YhJSEGRCYv",
          serviceId: "s-KgFDwg5vBS",
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar subscrição.");
      }
  
      let subscriptionId = await response.text(); // Lê a resposta como texto
      subscriptionId = subscriptionId.replace(/^"|"$/g, ""); // Remove as aspas no início e no final
  
      setActiveFreeSubscription({ id: subscriptionId });
      setSubscriptionId(subscriptionId);
      setInstances([]);
    } catch (error: any) {
      setErrorMessage(error.message || "Erro ao criar subscrição.");
    } finally {
      setIsLoading(false);
    }
  };
   

  // Handle instance selection and save data in Firebase
  const handleSelectInstance = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInstance) {
      setErrorMessage("Por favor, selecione uma instância.");
      return;
    }

    try {
      setIsLoading(true);
      const accessToken = sessionStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("Access token ausente.");
      }

      // Save data to Firebase
      const saveResponse = await fetch("/api/save-vercel-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceId: selectedInstance,
          projectId: selectedProject,
          subscriptionId: activeFreeSubscription.id,
          accessToken,
        }),
      });

      if (!saveResponse.ok) {
        const saveData = await saveResponse.json();
        throw new Error(saveData.message || "Erro ao salvar informações no Firebase.");
      }

      console.log("Informações salvas com sucesso no Firebase.");
    } catch (error: any) {
      setErrorMessage(error.message || "Erro ao selecionar a instância.");
    } finally {
      setIsLoading(false);
      onFinish();
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
            </Typography>
            {activeFreeSubscription ? (
              <form onSubmit={handleSelectInstance}>
                <Select
                  value={selectedInstance || ""}
                  onChange={(e) => setSelectedInstance(e.target.value)}
                  displayEmpty
                  sx={{ marginBottom: 2 }}
                  disabled={instances.length === 0} // Desativa caso não existam instâncias
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
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={!selectedInstance}
                  >
                    Select Instance
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={onNext}
                    disabled={instances.length > 0} // Desativa se já houver instâncias
                  >
                    Create Instance
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
              Contact us for more information.
            </Typography>
            <Button variant="outlined" disabled>
              Subscribe
            </Button>
          </Card>
          <Card>
            <CardTitle>FalkorDB Pro</CardTitle>
            <Typography variant="body1" color="#475467" mb={2}>
              The FalkorDB Pro Tier provides a production-ready FalkorDB deployment.
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
