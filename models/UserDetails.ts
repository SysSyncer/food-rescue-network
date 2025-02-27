import mongoose, { Schema, Document } from "mongoose";

export interface IUserDetails extends Document {
  userId: mongoose.Schema.Types.ObjectId; // Reference to UserCredentials
  name?: string;
  phone?: string;
  location?: string;
  profileImage?: string;
}

const UserDetailsSchema = new Schema<IUserDetails>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserCredentials", // Reference to UserCredentials model
    required: true,
    unique: true, // Each user has only one details record
  },
  name: {
    type: String,
    default: "",
  },

  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  profileImage: { type: String, default: "" },
});

UserDetailsSchema.pre("save", function (next) {
  if (!this.name || this.name.trim() === "") {
    this.name === "User";
  }
  next();
});

// Prevent duplicate model compilation in Next.js
export default mongoose.models.UserDetails ||
  mongoose.model<IUserDetails>("UserDetails", UserDetailsSchema);
