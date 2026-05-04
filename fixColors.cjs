const fs = require('fs');
const path = require('path');

function replaceStr(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceStr(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      // Change amber to yellow, keeping the shade
      content = content.replace(/amber-/g, 'yellow-');
      
      // Change slate to zinc for more neutral darks
      content = content.replace(/slate-/g, 'zinc-');
      
      // Main dark background to TRUE BLACK
      content = content.replace(/dark:bg-zinc-900/g, 'dark:bg-black');
      content = content.replace(/dark:bg-zinc-950/g, 'dark:bg-black');
      
      // Card dark backgrounds closer to black (from zinc-800 or zinc-800/50 to zinc-900)
      content = content.replace(/dark:bg-zinc-800\/50/g, 'dark:bg-zinc-900/60');
      content = content.replace(/dark:bg-zinc-800\/20/g, 'dark:bg-zinc-900/30');
      content = content.replace(/dark:bg-zinc-800/g, 'dark:bg-zinc-900');
      
      // Make dark mode borders darker as well
      content = content.replace(/dark:border-zinc-700/g, 'dark:border-zinc-800');
      content = content.replace(/dark:border-zinc-600/g, 'dark:border-zinc-800');

      fs.writeFileSync(fullPath, content);
    }
  }
}
replaceStr(path.join(__dirname, 'src'));
console.log('Processed colors to deep black and yellow');
