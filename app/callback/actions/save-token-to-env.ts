// callback/actions/save-token-to-env.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export async function saveTokenToEnv(
  accessToken: string,
  userApiKey: string,
  projectId: string,
  teamId: string
): Promise<void> {
  try {
    const result = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env?teamId=${teamId}&upsert=true`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: "USER_API_KEY",
        value: userApiKey,
        type: "secret", // Tipo de variável de ambiente com nível máximo de segurança
        target: ["production", "preview"], // Exclui "development" do alvo para variáveis sensíveis
        comment: "User's instance keys",
      }),
    });

    if (!result.ok) {
      const errorData = await result.json();
      console.error("Erro ao salvar a variável de ambiente:", errorData);
      throw new Error("Failed to save the environment variable.");
    }

    console.log("Variável de ambiente 'sensitive' salva com sucesso.");
  } catch (error) {
    console.error("Erro ao salvar a variável de ambiente:", error);
    throw error;
  }
}
