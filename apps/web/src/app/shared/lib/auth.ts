import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { UserRole } from "@dobrokot/shared";
import type { JWT } from "next-auth/jwt";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          return null;
        }

        return {
          id: json.data.user.id,
          email: json.data.user.email,
          name: json.data.user.name,
          role: json.data.user.role,
          accessToken: json.data.accessToken,
          refreshToken: json.data.refreshToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    accessToken?: string;
    refreshToken?: string;
  }
}
