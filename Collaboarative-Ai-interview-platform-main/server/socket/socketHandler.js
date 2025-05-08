// Server-side socket handler
const NameToSocketId = new Map();
const SocketToName = new Map();

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);
    
    // Handle user joining a room
    socket.on("join-room", ({ roomId, Name }) => {
      console.log(`🧑‍💻 ${Name} joined room ${roomId}`);
      
      // Store mappings between names and socket IDs
      NameToSocketId.set(Name, socket.id);
      SocketToName.set(socket.id, Name);
        
      // Join the socket room
      socket.join(roomId);
      
      // Notify other users in the room that a new user joined
      socket.to(roomId).emit("user-joined", { 
        Name, 
        socketId: socket.id 
      });
        
      // Confirm to the joining user that they've joined successfully
      socket.emit("joined-room", { roomId });
    });
     
    // Handle call initiation
    socket.on("call-user", ({ to, offer }) => {
      const from = SocketToName.get(socket.id);
      
      // Forward the offer to the target user
      socket.to(to).emit("incoming-call", { 
        from, 
        offer,
        callerId: socket.id 
      });
    });
    
    // Handle call answer
    socket.on("make-answer", ({ to, answer }) => {
      const from = SocketToName.get(socket.id);
      
      // Forward the answer to the caller
      socket.to(to).emit("answer-made", { 
        from,
        answer, 
        answererId: socket.id 
      });
    });
    
    // Handle ICE candidates
    socket.on("ice-candidate", ({ to, candidate }) => {
      socket.to(to).emit("ice-candidate", { 
        from: socket.id,
        candidate 
      });
    });
    
    // Handle user disconnection
    socket.on("disconnect", () => {
      const name = SocketToName.get(socket.id);
      if (name) {
        console.log(`❌ ${name} disconnected`);
        
        // Clean up mappings
        NameToSocketId.delete(name);
        SocketToName.delete(socket.id);
        
        // Notify others about disconnection
        socket.broadcast.emit("user-disconnected", {
          socketId: socket.id,
          name
        });
      }
    });
  });
};