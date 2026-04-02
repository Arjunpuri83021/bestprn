const fs = require('fs');
const content = fs.readFileSync('app/video/[id]/page.js', 'utf8');
const lines = content.split('\n');
console.log('Last 10 lines:');
for(let i = Math.max(0, lines.length - 10); i < lines.length; i++) {
    console.log(`${i+1}: ${JSON.stringify(lines[i])}`);
}