import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFoodDonation extends Document {
  donor_id: Types.ObjectId;
  food_type: string;
  quantity: number;
  image_url: string[];
  volunteer_pool_size: number;
  claimed_volunteers: Types.ObjectId[];
  pickup_address: string;
  expiry_date: Date; // ✅ Added expiry_date
  status: "available" | "closed";
  createdAt: Date;
}

const FoodDonationSchema = new Schema<IFoodDonation>(
  {
    donor_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    }, // ✅ Indexed for performance
    food_type: { type: String, required: true },
    quantity: { type: Number, required: true },
    image_url: { type: [String], required: true },
    volunteer_pool_size: { type: Number, required: true },
    pickup_address: { type: String, required: true },
    expiry_date: { type: Date, required: true }, // ✅ Added expiry_date
    claimed_volunteers: [
      { type: Schema.Types.ObjectId, ref: "VolunteerClaim" },
    ],
    status: {
      type: String,
      enum: ["available", "closed"],
      default: "available",
    },
  },
  { timestamps: true } // ✅ Automatically adds createdAt & updatedAt fields
);

// ✅ Middleware to ensure `claimed_volunteers` does not exceed `volunteer_pool_size`
FoodDonationSchema.pre("save", function (next) {
  if (this.claimed_volunteers.length > this.volunteer_pool_size) {
    return next(new Error("Claimed volunteers exceed the volunteer pool size"));
  }
  next();
});

const FoodDonation: Model<IFoodDonation> =
  mongoose.models.FoodDonation ||
  mongoose.model<IFoodDonation>("FoodDonation", FoodDonationSchema);

export default FoodDonation;
