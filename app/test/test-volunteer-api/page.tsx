"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import StatusUpdateDialog from "@/components/StatusUpdateDialog";
import ConfirmDialog from "@/components/ConfirmDialog";

// Define the structure of a donation
type Donation = {
  _id: string;
  title: string;
  status: string;
  confirmedBy?: string; // Optional field to track who confirmed delivery
};

type ClaimedDonation = {
  _id: string;
  donation_id: Donation;
};

export default function TestVolunteerAPI() {
  const { data: session } = useSession();
  const [volunteerId, setVolunteerId] = useState<string>(
    session?.user.id || ""
  );
  const [donationId, setDonationId] = useState<string>("");
  const [availableDonations, setAvailableDonations] = useState<Donation[]>([]);
  const [claimedDonations, setClaimedDonations] = useState<ClaimedDonation[]>(
    []
  );

  useEffect(() => {
    if (session?.user?.role === "volunteer") {
      setVolunteerId(session.user.id);
    }
  }, [session]);

  // WebSocket Connection
  useEffect(() => {
    const socket = io("http://localhost:4200");

    socket.on(
      "donationStatusUpdated",
      ({ donationId, status, confirmedBy }) => {
        setClaimedDonations((prev) =>
          prev.map((donation) =>
            donation.donation_id._id === donationId
              ? {
                  ...donation,
                  donation_id: { ...donation.donation_id, status, confirmedBy },
                }
              : donation
          )
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch available donations
  const fetchAvailableDonations = async () => {
    try {
      const response = await fetch("/api/donations/available");
      const data: Donation[] = await response.json();
      setAvailableDonations(data);
    } catch (error) {
      console.error("Error fetching available donations:", error);
    }
  };

  // Fetch claimed donations
  const fetchClaimedDonations = async () => {
    if (!volunteerId) {
      alert("Please enter a Volunteer ID.");
      return;
    }

    try {
      const response = await fetch(
        `/api/volunteers?volunteer_id=${volunteerId}`
      );
      if (!response.ok) throw new Error("Failed to fetch claimed donations");
      const data: ClaimedDonation[] = await response.json();
      setClaimedDonations(data);
    } catch (error) {
      console.error("Error fetching claimed donations:", error);
    }
  };

  // Claim a donation
  const claimDonation = async () => {
    if (!volunteerId || !donationId) {
      alert("Please enter both Volunteer ID and Donation ID.");
      return;
    }

    try {
      const response = await fetch("/api/volunteers/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteer_id: volunteerId,
          donation_id: donationId,
        }),
      });
      if (!response.ok) throw new Error("Failed to claim donation");

      alert("Donation claimed successfully!");
      fetchAvailableDonations();
      fetchClaimedDonations();
    } catch (error) {
      console.error("Error claiming donation:", error);
    }
  };

  // Update donation status
  const updateDonationStatus = async (
    donationId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(`/api/donations/${donationId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          user: session?.user.id, // Track who updated it
        }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      alert(`Donation marked as ${newStatus}`);
      fetchClaimedDonations();
    } catch (error) {
      console.error("Error updating donation status:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-center">
            Test Volunteer API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Available Donations */}
          <Button onClick={fetchAvailableDonations} className="w-full">
            Get Available Donations
          </Button>
          <ul className="space-y-2">
            {availableDonations.map((donation) => (
              <li key={donation._id}>
                <Button
                  variant="outline"
                  className="flex justify-between w-full p-2"
                  onClick={() => setDonationId(donation._id)}
                >
                  {donation.title}
                  <span className="text-gray-600">{donation.status}</span>
                </Button>
              </li>
            ))}
          </ul>

          <Separator />

          {/* Claim Donation */}
          <h2 className="text-lg font-semibold">Claim a Donation</h2>
          <Input
            type="text"
            placeholder="Volunteer ID"
            value={volunteerId}
            onChange={(e) => setVolunteerId(e.target.value)}
            disabled={session?.user?.role === "volunteer"}
          />
          <Input
            type="text"
            placeholder="Donation ID"
            value={donationId}
            onChange={(e) => setDonationId(e.target.value)}
          />
          <ConfirmDialog
            action={claimDonation}
            buttonLabel="Claim Donation"
            title="Confirm Claim"
            description="Are you sure you want to claim this donation? This action cannot be undone."
            disabled={!volunteerId || !donationId} // Disable if inputs are empty
          />

          <Separator />
          {/* Claimed Donations */}
          <Button onClick={fetchClaimedDonations} className="w-full">
            Get Claimed Donations
          </Button>
          <ul className="space-y-2">
            {claimedDonations.map((donation) => (
              <li key={donation._id} className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold">
                  {donation.donation_id.title}
                </h3>
                <p>
                  <strong>Status:</strong> {donation.donation_id.status}
                </p>
                <p>
                  <strong>Confirmed By:</strong>{" "}
                  {donation.donation_id.confirmedBy || "Not Confirmed"}
                </p>

                {/* Status Update Buttons with Confirmation */}
                <div className="flex mt-2 space-x-2">
                  {donation.donation_id.status === "claimed" && (
                    <StatusUpdateDialog
                      donationId={donation.donation_id._id}
                      newStatus="in transit"
                      updateDonationStatus={updateDonationStatus}
                    />
                  )}
                  {donation.donation_id.status === "in transit" && (
                    <StatusUpdateDialog
                      donationId={donation.donation_id._id}
                      newStatus="delivered"
                      updateDonationStatus={updateDonationStatus}
                    />
                  )}
                  {donation.donation_id.status === "delivered" && (
                    <StatusUpdateDialog
                      donationId={donation.donation_id._id}
                      newStatus="confirmed"
                      updateDonationStatus={updateDonationStatus}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
