const fs = require('fs');
const content = fs.readFileSync('build_error.txt', 'utf16le');
fs.writeFileSync('build_error_utf8.txt', content, 'utf8');
