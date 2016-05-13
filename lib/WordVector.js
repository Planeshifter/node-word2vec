'use strict';

/**
* Represents a Word Vector.
* @param {string} word - the word the vector represents
* @param {Array} values - elements of the word vector
* @constructor
*/
function WordVector( word, values ) {
	this.word = word;
	this.values = values;
}

/**
* Add another word vector to the current word vector.
* @param {WordVector} word - another WordVector
* @returns {WordVector} result of the addition
*/
WordVector.prototype.add = function( word ) {
	var i,
		values,
		len;

	len = this.values.length;
	values = new Array( len );
	for ( i = 0; i < this.values.length; i++ ) {
		values[ i ] = this.values[ i ] + word.values[ i ];
	}
	return new WordVector( null, values );
};

/**
* Subtract another word vector from the current word vector.
* @param {WordVector} word - another WordVector
* @returns {WordVector} result of the subtraction
*/
WordVector.prototype.subtract = function ( word ) {
	var i,
		values,
		len;

	len = this.values.length;
	values = new Array( len );
	for ( i = 0; i < this.values.length; i++ ) {
		values[ i ] = this.values[ i ] - word.values[ i ];
	}
	return new WordVector( null,  values  );
};


// EXPORTS //

module.exports = WordVector;
