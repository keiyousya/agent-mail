import { Hono } from "hono";
import { sendMail } from "../services/smtp.js";
import type { ComposeRequest } from "../types/index.js";

export const composeRoutes = new Hono();

composeRoutes.post("/send", async (c) => {
  const body = (await c.req.json()) as ComposeRequest;
  const result = await sendMail(body);
  return c.json(result);
});
