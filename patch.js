const fs = require('fs');
const path = 'c:/Users/Innomayi_01/.gemini/antigravity/brain/DevTrack/client/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /  \/\/ Form State\r?\n  const defaultForm = \{/,
  '  const [revealedPasswords, setRevealedPasswords] = useState(false)\n\n  const handleRevealPassword = (e) => {\n    if (e) e.preventDefault();\n    if (revealedPasswords) {\n      setRevealedPasswords(false);\n      return;\n    }\n    const pwd = window.prompt("Enter master password to uncover credentials:");\n    if (pwd === "1234") {\n      setRevealedPasswords(true);\n    } else if (pwd !== null) {\n      alert("Incorrect master password!");\n    }\n  }\n\n  // Form State\n  const defaultForm = {'
);

content = content.replace(
  /  const openAddModal = \(laptopToEdit = null\) => \{\r?\n    if \(laptopToEdit\) \{/,
  '  const openAddModal = (laptopToEdit = null) => {\n    setRevealedPasswords(false);\n    if (laptopToEdit) {'
);

content = content.replace(
  /  const closeModal = \(\) => \{\r?\n    setActiveModal\(null\)\r?\n    setEditingLaptop\(null\)\r?\n    setTimeout/,
  '  const closeModal = () => {\n    setActiveModal(null)\n    setEditingLaptop(null)\n    setRevealedPasswords(false)\n    setTimeout'
);

content = content.replace(
  "setSelectedLaptop(laptop); setActiveModal('detail')",
  "setSelectedLaptop(laptop); setActiveModal('detail'); setRevealedPasswords(false)"
);

content = content.replace(
  '<div className="form-group"><label>Outlook Password</label><input type="text" name="outlookPassword" value={formData.outlookPassword} onChange={handleFormChange} /></div>',
  '<div className="form-group"><label>Outlook Password</label><div style={{display: "flex", gap: "0.5rem", alignItems: "center"}}><input type={revealedPasswords ? "text" : "password"} name="outlookPassword" value={formData.outlookPassword} onChange={handleFormChange} /><button type="button" className="icon-btn" onClick={handleRevealPassword} style={{padding: "0.5rem", flexShrink: 0}}><i className={revealedPasswords ? "ri-eye-off-line" : "ri-eye-line"}></i></button></div></div>'
);

content = content.replace(
  '<div className="d-item"><div className="d-label">Outlook Password</div><div className="d-value">{selectedLaptop.outlookPassword || \'-\'}</div></div>',
  '<div className="d-item"><div className="d-label">Outlook Password</div><div className="d-value" style={{display: "flex", alignItems: "center", gap: "0.5rem"}}><span>{selectedLaptop.outlookPassword ? (revealedPasswords ? selectedLaptop.outlookPassword : "••••••••") : "-"}</span>{selectedLaptop.outlookPassword && (<button type="button" onClick={handleRevealPassword} title="Reveal Password" style={{background: "transparent", border: "none", cursor: "pointer", color: "var(--primary-color)", marginLeft: "4px"}}><i className={revealedPasswords ? "ri-eye-off-line" : "ri-eye-line"} style={{fontSize: "1.2rem"}}></i></button>)}</div></div>'
);

fs.writeFileSync(path, content);
console.log('Patch applied properly');
