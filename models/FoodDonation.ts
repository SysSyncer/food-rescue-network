import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFoodDonation extends Document {
  donor_id: Types.ObjectId;
  food_type: string;
  quantity: number;
  image_url: string;
  volunteer_pool_size: number;
  claimed_volunteers: Types.ObjectId[];
  status: "available" | "closed";
  createdAt: Date;
}

const FoodDonationSchema = new Schema<IFoodDonation>({
  donor_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  food_type: { type: String, required: true },
  quantity: { type: Number, required: true },
  image_url: { type: String, required: true },
  volunteer_pool_size: { type: Number, required: true },
  claimed_volunteers: [{ type: Schema.Types.ObjectId, ref: "VolunteerClaim" }],
  status: { type: String, enum: ["available", "closed"], default: "available" },
  createdAt: { type: Date, default: Date.now },
});

const FoodDonation: Model<IFoodDonation> =
  mongoose.models.FoodDonation ||
  mongoose.model<IFoodDonation>("FoodDonation", FoodDonationSchema);

export default FoodDonation;
