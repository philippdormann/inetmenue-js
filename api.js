const Fastify = require('fastify')
const mercurius = require('mercurius');
const { getFoodItems, getSources } = require('./index');
const app = Fastify()
require("dotenv").config();
const port = process.env.PORT || 3000;

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