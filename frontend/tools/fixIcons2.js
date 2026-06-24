const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // 1. Stars: <span class="star-select" data-value="1"></span>
  content = content.replace(/<span class="star-select" data-value="(\d+)"><\/span>/g, '<span class="star-select" data-value="$1">&#9733;</span>');
  
  // 2. Camera: 'Click to upload photos' -> '&#128247; Click to upload photos'
  content = content.replace(/Click to upload photos/g, '&#128247; Click to upload photos');
  // Avoid double prefixing
  content = content.replace(/&#128247; &#128247;/g, '&#128247;');

  // 3. Close buttons
  content = content.replace(/<button class="close-modal" id="close-review-modal"><\/button>/g, '<button class="close-modal" id="close-review-modal">&#215;</button>');

  // 4. Track Shipment / Package arrows
  content = content.replace(/Track Shipment <\/a>/g, 'Track Shipment &#8594;</a>');
  content = content.replace(/Track Package\s*<\/a>/g, 'Track Package &#8594;</a>');
  
  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Restored icons in:', f);
  }
});
