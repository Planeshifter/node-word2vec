var w2v = require("../lib/main.js");

w2v.loadModel("../src/vectors.txt", function(err, model){
  console.log(model)
  var dist = model.distance(["switzerland"], 20);
  console.log(dist);
  var analogy = model.analogy("woman",["man","king"]);
  console.log(analogy);
});
