const fs = require('fs');
const files = [
  'src/pages/Admin.tsx',
  'src/pages/Auth.tsx',
  'src/pages/Landing.tsx',
  'src/pages/User.tsx',
  'src/components/Layout.tsx',
  'src/App.tsx'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/apiFetch } from '\.\.\/lib\/api';\\nimport React/g, "apiFetch } from '../lib/api';\nimport React");
  c = c.replace(/apiFetch } from '\.\/lib\/api';\\nimport \{/g, "apiFetch } from './lib/api';\nimport {");
  fs.writeFileSync(f, c);
});
console.log('Fixed');
