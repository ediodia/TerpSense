import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const MICROSOFT_TENANT_ID = process.env.MICROSOFT_TENANT_ID ?? "common";

interface BackendAuthResponse {
  user_id: string;
  email: string;
  name: string;
  token: string;
}

async function backendPost<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    MicrosoftEntraID({
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      issuer: `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/v2.0`,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const result = await backendPost<BackendAuthResponse>("/auth/verify-password", {
          email: credentials.email,
          password: credentials.password,
        });
        if (!result) return null;

        return {
          id: result.user_id,
          email: result.email,
          name: result.name,
          backendToken: result.token,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Credentials already verified against the backend in `authorize`.
      if (account?.provider === "credentials") return true;

      // Google/Microsoft: get-or-create the matching backend user so
      // financial data has somewhere real to live, then stash the backend
      // token on the user object so the jwt callback can pick it up below.
      if (!user.email) return false;
      const result = await backendPost<BackendAuthResponse>("/auth/oauth-upsert", {
        email: user.email,
        name: user.name ?? user.email,
        provider: account?.provider ?? "oauth",
      });
      if (!result) return false;

      user.id = result.user_id;
      (user as { backendToken?: string }).backendToken = result.token;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.backendToken = (user as { backendToken?: string }).backendToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
      }
      session.backendToken = token.backendToken as string;
      return session;
    },
  },
});
