const {
  NEXT_PUBLIC_VAPID_PUBLIC,
  VAPID_PRIVATE,
  X_MICROCMS_API_KEY,
  MONGO_URI,
  MICROCMS_DOMAIN,
} = process.env;

if (
  NEXT_PUBLIC_VAPID_PUBLIC == null ||
  VAPID_PRIVATE == null ||
  X_MICROCMS_API_KEY == null ||
  MONGO_URI == null ||
  MICROCMS_DOMAIN == null
) {
  throw new Error("環境変数が設定されていません");
}

export const env = {
  NEXT_PUBLIC_VAPID_PUBLIC,
  VAPID_PRIVATE,
  X_MICROCMS_API_KEY,
  MONGO_URI,
  MICROCMS_DOMAIN,
};
