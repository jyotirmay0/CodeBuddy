import { Server } from "socket.io";
import MessageRoom from "../models/Messages.js";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

export default function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ["GET", "POST"],
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a chat room
    socket.on("join_room", ({ roomId, userId }) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
    });

    // Create group (only creator at start)
    socket.on("create_group_room", async ({ userId }, callback) => {
      try {
        const room = await MessageRoom.create({
          members: [userId],
          messages: [],
        });

        await User.findByIdAndUpdate(userId, {
          $push: { chatRooms: room._id }
        });

        callback(room._id.toString());
      } catch (err) {
        console.error("Error creating group room:", err);
        callback(null);
      }
    });

    // Create or get DM
    socket.on("create_or_get_dm", async ({ userId1, userId2 }, callback) => {
      try {
        let room = await MessageRoom.findOne({
          members: { $all: [userId1, userId2], $size: 2 }
        });

        if (!room) {
          room = await MessageRoom.create({
            members: [userId1, userId2],
            messages: [],
          });

          await User.updateMany(
            { _id: { $in: [userId1, userId2] } },
            { $push: { chatRooms: room._id } }
          );
        }

        callback(room._id.toString());
      } catch (err) {
        console.error("Error creating/getting DM:", err);
        callback(null);
      }
    });

    // Send a message
    socket.on("send_message", async ({ roomId, senderId, content }) => {
      try {
        const trimmed = content?.trim();
        if (!trimmed) return;

        const room = await MessageRoom.findById(roomId);
        if (!room?.members.includes(senderId)) return; // Sender not in room

        const newMessage = {
          sender: senderId,
          content: trimmed,
          timestamp: new Date(),
        };

        await MessageRoom.findByIdAndUpdate(roomId, {
          $push: { messages: newMessage }
        });

        io.to(roomId).emit("receive_message", {
          roomId,
          ...newMessage
        });
      } catch (err) {
        console.error("Error sending message:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}
