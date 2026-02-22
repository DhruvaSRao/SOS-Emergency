const { io } = require("socket.io-client");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OThhYmFjNWJjMzI2ZjMxZDMwM2QyNiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzcxNjkwMDkwLCJleHAiOjE3NzIyOTQ4OTB9.b24zZA0hPGrGrHvRposffHq2w9xKnvdqZPf-h1dWbNM";
const SOS_ID = "TEST-SOS-123";

const socket = io("http://localhost:4000", {
  auth: { token },
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("User connected");

  socket.emit("joinSOSRoom", SOS_ID);

  setInterval(() => {
    socket.emit("locationUpdate", {
      sosId: "TEST-SOS-123",
      latitude: 12.9716 + Math.random() * 0.001,
      longitude: 77.5946 + Math.random() * 0.001,
    });
  }, 3000);
});