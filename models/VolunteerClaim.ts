import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface IVolunteerClaim extends Document {
  volunteer_id: Types.ObjectId;
  shelter_request_id: Types.ObjectId;
  donation_id: Types.ObjectId;
  shelter_request_status: "promised" | "fulfilled" | "cancelled";
  donor_request_status: "claimed" | "donated" | "cancelled";
  claimedAt: Date;
}

const VolunteerClaimSchema = new Schema<IVolunteerClaim>({
  volunteer_id: {
    type: Schema.Types.ObjectId,
    ref: "UserDetails",
    required: true,
  },
  shelter_request_id: {
    type: Schema.Types.ObjectId,
    ref: "ShelterRequest",
    required: true,
  },
  donation_id: {
    type: Schema.Types.ObjectId,
    ref: "FoodDonation",
    required: true,
  },
  shelter_request_status: {
    type: String,
    enum: ["promised", "fulfilled", "cancelled"],
    default: "promised",
  },
  donor_request_status: {
    type: String,
    enum: ["claimed", "donated", "cancelled"],
    default: "claimed",
  },
  claimedAt: { type: Date, default: Date.now },
});

// ✅ Indexing for performance
VolunteerClaimSchema.index({
  volunteer_id: 1,
  shelter_request_id: 1,
  donation_id: 1,
});

// ✅ Unique index to prevent duplicate claims
VolunteerClaimSchema.index(
  { volunteer_id: 1, donation_id: 1 },
  { unique: true }
);

// ✅ Middleware: Automatically update `FoodDonation.claimed_volunteers`
VolunteerClaimSchema.post("save", async function (doc, next) {
  await mongoose.model("FoodDonation").updateOne(
    { _id: doc.donation_id },
    { $addToSet: { claimed_volunteers: doc._id } } // Ensure no duplicates
  );
  next();
});

// Export the model
const VolunteerClaim: Model<IVolunteerClaim> =
  mongoose.models.VolunteerClaim ||
  mongoose.model<IVolunteerClaim>("VolunteerClaim", VolunteerClaimSchema);

export default VolunteerClaim;
