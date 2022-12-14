const axios = require("axios");
const fs = require("fs");
const path = require("path");
const request = require("request");
require("dotenv").config();

axios.defaults.baseURL = "/";
axios.defaults.headers.common["Content-Type"] =
  "application/json;charset=utf-8";

axios.interceptors.request.use((request) => {
  let addHeader = {};
  // microCMSへの通信時にはAPI Keyを設定する
  if (
    !request.url.indexOf(`https://${process.env.MICROCMS_DOMAIN}.microcms.io`)
  ) {
    addHeader = {
      headers: {
        "X-MICROCMS-API-KEY": process.env.X_MICROCMS_API_KEY,
      },
    };
  }
  return {
    ...request,
    ...addHeader,
  };
});

const writeFile = (path, data) => {
  fs.writeFile(path, data, function (err) {
    if (err) {
      throw err;
    }
  });
};

const getImage = (path, url) => {
  request(
    { method: "GET", url: url, encoding: null },
    function (error, response, body) {
      if (!error && response.statusCode === 200) {
        fs.writeFileSync(path, body, "binary");
      }
    }
  );
};

const build = async () => {
  const v = await axios.get(
    `https://${process.env.MICROCMS_DOMAIN}.microcms.io/api/v1/ramen?limit=100`
  );

  const datas = v.data.contents.map((content) => {
    if (content.image) {
      const fileName = content.image.url
        .split("/")
        [content.image.url.split("/").length - 1].split(".")[0];
      return {
        ...content,
        url: content.image.url,
        fileName,
        image: {
          jpg: `${fileName}.jpg`,
          webp: `${fileName}.webp`,
        },
      };
    } else {
      return { ...content };
    }
  });
  datas.forEach((content) => {
    if (content.image) {
      getImage(
        path.join(__dirname, `../public/img/${content.id}.jpg`),
        `${content.url}?w=600`
      );
      getImage(
        path.join(__dirname, `../public/img/${content.id}_low.jpg`),
        `${content.url}?w=300`
      );
    }
  });
  writeFile(
    path.join(__dirname, "../microcms/ramens.json"),
    JSON.stringify(datas.map((data) => data.id))
  );
};

build();
