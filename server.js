const express = require("express");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Home
app.get("/", (req, res) => {
  res.json({
    message: "Monitoring server is running",
    status: "healthy"
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    timestamp: new Date().toISOString()
  });
});

// Example API
app.get("/api/users", (req, res) => {
  res.json([
    { id: 1, name: "John" },
    { id: 2, name: "Alice" },
    { id: 3, name: "David" }
  ]);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
