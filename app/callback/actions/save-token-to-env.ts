// save-token-to-env.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export async function saveTokenToEnv(
  accessToken: string,
  jwtToken: string,
  projectId: string,
  teamId?: string
) {
  try {
    const url = `https://api.vercel.com/v10/projects/${projectId}/env?upsert=true${teamId ? `&teamId=${teamId}` : ''}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key: "API_URL",
        value: jwtToken,
        type: "plain",
        target: ["preview"],
        comment: "Token de autenticação para o projeto",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Erro ao salvar o token:", data);
      throw new Error("Failed to save token to environment variables");
    }

    console.log("Token salvo com sucesso no projeto:", projectId);
    return data;
  } catch (error) {
    console.error("Erro ao salvar o token na Vercel:", error);
    throw error;
  }
}
