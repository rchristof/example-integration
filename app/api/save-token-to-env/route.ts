// app/api/save-token-to-env/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { accessToken, variables, projectId, teamId } = await request.json();

    if (!accessToken || !variables || !projectId) {
      return NextResponse.json({ message: 'Parâmetros ausentes.' }, { status: 400 });
    }

    const url = teamId
      ? `https://api.vercel.com/v10/projects/${projectId}/env?teamId=${teamId}`
      : `https://api.vercel.com/v10/projects/${projectId}/env`;

    const responses = await Promise.all(
      variables.map(async (variable: { key: string; value: string }) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: variable.key,
            value: variable.value,
            target: ['production', 'preview', 'development'],
            type: 'encrypted',
          }),
        });
        return res.json();
      })
    );

    return NextResponse.json({ success: true, data: responses }, { status: 200 });
  } catch (error) {
    console.error('Erro na rota /api/save-token-to-env:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
