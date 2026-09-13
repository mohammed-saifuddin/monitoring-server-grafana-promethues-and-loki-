const express = require("express");
const client = require("prom-client");

const app = express();
const PORT = 3000;

app.use(express.json());

/*
 * Prometheus metrics
 */

// Collect default Node.js metrics:
// CPU, memory, event loop, garbage collection, etc.
client.collectDefaultMetrics();

/*
 * Count HTTP requests
 */
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"]
});

/*
 * HTTP request duration
 */
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5]
});

/*
 * Middleware for monitoring requests
 */
app.use((req, res, next) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);

    const duration =
      diff[0] + diff[1] / 1e9;

    const route = req.route
      ? req.route.path
      : req.path;

    httpRequestsTotal.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route: route,
        status_code: res.statusCode
      },
      duration
    );

    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration.toFixed(3)}s`
    );
  });

  next();
});


/*
 * Home
 */
app.get("/", (req, res) => {
  res.json({
    message: "Monitoring server is running",
    status: "healthy"
  });
});


/*
 * Health check
 */
app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    timestamp: new Date().toISOString()
  });
});


/*
 * Example API
 */
app.get("/api/users", (req, res) => {
  res.json([
    {
      id: 1,
      name: "John"
    },
    {
      id: 2,
      name: "Alice"
    },
    {
      id: 3,
      name: "David"
    }
  ]);
});


/*
 * Prometheus metrics endpoint
 */
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);

  res.end(await client.register.metrics());
});


/*
 * Start server
 */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});