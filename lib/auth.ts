import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface User {
    role: "admin";
  }

  interface Session {
    user: {
      id: string;
      role: "admin";
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        password: {
          label: "Password",
          type: "password",
        },
      },
      authorize(credentials) {
        const password = credentials?.password;

        if (
          typeof password === "string" &&
          password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "admin", role: "admin" };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        (token as { role?: "admin" }).role = user.role;
      }

      return token;
    },
    session({ session, token }) {
      const role = (token as { role?: "admin" }).role;

      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub ?? "admin",
          role: role === "admin" ? role : "admin",
        },
      };
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
});

export const { GET, POST } = handlers;
