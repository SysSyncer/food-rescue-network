import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: "donor" | "volunteer" | "shelter";
      accessToken: string; // ✅ Added accessToken
    };
  }

  interface User {
    id: string;
    email: string;
    role: "donor" | "volunteer" | "shelter";
    accessToken: string; // ✅ Added accessToken
  }
}
