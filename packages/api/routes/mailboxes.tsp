using TypeSpec.Http;
using TypeSpec.Rest;

namespace AgentMail;

@route("/api/mailboxes")
interface Mailboxes {
  @get list(): Mailbox[];
}
