# inetmenue-js
inetmenue.de parser for js

## Data Sources
currently 360 sources, see [sources.json](./sources.json) for the full list

## GraphQL Usage
```
node api.js
```

hosted version: https://inetmenue.onrender.com/graphiql

## Library Usage
```
pnpm i inetmenue
```
```
import { getFoodItems } from "inetmenue/index.js";

const foodItems = await getFoodItems({ kw: "2022W45", source: "fag-neustadt" })
console.log(foodItems);
```