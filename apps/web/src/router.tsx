import {
  createRouter,
  createRoute,
  createRootRoute,
  redirect,
  Outlet,
} from "@tanstack/react-router";
import { App } from "./app";
import { MailboxView } from "./views/mailbox-view";

const rootRoute = createRootRoute({
  component: App,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/mailbox/$path", params: { path: "INBOX" } });
  },
});

const mailboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mailbox/$path",
  component: MailboxView,
});

const routeTree = rootRoute.addChildren([indexRoute, mailboxRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
