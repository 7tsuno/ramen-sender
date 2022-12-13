import {
  deletePushSubscription,
  getPushSubscriptions,
  PushSubscription,
  updatePushSubscription,
} from "../../lib/mongoDB";
import { getRamenByID, getRamenURL } from "../../lib/microCMS";
import dayjs from "dayjs";
import { badRequest, checkRequest, notAllowed, ok } from "../../lib/request";
import { webPush } from "../../lib/webPush";
import { NextApiRequest, NextApiResponse } from "next";
import { getMessageByKey, randomMessage } from "../../lib/messages";

const api = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    await postMethod(req, res);
  }
  notAllowed(res);
  return;
};

const getUrlAndMessage = async (req: NextApiRequest) => {
  // cronから呼び出された場合はランダムで取得
  if (req.body.cron) {
    return {
      url: await getRamenURL(),
      message: randomMessage().message,
    };
  }

  return {
    url: await getRamenByID(req.body.imageID),
    message: getMessageByKey(req.body.messageKey).message,
  };
};

const postMethod = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!checkRequest(req.body.subscription, res)) {
    return;
  }

  const [urlAndMessage, pushSubscriptions] = await Promise.all([
    getUrlAndMessage(req),
    getPushSubscriptions() as Promise<Array<PushSubscription>>,
  ]);

  // endpointが一致しないものは不正リクエストとしてプッシュ送信を実行しない
  const subscription = pushSubscriptions.find((subscription) => {
    return subscription.endpoint === req.body.subscription.endpoint;
  });

  if (subscription == null) {
    badRequest(res);
    return;
  }

  // 前回送信から60秒経過していないと連続送信はできないように制限
  if (
    subscription.lastSendTime != null &&
    dayjs(new Date()).diff(subscription.lastSendTime, "seconds") < 60
  ) {
    badRequest(res);
    return;
  }

  await Promise.all([
    updatePushSubscription(subscription),
    ...pushSubscriptions.map((pushSubscription) =>
      webPush
        .sendNotification(
          pushSubscription,
          JSON.stringify({
            body: urlAndMessage.message,
            image: urlAndMessage.url,
          })
        )
        .catch((_err) => {
          // 飛ばせないPushSubscriptionは削除しとく
          deletePushSubscription(pushSubscription);
        })
    ),
  ]);
  ok(res);
};

export default api;
