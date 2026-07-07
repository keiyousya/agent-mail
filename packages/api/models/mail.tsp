namespace AgentMail;

model Address {
  name?: string;
  address: string;
}

model Attachment {
  filename: string;
  contentType: string;
  size: uint32;
  partId: string;
}

model MessageEnvelope {
  uid: uint32;
  messageId?: string;
  subject?: string;
  from: Address[];
  to: Address[];
  cc?: Address[];
  date?: utcDateTime;
  preview: string;
  flags: string[];
  hasAttachments: boolean;
}

model MessageDetail {
  ...MessageEnvelope;
  bcc?: Address[];
  replyTo?: Address[];
  html?: string;
  text?: string;
  attachments: Attachment[];
  inReplyTo?: string;
  references?: string[];
}

model MessagePatch {
  addFlags?: string[];
  removeFlags?: string[];
  moveTo?: string;
}

model ComposeRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  inReplyTo?: string;
  references?: string[];
}
