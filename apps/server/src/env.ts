import { config } from "dotenv";
import { z } from "zod";
import { resolve } from "path";

config({ path: resolve(import.meta.dirname, "../../../.env") });

const envSchema = z.object({
  IMAP_HOST: z.string().default("koutoudaiyugatan.sakura.ne.jp"),
  IMAP_PORT: z.coerce.number().default(993),
  IMAP_USER: z.string().default("tamurakeito@koutoudai-yugata-naika.clinic"),
  IMAP_PASS: z.string(),
  SMTP_HOST: z.string().default("koutoudaiyugatan.sakura.ne.jp"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default("tamurakeito@koutoudai-yugata-naika.clinic"),
  SMTP_PASS: z.string(),
  PORT: z.coerce.number().default(3001),
});

export const env = envSchema.parse(process.env);
