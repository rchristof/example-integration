// app/api/exchange-code-for-access-token/route.ts
import { NextResponse } from "next/server";
import qs from "querystring";

export const POST = async (request: Request) => {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ message: "Código de autorização ausente." }, { status: 400 });
    }

    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const host = process.env.HOST;

    if (!clientId || !clientSecret || !host) {
      return NextResponse.json({ message: "Variáveis de ambiente ausentes." }, { status: 500 });
    }

    const response = await fetch("https://api.vercel.com/v2/oauth/access_token", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: qs.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${host}/callback`,
      }),
    });

    const body = await response.json();

    if (!response.ok || !body.access_token || !body.team_id) {
      return NextResponse.json(
        { message: body.error_description || "Erro ao trocar código por token." },
        { status: response.status }
      );
    }

    const { access_token: accessToken, team_id: teamId } = body;

    // Retornar accessToken e teamId, mas não salvar ainda
    return NextResponse.json({
      success: true,
      message: "Token gerado com sucesso.",
      accessToken,
      teamId,
    });
  } catch (error) {
    console.error("Erro ao trocar código por token:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
};

