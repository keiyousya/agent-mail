import { Hono } from "hono";
import { imapService } from "../services/imap.js";

export const searchRoutes = new Hono();

searchRoutes.get("/search", async (c) => {
  const q = c.req.query("q") || "";
  const mailbox = c.req.query("mailbox") || "INBOX";

  if (!q) {
    return c.json([]);
  }

  const results = await imapService.search(q, mailbox);
  return c.json(results);
});
