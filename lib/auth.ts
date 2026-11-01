import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { findOrCreateUser } from "./db/queries";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, profile }) {
      if (profile?.email) {
        const user = await findOrCreateUser({
          email: profile.email as string,
          name: (profile.name as string) ?? null,
          image: (profile.avatar_url as string) ?? null,
        });
        token.userId = user.id;
        token.picture = user.image;
      }
      return token;
    },
    session({ session, token }) {
      if (token.userId) session.user.id = token.userId as string;
      return session;
    },
  },
  pages: { signIn: "/sign-in" },
});
