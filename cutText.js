let Segment = require("segment");
const segment = new Segment();
const POSTAG = require("segment/lib/POSTAG")
const load = segment.useDefault()
/**
 * 
 * @param  {string} str 
 * @returns {Promise<string[]>}
 */
async function cutText(str) {
    await load;
    let words = segment.doSegment(str, {
        stripPunctuation: true
    });

    words = words.filter(v => {
        return v.p != POSTAG.D_U && v.p != POSTAG.D_P && v.p != POSTAG.A_M && v.p != POSTAG.D_D
    }).map(v => v.w)
    // console.log(words)
    return words
}

module.exports = { cutText }

// console.log(cutText("明天要去上学"))