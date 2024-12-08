// app/api/projects/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const accessToken = request.headers.get("Authorization")?.replace("Bearer ", "");
    const teamId = request.headers.get("x-team-id");

    if (!accessToken || !teamId) {
      return NextResponse.json({ message: "Missing access token or TeamId, restart the installation." }, { status: 401 });
    }

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
    console.error("Erro ao buscar projetos:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}
