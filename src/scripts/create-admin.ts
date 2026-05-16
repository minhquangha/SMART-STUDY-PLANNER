import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "@/models/user.js";

dotenv.config();

type CreateAdminArgs = {
  email?: string;
  name?: string;
  password?: string;
};

const readArgs = (): CreateAdminArgs => {
  const args = process.argv.slice(2);
  const values: CreateAdminArgs = {};

  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    const value = args[index + 1];

    if (!key?.startsWith("--") || !value || value.startsWith("--")) {
      continue;
    }

    if (key === "--email") {
      values.email = value.trim().toLowerCase();
      index += 1;
    }

    if (key === "--name") {
      values.name = value.trim();
      index += 1;
    }

    if (key === "--password") {
      values.password = value;
      index += 1;
    }
  }

  return values;
};

const validateArgs = ({ email, name, password }: CreateAdminArgs) => {
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("Valid --email is required");
  }

  if (name && !/^[A-Za-z0-9_]{3,30}$/.test(name)) {
    throw new Error("--name must be 3-30 characters and only use letters, numbers, or underscore");
  }

  if (
    password &&
    !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/.test(password)
  ) {
    throw new Error("--password must have at least 8 characters, including a letter, number, and special character");
  }
};

const run = async () => {
  const args = readArgs();
  validateArgs(args);

  const email = args.email;
  if (!email) {
    throw new Error("Valid --email is required");
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(mongoUri);

  const lookupFilter = args.name
    ? { $or: [{ email }, { name: args.name }] }
    : { email };

  const existingUser = await User.findOne(lookupFilter)
    .collation({ locale: "en", strength: 2 })
    .select("email")
    .lean<{ _id: mongoose.Types.ObjectId; email: string }>();

  if (existingUser) {
    const update: {
      role: "admin";
      name?: string;
      password?: string;
      updatedAt: Date;
    } = {
      role: "admin",
      updatedAt: new Date(),
    };

    if (args.name) {
      update.name = args.name;
    }

    if (args.password) {
      update.password = await bcrypt.hash(args.password, 10);
    }

    await User.updateOne({ _id: existingUser._id }, { $set: update });
    console.log(`Promoted admin user: ${existingUser.email}`);
    return;
  }

  if (!args.password) {
    throw new Error("--password is required when creating a new admin");
  }

  const user = await User.create({
    name: args.name ?? "admin",
    email,
    password: await bcrypt.hash(args.password, 10),
    role: "admin",
  });

  console.log(`Created admin user: ${user.email}`);
};

run()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
