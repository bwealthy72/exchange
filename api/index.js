let currDate = null;
let rates = {};

const app = require("express")();
const axios = require("axios");

const headers = {
  "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
  "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
  "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET,
};

const exchange = async function () {
  // 업데이트 했었는지 확인
  const now = new Date();
  if (currDate) {
    const diff = (now - currDate) / (1000 * 60 * 60 * 24);
    if (diff < 1) {
      return rates;
    }
  }

  const res = await axios.get(
    `https://api.apilayer.com/fixer/latest?base=USD`,
    {
      headers: {
        apikey: process.env.CURRENCY_API,
      },
    }
  );

  if (res.data.success) {
    currDate = new Date(res.data.date);
    rates = res.data.rates;
  }
  return rates;
};

const langDetect = async function (query) {
  const params = new URLSearchParams();
  params.append("query", query);

  const res = await axios.post(
    "https://openapi.naver.com/v1/papago/detectLangs",
    params,
    {
      headers,
    }
  );

  if (res.status == 200) {
    return res.data.langCode;
  } else {
    return null;
  }
};

const transfer = async function ({ from, to, text }) {
  const params = new URLSearchParams();
  params.append("source", from);
  params.append("target", to);
  params.append("text", text);

  if (from == to) {
    return text;
  }

  try {
    const res = await axios.post(
      "https://openapi.naver.com/v1/papago/n2mt",
      params,
      {
        headers,
      }
    );

    if (res.status == 200) {
      return res.data.message.result.translatedText;
    } else {
      return null;
    }
  } catch (e) {
    console.error(e.response.data.errorMessage);
    return text;
  }
};

app.get("/exchange", async (req, res) => {
  const rates = await exchange();
  res.json((rates[req.query.to] / rates[req.query.from]) * req.query.amount);
});

app.get("/transfer", async (req, res) => {
  const from = await langDetect(req.query.text);
  res.json(await transfer({ from, ...req.query }));
});

module.exports = app;
