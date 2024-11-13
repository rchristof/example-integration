// app/actions/save-token-to-env.ts

export async function saveTokenToEnv(accessToken: string, instanceDetails: string, projectId: string, teamId: string) {
  try {
    const response = await fetch(`https://api.vercel.com/v8/projects/${projectId}/env?teamId=${teamId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "encrypted",
        key: "INSTANCE_DETAILS",
        value: instanceDetails,
        target: ["production", "preview", "development"],
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Falha ao salvar o token nas variáveis de ambiente");
    }
    return data;
  } catch (error) {
    console.error("Erro ao salvar o token no env:", error);
    throw error;
  }
}
