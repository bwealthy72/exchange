<template>
  <div class="wrapper">
    <div class="currency">
      <select v-model="from">
        <option v-for="(val, key) in countries" :key="key" :value="key">
          {{ key }}
        </option>
      </select>
      <select v-model="to">
        <option v-for="(val, key) in countries" :key="key" :value="key">
          {{ key }}
        </option>
      </select>
    </div>
    <div class="input-form">
      <input
        @keypress.enter="run"
        type="text"
        :placeholder="from"
        v-model="inText"
      />
      <input type="text" :placeholder="to" v-model="outText" />
      <button @click="run">RUN</button>
    </div>

    <h2>Output</h2>
    <div class="result-form">
      <div>
        <div>From</div>
        <input type="text" />
        <input type="text" />
      </div>
      <div>
        <div>To</div>
        <input type="text" />
        <input type="text" />
      </div>
    </div>
  </div>
</template>

<script>
import wordsToNumbers from "words-to-numbers";
export default {
  data() {
    return {
      countries: {
        KRW: {
          name: "Republic of Korea",
          currency: "KRW",
        },
        EUR: {
          name: "European Union",
          currency: "EUR",
        },
        CHN: {
          name: "China",
          currency: "CNY",
        },
        JPN: {
          name: "Japan",
          currency: "JPY",
        },
        USA: {
          name: "The United State of America",
          currency: "USD",
        },
      },
      from: "KRW",
      to: "USA",
      inText: "",
      outText: "",
      input: null,
      result: null,
      currencyUnit: [
        "pound",
        "yen",
        "won",
        "dollars",
        "dollar",
        "euro",
        "kwai",
        "£",
        "€",
        "$",
        "₩",
        "¥",
        "元",
        "块",
        "us$",
        "cn¥",
        "rm¥",
      ],
    };
  },
  methods: {
    toWordFrom(num) {
      const a = [
        "",
        "one ",
        "two ",
        "three ",
        "four ",
        "five ",
        "six ",
        "seven ",
        "eight ",
        "nine ",
        "ten ",
        "eleven ",
        "twelve ",
        "thirteen ",
        "fourteen ",
        "fifteen ",
        "sixteen ",
        "seventeen ",
        "eighteen ",
        "nineteen ",
      ];
      const b = [
        "",
        "",
        "twenty",
        "thirty",
        "forty",
        "fifty",
        "sixty",
        "seventy",
        "eighty",
        "ninety",
      ];
      if ((num = num.toString()).length > 9) return "overflow";
      let n = ("000000000" + num)
        .substr(-9)
        .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n) return num;
      let str = "";
      str +=
        n[1] != 0
          ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + "crore "
          : "";
      str +=
        n[2] != 0
          ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + "lakh "
          : "";
      str +=
        n[3] != 0
          ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + "thousand "
          : "";
      str +=
        n[4] != 0
          ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + "hundred "
          : "";
      str += n[5] != 0 ? a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]] : "";
      return str;
    },

    async transfer(str) {
      // Transfer
      const res = await this.$axios.get("/api/transfer", {
        params: {
          to: "en",
          text: str,
        },
      });

      // Remove currency unit
      let removed = res.data.toLowerCase();
      for (const unit of this.currencyUnit) {
        removed = removed.replaceAll(unit, "");
      }

      console.log("removed", removed);

      let result = "";
      for (const num of removed.split(" ")) {
        result += this.toWordFrom(num);
      }
      console.log("string", result);

      return result;
    },

    async exchange(num) {
      const params = new URLSearchParams();
      params.append("from", this.countries[this.from].currency);
      params.append("to", this.countries[this.to].currency);
      params.append("amount", num);

      console.log(
        "exchange: ",
        this.countries[this.to].currency,
        this.countries[this.from].currency,
        num
      );

      const res = await this.$axios.get(
        "https://api.apilayer.com/fixer/convert",
        {
          params,
          headers: {
            apikey: "qosqNFnGCAkMBIPDOAyFjlxDXARbWVJE",
          },
        }
      );

      if (res.status == 200) {
        return res.data.result;
      } else {
        return null;
      }
    },
    async run() {
      const str = await this.transfer(this.inText);

      const num = wordsToNumbers(str, { fuzzy: true });
      // console.log("word to number: ", str, num);
      const result = await this.exchange(num);
      // console.log("result: ", result);

      this.outText = result;
    },
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
}
</style>
