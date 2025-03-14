// pages/dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock, CheckCircle, Loader2, Package, X } from "lucide-react";

// ShadCN components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Donation, Claim } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const VolunteerDashboardPage = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(
    null
  );
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("available");
  const router = useRouter();

  // Fetch available donations and claims
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // const [donationsRes, claimsRes] = await Promise.all([
        //   fetch("/api/volunteer/donations"),
        //   fetch("/api/volunteer/claims"),
        // ]);
        const donationsRes = await fetch("/api/volunteer/donations");
        const claimsRes = await fetch("/api/volunteer/claims");
        console.log("This is donationRes", donationsRes);
        if (!donationsRes.ok || !claimsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [donationsData, claimsData] = await Promise.all([
          donationsRes.json(),
          claimsRes.json(),
        ]);

        setDonations(donationsData);
        setClaims(claimsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Claim a donation
  const handleClaimDonation = async (donationId: string) => {
    try {
      const response = await fetch("/api/volunteer/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ donationId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to claim donation");
      }

      toast.success("Donation claimed successfully");
      setOpenDialog(false);

      // Refetch data to update the UI
      const [donationsRes, claimsRes] = await Promise.all([
        fetch("/api/volunteer/donations"),
        fetch("/api/volunteer/claims"),
      ]);

      const [donationsData, claimsData] = await Promise.all([
        donationsRes.json(),
        claimsRes.json(),
      ]);

      setDonations(donationsData);
      setClaims(claimsData);
      setActiveTab("claimed");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Unclaim a donation
  const handleUnclaimDonation = async (claimId: string) => {
    try {
      const response = await fetch(
        `/api/volunteer/unclaim?claimId=${claimId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to unclaim donation");
      }

      toast.success("Donation unclaimed successfully");

      // Update claims list
      setClaims((prevClaims) =>
        prevClaims.filter((claim) => claim._id !== claimId)
      );

      // Refetch available donations
      const donationsRes = await fetch("/api/volunteer/donations");
      const donationsData = await donationsRes.json();
      setDonations(donationsData);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Fulfill a claim
  const handleFulfillClaim = async (claimId: string) => {
    try {
      const response = await fetch(
        `/api/volunteer/fulfill?claimId=${claimId}`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to mark donation as fulfilled");
      }

      toast.success("Donation marked as fulfilled");

      // Update the claims list
      const claimsRes = await fetch("/api/volunteer/claims");
      const claimsData = await claimsRes.json();
      setClaims(claimsData);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "claimed":
        return "bg-blue-100 text-blue-800";
      case "promised":
        return "bg-purple-100 text-purple-800";
      case "donated":
      case "fulfilled":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-500 duration-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex justify-content h-[85vh] bg-gray-50 border border-solid rounded-lg">
      <div className="container px-2 py-8 mx-auto">
        <header className="mb-8">
          {/* <h1 className="text-3xl font-bold">Volunteer Dashboard</h1> */}
          <p className="mt-2 text-gray-500">
            View available donations, manage your claims, and track your
            contributions
          </p>
        </header>
        <Tabs
          defaultValue="available"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 md:w-1/2">
            <TabsTrigger value="available">Available Donations</TabsTrigger>
            <TabsTrigger value="claimed">My Claims</TabsTrigger>
          </TabsList>
          <TabsContent value="available" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {donations.length > 0 ? (
                donations.map((donation) => (
                  <Card
                    key={donation._id}
                    className="overflow-hidden shadow-none"
                  >
                    <div className="h-48 overflow-hidden bg-gray-100">
                      {donation.image_url && donation.image_url.length > 0 ? (
                        <img
                          src={donation.image_url[0]}
                          alt={donation.food_type}
                          className="object-cover w-full h-full p-3"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle>{donation.food_type}</CardTitle>
                        <Badge className={getStatusColor(donation.status)}>
                          {donation.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        {donation.donation_description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <CalendarClock className="w-4 h-4 mr-2 text-gray-500" />
                          <span>
                            Expires: {formatDate(donation.expiry_date)}
                            <span className="ml-1 font-medium">
                              ({getDaysUntilExpiry(donation.expiry_date)} days
                              left)
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium">Quantity:</span>
                          <span className="ml-1">
                            {donation.quantity} items
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium">Volunteers:</span>
                          <span className="ml-1">
                            {donation.claimed_volunteers_count}/
                            {donation.volunteer_pool_size}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Dialog
                        open={
                          openDialog && selectedDonation?._id === donation._id
                        }
                        onOpenChange={(open) => {
                          setOpenDialog(open);
                          if (!open) setSelectedDonation(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedDonation(donation);
                              setOpenDialog(true);
                            }}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>{donation.food_type}</DialogTitle>
                            <DialogDescription>
                              {donation.donation_description}
                            </DialogDescription>
                          </DialogHeader>
                          {/* <div className="py-4 space-y-4">
                            <div className="space-y-2">
                              <p className="font-medium">Pickup Address:</p>
                              <p className="text-sm text-gray-600">
                                {donation.pickup_address}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1">
                                <p className="font-medium">Donor:</p>
                                <div className="flex items-center mt-1 space-x-2">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback>
                                      {donation.donor.name.charAt(0) || "User"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">
                                    {donation.donor.name}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">Expiry:</p>
                                <p className="text-sm">
                                  {formatDate(donation.expiry_date)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1">
                                <p className="font-medium">Quantity:</p>
                                <p className="text-sm">
                                  {donation.quantity} items
                                </p>
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">Volunteers:</p>
                                <p className="text-sm">
                                  {donation.claimed_volunteers_count}/
                                  {donation.volunteer_pool_size}
                                </p>
                              </div>
                            </div>
                          </div> */}
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setOpenDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleClaimDonation(donation._id)}
                            >
                              Claim Donation
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button onClick={() => handleClaimDonation(donation._id)}>
                        Claim
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 col-span-full">
                  <Package className="w-16 h-16 mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium text-gray-900">
                    No available donations
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Check back later for new donation opportunities
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="claimed" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {claims.length > 0 ? (
                claims.map((claim) => (
                  <Card key={claim._id} className="overflow-hidden">
                    <div className="h-48 overflow-hidden bg-gray-100">
                      {claim.donation.image_url &&
                      claim.donation.image_url.length > 0 ? (
                        <img
                          src={claim.donation.image_url[0]}
                          alt={claim.donation.food_type}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle>{claim.donation.food_type}</CardTitle>
                        <div className="space-x-1">
                          <Badge
                            className={getStatusColor(
                              claim.donor_request_status
                            )}
                          >
                            Donor: {claim.donor_request_status}
                          </Badge>
                          <Badge
                            className={getStatusColor(
                              claim.shelter_request_status
                            )}
                          >
                            Shelter: {claim.shelter_request_status}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>
                        {claim.donation.donation_description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <CalendarClock className="w-4 h-4 mr-2 text-gray-500" />
                          <span>
                            Expires: {formatDate(claim.donation.expiry_date)}
                            <span className="ml-1 font-medium">
                              ({getDaysUntilExpiry(claim.donation.expiry_date)}{" "}
                              days left)
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium">Pickup Address:</span>
                          <span className="ml-1 truncate">
                            {claim.donation.pickup_address}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium">Claimed on:</span>
                          <span className="ml-1">
                            {formatDate(claim.createdAt)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => handleUnclaimDonation(claim._id)}
                        className="flex items-center"
                      >
                        <X className="w-4 h-4 mr-1" /> Unclaim
                      </Button>
                      <Button
                        onClick={() => handleFulfillClaim(claim._id)}
                        disabled={claim.shelter_request_status === "fulfilled"}
                        className="flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {claim.shelter_request_status === "fulfilled"
                          ? "Fulfilled"
                          : "Mark as Fulfilled"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 col-span-full">
                  <Package className="w-16 h-16 mb-4 text-gray-300" />
                  <h3 className="text-xl font-medium text-gray-900">
                    No claimed donations
                  </h3>
                  <p className="mt-2 text-gray-500">
                    Head over to Available Donations to start claiming
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab("available")}
                  >
                    View Available Donations
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VolunteerDashboardPage;
