import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IShelterRequest extends Document {
  shelter_id: Types.ObjectId;
  food_type: string;
  request_description: string;
  quantity: number;
  image_url?: string[];
  promised_volunteers: Types.ObjectId[];
  fulfilled_volunteers: Types.ObjectId[];
  status: "in_need" | "fulfilled" | "cancelled";
  createdAt: Date;
}

const ShelterRequestSchema = new Schema<IShelterRequest>({
  shelter_id: {
    type: Schema.Types.ObjectId,
    ref: "UserDetails", // ✅ ref to "UserDetails"
    required: true,
    index: true,
  },
  food_type: { type: String, required: true },
  request_description: { type: String },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"], // ✅ Ensure positive quantity
  },
  image_url: { type: [String] },
  promised_volunteers: [
    { type: Schema.Types.ObjectId, ref: "VolunteerClaim", default: [] },
  ],
  fulfilled_volunteers: [
    { type: Schema.Types.ObjectId, ref: "VolunteerClaim", default: [] },
  ],
  status: {
    type: String,
    enum: ["in_need", "fulfilled", "cancelled"],
    default: "in_need",
    index: true,
  },
  createdAt: { type: Date, default: Date.now, index: true },
});

// ✅ Middleware for cascading deletion of volunteer claims
ShelterRequestSchema.pre("findOneAndDelete", async function (next) {
  const doc = (await this.model
    .findOne(this.getFilter()) // ✅ Use `getFilter()` instead of `getQuery()`
    .lean()) as IShelterRequest | null;

  if (doc) {
    await mongoose.model("VolunteerClaim").deleteMany({
      _id: { $in: [...doc.promised_volunteers, ...doc.fulfilled_volunteers] },
    });
  }
  next();
});

const ShelterRequest: Model<IShelterRequest> =
  mongoose.models.ShelterRequest ||
  mongoose.model<IShelterRequest>("ShelterRequest", ShelterRequestSchema);

export default ShelterRequest;
