https://ramen-sender.vercel.app

## VAPID Key の設定

VAPID 用のキーペアを生成します。`vapidKey.json`というファイル名で保存される

```bash
yarn run generateKey
```

.env_sample をコピーし.env を作り、 `VAPID_PUBLIC` と `VAPID_PRIVATE` をそれぞれのキーの値で埋める

## microCMS の設定

`ramen` という API を作成し、`image` という属性に画像を設定する

ドメインの XXXX.microcms.io の XXXX の部分を `MICROCMS_DOMAIN` に設定する

API KEY を.env の `X_MICROCMS_API_KEY` に設定する

## mongoDB Atlas の設定

`pushramen` という DB を作成し、 `pushSubscription` という Collection を作成しておく

.env の `MONGO_URI` に ID/PASS 付きの URI を設定する こんなの `mongodb+srv://id:pass@xxxx.xxxx.mongodb.net`

## アプリの起動

アプリを起動します

```bash
yarn dev
```

localhost:3000 で動かせます
