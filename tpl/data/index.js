const path = require('path');

let fPath = path.join(__dirname,'_public');

let f = fws.require(fPath);
module.exports = {
    "title":f.header.title,
    "footer":f.copyText
};