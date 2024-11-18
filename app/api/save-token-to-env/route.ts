import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const POST = async (request: Request) => {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value; // Buscar accessToken

    if (!accessToken) {
      console.error("Access Token ausente nos cookies.");
      return NextResponse.json({ message: "Token de acesso ausente." }, { status: 401 });
    }

    console.log("Access Token recuperado:", accessToken);

    const { variables, projectId, teamId } = await request.json();

    if (!variables || !projectId || !teamId) {
      console.error("Parâmetros ausentes:", { variables, projectId, teamId });
      return NextResponse.json({ message: "Parâmetros ausentes." }, { status: 400 });
    }

    const url = teamId
      ? `https://api.vercel.com/v8/projects/${projectId}/env?teamId=${teamId}`
      : `https://api.vercel.com/v8/projects/${projectId}/env`;

    for (const variable of variables) {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`, // Usando accessToken
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "encrypted", // Usar 'encrypted' para maior segurança
          key: variable.key,
          value: variable.value,
          target: ["production", "preview", "development"],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`Erro ao salvar a variável ${variable.key}:`, data);
        return NextResponse.json(
          { message: data.error?.message || "Erro ao salvar variável." },
          { status: response.status }
        );
      }

      console.log(`Variável ${variable.key} salva com sucesso.`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro na rota /api/save-token-to-env:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
};
