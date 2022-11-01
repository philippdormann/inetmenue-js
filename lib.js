const axios = require('axios');
const cheerio = require('cheerio');
const sources = require("./inetmenue-sources.json")
const getFoodItems = async (_, { kw = "", source = "" }) => {
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
}
exports.getFoodItems = getFoodItems