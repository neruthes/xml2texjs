const fs = require('fs');
const xml2tex = require('./index.js');

const xml_file_path = process.argv[2];
let output_tex = xml2tex.from_xml_to_tex(fs.readFileSync(xml_file_path).toString());


console.log(output_tex);
