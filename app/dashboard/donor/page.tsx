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
import io from "socket.io-client";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function DonorDashboard() {
  type Post = {
    _id: string;
    food_type: string;
    expiry_date: Date;
    image_url: string[];
    status: string;
    createdAt: string;
    volunteer_pool_size: number;
    description?: string; // Optional field for donation description
  };

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
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

    async function fetchDonations() {
      setLoading(true);
      try {
        const res = await fetch(`/api/donations`);
        if (!res.ok) throw new Error("Failed to fetch donations");

        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching donations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDonations();

    if (!session?.user) return;

    // WebSocket connection
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4200"
    );

    socket.emit("register", session.user.id); // Register the user on connection

    socket.on("donation_created", (newDonation: Post) => {
      setPosts((prev) => [newDonation, ...prev]);
    });

    socket.on("donation_updated", (updatedDonation: Post) => {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === updatedDonation._id ? updatedDonation : post
        )
      );

      // Update selected post if it's the one that was changed
      if (selectedPost?._id === updatedDonation._id) {
        setSelectedPost(updatedDonation);
      }
    });

    socket.on("donation_deleted", (deletedId: string) => {
      setPosts((prev) => prev.filter((post) => post._id !== deletedId));
      if (selectedPost?._id === deletedId) setSelectedPost(null);
    });

    return () => {
      socket.disconnect();
    };
  }, [session]);

  useEffect(() => {
    if (emblaApi && selectedPost) {
      emblaApi.scrollTo(0);
    }
  }, [emblaApi, selectedPost]);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in progress":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
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

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 p-2 md:p-4 h-[85vh] bg-gray-50 rounded-lg border border-gray-200">
      {/* Mobile header */}
      <div className="block lg:hidden mb-2">
        <div className="flex justify-between items-center px-2 pt-1">
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedPost ? "Donation Details" : "Your Donations"}
          </h2>
          {selectedPost ? (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setSelectedPost(null)}
            >
              <ArrowLeft size={16} /> Back
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push("/dashboard/donor/create-donation")}
            >
              <Plus size={16} /> Add
            </Button>
          )}
        </div>
      </div>

      {/* Donation List Panel */}
      <div
        className={`${
          selectedPost ? "hidden" : "block"
        } lg:block h-full overflow-y-auto bg-white rounded-lg shadow-sm`}
      >
        <div className="hidden lg:flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Your Donations
          </h2>
          <Button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push("/dashboard/donor/create-donation")}
          >
            <Plus size={16} /> Add Donation
          </Button>
        </div>

        {loading ? (
          // Loading skeletons
          <div className="p-3 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 p-2">
                <Skeleton className="w-32 h-24 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
            <p className="text-gray-500 mb-4">
              You haven't created any donations yet.
            </p>
            <Button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push("/dashboard/donor/create-donation")}
            >
              <Plus size={16} /> Create Your First Donation
            </Button>
          </div>
        ) : (
          // Donation list
          <div className="flex flex-col">
            {posts.map((post) => (
              <div key={post._id}>
                <Card
                  className={`flex w-full cursor-pointer md:flex-row shadow-none border-none hover:bg-gray-50 transition-colors duration-200 ${
                    selectedPost?._id === post._id ? "bg-gray-50" : ""
                  }`}
                  onClick={() => handlePostClick(post)}
                >
                  <CardContent className="flex p-3 w-full">
                    <div className="relative min-w-32 h-24 rounded-md overflow-hidden">
                      {post.image_url && post.image_url.length > 0 ? (
                        <Image
                          src={post.image_url[0]}
                          fill
                          className="object-cover"
                          alt={`${post.food_type}`}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">
                            No image
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-between ml-3 w-full">
                      <div className="flex justify-between items-start">
                        <Badge
                          className={`px-2 py-1 ${getStatusColor(post.status)}`}
                          variant="outline"
                        >
                          {post.status}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Calendar size={12} className="mr-1" />
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="font-medium text-gray-800">
                          {post.food_type}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <Calendar size={12} className="mr-1" />
                          Expires: {formatDate(post.expiry_date)}
                        </p>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Users size={12} className="mr-1" />
                        {post.volunteer_pool_size} volunteer
                        {post.volunteer_pool_size !== 1 ? "s" : ""}
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
      {selectedPost ? (
        <div className="col-span-2 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Donation Details
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:flex items-center gap-1"
              onClick={() => setSelectedPost(null)}
            >
              <ArrowLeft size={16} /> Back to List
            </Button>
          </div>

          {/* Image Carousel */}
          {selectedPost.image_url && selectedPost.image_url.length > 0 ? (
            <div className="mb-6">
              <div
                className="relative w-full h-64 md:h-80 overflow-hidden rounded-lg"
                ref={emblaRef}
              >
                <div className="flex h-full">
                  {selectedPost.image_url.map((url, index) => (
                    <div
                      key={index}
                      className="relative flex-shrink-0 w-full h-full"
                    >
                      <Link href={url} target="_blank">
                        <Image
                          src={url}
                          className="object-contain"
                          alt={`Donation Image ${index + 1}`}
                          fill
                        />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPost.image_url.length > 1 && (
                <div className="flex justify-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full w-10 h-10 p-0"
                    onClick={() => emblaApi?.scrollPrev()}
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full w-10 h-10 p-0"
                    onClick={() => emblaApi?.scrollNext()}
                  >
                    <ChevronRight size={18} />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg mb-6">
              <span className="text-gray-400">No images available</span>
            </div>
          )}

          {/* Donation Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-800">
                {selectedPost.food_type}
              </h3>
              <Badge
                className={`${getStatusColor(selectedPost.status)}`}
                variant="outline"
              >
                {selectedPost.status}
              </Badge>
            </div>

            {selectedPost.description && (
              <p className="text-gray-600">{selectedPost.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={16} className="mr-2 text-gray-400" />
                <div>
                  <p className="font-medium">Created</p>
                  <p>{formatDate(selectedPost.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={16} className="mr-2 text-gray-400" />
                <div>
                  <p className="font-medium">Expires</p>
                  <p>{formatDate(selectedPost.expiry_date)}</p>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Tag size={16} className="mr-2 text-gray-400" />
                <div>
                  <p className="font-medium">Type</p>
                  <p>{selectedPost.food_type}</p>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Users size={16} className="mr-2 text-gray-400" />
                <div>
                  <p className="font-medium">Volunteer Pool</p>
                  <p>
                    {selectedPost.volunteer_pool_size} volunteer
                    {selectedPost.volunteer_pool_size !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/dashboard/donor/edit-donation/${selectedPost._id}`
                )
              }
            >
              Edit Donation
            </Button>
            {selectedPost.status !== "completed" && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                Mark as Completed
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden lg:block col-span-2 bg-white rounded-lg shadow-sm p-8">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-4 text-gray-400">
              <ChevronLeft size={64} />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              Select a donation
            </h3>
            <p className="text-gray-500 max-w-md">
              Choose a donation from the list to view its details, or create a
              new donation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
