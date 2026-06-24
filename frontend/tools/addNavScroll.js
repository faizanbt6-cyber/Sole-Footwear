const fs = require('fs');
const path = require('path');

const cssToAdd = `
  nav.scrolled {
    background: rgba(8, 8, 8, 0.95);
    backdrop-filter: blur(10px);
    mix-blend-mode: normal;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
  }
</style>`;

const jsToAdd = `
<script>
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (nav) {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
  });
</script>
</body>`;

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
  if (file.endsWith('INDEX.HTML')) return; // Skip homepage

  let content = fs.readFileSync(file, 'utf8');
  
  let modified = false;

  // Add CSS if not present
  if (!content.includes('nav.scrolled {')) {
    content = content.replace('</style>', cssToAdd);
    modified = true;
  }

  // Add JS if not present
  if (!content.includes("nav.classList.add('scrolled')")) {
    content = content.replace('</body>', jsToAdd);
    modified = true;
  }

  // Also add transition to the base nav if it's missing
  if (modified) {
     if (content.includes('mix-blend-mode: difference;') && !content.includes('transition: all 0.3s ease;')) {
         content = content.replace('mix-blend-mode: difference;', 'mix-blend-mode: difference;\n    transition: background 0.3s ease, backdrop-filter 0.3s ease, mix-blend-mode 0.3s ease;');
     }
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Added nav scroll effect to', file);
  }
});
console.log('Done');
