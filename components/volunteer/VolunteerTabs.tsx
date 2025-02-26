"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import AvailableDonors from "./tabs/AvailableDonors";
import AvailableShelters from "./tabs/AvailableShelters";
import ClaimedDonors from "./tabs/ClaimedDonors";
import PromisedShelters from "./tabs/PromisedShelters";

export default function VolunteerTabs() {
  const [selectedTab, setSelectedTab] = useState("available-donors");

  return (
    <Tabs
      defaultValue={selectedTab}
      onValueChange={setSelectedTab}
      className="w-full p-4"
    >
      {/* Tabs Navigation */}
      <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4">
        <TabsTrigger value="available-donors">Available Donors</TabsTrigger>
        <TabsTrigger value="available-shelters">Available Shelters</TabsTrigger>
        <TabsTrigger value="claimed-donors">Claimed Donors</TabsTrigger>
        <TabsTrigger value="promised-shelters">Promised Shelters</TabsTrigger>
      </TabsList>

      {/* Tabs Content */}
      <TabsContent value="available-donors">
        <AvailableDonors />
      </TabsContent>
      <TabsContent value="available-shelters">
        <AvailableShelters />
      </TabsContent>
      <TabsContent value="claimed-donors">
        <ClaimedDonors />
      </TabsContent>
      <TabsContent value="promised-shelters">
        <PromisedShelters />
      </TabsContent>
    </Tabs>
  );
}
