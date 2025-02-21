import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFoodDonation extends Document {
  title: string;
  description: string;
  donor_id: Types.ObjectId;
  food_type: string;
  quantity: number;
  pickup_address: string;
  status: "available" | "claimed" | "delivered";
  expiry_date: Date;
  images: string[];
  createdAt: Date;
}

const FoodDonationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    food_type: { type: String, required: true },
    pickup_address: { type: String, required: true }, // Replaced pickup_location
    expiry_date: { type: Date, required: true },
    images: { type: [String], default: [] },
    donor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["available", "claimed", "delivered"], default: "available" },
  },
  {
    timestamps: true,
  }
);

const FoodDonation: Model<IFoodDonation> =
  mongoose.models.Food_Donation || mongoose.model<IFoodDonation>("Food_Donation", FoodDonationSchema);
export default FoodDonation;
