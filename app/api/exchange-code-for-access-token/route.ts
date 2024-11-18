// app/api/exchange-code-for-access-token/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import qs from "querystring";

export const POST = async (request: Request) => {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ message: "Código ausente." }, { status: 400 });
    }

    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const host = process.env.HOST;

    if (!clientId || !clientSecret || !host) {
      console.error("Variáveis de ambiente ausentes.");
      return NextResponse.json(
        { message: "Variáveis de ambiente ausentes." },
        { status: 500 }
      );
    }

    // Troca do código pelo token de acesso
    const response = await fetch("https://api.vercel.com/v2/oauth/access_token", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: qs.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${host}/callback`, // Deve coincidir com o URI de redirecionamento configurado na Vercel
      }),
    });

    const body = await response.json();

    if (process.env.NODE_ENV !== "production") {
      console.log("API Vercel response:", JSON.stringify(body, null, 2));
    }

    if (!response.ok || !body.access_token) {
      console.error("Erro na troca de código por token:", body);
      return NextResponse.json(
        { message: body.error_description || "Erro ao trocar código por token." },
        { status: response.status }
      );
    }

    const { access_token: accessToken, team_id: teamId } = body;

    // Armazenar o token de acesso em um cookie seguro
    cookies().set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 dia
    });

    return NextResponse.json({ success: true, teamId });
  } catch (error) {
    console.error("Erro ao trocar código por token:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
};
