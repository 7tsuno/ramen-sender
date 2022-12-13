import { NextApiRequest, NextApiResponse } from "next";
import { PushSubscription } from "./mongoDB";

export const checkRequest = (
  subscription: PushSubscription,
  res: NextApiResponse
) => {
  if (
    subscription == null ||
    subscription.endpoint == null ||
    subscription.keys == null
  ) {
    badRequest(res);
    return false;
  }
  try {
    new URL(subscription.endpoint);
  } catch (_) {
    badRequest(res);
    return false;
  }
  return true;
};

export const ok = (res: NextApiResponse, params?: Object) => {
  res.status(200).send(JSON.stringify(params));
};

export const notAllowed = (res: NextApiResponse, params?: Object) => {
  res.status(405).send(params);
};

export const badRequest = (res: NextApiResponse, params?: Object) => {
  res.status(400).send(params);
};
