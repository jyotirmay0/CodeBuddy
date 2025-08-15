import MessageRoom from "../models/Messages.js";

/**
 * Client emits you'll use:
 *   "rtc_join"          -> { roomId, userId }
 *   "rtc_offer"         -> { roomId, sdp }
 *   "rtc_answer"        -> { roomId, sdp }
 *   "rtc_ice_candidate" -> { roomId, candidate }
 *   "rtc_end"           -> { roomId }
 *
 * Server broadcasts (to everyone else in the room):
 *   "rtc_peer_joined"   -> { socketId, userId }
 *   "rtc_offer"         -> { socketId, sdp }
 *   "rtc_answer"        -> { socketId, sdp }
 *   "rtc_ice_candidate" -> { socketId, candidate }
 *   "rtc_peer_left"     -> { socketId }
 *   "rtc_ended"         -> { socketId }
 */
export default function setupVideoRTC(io) {
  const callRoom = (roomId) => `call:${roomId}`;

  io.on("connection", (socket) => {
    // --- Join a call (verifies membership in MessageRoom) ---
    socket.on("rtc_join", async ({ roomId, userId }, cb) => {
      try {
        if (!roomId || !userId) return cb?.({ ok: false, error: "bad_args" });

        const room = await MessageRoom.findById(roomId).select("_id members");
        if (!room || !room.members.map(String).includes(String(userId))) {
          return cb?.({ ok: false, error: "not_member" });
        }

        const roomKey = callRoom(roomId);
        await socket.join(roomKey);

        // Let others know someone joined
        socket.to(roomKey).emit("rtc_peer_joined", {
          socketId: socket.id,
          userId,
        });

        // Provide simple peer count to the joiner (useful to gate UI)
        const peers = await io.in(roomKey).fetchSockets();
        cb?.({
          ok: true,
          peers: peers.map((s) => s.id).filter((id) => id !== socket.id),
          count: peers.length,
        });
      } catch (err) {
        console.error("rtc_join error:", err);
        cb?.({ ok: false, error: "server_error" });
      }
    });

    // --- Relay SDP Offer ---
    socket.on("rtc_offer", ({ roomId, sdp }) => {
      if (!roomId || !sdp) return;
      socket.to(callRoom(roomId)).emit("rtc_offer", {
        socketId: socket.id,
        sdp,
      });
    });

    // --- Relay SDP Answer ---
    socket.on("rtc_answer", ({ roomId, sdp }) => {
      if (!roomId || !sdp) return;
      socket.to(callRoom(roomId)).emit("rtc_answer", {
        socketId: socket.id,
        sdp,
      });
    });

    // --- Relay ICE Candidates ---
    socket.on("rtc_ice_candidate", ({ roomId, candidate }) => {
      if (!roomId || !candidate) return;
      socket.to(callRoom(roomId)).emit("rtc_ice_candidate", {
        socketId: socket.id,
        candidate,
      });
    });

    // --- End call (notify peers + leave) ---
    socket.on("rtc_end", async ({ roomId }) => {
      if (!roomId) return;
      const roomKey = callRoom(roomId);
      socket.to(roomKey).emit("rtc_ended", { socketId: socket.id });
      await socket.leave(roomKey);
    });

    // --- Clean up on disconnect (notify any rooms) ---
    socket.on("disconnecting", async () => {
      try {
        for (const roomKey of socket.rooms) {
          if (typeof roomKey === "string" && roomKey.startsWith("call:")) {
            socket.to(roomKey).emit("rtc_peer_left", { socketId: socket.id });
          }
        }
      } catch (e) {
        console.error(e)
      }
    });
  });
}
