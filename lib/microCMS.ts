import imageJson from "../microcms/ramens.json";

interface Content {
  id: string;
  image: {
    url: string;
  };
}

export const getRamenURL = async () => {
  const results = imageJson;

  const id = results[Math.floor(Math.random() * results.length)];

  return `https://ramen-sender.vercel.app/img/${id}.jpg`;
};

export const getRamens = async () => {
  const results = imageJson;
  return results.map((id: string) => ({
    id: id,
    url: `https://ramen-sender.vercel.app/img/${results}.jpg`,
  }));
};

export const getRamenByID = async (id: string) => {
  const results = imageJson;
  if (results.some((resultID) => resultID === id)) {
    return `https://ramen-sender.vercel.app/img/${id}.jpg`;
  } else {
    return getRamenURL();
  }
};
