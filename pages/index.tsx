import Head from "next/head";
import React, { useCallback, useEffect, useMemo } from "react";
import styles from "../styles/Home.module.css";
import { useState } from "react";
import {
  Button,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import axios from "axios";

import { NavigateBefore, NavigateNext } from "@mui/icons-material";
import { SelectChangeEvent } from "@mui/material";
import { notificationMessages } from "../lib/messages";
import Image from "next/image";
import imageJson from "../microcms/ramens.json";

export default function Home() {
  const [registerd, setRegisterd] = useState(false);
  const [sended, setSended] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [images, setImages] = useState<Array<{ id: string; url: string }>>([]);
  const [messageKey, setMessageKey] = React.useState(
    notificationMessages[0].key
  );
  const [quality, setQuality] = useState(100);

  const changeMessage = (event: SelectChangeEvent) => {
    setMessageKey(event.target.value);
  };

  // ServiceWorkerの登録
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      try {
        navigator.serviceWorker.register("./svc_worker.js");
      } catch (err) {
        console.log(`Service Worker registration failed: ${err}`);
      }
      (async () => {
        if ("serviceWorker" in navigator) {
          const swReg = await navigator.serviceWorker.getRegistration();
          if (swReg) {
            const subscription = await swReg.pushManager.getSubscription();
            setRegisterd(!!subscription);
          }
        }
      })();
    }
  }, []);

  useEffect(() => {
    if (registerd) {
      (async () => {
        const result = await axios.get("/api/ramen");
        setImages(result.data);
      })();
    }
  }, [registerd]);

  // プッシュ通知購読開始
  const registerSubscription = useCallback(async () => {
    // プッシュ通知の権限をリクエストする
    Notification.requestPermission(async (permission) => {
      if (
        permission === "granted" &&
        process.env.NEXT_PUBLIC_VAPID_PUBLIC != null
      ) {
        const urlB64ToUint8Array = (base64String: string) => {
          const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
          const base64 = (base64String + padding)
            .replace(/\-/g, "+")
            .replace(/_/g, "/");

          const rawData = window.atob(base64);
          const outputArray = new Uint8Array(rawData.length);

          for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
          }
          return outputArray;
        };

        if ("serviceWorker" in navigator) {
          const options = {
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(
              process.env.NEXT_PUBLIC_VAPID_PUBLIC
            ),
          };

          // Push通知を購読する
          const registration = await navigator.serviceWorker.ready;
          const pushSubscription = await registration.pushManager.subscribe(
            options
          );

          // PushSubscriptionをサーバに送る
          axios.post("/api/pushSubscription", pushSubscription);
          setRegisterd(true);
        }
      }
    });
  }, []);

  // プッシュ通知の購読を解除する
  const unregisterSubscription = useCallback(async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration != null) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            await axios.delete("/api/pushSubscription", { data: subscription });
            await subscription.unsubscribe();
          }
          setRegisterd(false);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

  // プッシュ通知を送信する
  const sendSubscription = useCallback(async () => {
    setSended(true);
    setSendError(false);
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          axios
            .post("/api/pushNotification", {
              subscription,
              imageID: images[imageIndex].id,
              messageKey,
            })
            .catch((_e) => {
              setSendError(true);
            });
        }
      }
    }
    // 連続で送れないように再活性まで1分待つ。サーバ側でも制御する
    setTimeout(() => {
      setSended(false);
    }, 60000);
  }, [imageIndex, images, messageKey]);

  const nextImage = useCallback(() => {
    if (images.length - 1 === imageIndex) {
      setImageIndex(0);
    } else {
      setImageIndex(imageIndex + 1);
    }
  }, [imageIndex, images.length]);

  const previewImage = useCallback(() => {
    if (0 === imageIndex) {
      setImageIndex(images.length - 1);
    } else {
      setImageIndex(imageIndex - 1);
    }
  }, [imageIndex, images.length]);

  const image = useMemo(() => {
    if (images.length === 0) {
      return "/ramen.jpeg";
    }

    setQuality(1);
    return `/img/${images[imageIndex].id}.jpg`;
  }, [imageIndex, images]);

  const onLoadingComplete = useCallback(() => {
    if (quality === 1) {
      setQuality(100);
      return;
    }
  }, [quality]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta property="og:url" content="ページのURL" />
        <meta property="og:title" content="Ramen Sender" />
        <meta
          property="og:description"
          content="ラーメン画像をプッシュ通知で送りつけあって飯テロするクソWebアプリ"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://pushramen.vercel.app/ramen.jpeg"
        />
        <title>Ramen Sender</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Typography sx={{ mb: 2 }} variant="h4" component="h1">
          Ramen Sender
        </Typography>
        {sendError && (
          <Typography sx={{ m: 2 }} variant="body2" color="red">
            連続で送信することはできません
          </Typography>
        )}
        {!registerd && (
          <Button
            sx={{ m: 2 }}
            variant="contained"
            onClick={registerSubscription}
          >
            プッシュ通知の購読を開始する
          </Button>
        )}
        {registerd && images.length > 1 && (
          <>
            <Typography variant="caption">送る画像</Typography>
            <Image
              alt="ramen"
              src={image}
              width={300}
              height={300}
              style={{
                objectFit: "cover",
              }}
              quality={quality}
              onLoadingComplete={onLoadingComplete}
              priority={true}
            />
            <div style={{ display: "none" }}>
              {imageJson.map((id: string) => (
                <Image
                  key={id}
                  alt="ramen"
                  src={`/img/${id}.jpg`}
                  width={300}
                  height={300}
                  style={{
                    objectFit: "cover",
                  }}
                  quality={1}
                  priority={true}
                />
              ))}
            </div>
            <Grid>
              <IconButton
                aria-label="preview"
                sx={{ m: 1 }}
                size="large"
                onClick={previewImage}
              >
                <NavigateBefore />
              </IconButton>
              <IconButton
                aria-label="next"
                sx={{ m: 1 }}
                size="large"
                onClick={nextImage}
              >
                <NavigateNext />
              </IconButton>
            </Grid>
            <Typography variant="caption">送るメッセージ</Typography>
            <FormControl sx={{ mb: 1, minWidth: 120 }} size="small">
              <Select
                value={messageKey}
                onChange={changeMessage}
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
              >
                {notificationMessages.map((notificationMessage, index) => (
                  <MenuItem value={notificationMessage.key} key={index}>
                    <Typography variant="caption">
                      {notificationMessage.message}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              disabled={sended}
              sx={{ m: 2 }}
              variant="contained"
              onClick={sendSubscription}
            >
              プッシュ通知を送信する
            </Button>
            <Button
              sx={{ m: 2 }}
              variant="outlined"
              onClick={unregisterSubscription}
            >
              プッシュ通知の購読を解除する
            </Button>
          </>
        )}
      </main>
    </div>
  );
}
