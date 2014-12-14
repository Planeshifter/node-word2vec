var main = require("../lib/main.js");

var chai = require("chai");
var expect = chai.expect;

describe("loadModel", function(){
  it("is a callable function", function(){
    expect(main.loadModel).to.be.a("function");
  });
});

describe("word2vec", function(){
  it("is a callable function", function(){
    expect(main.word2vec).to.be.a("function");
  });
});

describe("word2phrase", function(){
  it("is a callable function", function(){
    expect(main.word2phrase).to.be.a("function");
  });
});
