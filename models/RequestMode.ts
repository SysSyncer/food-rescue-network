// path: models/RequestModel.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IRequest extends Document {
  shelter_id: Types.ObjectId;
  donation_id: Types.ObjectId;
  status: "pending" | "approved" | "rejected" | "fulfilled";
  createdAt: Date;
}

const RequestSchema: Schema<IRequest> = new mongoose.Schema({
  shelter_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  donation_id: { type: mongoose.Schema.Types.ObjectId, ref: "FoodDonation", required: true },
  status: { type: String, enum: ["pending", "approved", "rejected", "fulfilled"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const Request: Model<IRequest> =
  mongoose.models.Request || mongoose.model<IRequest>("Request", RequestSchema);
export default Request;