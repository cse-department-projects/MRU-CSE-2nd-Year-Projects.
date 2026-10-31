const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/onXpGain=\{handleXpGain\}\n\s*\}/g, 'onXpGain={handleXpGain}');
fs.writeFileSync('src/App.tsx', content);
