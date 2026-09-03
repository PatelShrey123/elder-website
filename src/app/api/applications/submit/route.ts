import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { savePrivateFile } from "@/lib/storage";

const PRIMARY_SUBMIT_WEBHOOK = "https://discord.com/api/webhooks/1545038469351473213/6D2N32r-VR2SMFdiUAMEwnX6wUyCP0raDLjDIKeAmQ1SyqMHfUo3bIym341Nk7IoSx2i";
const OFFICER_ROLE_ID = process.env.DISCORD_OFFICER_ROLE_ID || "1369836381647405067";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in via Discord first." }, { status: 401 });
    }

    const user = session.user as any;

    // Monthly rate limit check
    try {
      const monthlyCount = await db.countMonthlyApplications(user.id || "guest");
      if (monthlyCount >= 2) {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const tryAgainDate = nextMonth.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return NextResponse.json({
          error: `Monthly Limit Reached. You can submit at most 2 applications per calendar month. You can apply again on ${tryAgainDate}.`,
        }, { status: 429 });
      }
    } catch (countErr) {
      console.warn("Count check note:", countErr);
    }

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

    // 1. POST Webhook to Discord (Webhook #1 - Ping Officers with embedded proof image & quick action link)
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL || PRIMARY_SUBMIT_WEBHOOK;
    const dashboardUrl = `${process.env.NEXTAUTH_URL || "https://elderapply.vercel.app"}/staff`;

    const embedData = {
      title: "⚔️ New Elder Clan Application",
      description: `A new warrior has submitted their application for the upcoming Clan War.\n\n👉 **[Click Here to Open Officer Panel & Review](${dashboardUrl})**`,
      color: 0x9333ea, // Purple neon
      fields: [
        { name: "👤 Discord Applicant", value: `<@${user.id}> (${user.name})`, inline: true },
        { name: "🎮 Kirka.io User ID", value: `\`${kirkaId}\``, inline: true },
        { name: "⚡ Weekly Score", value: `**${weeklyXp.toLocaleString()} XP**`, inline: true },
        { name: "🛡️ Previous Clan", value: previousClan ? `\`${previousClan}\`` : "*None*", inline: true },
        { name: "❓ Why did they leave?", value: whyLeft || "*N/A*" },
        { name: "🔥 Why they want to join Elder", value: whyJoin },
      ],
      image: {
        url: "attachment://trainer_match_proof.png",
      },
      footer: {
        text: "Elder Recruitment System • Quick Action: Click link above to Accept/Reject",
        icon_url: "https://elderapply.vercel.app/elder-logo.jpg",
      },
      timestamp: new Date().toISOString(),
    };

    const payloadJson = {
      content: `<@&${OFFICER_ROLE_ID}> 🚨 **New Clan Application Received!**`,
      username: "Elder Clan Recruiter",
      avatar_url: "https://elderapply.vercel.app/elder-logo.jpg",
      embeds: [embedData],
    };

    // Attempt 1: Multipart with image attachment
    let webhookSent = false;
    try {
      const webhookFormData = new FormData();
      webhookFormData.append("payload_json", JSON.stringify(payloadJson));
      const uint8 = new Uint8Array(buffer);
      const imgBlob = new Blob([uint8], { type: file.type || "image/png" });
      webhookFormData.append("files[0]", imgBlob, "trainer_match_proof.png");

      const res = await fetch(webhookUrl, {
        method: "POST",
        body: webhookFormData,
      });

      if (res.ok) {
        webhookSent = true;
      } else {
        console.warn("Multipart webhook returned non-ok status:", res.status, await res.text());
      }
    } catch (multipartErr) {
      console.warn("Multipart dispatch notice:", multipartErr);
    }

    // Attempt 2: JSON Fallback (guaranteed delivery if multipart fails)
    if (!webhookSent) {
      try {
        const jsonPayload = {
          content: `<@&${OFFICER_ROLE_ID}> 🚨 **New Clan Application Received!**`,
          username: "Elder Clan Recruiter",
          avatar_url: "https://elderapply.vercel.app/elder-logo.jpg",
          embeds: [
            {
              ...embedData,
              image: undefined, // remove attachment ref in pure JSON
            },
          ],
        };

        await fetch(PRIMARY_SUBMIT_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jsonPayload),
        });
      } catch (jsonErr) {
        console.error("JSON webhook fallback error:", jsonErr);
      }
    }

    // 2. Save Application to DB
    const newApplication = await db.createApplication({
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
    });

    return NextResponse.json({ success: true, application: newApplication });
  } catch (error: any) {
    console.error("Error submitting application:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
