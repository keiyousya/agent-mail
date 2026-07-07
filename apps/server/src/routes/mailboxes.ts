import { Hono } from "hono";
import { imapService } from "../services/imap.js";

export const mailboxRoutes = new Hono();

mailboxRoutes.get("/mailboxes", async (c) => {
  const mailboxes = await imapService.listMailboxes();
  return c.json(mailboxes);
});
