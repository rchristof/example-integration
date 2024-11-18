import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Token de acesso ausente." }, { status: 401 });
    }

    const response = await fetch("https://api.vercel.com/v9/projects", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
    console.error("Erro na rota /api/projects:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}
