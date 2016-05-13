'use strict';

// MODULES //

var spawn = require( 'child_process' ).spawn;
var path = require( 'path' );
var _ = require( 'underscore' );
var changeCase = require( 'change-case' );
var loadModel = require( './model' );
var WordVector = require( './WordVector' );


// VARIABLES //

var PACKAGE_FOLDER = path.join( __dirname, '..' );
var SRC_FOLDER = PACKAGE_FOLDER + '/src/';


// NAMESPACE //

var ns = {};

/*
Parameters for training:
	-train <file>
		Use text data from <file> to train the model
	-output <file>
		Use <file> to save the resulting word vectors / word clusters
	-size <int>
		Set size of word vectors; default is 100
	-window <int>
		Set max skip length between words; default is 5
	-sample <float>
		Set threshold for occurrence of words. Those that appear with higher frequency in the training data
		will be randomly down-sampled; default is 1e-3, useful range is (0, 1e-5)
	-hs <int>
		Use Hierarchical Softmax; default is 0 (not used)
	-negative <int>
		Number of negative examples; default is 5, common values are 3 - 10 (0 = not used)
	-threads <int>
		Use <int> threads (default 12)
	-iter <int>
		Run more training iterations (default 5)
	-min-count <int>
		This will discard words that appear less than <int> times; default is 5
	-alpha <float>
		Set the starting learning rate; default is 0.025 for skip-gram and 0.05 for CBOW
	-classes <int>
		Output word classes rather than word vectors; default number of classes is 0 (vectors are written)
	-debug <int>
		Set the debug mode (default = 2 = more info during training)
	-binary <int>
		Save the resulting vectors in binary moded; default is 0 (off)
	-save-vocab <file>
		The vocabulary will be saved to <file>
	-read-vocab <file>
		The vocabulary will be read from <file>, not constructed from the training data
	-cbow <int>
		Use the continuous bag of words model; default is 1 (use 0 for skip-gram model)
*/
function word2vec( input, output, params, callback ) {
	var paramsArr;
	var inputPath;
	var cc_name;
	var silent = false;
	var name;
	var cwd;

	if ( params === undefined ) {
		params = {};
	}

	if ( callback === undefined ) {
		callback = function(){};
	}

	if ( params.hasOwnProperty( 'silent' ) === true ) {
		silent = params.silent;
	}

	if ( !silent ) {
		var charm = require('charm')();
		charm.pipe(process.stdout);
		charm.reset();
	}

	paramsArr = [];
	for ( name in params ) {
		if ( params.hasOwnProperty(name) === true && name !== 'silent' ) {
			cc_name = changeCase.param( name );
			paramsArr.push( '-' + cc_name );
			paramsArr.push( params[name] );
		}
	}

	if( _.isString(input) === false || _.isString(output) === false ) {
		throw new TypeError( 'Input and output file names must be strings' );
	}

	cwd = process.cwd();
	inputPath = path.resolve( cwd, input );

	input = path.relative( SRC_FOLDER, inputPath );
	output = path.relative( SRC_FOLDER, output );

	var word2vecProc = spawn( './word2vec', ['-train', input, '-output', output ].concat(paramsArr), { cwd: SRC_FOLDER } );
	word2vecProc.stdout.on( 'data', function onData( data ) {
		if ( !silent ) {
			charm.foreground( 'cyan' );
			charm.write( data );
		}
	});

	word2vecProc.on( 'close', function onClose( code ) {
		if ( !silent ) {
			charm.write( '\n' );
			charm.foreground( 'yellow' );
			charm.write( 'Child process exited with code: ' + code );
			charm.write( '\n' );
			charm.display( 'reset' );
		}
		callback( code );
	});

} // end FUNCTION word2vec()

/*
Options:
Parameters for training:
	-train <file>
		Use text data from <file> to train the model
	-output <file>
		Use <file> to save the resulting word vectors / word clusters / phrases
	-min-count <int>
		This will discard words that appear less than <int> times; default is 5
	-threshold <float>
		 The <float> value represents threshold for forming the phrases (higher means less phrases); default 100
	-debug <int>
		Set the debug mode (default = 2 = more info during training)

Examples:
./word2phrase -train text.txt -output phrases.txt -threshold 100 -debug 2
*/
function word2phrase( input, output, params, callback ) {
	var inputPath;
	var paramsArr;
	var cc_name;
	var silent = false;
	var charm;
	var name;
	var cwd;

	if ( params === undefined ) {
		params = {};
	}

	if ( callback === undefined ) {
		callback = function(){};
	}

	if ( params.hasOwnProperty( 'silent' ) === true ) {
		silent = params.silent;
	}

	if ( !silent ) {
		charm = require( 'charm' )();
		charm.pipe( process.stdout );
		charm.reset();
	}

	paramsArr = [];
	for ( name in params ){
		if ( params.hasOwnProperty( params ) === true ) {
			cc_name = changeCase.param( name );
			paramsArr.push( '-' + cc_name );
			paramsArr.push( params[name] );
		}
	}

	if ( _.isString(input) === false || _.isString(output) === false ) {
		throw new TypeError( 'Input and output files have to be supplied as strings' );
	}
	cwd = process.cwd();
	inputPath = path.resolve( cwd, input );

	input = path.relative( SRC_FOLDER, inputPath );
	output = path.relative( SRC_FOLDER, output );

	var word2phraseProc = spawn(
		'./word2phrase',
		[ '-train', input, '-output', output ].concat(paramsArr),
		{ cwd: SRC_FOLDER }
	);
	word2phraseProc.stdout.on( 'data', function onData(data) {
		if ( !silent ) {
			charm.foreground( 'cyan' );
			charm.write( data );
		}
	});

	word2phraseProc.on( 'close', function onClose( code ) {
		if ( !silent ) {
			charm.write( '\n' );
			charm.foreground( 'yellow' );
			charm.write( 'Child process exited with code ' + code );
			charm.write( '\n' );
			charm.display( 'reset' );
		}
		callback( code );
	});
} // end FUNCTION word2phrase()

ns.word2vec = word2vec;
ns.word2phrase = word2phrase;
ns.loadModel = loadModel;
ns.WordVector = WordVector;


// EXPORTS //

module.exports = ns;
