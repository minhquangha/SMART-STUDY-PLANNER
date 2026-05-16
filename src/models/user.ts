import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  avatar: {
    url: {
      type: String,
      default: "",
    },
    publicId: {
      type: String,
      default: "",
    },
  },

  bio: {
    type: String,
    default: "",
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
  studyPreferences: {
    type: [String], // ["Math", "English", ...]
    default: [],
  },

  streak: {
    type: Number,
    default: 0,
  },

  totalStudyTime: {
    type: Number, // phút
    default: 0,
  },
},{timestamps:true});

export const User = mongoose.model("User", userSchema);
