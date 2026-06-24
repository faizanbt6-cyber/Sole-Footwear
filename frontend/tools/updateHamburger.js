const fs = require('fs');
const path = require('path');

const cssToAdd = `
  nav.menu-open {
    mix-blend-mode: normal !important;
    background: rgba(8,8,8,0.98) !important;
  }
`;

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      if (f.endsWith('.html') || f.endsWith('.css')) {
        callback(dirPath);
      }
    }
  });
}

walkDir(__dirname, file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  if (file.endsWith('.html')) {
    // 1. Add nav.classList.toggle('menu-open');
    if (content.includes("navLinks.classList.toggle('active');") && !content.includes("nav.classList.toggle('menu-open');")) {
      content = content.replace("navLinks.classList.toggle('active');", "navLinks.classList.toggle('active');\n        nav.classList.toggle('menu-open');");
      modified = true;
    }
    
    // 2. Add CSS to inline <style> if it has one and isn't just linking to index.css
    if (content.includes('<style>') && !content.includes('nav.menu-open {') && !content.includes('INDEX.HTML')) {
        content = content.replace('</style>', cssToAdd + '\n</style>');
        modified = true;
    }
  }

  if (file.endsWith('index.css') && file.includes('styles')) {
     if (!content.includes('nav.menu-open {')) {
        content = content + cssToAdd;
        modified = true;
     }
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated hamburger logic in', file);
  }
});
console.log('Done');
