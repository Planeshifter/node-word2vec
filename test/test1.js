const word2vec = require('../');

var w2v = require('./../lib');

const fs = require('fs');
const path = require('path');
const { cutText } = require('../cutText');

w2v.word2phrase('E:/web/wordApp/tmp/遮天.txt', __dirname + '/fixtures/phrases1.txt', {
    threshold: 5,
    debug: 2,
    minCount: 2
});

var out = fs.createWriteStream(path.join(__dirname, "/fixtures/cut.txt"), { flags: "w+" });


readLine(path.join(__dirname + '/fixtures/phrases1.txt'), async function (params) {
    var result = await cutText(params);
    out.write(result.join(" ") + "\n");
})


// // // 训练Word2Vec模型
// word2vec.word2vec( "E:/web/wordApp/tmp/out.txt", './output_model.txt', {
//     size: 200,
//     window: 5,
//     minCount: 4,
//     threshold: 90,
//     cbow: 1
// }, (error) => {
//     if (error) {
//         console.error(error);
//         return;
//     }

//     console.log('模型训练完成');
// });



async function readLine(filePath, insert) {
    const fileStream = fs.createReadStream(filePath);
    const lineReader = require('readline').createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lines = [];
    var i = 0;
    for await (const fileLine of lineReader) {
        await insert(fileLine);
        i++;
        if (i % 1000 == 0) {
            // break;/
            console.log(i);
        }

    }
    return lines;
}
