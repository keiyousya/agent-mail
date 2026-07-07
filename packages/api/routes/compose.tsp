using TypeSpec.Http;

namespace AgentMail;

@route("/api")
interface Compose {
  @post
  @route("send")
  send(@body body: ComposeRequest): {
    messageId: string;
  };

  @post
  @route("drafts")
  saveDraft(@body body: ComposeRequest): {
    uid: uint32;
  };
}
