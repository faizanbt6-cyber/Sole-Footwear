const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      if (f.endsWith('.html')) {
        callback(dirPath);
      }
    }
  });
}

walkDir(__dirname, file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('border-bottom: 1px solid rgba(255, 255, 255, 0.05);')) {
    content = content.replace('border-bottom: 1px solid rgba(255, 255, 255, 0.05);', '');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Removed white line from', file);
  }
});
console.log('Done');
