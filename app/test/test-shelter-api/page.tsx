"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface ShelterRequest {
  _id: string;
  donation_id: string;
  status: "pending" | "approved" | "rejected" | "fulfilled";
}

export default function TestShelterAPI() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<ShelterRequest[]>([]); // ✅ Correct Type

  const fetchRequests = async () => {
    if (!session?.user?.id) {
      toast.error("You must be logged in as a shelter");
      return;
    }

    try {
      const response = await fetch(
        `/api/requests?shelter_id=${session.user.id}`
      );
      const data: ShelterRequest[] = await response.json(); // ✅ Enforce Type

      if (response.ok) {
        setRequests(data);
        toast.success("Fetched requests successfully");
      } else {
        toast.error("Failed to fetch requests");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="max-w-md p-6 mx-auto mt-10 border rounded-lg shadow-md">
      <h1 className="mb-4 text-xl font-semibold">Test Shelter API</h1>

      <Button onClick={fetchRequests}>Fetch My Requests</Button>

      <ul className="mt-4">
        {requests.length > 0 ? (
          requests.map((req) => (
            <li key={req._id} className="py-2 border-b">
              <p>Donation ID: {req.donation_id}</p>
              <p>Status: {req.status}</p>
            </li>
          ))
        ) : (
          <p className="mt-2 text-gray-500">No requests found.</p>
        )}
      </ul>
    </div>
  );
}
