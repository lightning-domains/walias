import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { pubkey: string } }
) {
  const { pubkey } = params;

  try {
    // Fetch user and include waliases
    const user = await prisma.user.findUnique({
      where: { pubkey: String(pubkey) },
      include: {
        waliases: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          reason: "User not found",
        },
        { status: 404 }
      );
    }

    // Extract names from waliases
    const names = user.waliases.map((walias) => walias.name);
    const relays = JSON.parse(user.relays);

    return NextResponse.json(
      {
        names,
        relays,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        reason: "Internal server error",
      },
      { status: 500 }
    );
  }
}
