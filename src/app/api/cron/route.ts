import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { deletePrivateFile } from "@/lib/storage";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    const expectedSecret = process.env.CRON_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Find applications older than 48 hours that are already decided
    const expiredApps = await prisma.application.findMany({
      where: {
        status: { in: ["ACCEPTED", "REJECTED"] },
        decidedAt: { lte: fortyEightHoursAgo },
      },
      select: {
        id: true,
        screenshotPath: true,
      },
    });

    if (expiredApps.length === 0) {
      return NextResponse.json({ success: true, deletedCount: 0, message: "No expired applications found." });
    }

    // Delete screenshots
    for (const app of expiredApps) {
      if (app.screenshotPath) {
        await deletePrivateFile(app.screenshotPath);
      }
    }

    const idsToDelete = expiredApps.map((app: any) => app.id);

    // Delete from DB
    const deleteResult = await prisma.application.deleteMany({
      where: {
        id: { in: idsToDelete },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
      message: `Successfully cleaned up ${deleteResult.count} expired applications and their screenshots.`,
    });
  } catch (error) {
    console.error("Error in cleanup cron job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
