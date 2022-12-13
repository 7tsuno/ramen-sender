/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
// pushイベントハンドラを登録
self.addEventListener("push", (event) => {
  // 通知設定が行われているかをチェック
  if (!self.Notification || self.Notification.permission !== "granted") {
    // 通知設定が行われていなければ何もせず終了
    return;
  }

  // 送信されたデータを取得
  if (event.data) {
    const data = JSON.parse(event.data.text());

    event.waitUntil(
      self.registration.showNotification("Ramen Sender", {
        body: data.body,
        image: data.image || undefined,
        icon: data.image || undefined,
      })
    );
  }
});

// 表示された通知をクリックされた場合に発生するイベント
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  clients.openWindow(`/`);
});
