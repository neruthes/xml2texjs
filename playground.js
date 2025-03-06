const { DOMParser } = require('xmldom');

// Sample XML string
const xmlString = `
  <bookstore>
    <book>
      <title>Everyday 233</title>
      <author>Giada De Laurentiis</author>
      <year>2005</year>
    </book>
  </bookstore>
`;

// Parse the XML string into a DOM
const parser = new DOMParser();
const doc = parser.parseFromString(xmlString, 'text/xml');

// Access the root element
const bookstore = doc.documentElement;
console.log(bookstore.tagName); // Outputs: bookstore

// Access child elements
const book = bookstore.getElementsByTagName('book')[0];
const title = book.getElementsByTagName('title')[0].childNodes;
console.log(title); // Outputs: Everyday Italian
