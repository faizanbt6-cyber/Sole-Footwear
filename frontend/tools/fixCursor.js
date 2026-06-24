const fs = require('fs');
const path = require('path');

const cursorCodeOldRegex = /document\.querySelectorAll\('.*?'\)\.forEach\(el\s*=>\s*\{\s*el\.addEventListener\('mouseenter',\s*\(\)\s*=>\s*cursor\.classList\.add\('hover'\)\);\s*el\.addEventListener\('mouseleave',\s*\(\)\s*=>\s*cursor\.classList\.remove\('hover'\)\);\s*\}\);/g;

const cursorCodeNew = `document.addEventListener('mouseover', e => {
  if (e.target.closest('a, button, .product-card, .hero-cta, .color-swatch, .selector-btn, .carousel-btn, .wishlist-btn, .thumb, .review-card, .related-card-btn, .remove-btn, .checkout-btn, .continue-shop, .admin-sidebar li, .tab-btn, [onclick]')) {
    if (cursor) cursor.classList.add('hover');
  }
});
document.addEventListener('mouseout', e => {
  if (e.target.closest('a, button, .product-card, .hero-cta, .color-swatch, .selector-btn, .carousel-btn, .wishlist-btn, .thumb, .review-card, .related-card-btn, .remove-btn, .checkout-btn, .continue-shop, .admin-sidebar li, .tab-btn, [onclick]')) {
    if (cursor) cursor.classList.remove('hover');
  }
});`;

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git') {
        walkDir(dirPath, callback);
      }
    } else {
      if (f.endsWith('.html') || f.endsWith('.js')) {
        callback(dirPath);
      }
    }
  });
}

walkDir(__dirname, file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.match(cursorCodeOldRegex)) {
    content = content.replace(cursorCodeOldRegex, cursorCodeNew);
    content = content.replace(/cursor\.style\.left = cx \+ 'px'; cursor\.style\.top = cy \+ 'px';/g, "if(cursor) { cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px'; }");
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed cursor in', file);
  }
});

console.log('Done.');
