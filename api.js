const axios = require('axios');
const Fastify = require('fastify')
const mercurius = require('mercurius')
const cheerio = require('cheerio');
const sources = require("./inetmenue-sources.json")

const app = Fastify()

const schema = `
  type Allergen {
    short: String
    long: String
  }
  type FoodItem {
    category: String
    title: String
    description: String
    price: String
    image: String
    dayShort: String
    dayKey: String
    dayLong: String
    allergeneInfo: [Allergen]
  }
  type Query {
    food(kw: String, source: String): [FoodItem] @auth(requires: USER)
  }
`;
const resolvers = {
  Query: {
    food: async (_, { kw = "", source = "" }) => {
      if (!kw) {
        return [];
      }
      if (!sources.includes(source)) {
        return [];
      }
      const data = (await axios.request({
        method: 'GET',
        url: `https://${source}.inetmenue.de/fs/menu/week/${kw}`,
        headers: {
          Accept: '*/*'
        }
      })).data.replace(/>\s+</g, '><');
      //
      const out = [];
      const $ = cheerio.load(data);
      const days = [];
      const daykeys = ["mo", "di", "mi", "do", "fr", "sa", "so"];
      $(".day-header a.day").each((index, element) => {
        const dayShort = $(element).find(".short").html()?.replace("\n                    ", "")?.replace("<br><small>", ", ")?.replace("</small>", "");
        const dayLong = $(element).find(".long").html()?.replace("\n                    ", "")?.replace("<br><small>", ", ")?.replace("</small>", "");
        days.push({ dayLong, dayShort })
      });
      let c = 0;
      $("article.menu").each((index, element) => {
        const category = $(element).find("header i").attr("title")
        const image = $(element).find("div.product div.image").css("background-image")?.replace("url(", "")?.replace(")", "");
        const title = $(element).find("h4").text()?.replace("\n                    ", "")?.replace("                ", "");
        const description = $(element).find("p.description").text()?.replace("\n                    ", "")?.replace("                ", "");
        const price = $(element).find("span.price").text();
        const allergens = $(element).find("span.allergens").text()?.replace("\n                                                                        ", "",)?.replace("                                ", "").split(",").filter(a => a.trim());
        const allergensLong = $(element).find("span.allergens").attr("title")?.replace("\n                                                                        ", "",)?.replace("                                ", "").split(", ").filter(a => a.trim());
        const day = days[c];
        const allergeneInfo = [];
        let cc = 0
        allergens.forEach(a => {
          allergeneInfo.push({ short: a, long: allergensLong[cc] });
          cc++;
        });
        out.push({ category, image, title, description, price, allergeneInfo, dayKey: daykeys[c], dayLong: day?.dayLong, dayShort: day?.dayShort });
        c++;
      });
      return out
    },
  }
}

app.register(mercurius, {
  schema,
  resolvers,
  graphiql: true
})

app.listen({ port: 3000 }).then(() => {
  console.log("listening on http://localhost:3000, also see http://localhost:3000/graphiql");
})