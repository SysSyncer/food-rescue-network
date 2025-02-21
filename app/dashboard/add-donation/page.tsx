"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export default function AddDonationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quantity: "",
    food_type: "",
    pickup_address: "",
    expiry_date: "",
  });
  const [images, setImages] = useState<File[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files)); // Store the selected images
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Step 1: Upload images to Cloudinary
      const imageUrls: string[] = [];
      for (const image of images) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
        );

        const response = await fetch(
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL!,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();
        imageUrls.push(data.secure_url); // Collect the uploaded image URL
      }

      // Step 2: Add image URLs to form data
      const donationData = { ...formData, images: imageUrls };

      // Step 3: Send donation data to API
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donationData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Donation created successfully!",
        });
        router.push("/dashboard");
      } else {
        toast({ title: "Error", description: "Failed to create donation" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred" });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <h2 className="text-lg font-semibold">Add New Donation</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="food_type">Food Type</Label>
            <Input
              id="food_type"
              name="food_type"
              value={formData.food_type}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="pickup_address">Pickup Address</Label>
            <Input
              id="pickup_address"
              name="pickup_address"
              value={formData.pickup_address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="expiry_date">Expiry Date</Label>
            <Input
              id="expiry_date"
              name="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="images">Upload Images</Label>
            <Input
              id="images"
              name="images"
              type="file"
              multiple
              onChange={handleImageChange}
            />
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </CardContent>
    </Card>
  );
}
