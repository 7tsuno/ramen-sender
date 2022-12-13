import { createClient } from "microcms-js-sdk";
import { env } from "./env";

const client = createClient({
  serviceDomain: env.MICROCMS_DOMAIN,
  apiKey: env.X_MICROCMS_API_KEY,
});

interface Content {
  id: string;
  image: {
    url: string;
  };
}

export const getRamenURL = async () => {
  const result = await client.get({
    endpoint: "ramen",
    queries: { limit: 100 },
  });

  const ramen =
    result.contents[Math.floor(Math.random() * result.contents.length)];

  return ramen.image.url;
};

export const getRamens = async () => {
  const result = await client.get({
    endpoint: "ramen",
    queries: { limit: 100 },
  });
  return result.contents.map((content: Content) => ({
    id: content.id,
    url: `${content.image.url}?w=300`,
  }));
};

export const getRamenByID = async (id: string) => {
  try {
    const result = await client.get({
      endpoint: "ramen",
      contentId: id,
    });
    if (result == null || result.image == null) {
      return getRamenURL();
    }
    return result.image.url;
  } catch (_e) {
    return getRamenURL();
  }
};
