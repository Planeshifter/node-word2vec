'use strict';

var w2v = require( '../lib/main.js');

w2v.loadModel( '../src/vectors.txt', function( err, model ) {

	var wordVecs = model.getVectors( ['king', 'man', 'woman'] );

	var result = wordVecs[0].subtract( wordVecs[1] ).add( wordVecs[2] );

	console.log( model.getNearestWords(result, 10 ) );
});
