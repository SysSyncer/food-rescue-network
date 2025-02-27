import mongoose, { Schema, Document } from "mongoose";
import argon2 from "argon2";

export interface IUserCredentials extends Document {
  email: string;
  password: string;
  role: "donor" | "volunteer" | "shelter";
  validatePassword(password: string): Promise<boolean>;
}

const UserCredentialsSchema = new Schema<IUserCredentials>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["donor", "volunteer", "shelter"],
    required: true,
  },
});

// Hash password before saving
UserCredentialsSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await argon2.hash(this.password);
  next();
});

// Password validation method
UserCredentialsSchema.methods.validatePassword = async function (
  password: string
) {
  return await argon2.verify(this.password, password);
};

export default mongoose.models.UserCredentials ||
  mongoose.model<IUserCredentials>("UserCredentials", UserCredentialsSchema);
