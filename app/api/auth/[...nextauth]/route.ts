import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectMongo from "@/lib/connectMongo";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        await connectMongo();

        if (!credentials?.email || !credentials.password || !credentials.role) {
          throw new Error("Missing email, password, or role");
        }

        const user = await User.findOne({
          email: credentials.email,
          role: credentials.role,
        });
        if (!user) {
          throw new Error("No user found with this email and role");
        }

        const isValid = await user.validatePassword(credentials.password);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage || "",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.profileImage = user.profileImage;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.sub as string,
        name: token.name as string,
        email: token.email as string,
        role: token.role as "donor" | "volunteer" | "shelter",
        profileImage: token.profileImage as string,
      };
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
