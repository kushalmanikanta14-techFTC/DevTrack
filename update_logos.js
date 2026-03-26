const fs = require('fs');
const path = 'c:/Users/Innomayi_01/.gemini/antigravity/brain/DevTrack/client/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `<div className="card-icon" style={{alignSelf: 'center'}}><i className="ri-building-4-line"></i></div>`;
const replaceStr = `<div style={{alignSelf: 'center', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem'}}><img src={"/" + companyId + "-logo.png"} alt={company} style={{maxHeight: '100%', maxWidth: '160px', objectFit: 'contain'}} /></div>`;

// Check if we already applied this
if (content.includes("ri-building-4-line")) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync(path, content);
    console.log("App.jsx icons replaced with image tags.");
}
