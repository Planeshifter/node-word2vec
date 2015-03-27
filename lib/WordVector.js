'use strict';

function WordVector( word, values ) {
	this.word = word;
	this.values = values;
}

WordVector.prototype.add = function( word ) {
	var values = this.values.map( function( w, i ) {
		w += word.values[i];
		return w;
	});
	return new WordVector( null, values );
};

WordVector.prototype.subtract = function ( word ) {
	var values = this.values.map( function( w, i ) {
			w -= word.values[i];
			return w;
	});
	return new WordVector( null,  values  );
};

module.exports = exports = WordVector;
