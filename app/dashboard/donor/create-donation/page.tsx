"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function FoodDonationForm() {
  const router = useRouter();

  interface IFormData {
    food_type: string;
    donation_description: string;
    quantity: number;
    expiry_date: Date | null;
    volunteer_pool_size: number;
    pickup_address: string;
    image_url: File[];
  }

  const [formData, setFormData] = useState<IFormData>({
    food_type: "",
    donation_description: "",
    quantity: 0,
    expiry_date: null,
    volunteer_pool_size: 1,
    pickup_address: "",
    image_url: [],
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // Handle date selection
  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, expiry_date: date || null }));
  };

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      previewImages.forEach((url) => URL.revokeObjectURL(url));
      setFormData((prev) => ({ ...prev, image_url: files }));
      setPreviewImages(files.map((file) => URL.createObjectURL(file)));
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.expiry_date) {
      toast.error("Expiry date is required!");
      return;
    }
    setIsSubmitting(true);
    try {
      const imageUrls = await uploadImagesViaAPI(formData.image_url);
      console.log(imageUrls);
      const res = await fetch("/api/donor/donations/donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          food_type: formData.food_type,
          donation_description: formData.donation_description,
          quantity: formData.quantity,
          expiry_date: formData.expiry_date,
          volunteer_pool_size: formData.volunteer_pool_size,
          pickup_address: formData.pickup_address,
          image_url: imageUrls,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to create donation");
        return;
      }

      toast.success("Donation created successfully!");
      router.push("/dashboard/donor");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create donation");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Image upload API
  const uploadImagesViaAPI = async (images: File[]): Promise<string[]> => {
    const formData = new FormData();
    images.forEach((image) => formData.append("images", image));

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Image upload failed");

    const data = await res.json();
    return data.imageUrls;
  };

  return (
    <div className="max-w-lg p-4 mx-auto mb-16 border border-solid rounded-md">
      <h1 className="mb-4 text-2xl font-bold">Create Food Donation</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Food Type</Label>
          <Input
            name="food_type"
            value={formData.food_type}
            onChange={handleInputChange}
            placeholder="e.g., Fresh Vegetables, Canned Soup"
            required
          />
        </div>

        <div>
          <Label>Donation Description</Label>
          <Textarea
            name="donation_description"
            value={formData.donation_description}
            onChange={handleInputChange}
            placeholder="donation description"
            required
          />
        </div>

        <div>
          <Label>Quantity</Label>
          <Input
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleInputChange}
            placeholder="e.g., 10 (kg) or 5 (packs)"
            required
          />
        </div>

        <div>
          <Label>Expiry Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-between w-full px-4 py-2"
              >
                {formData.expiry_date
                  ? format(formData.expiry_date, "PPP")
                  : "Select a date"}
                <CalendarIcon className="w-4 h-4 ml-auto" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.expiry_date || undefined}
                onSelect={handleDateChange}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Volunteer Pool Size</Label>
          <Input
            name="volunteer_pool_size"
            type="number"
            min="1"
            value={formData.volunteer_pool_size}
            onChange={handleInputChange}
            placeholder="e.g., 3 (number of volunteers needed)"
            required
          />
        </div>

        <div>
          <Label>Pickup Address</Label>
          <Input
            name="pickup_address"
            value={formData.pickup_address}
            onChange={handleInputChange}
            placeholder="e.g., 123 Main Street, City, ZIP"
            required
          />
        </div>

        <div>
          <Label>Images</Label>
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {previewImages.map((src, idx) => (
            <Card key={idx} className="w-full shadow-none">
              <CardContent className="p-1 rounded-md">
                <img
                  src={src}
                  alt={`Preview ${idx}`}
                  className="object-cover w-full h-24 rounded-md"
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/donor")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="lg:bg-light-black lg:hover:bg-light-green lg:hover:text-light-black"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Donation"}
          </Button>
        </div>
      </form>
    </div>
  );
}
