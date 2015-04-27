'use strict';

/**
 * Represents a Word Vector.
 * @param{string} word - the word the vector represents
 * @param{array} values - elements of the word vector
 * @constructor
 */
function WordVector( word, values ) {
	this.word = word;
	this.values = values;
}

/**
 * Add another word vector to the current word vector.
 * @param{WordVector} word - another WordVector
 */
WordVector.prototype.add = function( word ) {
	var values = this.values.map( function( w, i ) {
		w += word.values[i];
		return w;
	});
	return new WordVector( null, values );
};

/**
 * Subtract another word vector from the current word vector.
 * @param{WordVector} word - another WordVector
 */
WordVector.prototype.subtract = function ( word ) {
	var values = this.values.map( function( w, i ) {
			w -= word.values[i];
			return w;
	});
	return new WordVector( null,  values  );
};

module.exports = exports = WordVector;
