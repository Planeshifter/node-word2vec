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

  model.distance = function distance(phrase_words, N_input){
    N = N_input || 40;
    var phrase = {};
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
    for (var a = 0; a < cn; a++){
      for(var b=0; b < words; b++){
        if(phrase.words[a].word === vocab[b].word){
          phrase.words[a].pos = b;
          break;
        }
      }
      if(phrase.words[a].pos === -1) console.log("Out of dictionary word: " + phrase.words[a].word +"\n");
    }
    vec = [];
    for (var i = 0; i < size; i++) vec[i] = 0;
    for (var b = 0; b < cn; b++) {
      if (phrase.words[b].pos !== -1){
        for (var a = 0; a < size; a++) vec[a] += vocab[phrase.words[b].pos].values[a];
      }
    }

    /* ------------- */
    /* normalizing vector vec */
    var len = 0;
    for (var a = 0; a < size; a++) len += vec[a] * vec[a];
    len = Math.sqrt(len);
    for (var a = 0; a < size; a++) vec[a] = vec[a] / len;

    /* iterate through vocab */

    for (var c = 0; c < words; c++) {
      var a = 0;
      for (b = 0; b < cn; b++) if (phrase.words[b].pos == c) a = 1;
      if (!a == 1){
        var dist = 0;
        for (var a = 0; a < size; a++) dist += vec[a] * vocab[c].values[a];
        for (var a = 0; a < N; a++) {
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
    for(var i = 0; i < N; i++){
      var o = {};
      o.word = bestw[i];
      o.dist = bestd[i];
      ret[i] = o;
    }
    return ret;
  }

  model.analogy = function analogy(word, pair){

    if(!_.isString(word)){
      throw new TypeError("Word of interest has to be supplied as string.");
    }
    if(!_.isArray(pair)){
      throw new TypeError("Word pair has to be supplied in string Array.");
    }

    var phrase = {};
    phrase.words = Array(word).concat(pair).map(function(word){
      var o = {};
      o.word = word;
      o.pos = -1;
      return o;
    });
    phrase.output = {};

    var bestw = Array(N);
    var bestd = Array.apply(null, new Array(N)).map(Number.prototype.valueOf,0);
    var cn = phrase.words.length;
    var bi = phrase.words
    var vec = Array.apply(null, new Array(size)).map(Number.prototype.valueOf,0);

    for (var a = 0; a < cn; a++){
      for(var b=0; b < words; b++){
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

    for (var b = 0; b < cn; b++) {
      if (phrase.words[b].pos !== -1){
        for (var a = 0; a < size; a++) vec[a] += vocab[phrase.words[b].pos].values[a];
      }
    }

    for (var a = 0; a < size; a++)
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
    for(var i = 0; i < N; i++){
      var o = {};
      o.word = bestw[i];
      o.dist = bestd[i];
      ret[i] = o;
    }
    return ret;
  }

  function init(file){
    var mime_type = mime.lookup(file)
    console.log(mime_type)
    switch(mime_type){
      case "text/plain":
        readTxt(file);
      break;
      case "application/octet-stream":
        console.log("not yet implemented, use txt input instead")
      break;
    }
  };
  init(file);

  function readTxt(file){
    var instream = fs.createReadStream(file);
    var outstream = new stream;
    var rl = readline.createInterface(instream, outstream);
    var counter = 0;

    rl.on('line', function(line) {
      if (counter == 0){
        var arr = line.split(" ");
        words = arr[0];
        size = arr[1];
      } else {
        var arr = line.split(" ");
        var o = {}
        o.word = arr.shift(1);
        arr.pop(1);
        o.values = arr.map(function(e){ return parseFloat(e)});

        var len = 0;
        for (var a = 0; a < size; a++) len += o.values[a] * o.values[a];
        len = Math.sqrt(len);
        for (var a = 0; a < size; a++) o.values[a] /= len;

        vocab.push(o);
      }
      counter++;
    });
    console.log("drin")
    rl.on('close', function() {
      model.words = words;
      model.size = size;
      callback(err, model);
    });
  }

  function readBinary(file){

  }

}
