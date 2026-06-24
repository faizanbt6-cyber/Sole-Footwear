const fs = require('fs');
const path = require('path');

const dir = '.';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // We look for the "replacement character" (\uFFFD) followed by the corruption letters
  content = content.replace(/\uFFFD\?"/g, 'x'); // close button / multiply
  content = content.replace(/\uFFFD\?\'/g, 'x');
  content = content.replace(/\uFFFDA\?\?/g, 'x');
  content = content.replace(/\uFFFDA\?\"/g, 'x');
  content = content.replace(/A\?\?/g, 'x');
  content = content.replace(/A\?\"/g, 'x');
  content = content.replace(/\uFFFD~\./g, '★'); // star
  content = content.replace(/~\./g, '★'); // star
  content = content.replace(/\uFFFDdY"/g, '📷'); // camera
  content = content.replace(/dY"/g, '📷'); // camera
  content = content.replace(/\uFFFD\+'/g, '→'); // arrow
  content = content.replace(/\+'/g, '→'); // arrow
  
  // dashed lines
  content = content.replace(/(?:\uFFFD\?){3,}/g, '---');
  content = content.replace(/(?:\uFFFD\?"){3,}/g, '---');
  content = content.replace(/\uFFFD/g, '');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Cleaned up:', f);
  }
});
