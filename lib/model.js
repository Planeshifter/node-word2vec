'use strict';

// load packages
var fs = require( 'fs' );
var readline = require( 'readline' );
var stream = require( 'stream' );
var mime = require( 'mime' );
var _ = require( 'underscore' );
var path = require( 'path' );

var WordVec = require( './WordVector' );

module.exports = function loadModel( file, callback ) {
    var err = null;
    if( typeof file !== 'string' ) {
        throw new TypeError( 'Function expects file name as first parameter.');
    }

    if ( callback === undefined ) {
        callback = function(){};
    }

    var model = {};

    var vocab = [];
    var words, size;
    var N; // number of closest words that will be shown

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
            return vocab.filter(function(w){
                return _.contains(words, w.word);
            });
        }
    };

    model.similarity = function similarity( word1, word2 ) {
        var vecs = [];
        for ( var i = 0; i < words; i++ ) {
            if ( vocab[i].word === word1 || vocab[i].word === word2 ) {
                vecs.push(vocab[i].values);
            }
        }
        if ( vecs.length === 2 ) {
            var sum = 0;
            for ( i = 0; i < size; i++ ) {
                sum += vecs[0][i] * vecs[1][i];
            }
        return sum;
        } else {
            return null;
        }
    };

    function normalize( values ) {
        var a;
        var vec = values;
        var size = values.length;
        var len = 0;
        for ( a = 0; a < size; a++ ) {
                len += vec[a] * vec[a];
        }
        len = Math.sqrt(len);
        for ( a = 0; a < size; a++ ) {
                vec[a] /= len;
        }

        return vec;
    }

    model.getNearestWord = function getNearestWord( vec ) {

        if ( vec instanceof WordVec === true ) {
            vec = vec.values;
        }
        vec = normalize(vec);

        var bestw, bestd, c, a;

        for ( c = 0; c < words; c++) {
            var dist = 0;
            for (a = 0; a < size; a++) {
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
        var d, i, c, a;

        N = N_input || 10;
        if ( vec instanceof WordVec === true ) {
            vec = vec.values;
        }
        vec = normalize(vec);

        var bestw = new Array(N);
        var bestd = Array.apply(null, new Array(N)).map(Number.prototype.valueOf,-1);

        for ( c = 0; c < words; c++ ) {
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

        var ret = [];
        for( i = 0; i < N; i++ ) {
            var o = {};
            o.word = bestw[i];
            o.dist = bestd[i];
            ret[i] = o;
        }
        return ret;

    };

    model.mostSimilar = function most_similar( input_phrase, N_input ) {
        N = N_input || 40;
        var phrase = {};
        var a, b, i, d;
        var phrase_words = input_phrase.split(' ');
        phrase.words = phrase_words.map(function(word){
            var o = {};
            o.word = word;
            o.pos = -1;
            return o;
        });
        phrase.output = {};
        var bestw = new Array(N);
        var bestd = Array.apply(null, new Array(N)).map(Number.prototype.valueOf,-1);
        var cn = phrase.words.length;
        for ( a = 0; a < cn; a++ ) {
            for( b=0; b < words; b++ ) {
                if( phrase.words[a].word === vocab[b].word ) {
                    phrase.words[a].pos = b;
                    break;
                }
            }
            if( phrase.words[a].pos === -1 ) {
                console.log('Out of dictionary word: ' + phrase.words[a].word + '\n');
            }
        }
        var vec = [];
        for (i = 0; i < size; i++) {
            vec[i] = 0;
        }
        for ( b = 0; b < cn; b++ ) {
            if ( phrase.words[b].pos !== -1 ) {
                for (a = 0; a < size; a++) {
                    vec[a] += vocab[phrase.words[b].pos].values[a];
                }
            }
        }

        /* ------------- */
        /* normalizing vector vec */
        var len = 0;
        for ( a = 0; a < size; a++ ) {
            len += vec[a] * vec[a];
            }
            len = Math.sqrt(len);
            for ( a = 0; a < size; a++ ) {
                vec[a] = vec[a] / len;
            }

            /* iterate through vocab */

            for (var c = 0; c < words; c++) {
                a = 0;
                for (b = 0; b < cn; b++) {
                    if (phrase.words[b].pos === c) {
                        a = 1;
                    }
                }
                if (a !== 1){
                    var dist = 0;
                    for ( a = 0; a < size; a++ ) {
                        dist += vec[a] * vocab[c].values[a];
                    }
                    for (a = 0; a < N; a++) {
                        if (dist > bestd[a]) {
                            for (d = N - 1; d > a; d--) {
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
            for(i = 0; i < N; i++){
                var o = {};
                o.word = bestw[i];
                o.dist = bestd[i];
                ret[i] = o;
            }
            return ret;
        };

    model.analogy = function analogy( word, pair, N_input ) {
        N = N_input || 40;
        if( _.isString(word) === false ) {
            throw new TypeError( 'Word of interest has to be supplied as string.' );
        }
        if( _.isArray(pair) === false ) {
            throw new TypeError( 'Word pair has to be supplied in string Array.' );
        }
        var a, b, i, d;
        var phrase = {};
        phrase.words = pair;
        phrase.words.push(word);
        phrase.words = phrase.words.map(function(word){
            var o = {};
            o.word = word;
            o.pos = -1;
            return o;
        });
        phrase.output = {};

        var bestw = new Array(N);
        var bestd = Array.apply(null, new Array(N)).map(Number.prototype.valueOf, 0);
        var cn = phrase.words.length;
        var bi = phrase.words;
        var vec = Array.apply(null, new Array(size)).map(Number.prototype.valueOf, 0);

        for (a = 0; a < cn; a++ ) {
            for (b = 0; b < words; b++ ) {
                if ( phrase.words[a].word === vocab[b].word ) {
                    phrase.words[a].pos = b;
                    break;
                }
            }
            if( phrase.words[a].pos === -1 ) {
                console.log('Out of dictionary word: ' + phrase.words[a].word + '\n');
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
        len = Math.sqrt(len);
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
                if (bi[b].pos === c) {
                    a = 1;
                }
            }
            if ( a === 1) {
                continue;
            }
            var dist = 0;
            for (a = 0; a < size; a++) {
                dist += vec[a] * vocab[c].values[a];
            }
            for (a = 0; a < N; a++) {
                if (dist > bestd[a]) {
                    for (d = N - 1; d > a; d--) {
                        bestd[d] = bestd[d - 1];
                        bestw[d] = bestw[d - 1];
                    }
                    bestd[a] = dist;
                    bestw[a] = vocab[c].word;
                    break;
                }
            }
        }

        var ret = [];
        for(i = 0; i < N; i++){
            var o = {};
            o.word = bestw[i];
            o.dist = bestd[i];
            ret[i] = o;
        }
        return ret;
    };

    function init( file ) {
        var mime_type = mime.lookup(file);
        switch(mime_type){
            case 'text/plain':
                readTxt(file);
            break;
            case 'application/octet-stream':
                readBinary(file);
            break;
        }
    }
    init(file);

    function readTxt( file ) {
        var instream = fs.createReadStream(file);
        var outstream = new stream();
        var rl = readline.createInterface(instream, outstream);
        var counter = 0;

        rl.on('line', function( line ) {
            var arr, a, len;
            if ( counter === 0 ) {
                arr = line.split(' ');
                words = arr[0];
                size = arr[1];
            } else {
                arr = line.split(' ');
                var word = arr.shift(1);
                arr.pop(1);
                var values = arr.map( function(e) {
                    return parseFloat(e);
                });
                var o = new WordVec( word, values );

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
        rl.on('close', function() {
            model.words = words;
            model.size = size;
            callback(err, model);
        });
    }

    function readBinary( file ) {
        fs.open(file, 'r', function(status, fd) {
            // need enough data to cover the string for two long longs
            var buffer = new Buffer( 50 );
            var pos = 0;

            fs.read(fd, buffer, 0, 50, 0, function(err, bytesRead, buffer ) {
                if ( err ) {
                    callback(err, null);
                    return;
                }
                var arr = buffer.toString().split(/[ \n]/);
                words = arr[0];
                size = arr[1];

                pos += arr[0].length;
                pos += arr[1].length;
                pos += 2; // whitespaces

                // maximum length of a vector is 50
                // and size*4 bytes for the floats
                buffer = new Buffer( 50 + size * 4 );
                fs.read(fd, buffer, 0, 50 + size * 4, pos, function readOne( err, bytesRead, buffer ) {
                    if ( err ) {
                        callback(err, null);
                        return;
                    }

                    if ( bytesRead < size * 4 ) {
                        model.words = words;
                        model.size = size;
                        callback( err, model );
                        return;
                    }

                    var word = buffer
                        .toString()
                        .split(' ')[0];

                    size = arr[1];
                    pos += word.length + 1;
                    pos += size * 4;

                    var values = new Float32Array( size );
                    var off = word.length + 1;
                    for ( var i = 0; i < size; i++ ) {
                        values[ i ] = buffer.readFloatLE( off );
                        off += 4;
                    }
                    var o = new WordVec( word.trim(), Array.prototype.slice.call( values, 0, size ) );

                    var a;
                    var len = 0;
                    for ( a = 0; a < size; a++ ) {
                        len += o.values[a] * o.values[a];
                    }
                    len = Math.sqrt( len );
                    for (a = 0; a < size; a++) {
                        o.values[a] /= len;
                    }
                    vocab.push( o );

                    fs.read( fd, buffer, 0, 50 + size * 4, pos, readOne );
                });
            });
        });
    }
};
