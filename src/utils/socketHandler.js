export default function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log(`Client connected:`, socket.id);

    socket.on("join", (room) => {
      socket.join(room);
      console.log(`Client ${socket.id} joined room: ${room}`);
    });

    socket.on("leave", (room) => {
      socket.leave(room);
      console.log(`Client ${socket.id} left room: ${room}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected: `, socket.id, "reason:", reason);
    });

    socket.on("error", (err) => {
      console.log(`Client error:`, err);
    });
  });
}
