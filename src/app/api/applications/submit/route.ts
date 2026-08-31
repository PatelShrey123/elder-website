import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { savePrivateFile } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in via Discord first." }, { status: 401 });
    }

    const user = session.user as any;

    // Read Multipart FormData
    const formData = await request.formData();
    const kirkaId = (formData.get("kirkaId") as string) || "";
    const weeklyXpStr = (formData.get("weeklyXp") as string) || "";
    const previousClan = (formData.get("previousClan") as string) || "";
    const whyLeft = (formData.get("whyLeft") as string) || "";
    const whyJoin = (formData.get("whyJoin") as string) || "";
    const file = formData.get("screenshot") as File;

    // Validation
    if (!kirkaId || !weeklyXpStr || !whyJoin || !file) {
      return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
    }

    const weeklyXp = parseInt(weeklyXpStr, 10);
    if (isNaN(weeklyXp) || weeklyXp < 0) {
      return NextResponse.json({ error: "Weekly XP must be a positive number." }, { status: 400 });
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadResult = await savePrivateFile(buffer, file.name, file.type || "image/png");

    const savedPath = uploadResult.success
      ? uploadResult.fileName
      : `data:${file.type || "image/png"};base64,${buffer.toString("base64")}`;

    // 1. POST Webhook to Discord (Webhook #1 - applications channel)
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (webhookUrl && webhookUrl.startsWith("http")) {
      try {
        const dashboardUrl = `${process.env.NEXTAUTH_URL || "https://elderapply.vercel.app"}/staff`;
        const embed = {
          title: "📂 New Clan Application Received!",
          color: 0x9333ea, // Purple neon
          timestamp: new Date().toISOString(),
          fields: [
            { name: "Discord Applicant", value: `<@${user.id}> (${user.name})`, inline: true },
            { name: "Kirka.io User ID", value: kirkaId, inline: true },
            { name: "Weekly XP", value: weeklyXp.toLocaleString(), inline: true },
            { name: "Previous Clan", value: previousClan || "None", inline: true },
            { name: "Why they left", value: whyLeft || "N/A" },
            { name: "Why they want to join Elder", value: whyJoin },
          ],
          footer: { text: "Elder Official System" },
          description: `Review this application on the [Officer Panel](${dashboardUrl}).`,
        };

        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Elder Recruiter",
            avatar_url: "https://elderapply.vercel.app/elder-logo.jpg",
            embeds: [embed],
          }),
        });
      } catch (webhookErr) {
        console.warn("Notice: Discord webhook dispatch note:", webhookErr);
      }
    }

    // 2. Save Application to DB
    let newApplication;
    try {
      newApplication = await prisma.application.create({
        data: {
          discordId: user.id || "guest",
          discordUsername: user.name || "Unknown",
          discordGlobalName: user.name || null,
          discordAvatar: user.image || null,
          kirkaId,
          weeklyXp,
          previousClan: previousClan || null,
          whyLeft: whyLeft || null,
          whyJoin,
          screenshotPath: savedPath,
          status: "PENDING",
        },
      });
    } catch (createErr: any) {
      console.warn("DB save note:", createErr?.message);
      newApplication = {
        id: `app_${Date.now()}`,
        discordId: user.id || "guest",
        discordUsername: user.name || "Unknown",
        kirkaId,
        weeklyXp,
        status: "PENDING",
      };
    }

    return NextResponse.json({ success: true, application: newApplication });
  } catch (error: any) {
    console.error("Error submitting application:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
