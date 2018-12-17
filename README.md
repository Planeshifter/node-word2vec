[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][codecov-image]][codecov-url]
[![Dependencies][dependencies-image]][dependencies-url]

node-word2vec
=============

> Node.js interface to the Google [word2vec](https://code.google.com/p/word2vec/) tool

# What is it?

This is a Node.js interface to the *word2vec* tool developed at Google Research for "efficient implementation of the continuous bag-of-words and skip-gram architectures for computing vector representations of words", which can be used in a variety of NLP tasks. For further information about the *word2vec* project, consult [https://code.google.com/p/word2vec/](https://code.google.com/p/word2vec/).

# Installation

Currently, `node-word2vec` is ONLY supported for Unix operating systems.

Install it via npm:
``` bash
npm install word2vec
```

To use it inside Node.js, require the module as follows:

``` javascript
var w2v = require( 'word2vec' );
```

# Usage

## API

### .word2phrase( input, output, params, callback )

For applications where it is important that certain pairs of words are treated as a single term (e.g. "Barack Obama" or "New York" should be treated as one word), the text corpora used for training should be pre-processed via the *word2phrases* function. Words which frequently occur next to each other will be concatenated via an underscore, e.g. the words "New" and "York" if following next to each other might be transformed to a single word "New_York".

Internally, this function calls the C command line application of the Google *word2vec* project. This allows it to make use of multi-threading and preserves the efficiency of the original C code. It processes the texts given by the `input` text document, writing the output to a file with the name given by `output`.

The `params` parameter expects a JS object optionally containing some of the following keys and associated values. If they are not supplied, the default values are used.


| Key        |   Description           | Default Value |
| ------------- |:-------------:| -----:|
| minCount      | discard words appearing less than *minCount* times | 5 |
| threshold      | determines the number of phrases, higher value means less phrases   | 100 |
| debug         | sets debug mode      | 2 |
| silent | sets whether any output should be printed to the console | false |

After successful execution, the supplied `callback` function is invoked. It receives the number of the exit code as its first parameter.

### .word2vec( input, output, params, callback )

This function calls Google's *word2vec* command line application and finds vector representations for the words in the `input` training corpus, writing the results to the `output` file. The output can then be loaded into node via the `loadModel` function, which exposes several methods to interact with the learned vector representations of the words.

The `params` parameter expects a JS object optionally containing some of the following keys and associated values. For those missing, the default values are used:

| Key        |   Description           | Default Value |
| ------------- |:-------------:| -----:|
| size      | sets the size of word vectors| 100 |
| window      | sets maximal skip length between words   | 5 |
| sample         | sets threshold for occurrence of words. Those that appear with higher frequency in the training data will be randomly down-sampled; useful range is (0, 1e-5)      | 1e-3 |
| hs | 1 = use  Hierarchical Softmax | 0 |
| negative | number of negative examples; common values are 3 - 10 (0 = not used) | 5 |
| threads | number of used threads | 12 |
| iter | number of training iterations | 5 |
| minCount | 	This will discard words that appear less than *minCount* times | 5 |
| alpha | sets the starting learning rate  |  0.025 for skip-gram and 0.05 for CBOW |
| classes | output word classes rather than word vectors | 0 (vectors are written) |
| debug | sets debug mode  | 2 |
| binary | save the resulting vectors in binary mode | 0 (off) |
| saveVocab | the vocabulary will be saved to *saveVocab* value |  |
| readVocab | the vocabulary will be read from *readVocab* value , not constructed from the training data | |
| cbow | use the continuous bag of words model | 1 (use 0 for skip-gram model) |
| silent | sets whether any output should be printed to the console | false |

After successful execution, the supplied `callback` function is invoked. It receives the number of the exit code as its first parameter.

### .loadModel( file, callback )

This is the main function of the package, which loads a saved model file containing vector representations of words into memory. Such a file can be created by using the *word2vec* function. After the file is successfully loaded, the supplied callback function is fired, which following conventions has two parameters: `err` and `model`. If everything runs smoothly and no error occured, the first argument should be `null`. The `model` parameter is a model object holding all data and exposing the properties and methods explained in the *Model Object* section.

Example:
``` javascript
w2v.loadModel( './vectors.txt', function( error, model ) {
    console.log( model );
});
```
Sample Output:

``` javascript
{
    getVectors: [Function],
    distance: [Function: distance],
    analogy: [Function: analogy],
    words: '98331',
    size: '200'
}
```

## Model Object

### Properties

#### .words

Number of unique words in the training corpus.

#### .size

Length of the learned word vectors.

### Methods

#### .similarity( word1, word2 )
Calculates the word similarity between `word1` and `word2`.

Example:
``` javascript
model.similarity( 'ham', 'cheese' );
```

Sample Output:
``` javascript
0.4907762118841032
```

#### .mostSimilar( phrase[, number] )

Calculates the cosine distance between the supplied phrase (a `string` which is internally converted to an Array of words, which result in a *phrase vector*) and the other word vectors of the vocabulary. Returned are the `number` words with the highest similarity to the supplied phrase. If `number` is not supplied, by default the *40* highest scoring words are returned. If none of the words in the phrase appears in the dictionary, the function returns `null`. In all other cases, unknown words will be dropped in the computation of the cosine distance.

Example:
``` javascript
model.mostSimilar( 'switzerland', 20 );
```
Sample Output:

``` javascript
[
    { word: 'chur', dist: 0.6070252929307018 },
    { word: 'ticino', dist: 0.6049085549621765 },
    { word: 'bern', dist: 0.6001648890419077 },
    { word: 'cantons', dist: 0.5822226582323267 },
    { word: 'z_rich', dist: 0.5671853621346818 },
    { word: 'iceland_norway', dist: 0.5651901750812693 },
    { word: 'aargau', dist: 0.5590524831511438 },
    { word: 'aarau', dist: 0.555220055372284 },
    { word: 'zurich', dist: 0.5401119092258485 },
    { word: 'berne', dist: 0.5391358099043649 },
    { word: 'zug', dist: 0.5375590160292268 },
    { word: 'swiss_confederation', dist: 0.5365824598661265 },
    { word: 'germany', dist: 0.5337325187293028 },
    { word: 'italy', dist: 0.5309218588704736 },
    { word: 'alsace_lorraine', dist: 0.5270204106304165 },
    { word: 'belgium_denmark', dist: 0.5247942780963807 },
    { word: 'sweden_finland', dist: 0.5241634037188426 },
    { word: 'canton', dist: 0.5212495170066538 },
    { word: 'anterselva', dist: 0.5186651140386938 },
    { word: 'belgium', dist: 0.5150383129735169 }
]
```

#### .analogy( word, pair[, number] )

For a pair of words in a relationship such as `man` and `king`, this function tries to find the term which stands in an analogous relationship to the supplied `word`. If `number` is not supplied, by default the *40* highest-scoring results are returned.

Example:
``` javascript
model.analogy( 'woman', [ 'man', 'king' ], 10 );
```

Sample Output:

``` javascript
[
    { word: 'queen', dist: 0.5607083309028658 },
    { word: 'queen_consort', dist: 0.510974781496456 },
    { word: 'crowned_king', dist: 0.5060923120115347 },
    { word: 'isabella', dist: 0.49319425034513376 },
    { word: 'matilda', dist: 0.4931204901924969 },
    { word: 'dagmar', dist: 0.4910608716969606 },
    { word: 'sibylla', dist: 0.4832698899279795 },
    { word: 'died_childless', dist: 0.47957251302898396 },
    { word: 'charles_viii', dist: 0.4775804990655765 },
    { word: 'melisende', dist: 0.47663194967001704 }
]
```

#### .getVector( word )

Returns the learned vector representations for the input `word`. If `word` does not exist in the vocabulary, the function returns `null`.

Example:
``` javascript
model.getVector( 'king' );
```

Sample Output:
``` javascript
{
    word: 'king',
    values: [
        0.006371254151248689,
        -0.04533821363410406,
        0.1589142808632736,
        ...
        0.042080221123209825,
        -0.038347102017109225
    ]
}
```

#### .getVectors( [words] )

Returns the learned vector representations for the supplied words. If *words* is undefined, i.e. the function is evoked without passing it any arguments, it returns the vectors for all learned words. The returned value is an `array` of objects which are instances of the class `WordVec`.

Example:
``` javascript
model.getVectors( [ 'king', 'queen', 'boy', 'girl' ] );
```

Sample Output:
``` javascript
[
    {
        word: 'king',
        values: [
            0.006371254151248689,
            -0.04533821363410406,
            0.1589142808632736,
            ...
            0.042080221123209825,
            -0.038347102017109225
        ]
    },
    {
        word: 'queen',
        values: [
            0.014399041122817985,
            -0.000026896638109750347,
            0.20398248693190596,
            ...
            -0.05329081648586445,
            -0.012556868376422963
        ]
    },
    {
        word: 'girl',
        values: [
            -0.1247347144692245,
            0.03834108759049417,
            -0.022911846734360187,
            ...
            -0.0798994867922872,
            -0.11387393949666696
        ]
    },
    {
        word: 'boy',
        values: [
            -0.05436531234037158,
            0.008874993957578164,
            -0.06711992414442335,
            ...
            0.05673998568026764,
            -0.04885347925837509
        ]
    }
]
```

#### .getNearestWord( vec )

Returns the word which has the closest vector representation to the input `vec`. The function expects a word vector, either an instance of constructor `WordVector` or an array of Number values of length `size`. It returns the word in the vocabulary for which the distance between its vector and the supplied input vector is lowest.

Example:
``` javascript
model.getNearestWord( model.getVector('empire') );
```

Sample Output:
``` javascript
{ word: 'empire', dist: 1.0000000000000002 }
```

#### .getNearestWords( vec[, number] )

Returns the words whose vector representations are closest to input `vec`. The first parameter of the function expects a word vector, either an instance of constructor `WordVector` or an array of Number values of length `size`. The second parameter, `number`, is optional and specifies the number of returned words. If not supplied, a default value of `10` is used.

Example:
``` javascript
model.getNearestWords( model.getVector( 'man' ), 3 )
```

Sample Output:
``` javascript
[
    { word: 'man', dist: 1.0000000000000002 },
    { word: 'woman', dist: 0.5731114915085445 },
    { word: 'boy', dist: 0.49110060323870924 }
]
```

## WordVector

### Properties

#### .word
The word in the vocabulary.

#### .values
The learned vector representation for the word, an array of length `size`.

### Methods

#### .add( wordVector )
Adds the vector of the input `wordVector` to the vector `.values`.

#### .subtract( wordVector )
Subtracts the vector of the input `wordVector` to the vector `.values`.

## Unit Tests

Run tests via the command `npm test`

## Build from Source

Clone the git repository with the command

``` bash
$ git clone https://github.com/Planeshifter/node-word2vec.git
```

Change into the project directory and compile the C source files via

``` bash
$ cd node-word2vec
$ make --directory=src
```

---
## License

[Apache v2](http://www.apache.org/licenses/LICENSE-2.0).

[npm-image]: https://badge.fury.io/js/word2vec.svg
[npm-url]: http://badge.fury.io/js/word2vec

[travis-image]: https://travis-ci.org/Planeshifter/node-word2vec.svg
[travis-url]: https://travis-ci.org/Planeshifter/node-word2vec

[codecov-image]: https://img.shields.io/codecov/c/github/Planeshifter/node-word2vec/master.svg
[codecov-url]: https://codecov.io/github/Planeshifter/node-word2vec?branch=master

[dependencies-image]: https://david-dm.org/Planeshifter/node-word2vec.svg
[dependencies-url]: https://david-dm.org/Planeshifter/node-word2vec
