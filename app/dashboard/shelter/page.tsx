"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
  Users,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
// import io from "socket.io-client";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { toast } from "sonner";

export default function ShelterDashboard() {
  type Request = {
    _id: string;
    food_type: string;
    request_description: string;
    quantity: number;
    image_url?: string[];
    promised_volunteers: string[];
    fulfilled_volunteers: string[];
    status: string;
    createdAt: string;
  };

  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequests, setSelectedRequests] = useState<Request | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    slidesToScroll: 1,
  });
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return; // Ensure session is available
    async function fetchRequests() {
      setLoading(true);
      try {
        const res = await fetch(`/api/shelter-requests`);
        console.log(res);
        if (!res.ok) {
          toast.error("Failed to fetch donations");
          return;
        }
        const data = await res.json();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching donations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();

    // if (!session?.user) return;

    // // WebSocket connection
    // const socket = io(
    //   process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4200"
    // );

    // socket.emit("register", session.user.id); // Register the user on connection

    // socket.on("donation_created", (newDonation: Post) => {
    //   setPosts((prev) => [newDonation, ...prev]);
    // });

    // socket.on("donation_updated", (updatedDonation: Post) => {
    //   setPosts((prev) =>
    //     prev.map((post) =>
    //       post._id === updatedDonation._id ? updatedDonation : post
    //     )
    //   );
    // });

    // socket.on("donation_removed", ({ donationId }) => {
    //   console.log("Donation removed:", donationId);
    //   setPosts((prev) => prev.filter((post) => post._id !== donationId));
    // });

    // return () => {
    //   socket.disconnect();
    // };
  }, [session]);

  useEffect(() => {
    if (emblaApi && selectedRequests) {
      emblaApi.scrollTo(0);
    }
  }, [emblaApi, selectedRequests]);

  async function handleDelete(requestId: string) {
    try {
      const res = await fetch(`/api/shelter-requests/${requestId}`, {
        method: "DELETE",
      });
      if (!res.ok) toast.error("Failed to delete donation");
      // Remove the deleted donation from UI
      setRequests((prevRequests) =>
        prevRequests.filter((request) => request._id !== requestId)
      );
      toast.success("Request deleted successfully");
      setSelectedRequests(null);
    } catch (error) {
      console.error("Error deleting donation:", error);
    }
  }

  const handleRequestClick = (request: Request) => {
    setSelectedRequests(request);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in_need":
        return "bg-yellow-100 text-yellow-800";
      case "fulfilled":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  function handleComplete(_id: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 p-2 md:p-4 h-[85vh] bg-gray-50 rounded-lg border border-gray-200">
      {/* Mobile header */}
      <div className="block mb-2 lg:hidden">
        <div className="flex items-center justify-between px-2 pt-1">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedRequests ? "Request Details" : "Your Requests"}
          </h2>
          {selectedRequests ? (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setSelectedRequests(null)}
            >
              <ArrowLeft size={16} /> Back
            </Button>
          ) : (
            <div>
              {requests ? (
                <div></div>
              ) : (
                <Button
                  size="sm"
                  className="bg-light-black"
                  onClick={() =>
                    router.push("/dashboard/shelter/create-request")
                  }
                >
                  <Plus size={16} /> Add
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Requests List Panel */}
      <div
        className={`${
          selectedRequests ? "hidden" : "block"
        } lg:block h-full overflow-y-auto bg-white rounded-lg shadow-sm`}
      >
        <div className="items-center justify-between hidden p-4 border-b lg:flex">
          {requests.length !== 0 ? (
            <Button
              className="lg:bg-light-black lg:hover:bg-light-green lg:hover:text-light-black"
              onClick={() => router.push("/dashboard/shelter/create-request")}
            >
              <Plus size={16} /> Add Requests
            </Button>
          ) : (
            <div></div>
          )}
        </div>
        <div></div>
        {loading ? (
          // Loading skeletons
          <div className="p-3 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 p-2">
                <Skeleton className="w-32 h-24 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-24 h-5" />
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-3/4 h-4" />
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
            <p className="mb-4 text-gray-500">
              You haven't created any requests yet.
            </p>
            <Button
              className="lg:bg-light-black lg:hover:bg-light-green lg:hover:text-light-black"
              onClick={() => router.push("/dashboard/shelter/create-request")}
            >
              <Plus size={16} /> Create Your First Request
            </Button>
          </div>
        ) : (
          // Request list
          <div className="flex flex-col">
            {requests.map((request) => (
              <div key={request._id}>
                <Card
                  className={`flex w-full cursor-pointer md:flex-row shadow-none border-none hover:bg-gray-50 transition-colors duration-200 ${
                    selectedRequests?._id === request._id ? "bg-gray-50" : ""
                  }`}
                  onClick={() => handleRequestClick(request)}
                >
                  <CardContent className="flex w-full p-3">
                    <div className="relative h-24 overflow-hidden rounded-md min-w-32">
                      {request.image_url && request.image_url.length > 0 ? (
                        <Image
                          src={request.image_url[0]}
                          fill
                          className="object-cover"
                          alt={`${request.food_type}`}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-200">
                          <span className="text-sm text-gray-400">
                            No image
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between w-full ml-3">
                      <div className="flex items-start justify-between">
                        <Badge
                          className={`px-2 py-1 ${getStatusColor(
                            request.status
                          )}`}
                          variant="outline"
                        >
                          {request.status}
                        </Badge>
                        <span className="flex items-center text-xs text-gray-500">
                          <Calendar size={12} className="mr-1" />
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="font-medium text-gray-800">
                          {request.food_type}
                        </p>
                      </div>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Users size={12} className="mr-1" />
                        {request.promised_volunteers.length} volunteers promised
                        <Users size={12} className="mr-1" />
                        {request.fulfilled_volunteers.length} volunteers
                        fulfilled
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Separator className="my-1" />
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Detail Panel */}
      {selectedRequests ? (
        <div className="col-span-2 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              className="items-center hidden gap-1 lg:flex"
              onClick={() => setSelectedRequests(null)}
            >
              <ArrowLeft size={16} /> Back to List
            </Button>
          </div>

          {/* Image Carousel */}
          {selectedRequests.image_url &&
          selectedRequests.image_url.length > 0 ? (
            <div className="mb-6">
              <div
                className="relative w-full h-64 overflow-hidden rounded-lg md:h-80"
                ref={emblaRef}
              >
                <div className="flex h-full">
                  {selectedRequests.image_url.map((url, index) => (
                    <div
                      key={index}
                      className="relative flex-shrink-0 w-full h-full"
                    >
                      <Link href={url} target="_blank">
                        <Image
                          src={url}
                          className="object-contain"
                          alt={`Request Image ${index + 1}`}
                          fill
                        />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRequests.image_url.length > 1 && (
                <div className="flex justify-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0 rounded-full"
                    onClick={() => emblaApi?.scrollPrev()}
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0 rounded-full"
                    onClick={() => emblaApi?.scrollNext()}
                  >
                    <ChevronRight size={18} />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-64 mb-6 bg-gray-100 rounded-lg">
              <span className="text-gray-400">No images available</span>
            </div>
          )}

          {/* Request Details */}
          <div className="p-4 space-y-3 rounded-lg bg-gray-50">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-medium text-gray-800">
                {selectedRequests.food_type}
              </h3>
              <Badge
                className={`${getStatusColor(selectedRequests.status)}`}
                variant="outline"
              >
                {selectedRequests.status}
              </Badge>
            </div>

            {selectedRequests.request_description && (
              <p className="text-gray-600">
                {selectedRequests.request_description}
              </p>
            )}

            <div className="grid grid-cols-1 gap-3 pt-2 md:grid-cols-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={16} className="mr-2 text-gray-400" />
                <div>
                  <p className="font-medium">Created</p>
                  <p>{formatDate(selectedRequests.createdAt)}</p>
                </div>
              </div>

              {/* <div className="flex items-center text-sm text-gray-600">
                <Calendar size={16} className="mr-2 text-gray-400" />
                <div>
                  <p className="font-medium">Expires</p>
                  <p>{formatDate(selectedRequests.q)}</p>
                </div>
              </div> */}

              <div className="flex items-center text-sm text-gray-600">
                <Tag size={16} className="mr-2 text-gray-400" />
                <div>
                  <p className="font-medium">Type</p>
                  <p>{selectedRequests.food_type}</p>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Users size={16} className="self-start mr-2 text-gray-400" />
                <div>
                  <p className="font-medium">Volunteers</p>
                  <p>{selectedRequests.promised_volunteers.length} promised</p>
                  <p>
                    {selectedRequests.fulfilled_volunteers.length} fulfilled
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mt-6 md:justify-end">
            <Button
              variant="outline"
              className="hover:bg-red-100 hover:text-red-800"
              onClick={() => handleDelete(selectedRequests._id)}
            >
              Delete Request
            </Button>
            {selectedRequests.status !== "completed" && (
              <Button
                className="lg:bg-light-black lg:hover:bg-light-green lg:hover:text-light-black"
                onClick={() => handleComplete(selectedRequests._id)}
              >
                Mark as Fulfilled
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden col-span-2 p-8 bg-white rounded-lg shadow-sm lg:block">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-4 text-gray-400">
              <ChevronLeft size={64} />
            </div>
            <h3 className="mb-2 text-xl font-medium text-gray-700">
              Select a request
            </h3>
            <p className="max-w-md text-gray-500">
              Choose a request from the list to view its details, or create a
              new request.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
