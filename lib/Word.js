'use strict';

function Word( word, values ) {
	this.word = word;
	this.values = values;
}

Word.prototype.add = function( word ) {
	var values = this.values.map( function( w, i ) {
		w += word.values[i];
		return w;
	});
	return new Word( null, values );
};

Word.prototype.subtract = function ( word ) {
	var values = this.values.map( function( w, i ) {
			w -= word.values[i];
			return w;
	});
	return new Word( null,  values  );
};

module.exports = exports = Word;
