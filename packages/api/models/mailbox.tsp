namespace AgentMail;

model Mailbox {
  name: string;
  path: string;
  delimiter: string;
  flags: string[];
  specialUse?: string;
  total: uint32;
  unseen: uint32;
}
