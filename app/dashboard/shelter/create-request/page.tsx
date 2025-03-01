"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function CreateRequest() {
  const router = useRouter();

  interface Request {
    food_type: string;
    quantity: number;
    image_url?: string;
  }

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<Request>({
    food_type: "",
    quantity: 1,
    image_url: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Prevent page reload
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/shelter-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create request");

      router.push("/dashboard/shelter");
      toast.success("Shelter request created successfully");
    } catch (error) {
      toast.error(`Error: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file); // Mock URL for preview
      setFormData({ ...formData, image_url: imageUrl });
    }
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.name === "quantity" ? Number(e.target.value) : e.target.value,
    });
  }

  return (
    <div className="max-w-md border border-solid rounded-md px-3 mx-auto">
      <h1 className="text-lg font-semibold my-2">Create Shelter Request</h1>
      <Separator className="mb-3" />
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <Label>Food Type</Label>
          <Input
            name="food_type"
            value={formData.food_type}
            onChange={handleFormChange}
            required
          />
        </div>

        <div>
          <Label>Quantity</Label>
          <Input
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleFormChange}
            required
          />
        </div>

        <div>
          <Label>Image</Label>
          <Input
            name="image_url"
            accept="image/*"
            type="file"
            onChange={handleImageChange}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
}
