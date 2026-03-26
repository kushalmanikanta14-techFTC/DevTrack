const fs = require('fs');
const path = 'c:/Users/Innomayi_01/.gemini/antigravity/brain/DevTrack/client/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "background: 'rgba(255,255,255,0.2)', color: '#fff'",
  "background: '#ef4444', color: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'"
);

fs.writeFileSync(path, content);
console.log('Logout button updated.');
