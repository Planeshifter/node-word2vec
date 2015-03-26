'use strict';

var main = require("../lib/main.js");

var chai = require("chai");
var expect = chai.expect;

describe("loadModel", function tests() {
	it("is a callable function", function test() {
		expect(main.loadModel).to.be.a("function");
	});
});

describe("word2vec", function tests() {
	it("is a callable function", function test() {
		expect(main.word2vec).to.be.a("function");
	});
});

describe("word2phrase", function tests() {
	it("is a callable function", function test() {
		expect(main.word2phrase).to.be.a("function");
	});
});
