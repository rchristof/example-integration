// app/api/save-vercel-token/route.ts
import { NextResponse } from "next/server";
import { db } from "@/utils/firebaseAdmin";

export const POST = async (request: Request) => {
  try {
    const { teamId, projectId, accessToken } = await request.json();

    if (!teamId || !projectId || !accessToken) {
      return NextResponse.json({ message: "Parâmetros ausentes." }, { status: 400 });
    }

    const docId = `${teamId}_${projectId}`; // Identificador único
    const sessionData = { accessToken, teamId, projectId, createdAt: new Date().toISOString() };

    await db.collection("vercel_tokens").doc(docId).set(sessionData);

    return NextResponse.json({ success: true, message: "Token salvo com sucesso" });
  } catch (error) {
    console.error("Erro ao salvar token:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
};
