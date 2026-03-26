const fs = require('fs');

const indexHtmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css" rel="stylesheet">
    <title>DevTrack - Laptop Inventory</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
fs.writeFileSync('c:/Users/Innomayi_01/.gemini/antigravity/brain/DevTrack/client/index.html', indexHtmlContent, 'utf8');

const sPath = 'c:/Users/Innomayi_01/.gemini/antigravity/brain/DevTrack/server/package.json';
const cPath = 'c:/Users/Innomayi_01/.gemini/antigravity/brain/DevTrack/client/package.json';

const sData = JSON.parse(fs.readFileSync(sPath, 'utf8').replace(/^\uFEFF/, ''));
fs.writeFileSync(sPath, JSON.stringify(sData, null, 2), 'utf8');

const cData = JSON.parse(fs.readFileSync(cPath, 'utf8').replace(/^\uFEFF/, ''));
fs.writeFileSync(cPath, JSON.stringify(cData, null, 2), 'utf8');
console.log('Fixed index.html and removed BOMs from package.json files!');
