// app/actions/save-token-to-env.ts

export async function saveTokenToEnv(
  accessToken: string,
  variables: { key: string; value: string }[],
  projectId: string,
  teamId?: string
) {
  try {
    const url = teamId
      ? `https://api.vercel.com/v8/projects/${projectId}/env?teamId=${teamId}`
      : `https://api.vercel.com/v8/projects/${projectId}/env`;

    for (const variable of variables) {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "encrypted", // Usando 'encrypted' para maior segurança
          key: variable.key,
          value: variable.value,
          target: ["production", "preview", "development"],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || JSON.stringify(data));
      }

      console.log(`Variável ${variable.key} salva com sucesso.`);
    }
  } catch (error: any) {
    console.error("Erro ao salvar o token no env:", error);
    throw error;
  }
}
