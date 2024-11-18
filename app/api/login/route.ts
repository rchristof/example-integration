import { NextResponse } from "next/server";
import redis from "@/utils/redis";

export const POST = async (request: Request) => {
  try {
    const { email, password } = await request.json();
    const apikey = process.env.ADMIN_BEARER;

    if (!apikey) {
      return NextResponse.json({ message: "Chave de API não encontrada." }, { status: 500 });
    }

    const response = await fetch("https://api.omnistrate.cloud/2022-09-01-00/customer-user-signin", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apikey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const { jwtToken } = data;

    if (!jwtToken) {
      return NextResponse.json({ message: "Token de autenticação não recebido." }, { status: 500 });
    }

    // Recuperar o token de sessão do cookie
    const sessionToken = request.headers.get("cookie")?.split("=")?.[1];
    if (!sessionToken) {
      return NextResponse.json({ message: "Sessão ausente." }, { status: 401 });
    }

    const existingSession = await redis.get(sessionToken);
    if (!existingSession) {
      return NextResponse.json({ message: "Sessão inválida ou expirada." }, { status: 401 });
    }

    // Atualizar a sessão com o jwtToken
    const sessionData = JSON.parse(existingSession);
    sessionData.jwtToken = jwtToken;

    const ttl = 60 * 60 * 24; // 1 dia
    await redis.set(sessionToken, JSON.stringify(sessionData), "EX", ttl);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
};
