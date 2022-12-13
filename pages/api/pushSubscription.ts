import { NextApiRequest, NextApiResponse } from "next";
import {
  deletePushSubscription,
  getPushSubscriptions,
  postPushSubscription,
  PushSubscription,
} from "../../lib/mongoDB";
import { badRequest, checkRequest, notAllowed, ok } from "../../lib/request";
import { webPush } from "../../lib/webPush";

const api = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "DELETE") {
    await deleteMethod(req, res);
    return;
  }
  if (req.method === "POST") {
    await postMethod(req, res);
    return;
  }
  notAllowed(res);
  return;
};

const postMethod = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!checkRequest(req.body, res)) {
    return;
  }

  const pushSubscription = {
    endpoint: req.body.endpoint,
    keys: req.body.keys,
  };

  try {
    await webPush.sendNotification(
      pushSubscription,
      JSON.stringify({
        body: "登録しました！",
      })
    );
  } catch (e) {
    badRequest(res);
    return;
  }

  await postPushSubscription(pushSubscription);
  ok(res);
};

const deleteMethod = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!checkRequest(req.body, res)) {
    return;
  }
  const pushSubscriptions =
    (await getPushSubscriptions()) as Array<PushSubscription>;
  const subscription = pushSubscriptions.find((subscription) => {
    return subscription.endpoint === req.body.endpoint;
  });
  if (!subscription) {
    badRequest(res);
    return;
  }
  await deletePushSubscription(subscription);
  ok(res);
  return;
};

export default api;
