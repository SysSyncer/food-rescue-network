"use client";

import io from "socket.io-client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function VolunteerDashboard() {
  const session = useSession();
  useEffect(() => {
    if (!session) return; // Ensure session is available
    // WebSocket connection
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4200"
    );

    return () => {
      socket.disconnect();
    };
  }, [session]);

  return (
    <>
      <h1>Volunteer Dashboard</h1>
    </>
  );
}
