"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateRequest() {
  const router = useRouter();

  interface Request {
    food_type: string;
    request_description?: string;
    quantity: number;
    image_url: File[];
  }

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<Request>({
    food_type: "",
    request_description: "",
    quantity: 1,
    image_url: [],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Prevent page reload
    setIsSubmitting(true);
    try {
      const imageUrls = await uploadImagesViaAPI(formData.image_url);
      const res = await fetch("/api/shelter-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image_url: imageUrls,
        }),
      });
      console.log(res);
      if (!res.ok) toast.error("Failed to create request");

      toast.success("Shelter request created successfully");
      router.push("/dashboard/shelter");
    } catch (error) {
      toast.error(`Error: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      previewImages.forEach((url) => URL.revokeObjectURL(url));
      setFormData((prev) => ({ ...prev, image_url: files }));
      setPreviewImages(files.map((file) => URL.createObjectURL(file)));
    }
  }

  function handleFormChange(
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const { name, type, value } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value,
    });
  }

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
    <div className="max-w-md px-3 mx-auto border border-solid rounded-md">
      <h1 className="my-2 text-lg font-semibold">Create Shelter Request</h1>
      <Separator className="mb-3" />
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
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
          <Label>Request Description</Label>
          <Textarea
            name="request_description"
            value={formData.request_description}
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
            multiple
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
            variant={"outline"}
            onClick={() => router.push("/dashboard/shelter")}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="lg:bg-light-black lg:hover:bg-light-green lg:hover:text-light-black"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}
