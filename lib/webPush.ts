import webPush from "web-push";
import { env } from "./env";

webPush.setVapidDetails(
  "mailto:hoge@example.com",
  env.NEXT_PUBLIC_VAPID_PUBLIC,
  env.VAPID_PRIVATE
);

export { webPush };
