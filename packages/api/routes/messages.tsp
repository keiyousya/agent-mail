using TypeSpec.Http;
using TypeSpec.Rest;

namespace AgentMail;

@route("/api/mailboxes/{mailboxPath}/messages")
interface Messages {
  @get list(
    @path mailboxPath: string,
    @query page?: uint32,
    @query limit?: uint32,
  ): {
    messages: MessageEnvelope[];
    total: uint32;
  };

  @get
  @route("{uid}")
  get(@path mailboxPath: string, @path uid: uint32): MessageDetail;

  @patch
  @route("{uid}")
  update(
    @path mailboxPath: string,
    @path uid: uint32,
    @body body: MessagePatch,
  ): void;

  @delete
  @route("{uid}")
  delete(@path mailboxPath: string, @path uid: uint32): void;
}
