const fs = require('fs');
let content = fs.readFileSync('src/data/languageData.ts', 'utf8');
content = content.replace(/category: 'Core [^']+'/g, "category: 'Core Systems'");
content = content.replace(/category: 'Advanced [^']+'/g, "category: 'Advanced Specialization'");
fs.writeFileSync('src/data/languageData.ts', content);
console.log('Categories updated!');
