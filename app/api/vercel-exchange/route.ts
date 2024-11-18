// app/api/vercel-exchange/route.ts

import { NextResponse } from "next/server";
import { exchangeCodeForAccessToken } from "@actions/exchange-code-for-access-token";
import { serialize } from "cookie";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Código de autorização ausente" }, { status: 400 });
    }

    // Trocar o código pelo token de acesso
    const { access_token, team_id } = await exchangeCodeForAccessToken(code);

    if (!access_token) {
      return NextResponse.json({ error: "Falha ao obter token de acesso" }, { status: 500 });
    }

    // Configurar cookies seguros
    const accessTokenCookie = serialize("accessToken", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 dia em segundos
    });

    const teamIdCookie = serialize("teamId", team_id || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 dia em segundos
    });

    const headers = new Headers();
    headers.append("Set-Cookie", accessTokenCookie);
    headers.append("Set-Cookie", teamIdCookie);

    return NextResponse.json({ success: true }, { headers });
  } catch (error) {
    console.error("Erro na troca de código:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
