import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "~/server/db";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const credentials = raw as unknown as { email?: unknown; password?: unknown } | null;
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;
        if (user.status === "banned") return null;

        const valid = await compare(password, user.passwordHash);
        if (!valid) return null;

        await db.user.update({
          where: { id: user.id },
          data: { lastActive: new Date().toISOString() },
        }).catch(() => undefined);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          city: user.city,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" as const },
  pages: { signIn: "/auth" },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id ?? token.sub;
        token.role = user.role ?? "user";
        token.city = user.city;
      }
      if (token.email) {
        const dbUser = await db.user
          .findUnique({ where: { email: token.email as string }, select: { id: true, role: true, status: true } })
          .catch(() => null);
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          if (dbUser.status === "banned") return { ...token, error: "BANNED" };
        }
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (token) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.role = (token.role as string) ?? "user";
        session.user.city = token.city as string | undefined;
      }
      return session;
    },
  },
};
