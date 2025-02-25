import mongoose, { Schema, Document, Types } from "mongoose";
import argon2 from "argon2";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string; // Password is optional for social logins
  role: "donor" | "volunteer" | "shelter";
  phone?: string;
  location?: string;
  image?: string;
  createdAt: Date;
  validatePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  password: { type: String }, // Optional for OAuth users
  role: {
    type: String,
    enum: ["donor", "volunteer", "shelter"],
    required: true,
  },
  phone: { type: String },
  location: { type: String },
  image: { type: String }, // Profile picture support
  createdAt: { type: Date, default: Date.now },
});

// Ensure (email, role) is unique → Prevents duplicate role registration
UserSchema.index({ email: 1, role: 1 }, { unique: true });

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await argon2.hash(this.password);
  }
  next();
});

// Method to validate password
UserSchema.methods.validatePassword = async function (password: string) {
  return this.password ? await argon2.verify(this.password, password) : false;
};

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
