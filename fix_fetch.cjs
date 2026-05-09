const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      if (fullPath === 'src/lib/api.ts' || fullPath === 'src/lib/firebase.ts' || fullPath === 'src/lib/store.ts') continue;
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let changed = false;
      if (content.includes("fetch('") || content.includes("fetch(`")) {
        content = content.replace(/fetch\('/g, "apiFetch('");
        content = content.replace(/fetch\(`/g, "apiFetch(`");
        changed = true;
      }
      
      // Ensure import is there
      if (changed && !content.includes("apiFetch")) {
         // This is a naive import insertion, but we already added the import in previous steps.
         // Wait, the previous steps might have failed. Let's make sure import is added:
         const depth = fullPath.split('/').length - 2;
         const relativePath = depth > 0 ? '../'.repeat(depth) + 'lib/api' : './lib/api';
         content = `import { apiFetch } from '${relativePath}';\n` + content;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceInDir('src');
console.log('Done');
