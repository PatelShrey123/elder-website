import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateSignedUrl } from "@/lib/storage";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).isOfficer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const whereClause = status ? { status } : {};

    const applications = await prisma.application.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    // Generate signed URLs for screenshots
    const appsWithSignedUrls = applications.map((app: any) => {
      let screenshotUrl = "";
      try {
        screenshotUrl = generateSignedUrl(app.screenshotPath);
      } catch (err) {
        console.error(`Error generating signed URL for application ${app.id}:`, err);
      }
      return {
        ...app,
        screenshotUrl,
      };
    });

    return NextResponse.json({ success: true, applications: appsWithSignedUrls });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
