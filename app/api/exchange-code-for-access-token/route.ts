// app/api/exchange-code-for-access-token/route.ts
import { NextResponse } from "next/server";
import qs from "querystring";

export const POST = async (request: Request) => {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ message: "Missing authorization code, restart the installation." }, { status: 400 });
    }

    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const host = process.env.HOST;

    if (!clientId || !clientSecret || !host) {
      return NextResponse.json({ message: "Missing environment variables." }, { status: 500 });
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
        { message: body.error_description || "Error when exchanging code for token, restart the installation." },
        { status: response.status }
      );
    }

    const { access_token: accessToken, team_id: teamId } = body;

    return NextResponse.json({
      success: true,
      // message: "Successfully generated token.",
      accessToken,
      teamId,
    });
  } catch (error) {
    console.error("Error when exchanging code for token:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
};

