const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let newContent = content;
  
  // Replace anything that is not standard ASCII
  // But wait, there might be legitimate non-ASCII characters if any exist.
  // We'll replace the specific corrupted sequences we know about first.
  
  // 1. A?"  (Close button and multiplication sign)
  newContent = newContent.replace(/A\xEF\xBF\xBD\?"/g, 'x');
  // 2. ~. (Stars)
  newContent = newContent.replace(/\xEF\xBF\xBD~\./g, '★');
  // 3. dY" (Camera)
  newContent = newContent.replace(/dY"\xEF\xBF\xBD/g, '📷');
  // 4. +' (Track arrow)
  newContent = newContent.replace(/\xEF\xBF\xBD\+'/g, '→');
  // 5. ?" (Mangled dashed lines)
  newContent = newContent.replace(/(?:\xEF\xBF\xBD\?"){3,}/g, '---');
  newContent = newContent.replace(/(?:\xEF\xBF\xBD\?){3,}/g, '---');
  // 6. SOLE ?" (Title)
  newContent = newContent.replace(/SOLE \xEF\xBF\xBD\?"/g, 'SOLE -');
  // 7. Any remaining replacement characters
  newContent = newContent.replace(/\xEF\xBF\xBD/g, '');

  if (newContent !== content) {
    fs.writeFileSync(f, newContent, 'utf8');
    console.log('Fixed:', f);
  }
});
