"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { saveTokenToEnv } from "~/app/actions/save-token-to-env";

export default function Plans() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null); // Token JWT do usuário

  const handleSubscribe = async (plan: string) => {
    try {
      if (plan === "Basic") {
        const response = await fetch("https://api.omnistrate.cloud/2022-09-01-00/subscription", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceId: "s-KgFDwg5vBS",
            productTierId: "pt-055K4xaRsm",
          }),
        });
        
        const subscriptionData = await response.json();
        if (!response.ok) throw new Error(subscriptionData.message);

        const subscriptionId = subscriptionData.subscriptionId;

        const instanceResponse = await fetch(
          `https://api.omnistrate.cloud/2022-09-01-00/resource-instance/sp-JvkxkPhinN/falkordb/v1/dev/falkordb-free-customer-hosted/falkordb-free-falkordb-customer-hosted-model-omnistrate-multi-tenancy/free?subscriptionId=${subscriptionId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cloud_provider: "aws",
              region: "us-west-2",
              requestParams: {
                name: "MyFreeInstance",
                falkordbPassword: "strongPassword",
                falkordbUser: "adminUser",
              },
            }),
          }
        );

        const instanceData = await instanceResponse.json();
        if (!instanceResponse.ok) throw new Error(instanceData.message);

        const instanceId = instanceData.instanceId;

        const instanceDetailsResponse = await fetch(
          `https://api.omnistrate.cloud/2022-09-01-00/resource-instance/sp-JvkxkPhinN/falkordb/v1/dev/falkordb-free-customer-hosted/falkordb-free-falkordb-customer-hosted-model-omnistrate-multi-tenancy/free/instance/${instanceId}?subscriptionId=${subscriptionId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const instanceDetails = await instanceDetailsResponse.json();
        await saveTokenToEnv("<accessToken>", JSON.stringify(instanceDetails), "<projectId>", "<teamId>");
        console.log("Instância gratuita implantada e detalhes armazenados.");
      }

      if (next) {
        router.push(next);
      } else {
        console.error("Next URL is not provided");
      }
    } catch (error) {
      console.error("Erro ao processar a assinatura:", error);
      setErrorMessage("Erro ao processar a assinatura.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Choose a Plan</h1>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold">Basic Plan</h2>
          <p className="mt-2">Descrição do plano básico.</p>
          <button
            className="bg-black text-white px-4 py-2 rounded mt-4"
            onClick={() => handleSubscribe("Basic")}
          >
            Subscribe
          </button>
        </div>
        {/* Outros planos */}
      </div>
    </div>
  );
}
