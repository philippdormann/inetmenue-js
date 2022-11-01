const { getFoodItems } = require('./lib');
getFoodItems(undefined, { kw: "2022W45", source: "schmecktsdannbassts" }).then((foodItems) => {
  console.log(foodItems);
})