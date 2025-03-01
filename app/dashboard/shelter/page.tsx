import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

export default function ShelterDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [shelterRequests, setShelterRequests] = useState<ShelterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  interface ShelterRequest {
    _id: string;
    food_type: string;
    quantity: number;
    status: "in_need" | "fulfilled" | "cancelled";
    promised_volunteers: string[];
    fulfilled_volunteers: string[];
  }

  useEffect(() => {
    if (!session || session.user.role !== "shelter") {
      router.push("/");
      return;
    }

    fetchRequests();

    const socket = io();
    socket.on("shelter_request_updated", (updatedRequest) => {
      setShelterRequests((prev) =>
        prev.map((req) =>
          req._id === updatedRequest._id ? updatedRequest : req
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [session]);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/shelter-requests");
      const data = await res.json();
      setShelterRequests(data);
    } catch (error) {
      console.error("Error fetching shelter requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    // Implementation for creating a new request
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      await fetch(`/api/shelter-requests/${id}`, { method: "DELETE" });
      setShelterRequests((prev) => prev.filter((req) => req._id !== id));
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Shelter Dashboard</h1>
      <Button onClick={handleCreateRequest}>Create Request</Button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shelterRequests.map((request) => (
            <Card key={request._id}>
              <CardHeader>
                <CardTitle>{request.food_type}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Quantity: {request.quantity}</p>
                <p>Status: {request.status}</p>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteRequest(request._id)}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
