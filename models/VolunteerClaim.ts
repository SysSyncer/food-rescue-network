import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IVolunteerClaim extends Document {
  volunteer_id: Types.ObjectId;
  food_donation_id: Types.ObjectId;
  shelter_request_id: Types.ObjectId;
  donor_status: "claimed" | "in_transit" | "delivered" | "rejected_by_donor";
  shelter_status: "promised" | "fulfilled" | "rejected_by_shelter";
  createdAt: Date;
}

const VolunteerClaimSchema = new Schema<IVolunteerClaim>({
  volunteer_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  food_donation_id: {
    type: Schema.Types.ObjectId,
    ref: "FoodDonation",
    required: true,
  },
  shelter_request_id: {
    type: Schema.Types.ObjectId,
    ref: "ShelterRequest",
    required: true,
  },
  donor_status: {
    type: String,
    enum: ["claimed", "in_transit", "delivered", "rejected_by_donor"],
    default: "claimed",
  },
  shelter_status: {
    type: String,
    enum: ["promised", "fulfilled", "rejected_by_shelter"],
    default: "promised",
  },
  createdAt: { type: Date, default: Date.now },
});

const VolunteerClaim: Model<IVolunteerClaim> =
  mongoose.models.VolunteerClaim ||
  mongoose.model<IVolunteerClaim>("VolunteerClaim", VolunteerClaimSchema);

export default VolunteerClaim;
