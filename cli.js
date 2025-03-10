const fs = require('fs');
const xml2tex = require('./index.js');

let xml2tex_session = xml2tex.new_session();



const xml_file_path = process.argv[2];

let document_obj = {
    basename: xml_file_path.split('/').reverse()[0]
};
let output_tex = xml2tex_session.from_xml_to_tex(fs.readFileSync(xml_file_path).toString(), document_obj);


console.log(output_tex);
