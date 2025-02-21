Yes, we can start building this project step by step! We already have a clear project overview, so here’s how we can break it down:

Step-by-Step Development Plan

1. Set Up Project Structure
   • Create a Next.js project with TypeScript enabled.
   • Install necessary dependencies (mongoose, next-auth, bcrypt, jsonwebtoken, and shadcn/ui).
2. Database Configuration
   • Set up MongoDB connection (can reuse your connectMongo function).
   • Create the four MongoDB models (User, FoodDonation, Request, Volunteer).
3. Authentication
   • Configure NextAuth with a credentials provider.
   • Implement sign-up and sign-in pages for user roles (donor, volunteer, shelter).
   • Add role-based JWTs.
4. Role-Based Access Control
   • Add middleware for role-based route protection.
   • Ensure that certain actions are accessible only to specific roles (e.g., shelters can request food, volunteers can claim donations).
5. Food Donation Management
   • Implement a form for donors to create food donation entries.
   • Allow shelters to request food from the available donations.
   • Track the status of each donation (available, claimed, delivered).
6. Volunteer Management
   • Allow volunteers to register their availability and transportation info.
   • Match volunteers to claimed donations for pickup and delivery.
7. Request Management
   • Allow shelters to view, create, and fulfill requests.
   • Implement a matching process for donations and requests.
8. User Dashboard
   • Create role-specific dashboards for donors, volunteers, and shelters.
   • Show relevant actions and information based on user roles.
9. UI and Styling
   • Use ShadCN components to style all pages.
   • Ensure a clean, user-friendly interface for all interactions.

http://localhost:3000/api/auth/signout?csrf=true
need to design this page...
