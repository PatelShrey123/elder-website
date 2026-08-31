export interface DiscordMemberInfo {
  inGuild: boolean;
  isApplicant: boolean;
  isOfficer: boolean;
  roles: string[];
}

const GUILD_ID = "1369832704102633554";
const APPLICANT_ROLE_ID = "1501943775021371543";
const OFFICER_ROLE_ID = "1369836381647405067";

export async function checkGuildMembershipAndRoles(
  accessToken: string,
  userId: string
): Promise<DiscordMemberInfo> {
  const result: DiscordMemberInfo = {
    inGuild: false,
    isApplicant: false,
    isOfficer: false,
    roles: [],
  };

  try {
    const userMemberUrl = `https://discord.com/api/v10/users/@me/guilds/${GUILD_ID}/member`;
    const userMemberRes = await fetch(userMemberUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 0 },
    });

    if (userMemberRes.ok) {
      const memberData = await userMemberRes.json();
      result.inGuild = true;
      result.roles = memberData.roles || [];
      result.isOfficer = result.roles.includes(OFFICER_ROLE_ID);
      result.isApplicant = result.roles.includes(APPLICANT_ROLE_ID);
      return result;
    } else {
      console.warn(`Discord member API returned status ${userMemberRes.status} for user ${userId}`);
    }
  } catch (err) {
    console.error("Error verifying via User OAuth2 member endpoint:", err);
  }

  return result;
}

// DM Helper using Bot Token (optional, wrap in try/catch)
export async function sendDiscordDM(userId: string, content: string) {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    console.warn("DISCORD_BOT_TOKEN is not configured. Skipping DM notification.");
    return false;
  }

  try {
    // 1. Create DM channel
    const dmRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
      method: "POST",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipient_id: userId }),
    });

    if (!dmRes.ok) {
      const err = await dmRes.text();
      throw new Error(`Failed to create DM channel: ${err}`);
    }

    const dmChannel = await dmRes.json();

    // 2. Send message
    const msgRes = await fetch(`https://discord.com/api/v10/channels/${dmChannel.id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (!msgRes.ok) {
      const err = await msgRes.text();
      throw new Error(`Failed to send message: ${err}`);
    }

    return true;
  } catch (err) {
    console.error(`Error sending Discord DM to user ${userId}:`, err);
    return false;
  }
}
