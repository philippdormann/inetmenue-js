const Fastify = require('fastify')
const mercurius = require('mercurius');
const { getFoodItems, getSources } = require('inetmenue');
const app = Fastify()
require("dotenv").config();
const port = process.env.PORT || 3000;

let redisclient = undefined
if (process.env.CACHE_REDIS_URL) {
  console.log("init with redis cache");
  const Redis = require('ioredis');
  redisclient = new Redis(process.env.CACHE_REDIS_URL);
}

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
    food(kw: String, source: String): [FoodItem]
    sources: [String]
  }
`;

async function getFoodItemsWithCache({ kw, source }) {
  if (process.env.CACHE_REDIS_URL) {
    let result = await redisclient.get(`${kw}:${source}`)
    if (result) {
      result = JSON.parse(result);
    } else {
      result = await getFoodItems({ kw, source });
      await redisclient.set(`${kw}:${source}`, JSON.stringify(result));
      await redisclient.expire(`${kw}:${source}`, 300);
    }
    return result;
  } else {
    return await getFoodItems({ kw, source });
  }
}

const resolvers = {
  Query: {
    food: (_, { kw, source }) => getFoodItemsWithCache({ kw, source }),
    sources: () => getSources()
  }
}

app.register(mercurius, {
  schema,
  resolvers,
  graphiql: true
})

app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(`listening on http://localhost:${port}, also see http://localhost:${port}/graphiql`);
})