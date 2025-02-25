import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IShelterRequest extends Document {
  shelter_id: Types.ObjectId;
  food_type: string;
  quantity: number;
  image_url: string;
  promised_volunteers: Types.ObjectId[];
  fulfilled_volunteers: Types.ObjectId[];
  status: "in_need" | "claimed" | "fulfilled";
  createdAt: Date;
}

const ShelterRequestSchema = new Schema<IShelterRequest>({
  shelter_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  food_type: { type: String, required: true },
  quantity: { type: Number, required: true },
  image_url: { type: String, required: true },
  promised_volunteers: [{ type: Schema.Types.ObjectId, ref: "VolunteerClaim" }],
  fulfilled_volunteers: [
    { type: Schema.Types.ObjectId, ref: "VolunteerClaim" },
  ],
  status: {
    type: String,
    enum: ["in_need", "claimed", "fulfilled"],
    default: "in_need",
  },
  createdAt: { type: Date, default: Date.now },
});

const ShelterRequest: Model<IShelterRequest> =
  mongoose.models.ShelterRequest ||
  mongoose.model<IShelterRequest>("ShelterRequest", ShelterRequestSchema);

export default ShelterRequest;
