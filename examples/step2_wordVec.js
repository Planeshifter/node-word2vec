'use strict';

var w2v = require( '../lib/main.js' );

w2v.word2vec( '../src/phrases.txt', 'vectors.txt', {
	cbow:1,
	size: 200,
	window:8,
	negative: 25,
	hs: 0,
	sample:1e-4,
	threads:20,
	iter:15,
	minCount: 5
});
