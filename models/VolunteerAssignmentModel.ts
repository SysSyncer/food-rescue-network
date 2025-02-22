import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IVolunteerAssignment extends Document {
  volunteer_id: Types.ObjectId;
  donation_id: Types.ObjectId;
  status: "claimed" | "in transit" | "delivered" | "confirmed";
  pickup_time?: Date;
  createdAt: Date;
}

const VolunteerAssignmentSchema: Schema<IVolunteerAssignment> =
  new mongoose.Schema({
    volunteer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    donation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodDonation",
      required: true,
    },
    status: {
      type: String,
      enum: ["claimed", "in transit", "delivered", "confirmed"], // ✅ Updated statuses
      default: "claimed",
    },
    pickup_time: { type: Date }, // Optional pickup time
    createdAt: { type: Date, default: Date.now },
  });

const VolunteerAssignment: Model<IVolunteerAssignment> =
  mongoose.models.VolunteerAssignment ||
  mongoose.model<IVolunteerAssignment>(
    "VolunteerAssignment",
    VolunteerAssignmentSchema
  );

export default VolunteerAssignment;
