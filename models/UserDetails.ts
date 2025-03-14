import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUserDetails extends Document {
  _id: Types.ObjectId; // Reference to UserCredentials
  name?: string;
  phone?: string;
  location?: string;
  profileImage?: string;
}

const UserDetailsSchema = new Schema<IUserDetails>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      ref: "UserCredentials", // ✅ Reference to UserCredentials model
      required: true,
      unique: true, // ✅ Ensures one-to-one mapping with UserCredentials
    },
    name: {
      type: String,
      default: "User", // ✅ Set default directly instead of using middleware
    },
    phone: {
      type: String,
      // unique: true, // ✅ Ensures phone numbers are unique
      match: [/^\d{10,15}$/, "Phone number must be 10-15 digits"], // ✅ Simple regex validation
      default: "",
    },
    location: { type: String, default: "" },
    profileImage: { type: String, default: null }, // ✅ Use null to indicate "not set"
  },
  { _id: false }
);

// ✅ Fix `pre("save")` middleware to correctly assign the default name
UserDetailsSchema.pre("save", function (next) {
  if (!this.name || this.name.trim() === "") {
    this.name = "User"; // ✅ Fix incorrect assignment
  }
  next();
});

// ✅ Prevent duplicate model compilation in Next.js
export default mongoose.models.UserDetails ||
  mongoose.model<IUserDetails>("UserDetails", UserDetailsSchema);
