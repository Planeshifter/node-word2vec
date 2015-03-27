'use strict';

var w2v = require( '../lib/main.js' );

w2v.word2phrase( '../src/text8', 'phrases.txt', {
	threshold:100,
	debug:2,
	minCount: 5
});
