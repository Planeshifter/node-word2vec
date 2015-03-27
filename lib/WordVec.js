'use strict';

function WordVec( word, values ) {
	this.word = word;
	this.values = values;
}

WordVec.prototype.add = function( word ) {
	var values = this.values.map( function( w, i ) {
		w += word.values[i];
		return w;
	});
	return new WordVec( null, values );
};

WordVec.prototype.subtract = function ( word ) {
	var values = this.values.map( function( w, i ) {
			w -= word.values[i];
			return w;
	});
	return new WordVec( null,  values  );
};

module.exports = exports = WordVec;
