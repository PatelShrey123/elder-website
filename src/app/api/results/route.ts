import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const decidedApplications = await prisma.application.findMany({
      where: {
        status: { in: ["ACCEPTED", "REJECTED"] },
      },
      select: {
        id: true,
        discordUsername: true,
        discordAvatar: true,
        kirkaId: true,
        status: true,
        decisionReason: true,
        decidedAt: true,
      },
      orderBy: { decidedAt: "desc" },
    });

    return NextResponse.json({ success: true, results: decidedApplications });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
