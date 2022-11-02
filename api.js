const Fastify = require('fastify')
const mercurius = require('mercurius');
const { getFoodItems } = require('./lib');
const sources = require("./inetmenue-sources.json");
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
    food(kw: String, source: String): [FoodItem]
    sources: [String]
  }
`;
const resolvers = {
  Query: {
    food: (_, { kw, source }) => getFoodItems({ kw, source }),
    sources: () => sources
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