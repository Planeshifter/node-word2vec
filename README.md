[![NPM version](https://badge.fury.io/js/word2vec.svg)](http://badge.fury.io/js/word2vec)
[![Build Status](https://travis-ci.org/Planeshifter/node-word2vec.svg)](https://travis-ci.org/Planeshifter/node-word2vec)

node-word2vec
=============

# What is it?

This is a node.js interface to the *word2vec* tool developed at Google Research for "efficient implementation of the continuous bag-of-words and skip-gram architectures for computing vector representations of words", which can be used in a variety of NLP tasks. For further information about the *word2vec* project, consult [https://code.google.com/p/word2vec/](https://code.google.com/p/word2vec/).

# Installation

Install via npm:
```
npm install word2vec
```

To use it inside node.js, require the module as follows:
```
w2v = require('word2vec');
```

# Usage

## API

### .word2phrases(input, output, params)

The `params` parameter expects a JS object optionally containing some of the following keys and associated values. If they are not supplied, the default values are used.


| Key        |   Description           | Default Value |
| ------------- |:-------------:| -----:|
| minCount      | discard words appearing less than *minCount* times | 5 |
| threshold      | determines the number of phrases, higher value means less phrases   | 100 |
| debug         | sets debug mode      | 2 |

### .word2vec(input, output, params)

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
| saveVocab | the vocabulary will be saved to *saveVocab* value |  |
| readVocab | the vocabulary will be read from *readVocab* value , not constructed from the training data | |
| cbow | use the continuous bag of words model | 1 (use 0 for skip-gram model) |

###.loadModel(file, callback)

## Model Object

### Properties

#### .vocab

Number of unique words in the training corpus.

#### .size

Length of the learned word vectors. 

### Methods

#### .distance(phrase, [number])
Calculates the cosine distance between the supplied phrase (a `string` which is internally converted to an Array of words, which result in a *phrase vector*) and the other word vectors of the vocabulary. Returned are the `number` words with the highest similarity to the supplied phrase. If `number` is not supplied, by default the *40* highest scoring words are returned. 

Example:
```
model.distance(["switzerland"], 20);
```
Sample Output:

#### .analogy(word, pair, [number])

Example:
```
model.analogy("woman",["man","king"], 10);
```

Sample Output:
