export const notificationMessages = [
  {
    key: "1",
    message: "ラーメン、どうですか？",
  },
  {
    key: "2",
    message: "おなか、すきません？",
  },
  {
    key: "3",
    message: "おいしそうですね。",
  },
];

export const randomMessage = () => {
  return notificationMessages[
    Math.floor(Math.random() * notificationMessages.length)
  ];
};
export const getMessageByKey = (key: string) => {
  if (key == null) {
    return randomMessage();
  }
  const notificationMessage = notificationMessages.find(
    (notificationMessage) => notificationMessage.key === key
  );
  if (notificationMessage == null) {
    return randomMessage();
  }
  return notificationMessage;
};
