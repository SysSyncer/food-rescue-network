import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "donor" | "volunteer" | "shelter";
      phone?: string;
      location?: string;
      profileImage?: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: "donor" | "volunteer" | "shelter";
    phone?: string;
    location?: string;
    profileImage?: string;
  }
}
