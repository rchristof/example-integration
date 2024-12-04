// app/api/webhook/route.ts
import { NextResponse } from "next/server";
import { db } from "@/utils/firebaseAdmin";

export const POST = async (request: Request) => {
  try {
    const authHeader = request.headers.get("Authorization");

    // Verifica o token de autenticação
    if (!authHeader || authHeader !== "Bearer token-secreto") {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { instanceId } = body;

    if (!instanceId) {
      return NextResponse.json({ message: "ID da instância ausente." }, { status: 400 });
    }

    console.log(`Iniciando automação para a instância: ${instanceId}`);

    // Busca documentos no Firestore que comecem com o ID da instância
    const snapshot = await db
      .collection("vercel_tokens")
      .where("__name__", ">=", `${instanceId}:`)
      .where("__name__", "<", `${instanceId}:~`)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ message: "Nenhum projeto encontrado para esta instância." }, { status: 404 });
    }

    const apikey = process.env.ADMIN_BEARER;

    if (!apikey) {
      return NextResponse.json({ message: "Chave de API não encontrada." }, { status: 500 });
    }

    for (const doc of snapshot.docs) {
      const { accessToken, projectId, subscriptionId, teamId } = doc.data();

      console.log(`Processando projeto ${projectId} para a instância ${instanceId}`);

      // Obtem detalhes da instância
      const instanceDetailsResponse = await fetch(
        `https://api.omnistrate.cloud/2022-09-01-00/resource-instance/sp-JvkxkPhinN/falkordb/v1/prod/falkordb-free-customer-hosted/falkordb-free-falkordb-customer-hosted-model-omnistrate-multi-tenancy/free/${instanceId}?subscriptionId=${subscriptionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apikey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!instanceDetailsResponse.ok) {
        const errorDetails = await instanceDetailsResponse.json();
        console.error("Erro ao obter detalhes da instância:", errorDetails);
        continue;
      }

      const instanceDetails = await instanceDetailsResponse.json();
      const falkordbUser = instanceDetails.result_params?.falkordbUser;

      if (!falkordbUser) {
        console.error("FalkorDB user não encontrado nos detalhes da instância.");
        continue;
      }

      console.log(`FalkorDB user obtido: ${falkordbUser}`);

      // Chama a API interna para salvar as variáveis no Vercel
      const saveEnvResponse = await fetch("http://localhost:3000/api/save-token-to-env", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // Passa o token diretamente
        },
        body: JSON.stringify({
          variables: [
            { key: "FALKORDB_USER", value: falkordbUser },
          ],
          projectId,
          teamId,
        }),
      });

      if (!saveEnvResponse.ok) {
        const saveEnvError = await saveEnvResponse.json();
        console.error("Erro ao salvar variáveis de ambiente no Vercel usando a API interna:", saveEnvError);
        continue;
      }

      console.log(`Variáveis de ambiente salvas com sucesso no projeto ${projectId}.`);
    }

    return NextResponse.json({ message: "Webhook processado com sucesso." }, { status: 200 });
  } catch (error) {
    console.error("Erro ao processar o webhook:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
};
