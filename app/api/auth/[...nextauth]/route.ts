import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectMongo from "@/lib/connectMongo";
import UserCredentials from "@/models/UserCredentials";
import UserDetails from "@/models/UserDetails";
import jwt from "jsonwebtoken"; // ✅ Import JWT

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

        // Find user credentials
        const user = await UserCredentials.findOne({
          email: credentials.email,
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        // Validate password
        const isValid = await user.validatePassword(credentials.password);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        // Ensure UserDetails document exists
        const existingDetails = await UserDetails.findOne({ _id: user._id });
        if (!existingDetails) {
          await UserDetails.create({
            _id: user._id,
            name: "",
            phone: "",
            location: "",
            profileImage: "",
          });
        }

        // ✅ Generate accessToken
        const accessToken = jwt.sign(
          { _id: user._id.toString(), email: user.email, role: user.role },
          process.env.NEXT_PUBLIC_JWT_SECRET!,
          { expiresIn: "1h" }
        );

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          accessToken,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "Vanakkam da mapla",
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.accessToken = user.accessToken; // ✅ Store accessToken in JWT
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        role: token.role as "donor" | "volunteer" | "shelter",
        accessToken: token.accessToken as string, // ✅ Attach accessToken to session
      };
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
