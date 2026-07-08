const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('public/assets/libreoffice.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('/tmp/libre_raw.txt', data.text);
    console.log('Extracted ' + data.text.length + ' characters.');
}).catch(function(error){
    console.error(error);
});
