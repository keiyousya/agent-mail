using TypeSpec.Http;

namespace AgentMail;

@route("/api/search")
interface Search {
  @get search(
    @query q: string,
    @query mailbox?: string,
  ): MessageEnvelope[];
}
