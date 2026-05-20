import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { queryOne } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await queryOne<any>(
          `SELECT * FROM "User" WHERE (username = $1 OR email = $1) AND "deletedAt" IS NULL AND activated = true LIMIT 1`,
          [String(credentials.username)]
        );

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(String(credentials.password), user.password);
        if (!valid) return null;

        await queryOne(
          `UPDATE "User" SET "lastLogin" = NOW(), "updatedAt" = NOW() WHERE id = $1`,
          [user.id]
        );

        return {
          id: String(user.id),
          name: `${user.firstName} ${user.lastName}`,
          email: user.email ?? "",
          username: user.username,
          isSuperUser: user.isSuperUser,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.isSuperUser = (user as any).isSuperUser;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).isSuperUser = token.isSuperUser;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },
});
