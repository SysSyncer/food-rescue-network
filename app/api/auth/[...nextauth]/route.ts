import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectMongo from "@/lib/connectMongo";
import User from "@/models/UserModel";

// Define authOptions and export it
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectMongo();

        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing email or password");
        }

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("No user found");
        }

        const isValid = await user.validatePassword(credentials.password);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.NEXT_PUBLIC_JWT_SECRET || "helloworld",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.sub as string,
        email: token.email as string,
        role: token.role as "donor" | "volunteer" | "shelter",
      };
      return session;
    },
  },
};

// Export the handler for NextAuth
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };