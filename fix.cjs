const fs = require('fs');
const path = require('path');

function replaceColor(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceColor(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      content = content.replace(/blue-/g, 'amber-');
      content = content.replace(/bg-blue/g, 'bg-amber');
      content = content.replace(/text-blue/g, 'text-amber');
      content = content.replace(/border-blue/g, 'border-amber');
      content = content.replace(/shadow-blue/g, 'shadow-amber');
      content = content.replace(/from-blue/g, 'from-amber');
      content = content.replace(/to-blue/g, 'to-amber');
      content = content.replace(/from-indigo/g, 'from-amber');
      content = content.replace(/to-indigo/g, 'to-yellow');
      fs.writeFileSync(fullPath, content);
    }
  }
}
replaceColor(path.join(__dirname, 'src'));
console.log('Replaced blue with amber');
