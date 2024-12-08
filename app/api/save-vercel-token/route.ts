import { NextResponse } from "next/server";
import { db } from "@/utils/firebaseAdmin";

export const POST = async (request: Request) => {
  try {
    const { instanceId, projectId, accessToken, subscriptionId } = await request.json();

    if (!instanceId || !projectId || !accessToken || !subscriptionId) {
      return NextResponse.json({ message: "Missing parameters, restart the installation." }, { status: 400 });
    }

    const docId = `${instanceId}:${projectId}`;
    const sessionData = {
      accessToken,
      instanceId,
      projectId,
      subscriptionId,
      createdAt: new Date().toUTCString(),
    };

    await db.collection("vercel_tokens").doc(docId).set(sessionData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving token:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
};
