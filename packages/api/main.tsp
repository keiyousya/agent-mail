import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

import "./models/common.tsp";
import "./models/mail.tsp";
import "./models/mailbox.tsp";
import "./routes/mailboxes.tsp";
import "./routes/messages.tsp";
import "./routes/compose.tsp";
import "./routes/search.tsp";

using TypeSpec.Http;

@service({
  title: "Agent Mail API",
})
namespace AgentMail;
