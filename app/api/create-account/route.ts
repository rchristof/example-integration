// app/api/create-account/route.ts

import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const { email, legalCompanyName, name, password } = await request.json();

    const apikey = process.env.ADMIN_BEARER;

    if (!apikey) {
      console.error("Chave de API não encontrada.");
      return NextResponse.json({ message: "Chave de API não encontrada." }, { status: 500 });
    }

    // Enviar dados para a API externa
    const response = await fetch(
      "https://api.omnistrate.cloud/2022-09-01-00/customer-user-signup",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apikey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          legalCompanyName,
          name,
          password,
        }),
      }
    );

    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Erro na criação de conta na API externa:", errorData);
      return NextResponse.json(
        { message: errorData.message || "Erro ao criar conta." },
        { status: response.status }
      );
    }

    // Conta criada com sucesso
    console.log("Conta criada com sucesso.");
    return NextResponse.json(
      {
        success: true,
        message: "Conta criada com sucesso. Verifique seu email para confirmação.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Capturar erros internos
    console.error("Erro inesperado na rota /api/create-account:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor.", error: error.message },
      { status: 500 }
    );
  }
};