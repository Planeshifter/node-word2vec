'use strict';

var main = require( '../lib/main.js' );

var chai = require( 'chai' );
var expect = chai.expect;

describe( 'loadModel', function tests() {

	it( 'is a callable function', function test() {
		expect(main.loadModel).to.be.a( 'function' );
	});

	it( 'should throw an error if not provided a string for filename', function test() {
		var values = [
			5,
			null,
			undefined,
			NaN,
			true,
			[],
			{},
			function(){}
		];

		for ( var i = 0; i < values.length; i++ ) {
			expect( badValue( values[i] ) ).to.throw( Error );
		}
		function badValue( value ) {
			return function() {
				main.loadModel( value );
			};
		}
	});



});

describe( 'word2vec', function tests() {
	it( 'is a callable function', function test() {
		expect(main.word2vec).to.be.a( 'function' );
	});
});

describe( 'word2phrase', function tests() {
	it( 'is a callable function', function test() {
		expect(main.word2phrase).to.be.a( 'function' );
	});
});
