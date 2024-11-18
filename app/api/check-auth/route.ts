// app/api/check-auth/route.ts

import { NextResponse } from 'next/server';
import { csrf } from '@lib/csrf'; // Usando o alias configurado
import { cookies } from 'next/headers';

export const GET = csrf(async (request: Request) => {
  try {
    const jwtToken = cookies().get('jwtToken')?.value;

    if (!jwtToken) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 });
    }

    // Opcional: Validar o jwtToken, por exemplo, verificando sua assinatura ou consultando a API externa

    // Para este exemplo, vamos assumir que se o token está presente, o usuário está autenticado
    return NextResponse.json({ isAuthenticated: true }, { status: 200 });
  } catch (error: any) {
    console.error('Erro na rota /api/check-auth:', error);
    return NextResponse.json({ isAuthenticated: false }, { status: 500 });
  }
});
