import mongoose from "mongoose";

const singleMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const MessageRoomSchema = new mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  messages: [singleMessageSchema]
}, { timestamps: true });

const MessageRoom= mongoose.model("MessageRoom", MessageRoomSchema);
export default MessageRoom