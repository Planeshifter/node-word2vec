'use strict';

var w2v = require( './../lib' );

w2v.word2phrase( __dirname + '/fixtures/input.txt', __dirname + '/fixtures/phrases.txt', {
	threshold: 5,
	debug: 2,
	minCount: 2
});
