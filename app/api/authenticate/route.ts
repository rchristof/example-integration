// app/api/authenticate/route.ts

import { NextResponse } from "next/server";
import { exchangeCodeForAccessToken } from "@actions/exchange-code-for-access-token"; // Usando o alias configurado
import { serialize } from "cookie";

export const POST = async (request: Request) => {
  try {
    const { code } = await request.json();
    console.log("Recebido code:", code);

    if (!code) {
      console.error("Código de autorização ausente.");
      return NextResponse.json(
        { message: "Código de autorização ausente." },
        { status: 400 }
      );
    }

    // Trocar o código por token de acesso
    const tokenData = await exchangeCodeForAccessToken(code);
    console.log("Token Data:", tokenData);

    // Definir cookies com o token de acesso
    const accessTokenCookie = serialize("accessToken", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hora em segundos
    });

    const teamIdCookie = serialize("teamId", tokenData.team_id || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hora em segundos
    });

    const headers = new Headers();
    headers.append("Set-Cookie", accessTokenCookie);
    headers.append("Set-Cookie", teamIdCookie);

    return NextResponse.json(
      { message: "Autenticação realizada com sucesso." },
      { headers }
    );
  } catch (error: any) {
    console.error("Erro na rota /api/authenticate:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
};
