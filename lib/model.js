'use strict';

// MODULES //

var fs = require( 'fs' );
var readline = require( 'readline' );
var Stream = require( 'stream' );
var mime = require( 'mime' );
var _ = require( 'underscore' );
var path = require( 'path' );
var WordVec = require( './WordVector' );


// LOAD MODEL //

module.exports = function loadModel( file, callback ) {
	var model = {};
	var vocab = [];
	var words;
	var size;
	var err = null;
	var N; // number of closest words that will be shown

	if ( typeof file !== 'string' ) {
		throw new TypeError( 'Function expects file name as its first parameter.' );
	}
	file = path.resolve( process.cwd(), file );

	if ( callback === undefined ) {
		callback = function(){};
	}

	model.getVector = function ( word ) {
		for ( var i = 0; i < words; i++ ) {
			if ( vocab[i].word === word ) {
				return vocab[i];
			}
		}
		return null;
	};

	model.getVectors = function( words ) {
		if ( !words ) {
			return vocab;
		} else {
			return vocab.filter( function onElement( w ) {
				return _.contains( words, w.word );
			});
		}
	};

	model.similarity = function similarity( word1, word2 ) {
		var vecs = [];
		var sum;
		var i;
		for ( i = 0; i < words; i++ ) {
			if ( vocab[i].word === word1 || vocab[i].word === word2 ) {
				vecs.push(vocab[i].values);
			}
		}
		if ( vecs.length === 2 ) {
			sum = 0;
			for ( i = 0; i < size; i++ ) {
				sum += vecs[0][i] * vecs[1][i];
			}
			return sum;
		} else if ( vecs.length === 1 && word1 === word2 ) {
			// Case: word1 and word2 are identical:
			return 1.0;
		}
		// Case: At least one of the words is not available in vocabulary:
		return null;
	};

	function normalize( values ) {
		var a;
		var vec = values;
		var size = values.length;
		var len = 0;

		for ( a = 0; a < size; a++ ) {
			len += vec[a] * vec[a];
		}
		len = Math.sqrt( len );
		for ( a = 0; a < size; a++ ) {
			vec[a] /= len;
		}

		return vec;
	}

	model.getNearestWord = function getNearestWord( vec ) {
		var bestw;
		var bestd;
		var c;
		var a;

		if ( vec instanceof WordVec === true ) {
			vec = vec.values;
		}
		vec = normalize( vec );

		for ( c = 0; c < words; c++) {
			var dist = 0;
			for ( a = 0; a < size; a++ ) {
				dist += vec[a] * vocab[c].values[a];
			}
			if ( c === 0 || dist > bestd ) {
				bestd = dist;
				bestw = vocab[c].word;
			}
		}

		var o = {};
		o.word = bestw;
		o.dist = bestd;
		return o;
	};

	model.getNearestWords = function getNearestWords( vec, N_input ) {
		var bestd;
		var bestw;
		var dist;
		var ret;
		var d;
		var i;
		var c;
		var a;

		N = N_input || 10;
		if ( vec instanceof WordVec === true ) {
			vec = vec.values;
		}
		vec = normalize( vec );

		bestw = new Array(N);
		bestd = Array.apply( null, new Array(N) ).map( Number.prototype.valueOf, -1 );

		for ( c = 0; c < words; c++ ) {
			dist = 0;
			for ( a = 0; a < size; a++ ) {
				dist += vec[a] * vocab[c].values[a];
			}
			for ( a = 0; a < N; a++ ) {
				if ( dist > bestd[a] ) {
					for ( d = N - 1; d > a; d-- ) {
						bestd[d] = bestd[d - 1];
						bestw[d] = bestw[d - 1];
					}
					bestd[a] = dist;
					bestw[a] = vocab[c].word;
					break;
				}
			}
		}

		ret = [];
		for ( i = 0; i < N; i++ ) {
			var o = {};
			o.word = bestw[i];
			o.dist = bestd[i];
			ret[i] = o;
		}
		return ret;
	};

	model.mostSimilar = function mostSimilar( input_phrase, N_input ) {
		var phrase_words;
		var phrase;
		var bestw;
		var bestd;
		var found;
		var dist;
		var vec;
		var len;
		var cn;
		var a;
		var b;
		var c;
		var i;
		var d;
		var o;

		N = N_input || 40;
		phrase = {
			words: [],
			output: {}
		};
		phrase_words = input_phrase.split( ' ' );

		for ( i = 0; i < phrase_words.length; i++ ) {
			o = {
				word: phrase_words[ i ],
				pos: -1
			};
			phrase.words.push( o );
		}

		bestw = new Array( N );
		bestd = Array.apply( null, new Array(N) ).map( Number.prototype.valueOf, -1 );
		cn = phrase.words.length;
		// Boolean checking whether at least one phrase word is in dictionary...
		found = false;
		for ( a = 0; a < cn; a++ ) {
			for ( b = 0; b < words; b++ ) {
				if ( phrase.words[a].word === vocab[b].word ) {
					found = true;
					phrase.words[a].pos = b;
					break;
				}
			}
			if ( phrase.words[a].pos === -1 ) {
				console.log( 'Out of dictionary word: ' + phrase.words[a].word + '\n' );
			}
		}

		if ( found === false ) {
			// All words are out-of-dictionary, return `null`:
			return null;
		}

		vec = [];
		for ( i = 0; i < size; i++ ) {
			vec[i] = 0;
		}
		for ( b = 0; b < cn; b++ ) {
			if ( phrase.words[b].pos !== -1 ) {
				for ( a = 0; a < size; a++ ) {
					vec[a] += vocab[ phrase.words[b].pos ].values[a];
				}
			}
		}

		// Normalizing vector vec...
		len = 0;
		for ( a = 0; a < size; a++ ) {
			len += vec[a] * vec[a];
		}
		len = Math.sqrt( len );
		for ( a = 0; a < size; a++ ) {
			vec[a] = vec[a] / len;
		}

		// Iterate through vocabulary...
		for ( c = 0; c < words; c++ ) {
			a = 0;
			for ( b = 0; b < cn; b++ ) {
				if ( phrase.words[b].pos === c ) {
					a = 1;
				}
			}
			if ( a !== 1 ){
				dist = 0;
				for ( a = 0; a < size; a++ ) {
					dist += vec[a] * vocab[c].values[a];
				}
				for ( a = 0; a < N; a++ ) {
					if ( dist > bestd[a] ) {
						for ( d = N - 1; d > a; d-- ) {
							bestd[d] = bestd[d - 1];
							bestw[d] = bestw[d - 1];
						}
					bestd[a] = dist;
					bestw[a] = vocab[c].word;
					break;
					}
				}
			}
		}

		var ret = [];
		for ( i = 0; i < N; i++ ) {
			o = {};
			o.word = bestw[i];
			o.dist = bestd[i];
			ret[i] = o;
		}
		return ret;
	};

	model.analogy = function analogy( word, pair, N_input ) {
		var phrase;
		var bestw;
		var bestd;
		var ret;
		var vec;
		var bi;
		var cn;
		var a;
		var b;
		var d;
		var i;
		var o;

		N = N_input || 40;
		if ( _.isString(word) === false ) {
			throw new TypeError( 'Word of interest has to be supplied as string.' );
		}
		if ( _.isArray(pair) === false ) {
			throw new TypeError( 'Word pair has to be supplied in string Array.' );
		}
		phrase = {
			words: pair,
			output: {}
		};

		phrase.words.push( word );
		phrase.words = phrase.words.map( function(word) {
			o = {};
			o.word = word;
			o.pos = -1;
			return o;
		});

		bestw = new Array( N );
		bestd = Array.apply(null, new Array(N)).map(Number.prototype.valueOf, 0);
		cn = phrase.words.length;
		bi = phrase.words;
		vec = Array.apply(null, new Array(size)).map(Number.prototype.valueOf, 0);

		for ( a = 0; a < cn; a++ ) {
			for ( b = 0; b < words; b++ ) {
				if ( phrase.words[a].word === vocab[b].word ) {
					phrase.words[a].pos = b;
					break;
				}
			}
			if ( phrase.words[a].pos === -1 ) {
				console.log( 'Out of dictionary word: ' + phrase.words[a].word + '\n' );
				break;
			}
		}

		for ( b = 0; b < cn; b++ ) {
			if ( phrase.words[b].pos !== -1 ) {
				for ( a = 0; a < size; a++ ) {
					vec[a] += vocab[phrase.words[b].pos].values[a];
				}
			}
		}

		for ( a = 0; a < size; a++ ) {
			vec[a] = vocab[bi[1].pos].values[a] - vocab[bi[0].pos].values[a] + vocab[bi[2].pos].values[a];
		}

		var len = 0;
		for ( a = 0; a < size; a++ ) {
			len += vec[a] * vec[a];
		}
		len = Math.sqrt( len );
		for ( a = 0; a < size; a++ ) {
			vec[a] /= len;
		}

		for ( var c = 0; c < words; c++ ) {
			if ( c === bi[0].pos ) {
				continue;
			}
			if ( c === bi[1].pos ) {
				continue;
			}
			if ( c === bi[2].pos ) {
				continue;
			}
			a = 0;
			for ( b = 0; b < cn; b++ ) {
				if ( bi[b].pos === c ) {
					a = 1;
				}
			}
			if ( a === 1 ) {
				continue;
			}
			var dist = 0;
			for ( a = 0; a < size; a++ ) {
				dist += vec[a] * vocab[c].values[a];
			}
			for ( a = 0; a < N; a++ ) {
				if ( dist > bestd[a] ) {
					for ( d = N - 1; d > a; d-- ) {
						bestd[d] = bestd[d - 1];
						bestw[d] = bestw[d - 1];
					}
					bestd[a] = dist;
					bestw[a] = vocab[c].word;
					break;
				}
			}
		}

		ret = [];
		for( i = 0; i < N; i++ ){
			o = {};
			o.word = bestw[i];
			o.dist = bestd[i];
			ret[ i ] = o;
		}
		return ret;
	};

	function init( file ) {
		var mime_type = mime.getType( file );
		switch ( mime_type ) {
			case 'text/plain':
				readTxt( file );
			break;
			case 'application/octet-stream':
				readBinary( file );
			break;
		}
	}
	init( file );

	function readTxt( file ) {
		var instream = fs.createReadStream( file );
		var outstream = new Stream();
		var rl = readline.createInterface( instream, outstream );
		var counter = 0;

		rl.on( 'line', function( line ) {
			var values;
			var word;
			var arr;
			var len;
			var val;
			var a;
			var i;
			var o;

			if ( counter === 0 ) {
				arr = line.split( ' ' );
				words = arr[0];
				size = arr[1];
				if( isNaN(words) || isNaN(size) ) {
					throw new Error( 'First line of text file has to be <number of words> <length of vector>.' );
				}
			} else {
				arr = line.split( ' ' );
				word = arr.shift( 1 );

				values = [];
				for ( i = 0; i < arr.length; i++ ) {
					val = arr[ i ];
					if ( val !== '' ) {
						values.push( parseFloat( val ) );
					}
				}
				o = new WordVec( word, values );

				len = 0;
				for ( a = 0; a < size; a++ ) {
					len += o.values[a] * o.values[a];
				}
				len = Math.sqrt(len);
				for (a = 0; a < size; a++) {
					o.values[a] /= len;
				}
				vocab.push( o );
			}
			counter++;
		});
		rl.on( 'close', function() {
			model.words = words;
			model.size = size;
			callback( err, model );
		});
	}

	function readBinary( file ) {
		var MAX_STRING = 100;
		fs.open( file, 'r', function( status, fd ) {
			// Need enough data to cover the string for two long longs...
			var buffer = new Buffer( 50 );
			var pos = 0;

			fs.read( fd, buffer, 0, 50, 0, function( err, bytesRead, buffer ) {
				var arr;

				if ( err ) {
					callback( err, null );
					return;
				}
				arr = buffer.toString().split(/[ \n]/);
				words = parseInt( arr[0], 10 );
				size = parseInt( arr[1], 10 );

				pos += arr[0].length;
				pos += arr[1].length;
				pos += 2; // whitespaces

				// maximum length of a vector is 100
				// and size*4 bytes for the floats
				buffer = new Buffer( MAX_STRING + size * 4 );

				fs.read( fd, buffer, 0, MAX_STRING + size * 4, pos, function readOne( err, bytesRead, buffer ) {
					var values;
					var word;
					var len;
					var off;
					var a;
					var i;
					var o;

					if ( err ) {
						callback( err, null );
						return;
					}

					if ( bytesRead < size * 4 ) {
						model.words = words;
						model.size = size;
						callback( err, model );
						return;
					}

					word = buffer
						.toString()
						.split(' ')[0];
					pos += Buffer.from(word).byteLength + 1;
					pos += size * 4;

					off = Buffer.from(word).byteLength + 1;
					values = new Float32Array( size );
					for ( i = 0; i < size; i++ ) {
						values[ i ] = buffer.readFloatLE( off );
						off += 4;
					}
					o = new WordVec( word.trim(), values );

					len = 0;
					for ( a = 0; a < size; a++ ) {
						len += o.values[a] * o.values[a];
					}
					len = Math.sqrt( len );
					for ( a = 0; a < size; a++ ) {
						o.values[a] /= len;
					}
					vocab.push( o );

					fs.read( fd, buffer, 0, MAX_STRING + size * 4, pos, readOne );
				});
			});
		});
	}
};
