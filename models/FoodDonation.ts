import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFoodDonation extends Document {
  donor_id: Types.ObjectId;
  food_type: string;
  donation_description: string;
  quantity: number;
  image_url: string[];
  volunteer_pool_size: number;
  claimed_volunteers: Types.ObjectId[];
  claimed_volunteers_count: number;
  pickup_address: string;
  expiry_date: Date;
  status: "available" | "closed" | "canceled";
  createdAt: Date;
}

const FoodDonationSchema = new Schema<IFoodDonation>(
  {
    donor_id: {
      type: Schema.Types.ObjectId,
      ref: "UserDetails",
      required: true,
      index: true,
    },
    food_type: { type: String, required: true },
    donation_description: { type: String },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    image_url: { type: [String], required: true },
    volunteer_pool_size: {
      type: Number,
      required: true,
      min: [1, "Volunteer pool size must be at least 1"],
    },
    claimed_volunteers: {
      type: [{ type: Schema.Types.ObjectId, ref: "VolunteerClaim" }],
      default: [],
    },
    claimed_volunteers_count: { type: Number, default: 0 },
    pickup_address: { type: String, required: true },
    expiry_date: { type: Date, required: true, index: true }, // ✅ Indexed for better query performance
    status: {
      type: String,
      enum: ["available", "closed", "canceled"],
      default: "available",
      index: true, // ✅ Indexed for better filtering performance
    },
  },
  { timestamps: true }
);

// ✅ Pre-save middleware to ensure valid claimed volunteers count
FoodDonationSchema.pre("save", function (next) {
  this.claimed_volunteers_count = this.claimed_volunteers.length;

  if (this.claimed_volunteers.length > this.volunteer_pool_size) {
    return next(new Error("Claimed volunteers exceed the volunteer pool size"));
  }
  next();
});

const FoodDonation: Model<IFoodDonation> =
  mongoose.models.FoodDonation ||
  mongoose.model<IFoodDonation>("FoodDonation", FoodDonationSchema);

export default FoodDonation;
