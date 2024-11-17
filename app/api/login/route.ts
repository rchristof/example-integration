// app/api/login/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const apikey = process.env.ADMIN_BEARER;
    if (!apikey) {
      return NextResponse.json({ message: 'Chave de API não encontrada.' }, { status: 500 });
    }

    const response = await fetch('https://api.omnistrate.cloud/2022-09-01-00/customer-user-signin', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apikey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Erro na rota /api/login:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}