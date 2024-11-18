// app/api/auth/me/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const GET = async () => {
  try {
    const jwtToken = cookies().get('jwtToken')?.value;

    if (!jwtToken) {
      return NextResponse.json({ message: 'Token de autenticação ausente.' }, { status: 401 });
    }

    const secretKey = process.env.JWT_SECRET;

    if (!secretKey) {
      throw new Error("Chave secreta do JWT não definida.");
    }

    const decoded = jwt.verify(jwtToken, secretKey) as { teamId: string };

    const teamId = decoded.teamId;

    if (!teamId) {
      return NextResponse.json({ message: 'ID da equipe não encontrado no token.' }, { status: 400 });
    }

    return NextResponse.json({ teamId }, { status: 200 });
  } catch (error: any) {
    console.error('Erro na rota /api/auth/me:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
};
