// app/api/subscriptions/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const GET = async (request: Request) => {
  try {
    const jwtToken = cookies().get('jwtToken')?.value;

    if (!jwtToken) {
      return NextResponse.json({ message: 'Token de autenticação ausente.' }, { status: 401 });
    }

    const response = await fetch('https://api.omnistrate.cloud/2022-09-01-00/subscription', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Erro na rota /api/subscriptions:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const jwtToken = cookies().get('jwtToken')?.value;

    if (!jwtToken) {
      return NextResponse.json({ message: 'Token de autenticação ausente.' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch('https://api.omnistrate.cloud/2022-09-01-00/subscription', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.text();

    return new Response(data, { status: response.status });
  } catch (error) {
    console.error('Erro na rota /api/subscriptions:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
};

// export const DELETE = async (request: Request) => {
//   try {
//     const jwtToken = cookies().get('jwtToken')?.value;

//     if (!jwtToken) {
//       return NextResponse.json({ message: 'Token de autenticação ausente.' }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const subscriptionId = searchParams.get('subscriptionId');

//     if (!subscriptionId) {
//       return NextResponse.json({ message: 'ID da assinatura ausente.' }, { status: 400 });
//     }

//     const response = await fetch(`https://api.omnistrate.cloud/2022-09-01-00/subscription/${subscriptionId}`, {
//       method: 'DELETE',
//       headers: {
//         Authorization: `Bearer ${jwtToken}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     const data = await response.text();

//     return new Response(data, { status: response.status });
//   } catch (error) {
//     console.error('Erro na rota /api/subscriptions:', error);
//     return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
//   }
// };
