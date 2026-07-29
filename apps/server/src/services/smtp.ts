import nodemailer from "nodemailer";
import { env } from "../env.js";
import type { ComposeRequest } from "../types/index.js";
import { imapService } from "./imap.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendMail(
  request: ComposeRequest
): Promise<{ messageId: string }> {
  const mailOptions: Record<string, any> = {
    from: env.SMTP_USER,
    to: request.to.join(", "),
    cc: request.cc?.join(", "),
    bcc: request.bcc?.join(", "),
    subject: request.subject,
    text: request.text,
    html: request.html,
    inReplyTo: request.inReplyTo,
    references: request.references?.join(" "),
    attachments: request.attachments?.map((a) => ({
      filename: a.filename,
      path: a.path,
      content: a.content,
      contentType: a.contentType,
      encoding: a.encoding,
    })),
  };

  const info = await transporter.sendMail(mailOptions);

  // Save to Sent folder via IMAP
  try {
    const rawMessage = await buildRawMessage(mailOptions);
    await imapService.appendToSent(rawMessage);
  } catch (err) {
    console.error("Failed to save to Sent folder:", err);
  }

  return { messageId: info.messageId };
}

export async function saveDraft(
  request: ComposeRequest
): Promise<void> {
  const mailOptions: Record<string, any> = {
    from: env.SMTP_USER,
    to: request.to.join(", "),
    cc: request.cc?.join(", "),
    bcc: request.bcc?.join(", "),
    subject: request.subject,
    text: request.text,
    html: request.html,
    inReplyTo: request.inReplyTo,
    references: request.references?.join(" "),
    attachments: request.attachments?.map((a) => ({
      filename: a.filename,
      path: a.path,
      content: a.content,
      contentType: a.contentType,
      encoding: a.encoding,
    })),
  };

  const rawMessage = await buildRawMessage(mailOptions);
  await imapService.appendToDrafts(rawMessage);
}

async function buildRawMessage(options: Record<string, any>): Promise<string> {
  const mail = nodemailer.createTransport({ streamTransport: true });
  const info = await mail.sendMail(options);
  const chunks: Buffer[] = [];
  for await (const chunk of info.message) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString();
}
