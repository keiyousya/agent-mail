import { Hono } from "hono";
import { imapService } from "../services/imap.js";

export const messageRoutes = new Hono();

messageRoutes.get("/mailboxes/:path/messages", async (c) => {
  const mailboxPath = decodeURIComponent(c.req.param("path"));
  const page = Number(c.req.query("page") || "1");
  const limit = Number(c.req.query("limit") || "50");

  const result = await imapService.listMessages(mailboxPath, page, limit);
  return c.json(result);
});

messageRoutes.get("/mailboxes/:path/messages/:uid", async (c) => {
  const mailboxPath = decodeURIComponent(c.req.param("path"));
  const uid = Number(c.req.param("uid"));

  const message = await imapService.getMessage(mailboxPath, uid);
  if (!message) {
    return c.json({ error: "not_found", message: "Message not found" }, 404);
  }

  // Mark as read
  if (!message.flags.includes("\\Seen")) {
    await imapService.updateFlags(mailboxPath, uid, ["\\Seen"]);
    message.flags.push("\\Seen");
  }

  return c.json(message);
});

messageRoutes.patch("/mailboxes/:path/messages/:uid", async (c) => {
  const mailboxPath = decodeURIComponent(c.req.param("path"));
  const uid = Number(c.req.param("uid"));
  const body = await c.req.json();

  if (body.moveTo) {
    await imapService.moveMessage(mailboxPath, uid, body.moveTo);
  } else {
    await imapService.updateFlags(
      mailboxPath,
      uid,
      body.addFlags,
      body.removeFlags
    );
  }

  return c.body(null, 204);
});

messageRoutes.delete("/mailboxes/:path/messages/:uid", async (c) => {
  const mailboxPath = decodeURIComponent(c.req.param("path"));
  const uid = Number(c.req.param("uid"));

  await imapService.deleteMessage(mailboxPath, uid);
  return c.body(null, 204);
});

// Bulk purge (permanent delete)
messageRoutes.post("/mailboxes/:path/purge", async (c) => {
  const mailboxPath = decodeURIComponent(c.req.param("path"));
  const { uids } = await c.req.json() as { uids: number[] };

  const count = await imapService.purgeMessages(mailboxPath, uids);
  return c.json({ deleted: count });
});
