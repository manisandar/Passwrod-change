import corsHeaders from "@/lib/cors";

import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json(
    {
      message: "Logout successful",
    },

    {
      status: 200,

      headers: corsHeaders,
    },
  );

  response.cookies.set("token", "", {
    httpOnly: true,

    sameSite: "lax",

    path: "/",

    maxAge: 0,

    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
