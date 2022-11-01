const Fastify = require('fastify')
const mercurius = require('mercurius');
const { getFoodItems } = require('./lib');
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
  }
`;
const resolvers = {
  Query: {
    food: getFoodItems,
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