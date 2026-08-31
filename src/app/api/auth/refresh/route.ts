import { NextResponse } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkGuildMembershipAndRoles } from "@/lib/discord";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  const verifyInfo = await checkGuildMembershipAndRoles(
    user.accessToken as string,
    user.id as string
  );

  return NextResponse.json({
    success: true,
    inGuild: verifyInfo.inGuild,
    isApplicant: verifyInfo.isApplicant,
    isOfficer: verifyInfo.isOfficer,
  });
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
