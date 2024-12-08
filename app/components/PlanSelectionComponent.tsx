// app/components/PlanSelectionComponent.tsx
"use client";

import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import MainImageLayout from "../components/NonDashboardComponents/Layout/MainImageLayout";
import Card, { CardTitle } from "@components/NonDashboardComponents/Card";
import Button from "@components/NonDashboardComponents/Button";
import Select from "@components/NonDashboardComponents/FormElementsV2/Select";
import MenuItem from "@components/NonDashboardComponents/FormElementsV2/MenuItem";
import TextField from "@components/NonDashboardComponents/FormElementsV2/TextField";
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
  const [instancePassword, setInstancePassword] = useState<string>("");
  const [activeFreeSubscription, setActiveFreeSubscription] = useState<any | null>(null);

  useEffect(() => {
    const fetchSubscriptionsAndInstances = async () => {
      try {
        setIsLoading(true);

        const jwtToken = sessionStorage.getItem("jwtToken");
        if (!jwtToken) {
          throw new Error("Missing user token. Make sure you are logged in.");
        }

        const subscriptionResponse = await fetch("/api/subscriptions", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        const subscriptionData = await subscriptionResponse.json();

        if (!subscriptionResponse.ok) {
          throw new Error(subscriptionData.message || "Error when searching for subscriptions.");
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
            throw new Error(instanceData.message || "Error fetching instances.");
          }

          setInstances(instanceData.ids || []);
        }
      } catch (error: any) {
        setErrorMessage(error.message || "Error loading information.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionsAndInstances();
  }, [setSubscriptionId]);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);

      const jwtToken = sessionStorage.getItem("jwtToken");
      if (!jwtToken) {
        throw new Error("Missing user Token.");
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
        throw new Error(errorData.message || "Error creating subscription.");
      }

      let subscriptionId = await response.text();
      subscriptionId = subscriptionId.replace(/^"|"$/g, "");

      setActiveFreeSubscription(subscriptionId);
      setSubscriptionId(subscriptionId);
      setInstances([]);
    } catch (error: any) {
      setErrorMessage(error.message || "Error creating subscription.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectInstance = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!selectedInstance) {
      setErrorMessage("Please select an instance.");
      return;
    }
  
    if (!instancePassword) {
      setErrorMessage("Please enter the instance password.");
      return;
    }
  
    try {
      setIsLoading(true);
  
      const jwtToken = sessionStorage.getItem("jwtToken");
      if (!jwtToken) {
        throw new Error("Missing user Token.");
      }
      const accessToken = sessionStorage.getItem("access_token");
      if (!accessToken) {
        throw new Error("Missing acess Token.");
      }
      
      const instanceDetailsResponse = await fetch(
        `/api/instances?instanceId=${selectedInstance}&subscriptionId=${activeFreeSubscription.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
  
      if (!instanceDetailsResponse.ok) {
        const errorDetails = await instanceDetailsResponse.json();
        throw new Error(errorDetails.message || "Error getting instance details.");
      }
  
      const instanceDetails = await instanceDetailsResponse.json();
      const status = instanceDetails.status;
      const falkordbUser = instanceDetails.result_params?.falkordbUser;
      const dynamicKey = Object.keys(
        instanceDetails.detailedNetworkTopology
      )[0];
      const falkordbHostname =
        instanceDetails.detailedNetworkTopology[dynamicKey]?.clusterEndpoint;
      const falkordbPort =
        instanceDetails.detailedNetworkTopology[dynamicKey]?.clusterPorts?.[0];
      
      // console.log("Detalhes da instância:", instanceDetails);
      // console.log("user instância:", falkordbUser);

      switch (status) {
        case "DEPLOYING":
          // Salvar nas variáveis do Vercel e no Firebase
          await fetch("/api/save-token-to-env", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            credentials: "include",
            body: JSON.stringify({
              variables: [
                { key: "FALKORDB_PASSWORD", value: instancePassword },
              ],
              projectId: selectedProject,
            }),
          });
  
          await fetch("/api/save-vercel-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              instanceId: selectedInstance,
              projectId: selectedProject,
              subscriptionId: activeFreeSubscription.id,
              accessToken,
              instancePassword,
              falkordbUser,
            }),
          });
          break;
  
        case "DELETING":
          throw new Error("Instances in DELETING cannot be selected.");
  
        default:
          if (!falkordbUser) {
            throw new Error("User not found in instance details.");
          }

          await fetch("/api/save-token-to-env", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
            },
            credentials: "include",
            body: JSON.stringify({
              variables: [
                { key: "FALKORDB_USER", value: falkordbUser },
                { key: "FALKORDB_PASSWORD", value: instancePassword },
                { key: "FALKORDB_HOSTNAME", value: falkordbHostname },
                { key: "FALKORDB_PORT", value: `${falkordbPort}` },
              ],
              projectId: selectedProject,
            }),
          });
      }

      onFinish();
    } catch (error: any) {
      setErrorMessage(error.message || "Error processing instance.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainImageLayout
      pageTitle="Subscription Plans"
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
                  disabled={instances.length === 0} 
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
                    variant="contained"
                    type="submit"
                    disabled={!selectedInstance || !instancePassword}
                  >
                    Select Instance
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => onNext()}
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
