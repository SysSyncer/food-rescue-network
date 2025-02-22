import mongoose, { Schema, Document, Model, Types } from "mongoose";
import argon2 from "argon2";

export interface IUser extends Document {
  _id: Types.ObjectId; // Explicitly define _id type
  name: string;
  email: string;
  password: string;
  role: "donor" | "volunteer" | "shelter";
  phone?: string;
  location?: string;
  createdAt: Date;
  validatePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["donor", "volunteer", "shelter"],
    required: true,
  },
  phone: { type: String },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Password hashing before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await argon2.hash(this.password);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Validate password
UserSchema.methods.validatePassword = async function (
  password: string
): Promise<boolean> {
  return argon2.verify(this.password, password);
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
