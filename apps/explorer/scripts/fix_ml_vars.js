const fs = require('fs');
const path = require('path');

const mlPath = path.join(__dirname, '../src/locales/ml.json');
let content = fs.readFileSync(mlPath, 'utf8');

// Replace {var} with {{var}}
content = content.replace(/\{(\w+)\}/g, '{{$1}}');

fs.writeFileSync(mlPath, content);
console.log('Successfully fixed variables in ml.json');
