import { Schema, model, type HydratedDocument, type Model } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "customer" | "admin";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

type UserModel = Model<IUser, object, IUserMethods>;
export type UserDocument = HydratedDocument<IUser, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set("toJSON", {
  transform(_doc, ret) {
    const { password: _password, tokenVersion: _tokenVersion, __v: _v, ...safe } = ret;
    return safe;
  },
});

export const User = model<IUser, UserModel>("User", userSchema);
