import { NextResponse } from "next/server";
import redis from "@/utils/redis";

export async function GET(request: Request) {
  try {
    const sessionToken = request.headers.get("cookie")?.split("=")?.[1]; // Recuperar sessionToken do cookie

    if (!sessionToken) {
      return NextResponse.json(
        { message: "Sessão ausente." },
        { status: 401 }
      );
    }

    const sessionData = await redis.get(sessionToken);
    if (!sessionData) {
      return NextResponse.json(
        { message: "Sessão inválida ou expirada." },
        { status: 401 }
      );
    }

    const { accessToken, teamId } = JSON.parse(sessionData);

    const response = await fetch("https://api.vercel.com/v9/projects", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-team-id": teamId,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ projects: data.projects }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
