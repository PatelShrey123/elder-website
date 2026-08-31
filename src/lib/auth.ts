import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { checkGuildMembershipAndRoles } from "./discord";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "identify guilds.members.read",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.userId = account.providerAccountId;
      }
      
      if (token.accessToken && token.userId) {
        try {
          const verifyInfo = await checkGuildMembershipAndRoles(
            token.accessToken as string,
            token.userId as string
          );
          token.inGuild = verifyInfo.inGuild;
          token.isApplicant = verifyInfo.isApplicant;
          token.isOfficer = verifyInfo.isOfficer;
        } catch (e) {
          console.error("Error in NextAuth JWT callback verification:", e);
          token.inGuild = false;
          token.isApplicant = false;
          token.isOfficer = false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).inGuild = token.inGuild;
        (session.user as any).isApplicant = token.isApplicant;
        (session.user as any).isOfficer = token.isOfficer;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
