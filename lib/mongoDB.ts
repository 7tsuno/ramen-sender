import { MongoClient, ObjectId } from "mongodb";
import { env } from "./env";

const mclient = new MongoClient(env.MONGO_URI);

export interface PushSubscription {
  _id?: ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  lastSendTime?: Date;
}

const getCollection = async () => {
  await mclient.connect();
  return mclient.db("pushRamen").collection("pushSubscription");
};

export const getPushSubscriptions = async () => {
  const collection = await getCollection();
  return collection.find().toArray();
};

export const postPushSubscription = async (
  pushSubscription: PushSubscription
) => {
  const collection = await getCollection();
  return collection.insertOne(pushSubscription);
};

export const updatePushSubscription = async (
  pushSubscription: PushSubscription
) => {
  const collection = await getCollection();
  return collection.updateOne(
    {
      _id: pushSubscription._id,
    },
    {
      $set: {
        lastSendTime: new Date(),
      },
    }
  );
};

export const deletePushSubscription = async (
  pushSubscription: PushSubscription
) => {
  const collection = await getCollection();
  return collection.deleteOne(pushSubscription);
};
