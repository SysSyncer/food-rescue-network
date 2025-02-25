import VolunteerNavbar from "@/components/volunteer/VolunteerNavbar";
import VolunteerTabs from "@/components/volunteer/VolunteerTabs";

export default function VolunteerDashboard() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Top Navbar */}
      <VolunteerNavbar />

      {/* Tabs Section */}
      <div className="container mx-auto">
        <VolunteerTabs />
      </div>
    </div>
  );
}
