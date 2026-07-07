import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./env.js";
import { mailboxRoutes } from "./routes/mailboxes.js";
import { messageRoutes } from "./routes/messages.js";
import { composeRoutes } from "./routes/compose.js";
import { searchRoutes } from "./routes/search.js";

// Prevent IMAP disconnects from crashing the process
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

const app = new Hono();

app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
  })
);
app.use("*", logger());

app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json(
    { error: "server_error", message: err.message || "Internal server error" },
    500
  );
});

app.route("/api", mailboxRoutes);
app.route("/api", messageRoutes);
app.route("/api", composeRoutes);
app.route("/api", searchRoutes);

app.get("/api/health", (c) => c.json({ status: "ok" }));

console.log(`Server starting on port ${env.PORT}...`);

serve({
  fetch: app.fetch,
  port: env.PORT,
});

console.log(`Server running at http://localhost:${env.PORT}`);
