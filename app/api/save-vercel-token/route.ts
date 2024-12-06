import { NextResponse } from "next/server";
import { db } from "@/utils/firebaseAdmin";

export const POST = async (request: Request) => {
  try {
    const { instanceId, projectId, accessToken, subscriptionId } = await request.json();

    if (!instanceId || !projectId || !accessToken || !subscriptionId) {
      return NextResponse.json({ message: "Parâmetros ausentes." }, { status: 400 });
    }

    const docId = `${instanceId}:${projectId}`;
    const sessionData = {
      accessToken,
      instanceId,
      projectId,
      subscriptionId,
      createdAt: new Date().toISOString(),
    };

    await db.collection("vercel_tokens").doc(docId).set(sessionData);

    return NextResponse.json({ success: true, message: "Token salvo com sucesso" });
  } catch (error) {
    console.error("Erro ao salvar token:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
};
