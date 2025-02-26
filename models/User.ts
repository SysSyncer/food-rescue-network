import mongoose, { Schema, Document, Types } from "mongoose";
import argon2 from "argon2";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: "donor" | "volunteer" | "shelter";
  phone?: string;
  location?: string;
  profileImage?: string;
  createdAt: Date;
  validatePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, unique: true },
  password: { type: String }, // Optional for OAuth users
  role: {
    type: String,
    enum: ["donor", "volunteer", "shelter"],
    required: true,
  },
  phone: { type: String },
  location: { type: String },
  profileImage: { type: String }, // Profile picture support
  createdAt: { type: Date, default: Date.now },
});

// ✅ Keep Only the Password Validation Method
UserSchema.methods.validatePassword = async function (password: string) {
  return this.password ? await argon2.verify(this.password, password) : false;
};

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
