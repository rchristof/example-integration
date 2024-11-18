// app/api/login/route.ts

import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export const POST = async (request: Request) => {
  try {
    const { email, password } = await request.json();
    console.log('Recebido email e password:', email, password);

    const apikey = process.env.ADMIN_BEARER;

    if (!apikey) {
      console.error('Chave de API não encontrada.');
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
      console.error('Erro na autenticação:', data);
      return NextResponse.json(data, { status: response.status });
    }

    const jwtToken = data.jwtToken;

    if (!jwtToken) {
      console.error('Token de autenticação não recebido.');
      return NextResponse.json({ message: 'Token de autenticação não recebido.' }, { status: 500 });
    }

    // Definir o jwtToken em um cookie HTTP-only
    const cookie = serialize('jwtToken', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 dia em segundos
    });

    const headers = new Headers();
    headers.append('Set-Cookie', cookie);

    return NextResponse.json({ success: true }, { headers });
  } catch (error: any) {
    console.error('Erro na rota /api/login:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
};
