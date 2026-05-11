import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: "",
  },
  readAt: {
    type: Date,
    default: null,
  },
  dedupeKey: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

notificationSchema.index(
  { userId: 1, dedupeKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      dedupeKey: { $exists: true, $type: "string" },
    },
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
