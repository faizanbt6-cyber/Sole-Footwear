const fs = require('fs');
const path = require('path');

const correctNavCSS = `  /* NAV */
  nav {
    position: fixed; top: 0; left: 0; right: 0;
    display: flex; justify-content: space-between; align-items: center;
    padding: 24px 48px;
    z-index: 100;
    mix-blend-mode: difference;
  }
  .nav-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 32px;
    letter-spacing: 4px;
    color: var(--fg);
    text-decoration: none;
  }
  .nav-links {
    list-style: none; display: flex; gap: 32px; align-items: center;
  }
  .nav-links a {
    color: var(--fg); text-decoration: none; font-size: 13px;
    text-transform: uppercase; letter-spacing: 1px;
    opacity: 0.6; transition: opacity 0.2s;
  }
  .nav-links a:hover { opacity: 1; }`;

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
  if (file.includes('INDEX.HTML')) return; // INDEX.HTML uses external CSS

  let content = fs.readFileSync(file, 'utf8');
  
  // Find the existing NAV section
  const navRegex = /\/\*\s*NAV\s*\*\/\s*[\s\S]*?(?=\/\*|$)/i;
  const match = content.match(navRegex);
  
  if (match) {
    const existingNavBlock = match[0];
    
    // Check if it already has 'nav {'
    if (!existingNavBlock.includes('nav {')) {
      // It's missing 'nav {'! Let's replace the whole block up to the next comment
      // Wait, we need to be careful to only replace the broken NAV css.
      // Usually it ends right before another comment like /* ACCOUNT SECTION */ or /* MAIN */
      content = content.replace(navRegex, correctNavCSS + '\n\n  ');
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed nav CSS in', file);
    } else {
       // If it has 'nav {', maybe it's just missing mix-blend-mode?
       if (!existingNavBlock.includes('mix-blend-mode: difference;')) {
          content = content.replace('z-index: 100;', 'z-index: 100;\n    mix-blend-mode: difference;');
          fs.writeFileSync(file, content, 'utf8');
          console.log('Added mix-blend-mode to nav in', file);
       }
    }
  }
});
console.log('Done');
