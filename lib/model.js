// load packages
var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
var util = require('util');
var mime = require('mime');
var _ = require('underscore');

module.exports = function loadModel(file, callback){
  var err = null;
  if(!file){
    err = new TypeError("Function expects file name as first parameter.");
  }

  var model = {};

  var vocab = [];
  var words, size;
  var N; // number of closest words that will be shown

  model.getVectors = function(words){
    if(!words){
      return vocab;
    } else {
      return vocab.filter(function(w){
        return _.contains(words, w.word);
      });
    }
  };

  model.distance = function distance(input_phrase, N_input){
    N = N_input || 40;
    var phrase = {};
    var a,b,i;
    phrase_words = input_phrase.split(" ");
    phrase.words = phrase_words.map(function(word){
      var o = {};
      o.word = word;
      o.pos = -1;
      return o;
    });
    phrase.output = {};
    var bestw = Array(N);
    var bestd = Array.apply(null, new Array(N)).map(Number.prototype.valueOf,-1);
    var cn = phrase.words.length;
    for (a = 0; a < cn; a++){
      for(b=0; b < words; b++){
        if(phrase.words[a].word === vocab[b].word){
          phrase.words[a].pos = b;
          break;
        }
      }
      if(phrase.words[a].pos === -1) console.log("Out of dictionary word: " + phrase.words[a].word +"\n");
    }
    vec = [];
    for (i = 0; i < size; i++) vec[i] = 0;
    for (b = 0; b < cn; b++) {
      if (phrase.words[b].pos !== -1){
        for (a = 0; a < size; a++) vec[a] += vocab[phrase.words[b].pos].values[a];
      }
    }

    /* ------------- */
    /* normalizing vector vec */
    var len = 0;
    for (a = 0; a < size; a++) len += vec[a] * vec[a];
    len = Math.sqrt(len);
    for (a = 0; a < size; a++) vec[a] = vec[a] / len;

    /* iterate through vocab */

    for (var c = 0; c < words; c++) {
      a = 0;
      for (b = 0; b < cn; b++) if (phrase.words[b].pos == c) a = 1;
      if (a != 1){
        var dist = 0;
        for (a = 0; a < size; a++) dist += vec[a] * vocab[c].values[a];
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

  model.analogy = function analogy(word, pair, N_input){
    N = N_input || 40;
    if(!_.isString(word)){
      throw new TypeError("Word of interest has to be supplied as string.");
    }
    if(!_.isArray(pair)){
      throw new TypeError("Word pair has to be supplied in string Array.");
    }
    var a, b, i;
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

    var bestw = Array(N);
    var bestd = Array.apply(null, new Array(N)).map(Number.prototype.valueOf,0);
    var cn = phrase.words.length;
    var bi = phrase.words;
    var vec = Array.apply(null, new Array(size)).map(Number.prototype.valueOf,0);

    for (a = 0; a < cn; a++){
      for(b=0; b < words; b++){
        if(phrase.words[a].word === vocab[b].word){
          phrase.words[a].pos = b;
          break;
        }
      }
      if(phrase.words[a].pos === -1){
        console.log("Out of dictionary word: " + phrase.words[a].word +"\n");
        break;
      }
    }

    for (b = 0; b < cn; b++) {
      if (phrase.words[b].pos !== -1){
        for (a = 0; a < size; a++) vec[a] += vocab[phrase.words[b].pos].values[a];
      }
    }

    for (a = 0; a < size; a++)
      vec[a] = vocab[bi[1].pos].values[a] - vocab[bi[0].pos].values[a] + vocab[bi[2].pos].values[a];

    var len = 0;
    for (a = 0; a < size; a++) len += vec[a] * vec[a];
    len = Math.sqrt(len);
    for (a = 0; a < size; a++) vec[a] /= len;

    for (var c = 0; c < words; c++) {
      if (c == bi[0].pos) continue;
      if (c == bi[1].pos) continue;
      if (c == bi[2].pos) continue;
      a = 0;
      for (b = 0; b < cn; b++) if (bi[b].pos == c) a = 1;
      if (a == 1) continue;
      dist = 0;
      for (a = 0; a < size; a++) dist += vec[a] * vocab[c].values[a];
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

  function init(file){
    var mime_type = mime.lookup(file);
    switch(mime_type){
      case "text/plain":
        readTxt(file);
      break;
      case "application/octet-stream":
        console.log("Binary data input not yet implemented, use *.txt file input instead.");
      break;
    }
  }
  init(file);

  function readTxt(file){
    var instream = fs.createReadStream(file);
    var outstream = new stream();
    var rl = readline.createInterface(instream, outstream);
    var counter = 0;

    rl.on('line', function(line) {
      var arr;
      if (counter === 0){
        arr = line.split(" ");
        words = arr[0];
        size = arr[1];
      } else {
        arr = line.split(" ");
        var o = {};
        o.word = arr.shift(1);
        arr.pop(1);
        o.values = arr.map(function(e){ return parseFloat(e); });

        var len = 0;
        for (a = 0; a < size; a++) len += o.values[a] * o.values[a];
        len = Math.sqrt(len);
        for (a = 0; a < size; a++) o.values[a] /= len;
        vocab.push(o);
      }
      counter++;
    });
    rl.on('close', function() {
      model.words = words;
      model.size = size;
      callback(err, model);
    });
  }

  function readBinary(file){
    // to be implemented
  }

};
