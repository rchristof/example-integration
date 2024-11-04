import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userApiKey = process.env.USER_API_KEY; // Recupera a chave armazenada

  if (!userApiKey) {
    return res.status(500).json({ error: 'User API key not found in environment variables' });
  }

  res.status(200).json({ userApiKey });
}
