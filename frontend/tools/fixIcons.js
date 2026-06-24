const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // 1. Replace '*' inside star-select spans with &#9733; (★)
  content = content.replace(/<span class="star-select" data-value="(\d+)">\*<\/span>/g, '<span class="star-select" data-value="$1">&#9733;</span>');
  
  // 2. Replace 'Photo Click to upload photos' with '&#128247; Click to upload photos'
  content = content.replace(/Photo Click to upload photos/g, '&#128247; Click to upload photos');
  
  // 3. Replace 'Track Shipment ->' with 'Track Shipment &#8594;'
  content = content.replace(/Track Shipment ->/g, 'Track Shipment &#8594;');
  
  // 4. Replace 'Track Package' with missing arrow with 'Track Package &#8594;'
  content = content.replace(/Track Package\s{2,}/g, 'Track Package &#8594;');
  
  // 5. Replace close button 'A?' or 'x' in modals with '&#215;' (×)
  content = content.replace(/<button class="close-modal" id="close-review-modal">x<\/button>/g, '<button class="close-modal" id="close-review-modal">&#215;</button>');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log('Restored icons in:', f);
  }
});
