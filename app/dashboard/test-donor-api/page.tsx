"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function TestAPIPage() {
  const [donationId, setDonationId] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quantity: "",
    food_type: "",
    pickup_address: "",
    expiry_date: "",
  });

  const [response, setResponse] = useState("");

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle API requests
  const handleRequest = async (method: "POST" | "GET" | "DELETE" | "PATCH") => {
    try {
      let url = "/api/donations";
      let options: RequestInit = {
        method,
        headers: { "Content-Type": "application/json" },
      };

      if (method === "GET" && donationId) {
        url += `/${donationId}`;
      } else if (method === "DELETE" && donationId) {
        url += `/${donationId}`;
      } else if (method === "PATCH" && donationId) {
        url += `/${donationId}`;
        options.body = JSON.stringify(formData);
      } else if (method === "POST") {
        options.body = JSON.stringify(formData);
      }

      const res = await fetch(url, options);
      const data = await res.json();

      if (res.ok) {
        toast.success("Success", {
          description: `Request successful: ${method}`,
        });
        setResponse(JSON.stringify(data, null, 2));
      } else {
        toast.error("Error", { description: data.error || "Request failed" });
        setResponse(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      toast("Error", { description: "An unexpected error occurred" });
    }
  };

  return (
    <div className="p-6">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <h2 className="text-lg font-semibold">Food Donations API Tester</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Donation ID Field */}
          <div>
            <Label htmlFor="donationId">
              Donation ID (for GET, DELETE, PATCH)
            </Label>
            <Input
              id="donationId"
              value={donationId}
              onChange={(e) => setDonationId(e.target.value)}
            />
          </div>

          {/* Form for POST & PATCH */}
          <div className="space-y-3">
            <Label>Donation Details (for POST & PATCH)</Label>
            <Input
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleInputChange}
            />
            <Textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
            />
            <Input
              name="quantity"
              type="number"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={handleInputChange}
            />
            <Input
              name="food_type"
              placeholder="Food Type"
              value={formData.food_type}
              onChange={handleInputChange}
            />
            <Input
              name="pickup_address"
              placeholder="Pickup Address"
              value={formData.pickup_address}
              onChange={handleInputChange}
            />
            <Input
              name="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={handleInputChange}
            />
          </div>

          {/* Buttons for API actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleRequest("POST")}>
              Create Donation (POST)
            </Button>
            <Button onClick={() => handleRequest("GET")}>
              Get All Donations (GET)
            </Button>
            <Button onClick={() => handleRequest("GET")} disabled={!donationId}>
              Get Donation by ID (GET)
            </Button>
            <Button
              onClick={() => handleRequest("PATCH")}
              disabled={!donationId}
            >
              Update Donation (PATCH)
            </Button>
            <Button
              onClick={() => handleRequest("DELETE")}
              disabled={!donationId}
            >
              Delete Donation (DELETE)
            </Button>
          </div>

          {/* Response Output */}
          {response && (
            <div className="p-2 mt-4 overflow-x-scroll text-sm bg-gray-100 rounded">
              <pre>{response}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
