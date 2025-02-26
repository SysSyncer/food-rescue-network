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
      },
      async authorize(credentials) {
        await connectMongo();

        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing email or password");
        }

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("No user found with this email");
        }

        console.log("Entered password for verification:", credentials.password);
        console.log("Stored hashed password:", user.password);

        // ✅ Use the model's validatePassword() method
        const isValid = await user.validatePassword(credentials.password);
        console.log("Password verification result:", isValid);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          location: user.location,
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
        token.email = user.email;
        token.role = user.role;
        token.phone = user.phone;
        token.location = user.location;
        token.profileImage = user.profileImage; // Include profile image
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.sub as string,
        name: token.name as string,
        email: token.email as string,
        role: token.role as "donor" | "volunteer" | "shelter",
        phone: token.phone as string, // Add phone
        location: token.location as string, // Add location
        profileImage: token.profileImage as string, // Add profile image
      };
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
