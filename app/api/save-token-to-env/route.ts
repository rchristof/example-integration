// app/api/save-token-to-env/route.ts
import { NextResponse } from "next/server";
import { db } from "@/utils/firebaseAdmin"; // Importa Firestore

export const POST = async (request: Request) => {
  try {
    const authHeader = request.headers.get("Authorization");
    let accessToken: string | null = null;
    let teamId: string | null = null;

    // Lê o corpo da requisição uma única vez
    const requestBody = await request.json();
    const { variables, projectId, teamId: bodyTeamId } = requestBody;

    if (!variables || !projectId) {
      return NextResponse.json({ message: "Parâmetros ausentes." }, { status: 400 });
    }

    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Token enviado no cabeçalho
      accessToken = authHeader.replace("Bearer ", "");
      teamId = bodyTeamId || null;
    } else {
      // Fallback para o token de sessão do cookie
      const sessionToken = request.headers.get("cookie")?.split("=")?.[1];
      if (!sessionToken) {
        return NextResponse.json({ message: "Sessão ausente." }, { status: 401 });
      }

      const sessionDoc = await db.collection("sessions").doc(sessionToken).get();
      if (!sessionDoc.exists) {
        return NextResponse.json({ message: "Sessão inválida ou expirada." }, { status: 401 });
      }

      const sessionData = sessionDoc.data();
      accessToken = sessionData?.accessToken;
      teamId = sessionData?.teamId || null;
    }

    if (!accessToken) {
      return NextResponse.json({ message: "Token de acesso ausente." }, { status: 401 });
    }

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
          type: "encrypted",
          key: variable.key,
          value: variable.value,
          target: ["production", "preview", "development"],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        return NextResponse.json(
          { message: data.error?.message || "Erro ao salvar variável." },
          { status: response.status }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro interno do servidor:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
};
