const { io } = require("socket.io-client");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OWEwODc5ODQ0M2VlY2VkNTUwOWQzZiIsInJvbGUiOiJwb2xpY2UiLCJpYXQiOjE3NzE3MDIzOTMsImV4cCI6MTc3MjMwNzE5M30.vavibqcM2scFfNCEaH7sRy5e6PjcPo-a4cTj3KZq73w"
const SOS_ID = "TEST-SOS-123";

const socket = io("http://localhost:4000", {
  auth: { token },
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("joinSOSRoom", SOS_ID);
});

socket.on("liveLocation", (data) => {
  console.log("Police received live location:", data);
});

socket.on("audioUploaded", (data) => {
  console.log("Audio uploaded for SOS:", data.dispatchId);
  console.log("Audio URL:", data.audioUrl);
});

setInterval(() => {
  socket.emit("policeLocationUpdate", {
    latitude: 12.9716,
    longitude: 77.5946
  });
}, 3000);

socket.on("newSOS", (data) => {
  console.log("Police received new SOS:", data.dispatchId);
});

socket.on("connect_error", (err) => {
  console.log("Connection error:", err.message);
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});