// app/api/subscriptions/route.ts
import { NextResponse } from "next/server";
import redis from "@/utils/redis";

export const GET = async (request: Request) => {
  try {
    // Recuperar o token de sessão do cookie
    const sessionToken = request.headers.get("cookie")?.split("=")?.[1];
    if (!sessionToken) {
      return NextResponse.json({ message: "Sessão ausente." }, { status: 401 });
    }

    const sessionData = await redis.get(sessionToken);
    if (!sessionData) {
      return NextResponse.json({ message: "Sessão inválida ou expirada." }, { status: 401 });
    }

    const { jwtToken } = JSON.parse(sessionData);

    const response = await fetch("https://api.omnistrate.cloud/2022-09-01-00/subscription", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    // Recuperar o token de sessão do cookie
    const sessionToken = request.headers.get("cookie")?.split("=")?.[1];
    if (!sessionToken) {
      return NextResponse.json({ message: "Sessão ausente." }, { status: 401 });
    }

    const sessionData = await redis.get(sessionToken);
    if (!sessionData) {
      return NextResponse.json({ message: "Sessão inválida ou expirada." }, { status: 401 });
    }

    const { jwtToken } = JSON.parse(sessionData);
    const body = await request.json();

    const response = await fetch("https://api.omnistrate.cloud/2022-09-01-00/subscription", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.text();
    return new Response(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
};
