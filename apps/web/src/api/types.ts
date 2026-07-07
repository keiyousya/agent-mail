export interface Address {
  name?: string;
  address: string;
}

export interface Attachment {
  filename: string;
  contentType: string;
  size: number;
  partId: string;
}

export interface MessageEnvelope {
  uid: number;
  messageId?: string;
  subject?: string;
  from: Address[];
  to: Address[];
  cc?: Address[];
  date?: string;
  preview: string;
  flags: string[];
  hasAttachments: boolean;
}

export interface MessageDetail extends MessageEnvelope {
  bcc?: Address[];
  replyTo?: Address[];
  html?: string;
  text?: string;
  attachments: Attachment[];
  inReplyTo?: string;
  references?: string[];
}

export interface Mailbox {
  name: string;
  path: string;
  delimiter: string;
  flags: string[];
  specialUse?: string;
  total: number;
  unseen: number;
}

export interface ComposeData {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  text: string;
  html?: string;
  inReplyTo?: string;
  references?: string[];
}
