// path: models/VolunteerModel.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IVolunteer extends Document {
  volunteer_id: Types.ObjectId;
  donation_id: Types.ObjectId;
  status: "pending" | "assigned" | "completed";
  pickup_time: Date;
  createdAt: Date;
}

const VolunteerSchema: Schema<IVolunteer> = new mongoose.Schema({
  volunteer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  donation_id: { type: mongoose.Schema.Types.ObjectId, ref: "FoodDonation", required: true },
  status: { type: String, enum: ["pending", "assigned", "completed"], default: "pending" },
  pickup_time: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Volunteer: Model<IVolunteer> =
  mongoose.models.Volunteer || mongoose.model<IVolunteer>("Volunteer", VolunteerSchema);
export default Volunteer;