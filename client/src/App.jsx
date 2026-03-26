import { useState, useEffect } from 'react'
import './index.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function App() {
  const [laptops, setLaptops] = useState([])
  const [view, setView] = useState('dashboard') // 'dashboard' or 'grid'
  const [searchTerm, setSearchTerm] = useState('')
  
  // Auth states
  const [userRole, setUserRole] = useState(null) // 'admin' | 'viewer' | null
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Company filtering state
  const [selectedCompanyGrid, setSelectedCompanyGrid] = useState(null)

  // Modal states
  const [activeModal, setActiveModal] = useState(null) // 'add', 'detail', null
  const [editingLaptop, setEditingLaptop] = useState(null)
  const [selectedLaptop, setSelectedLaptop] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)

  // Form State
  const defaultForm = {
    assetId: '', deviceName: '', employeeName: '', status: 'In Use',
    company: 'Soham', department: '', brandModel: '', serialNumber: '',
    specs: '', purchaseDate: '', warrantyExpiry: '', outlookEmail: '',
    outlookPassword: '', wifiMac: '', lanMac: '', notes: ''
  }
  const [formData, setFormData] = useState(defaultForm)

  useEffect(() => { 
    if (userRole) {
      fetchLaptops() 
    }
  }, [userRole])

  const fetchLaptops = async () => {
    try {
      const resp = await fetch(`${API_BASE}/laptops`)
      const data = await resp.json()
      setLaptops(data)
    } catch (error) { console.error('Fetch error:', error) }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (loginUsername === 'admin' && loginPassword === 'Dev@2025') {
      setUserRole('admin')
      setLoginError('')
    } else if (loginUsername === 'viewer' && loginPassword === 'viewer@1234') {
      setUserRole('viewer')
      setLoginError('')
    } else {
      setLoginError('Invalid username or password')
    }
  }

  const handleLogout = () => {
    setUserRole(null)
    setLoginUsername('')
    setLoginPassword('')
    setView('dashboard')
    setSelectedCompanyGrid(null)
    setSearchTerm('')
  }

  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (userRole !== 'admin') return;
    try {
      if (editingLaptop) {
        await fetch(`${API_BASE}/laptops/${editingLaptop.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
        })
      } else {
        const payload = { ...formData, id: formData.assetId + '-' + Date.now() }
        await fetch(`${API_BASE}/laptops`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        })
      }
      fetchLaptops()
      closeModal()
    } catch (err) { console.error('Save error:', err) }
  }

  const deleteLaptop = async (id) => {
    if (userRole !== 'admin') return;
    try {
      await fetch(`${API_BASE}/laptops/${id}`, { method: 'DELETE' })
      fetchLaptops()
      setShowConfirm(false)
      closeModal()
    } catch (err) { console.error('Delete error', err) }
  }

  const openAddModal = (laptopToEdit = null) => {
    if (userRole !== 'admin') return;
    if (laptopToEdit) {
      setEditingLaptop(laptopToEdit)
      setFormData(laptopToEdit)
    } else {
      setEditingLaptop(null)
      setFormData(defaultForm)
    }
    setActiveModal('add')
  }

  const closeModal = () => {
    setActiveModal(null)
    setEditingLaptop(null)
    setTimeout(() => { if (activeModal !== null) setFormData(defaultForm) }, 300)
  }

  const filteredLaptops = laptops.filter(l => {
    if (selectedCompanyGrid && !searchTerm && l.company !== selectedCompanyGrid) return false;
    
    const searchFilter = 
      (l.deviceName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.assetId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    return searchFilter;
  })

  if (!userRole) {
    return (
      <div id="app" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-color)', padding: '1rem'}}>
        <div className="modal" style={{position: 'relative', width: '100%', maxWidth: '400px', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'}}>
          <div style={{textAlign: 'center', marginBottom: '2.5rem'}}>
            <div style={{fontSize: '3.5rem', color: 'var(--primary-color)', marginBottom: '0.5rem'}}><i className="ri-macbook-line"></i></div>
            <h2 style={{fontSize: '1.75rem', fontWeight: '700', margin: '0'}}>DevTrack</h2>
            <p style={{color: 'var(--text-muted)', marginTop: '0.25rem'}}>Sign in to access inventory</p>
          </div>
          <form onSubmit={handleLogin}>
            {loginError && <div style={{background: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center'}}>{loginError}</div>}
            <div className="form-group" style={{marginBottom: '1rem'}}>
              <label>Username</label>
              <input type="text" required value={loginUsername} onChange={e => setLoginUsername(e.target.value)} placeholder="admin or viewer" style={{padding: '0.75rem'}} />
            </div>
            <div className="form-group" style={{marginBottom: '2rem'}}>
              <label>Password</label>
              <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Enter password" style={{padding: '0.75rem'}} />
            </div>
            <button type="submit" className="primary-btn" style={{width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem'}}>Sign In</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div id="app">
      {/* Dashboard View */}
      <main id="view-dashboard" className={`view ${view === 'dashboard' ? 'active' : 'hidden'}`}>
        <header className="dash-hero" style={{position: 'relative'}}>
          <button onClick={handleLogout} className="icon-btn" style={{position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#ef4444', color: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}} title="Logout">
            <i className="ri-logout-box-r-line"></i>
          </button>
          <h1>Laptop Inventory</h1>
          <p>Manage devices cleanly and efficiently.</p>
          <div style={{display: 'inline-block', marginTop: '1rem', padding: '0.25rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '0.85rem'}}>
            Logged in as <strong>{userRole}</strong>
          </div>
        </header>
        <div className="dash-cards">
          {userRole === 'admin' && (
            <div className="dash-card interactive" onClick={() => openAddModal()}>
              <div className="card-icon"><i className="ri-add-line"></i></div>
              <h2>Add Laptop</h2>
              <p>Register a new device into the inventory system.</p>
            </div>
          )}
          <div className="dash-card interactive" onClick={() => { setView('grid'); setSearchTerm(''); setSelectedCompanyGrid(null); }}>
            <div className="card-icon"><i className="ri-macbook-line"></i></div>
            <h2>Company Inventory</h2>
            <p>View, search, and manage categorized devices.</p>
          </div>
        </div>
      </main>

      {/* Grid View */}
      <main id="view-grid" className={`view ${view === 'grid' ? 'active' : 'hidden'}`}>
        <header className="grid-header" style={{flexWrap: 'wrap', gap: '1rem'}}>
          <div className="header-left">
            <button className="icon-btn" title="Back" onClick={() => {
              if (searchTerm) {
                setSearchTerm('');
              } else if (selectedCompanyGrid) {
                setSelectedCompanyGrid(null);
              } else {
                setView('dashboard');
              }
            }}>
              <i className="ri-arrow-left-line"></i>
            </button>
            <h2>{searchTerm ? 'Search Results' : (selectedCompanyGrid ? `${selectedCompanyGrid} Inventory` : 'Companies')}</h2>
          </div>
          <div className="header-right">
            <div className="search-box">
              <i className="ri-search-line"></i>
              <input 
                type="text" 
                placeholder="Search devices, employees, or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {userRole === 'admin' && (
              <button className="primary-btn" onClick={() => {
                setFormData({...defaultForm, company: selectedCompanyGrid || 'Soham'});
                openAddModal();
              }}>
                <i className="ri-add-line"></i> New
              </button>
            )}
          </div>
        </header>
        
        {!selectedCompanyGrid && !searchTerm ? (
          <div style={{animation: 'fade-in 0.3s ease'}}>
            <div style={{marginBottom: '2rem', padding: '1.5rem', background: 'var(--card-bg)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div style={{fontSize: '2rem', color: 'var(--primary-color)'}}><i className="ri-database-2-line"></i></div>
              <div>
                <h3 style={{margin: 0, fontSize: '1.5rem', color: 'var(--text-color)'}}>Total Laptops: {laptops.length}</h3>
                <p style={{margin: 0, color: 'var(--text-muted)'}}>Across all global offices and stockrooms.</p>
              </div>
            </div>
            
            <div className="dash-cards" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'stretch', gap: '2rem'}}>
              {['Soham', 'Texoham', 'Innomayi'].map(company => {
                const comps = laptops.filter(l => l.company && l.company.toLowerCase() === company.toLowerCase());
                const count = comps.length;
                let lastDate = '-';
                if (count > 0) {
                  const dates = comps.map(l => l.purchaseDate).filter(d => !!d).sort();
                  if (dates.length > 0) lastDate = dates[dates.length - 1];
                }
                
                const brandCounts = comps.reduce((acc, l) => {
                  let brand = (l.brandModel || 'Other').trim().split(' ')[0];
                  if (!brand || brand.length === 0) brand = 'Other';
                  brand = brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
                  acc[brand] = (acc[brand] || 0) + 1;
                  return acc;
                }, {});

                const companyId = company.toLowerCase();
                return (
                  <div key={company} className={`dash-card interactive accent-${companyId}`} onClick={() => setSelectedCompanyGrid(company)} style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                    
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem'}}>
                      <div style={{alignSelf: 'center', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem'}}>
                        <img src={`/${companyId}-logo.png`} alt={company} style={{maxHeight: '100%', maxWidth: '160px', objectFit: 'contain'}} />
                      </div>
                      <h2 style={{textAlign: 'center', margin: '0.25rem 0 0 0'}}>{company}</h2>
                    </div>

                    <div style={{marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem'}}>
                        <span style={{color: 'var(--text-muted)', whiteSpace: 'nowrap'}}>Total Laptops:</span>
                        <strong style={{fontSize: '1.1rem', color: 'var(--text-color)', whiteSpace: 'nowrap', marginLeft: '0.5rem'}}>{count}</strong>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span style={{color: 'var(--text-muted)', whiteSpace: 'nowrap'}}>Last Purchase:</span>
                        <strong style={{color: 'var(--text-color)', whiteSpace: 'nowrap', marginLeft: '0.5rem'}}>{lastDate}</strong>
                      </div>
                    </div>
                    
                    {Object.keys(brandCounts).length > 0 && (
                      <div style={{marginTop: '1.25rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem'}}>
                        <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center'}}>Brands in Use</div>
                        {Object.entries(brandCounts).map(([b, c]) => (
                          <div key={b} style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.35rem', paddingLeft: '0.5rem', paddingRight: '0.5rem'}}>
                            <span>{b}</span>
                            <strong>{c}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="grid-container" id="laptop-grid" style={{animation: 'fade-in 0.3s ease'}}>
            {filteredLaptops.length === 0 ? (
              <div className="empty-state" style={{gridColumn: '1 / -1'}}>
                <div className="empty-icon"><i className="ri-inbox-line"></i></div>
                <h3>No Laptops Found</h3>
                <p>Try adjusting your search or add a new device.</p>
              </div>
            ) : (
              filteredLaptops.map((laptop, index) => {
                const companyId = (laptop.company || 'soham').toLowerCase()
                const statusClass = laptop.status === 'In Use' ? 'status-in-use' : laptop.status === 'In Stock' ? 'status-in-stock' : 'status-repair'
                
                return (
                  <div key={laptop.id} className={`laptop-card accent-${companyId}`} style={{animationDelay: `${index * 0.05}s`}} onClick={() => { setSelectedLaptop(laptop); setActiveModal('detail') }}>
                    <div className="card-header">
                      <div className="card-icon-small"><i className="ri-macbook-line"></i></div>
                      <div className={`status-badge ${statusClass}`}>{laptop.status}</div>
                    </div>
                    <div className="card-title">{laptop.deviceName}</div>
                    <div className="card-asset">{laptop.assetId}</div>
                    <div className="card-user"><i className="ri-user-line"></i> {laptop.employeeName || 'Unassigned'}</div>
                    {laptop.company && <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color:'var(--text-muted)', fontWeight: 500, opacity: 0.8 }}>💻 {laptop.company}</div>}
                  </div>
                )
              })
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <div id="modal-overlay" className={`modal-overlay ${activeModal ? '' : 'hidden'}`} onMouseDown={(e) => { if(e.target.id === 'modal-overlay') closeModal()}}>
        
        {/* Add Laptop Modal */}
        {userRole === 'admin' && (
          <div id="modal-add" className={`modal ${activeModal === 'add' ? '' : 'hidden'}`}>
            <div className="modal-header">
              <h3>{editingLaptop ? 'Edit Laptop' : 'Add New Laptop'}</h3>
              <button className="close-btn" onClick={closeModal}><i className="ri-close-line"></i></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleFormSubmit}>
                <div className="form-row">
                  <div className="form-group"><label>Asset ID *</label><input type="text" name="assetId" required value={formData.assetId} onChange={handleFormChange} /></div>
                  <div className="form-group"><label>Device Name *</label><input type="text" name="deviceName" required value={formData.deviceName} onChange={handleFormChange} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Employee Name *</label><input type="text" name="employeeName" required value={formData.employeeName} onChange={handleFormChange} /></div>
                  <div className="form-group"><label>Status *</label>
                    <select name="status" required value={formData.status} onChange={handleFormChange}>
                      <option value="In Use">In Use</option><option value="In Stock">In Stock</option><option value="Repair">Repair</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Company *</label>
                    <select name="company" required value={formData.company} onChange={handleFormChange}>
                      <option value="Soham">Soham</option><option value="Texoham">Texoham</option><option value="Innomayi">Innomayi</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Department</label><input type="text" name="department" value={formData.department} onChange={handleFormChange} /></div>
                </div>

                <div className="form-details-section">
                  <h4>Technical Details</h4>
                  <div className="form-row">
                    <div className="form-group"><label>Brand & Model</label><input type="text" name="brandModel" value={formData.brandModel} onChange={handleFormChange} /></div>
                    <div className="form-group"><label>Serial Number</label><input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleFormChange} /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>RAM & Storage</label><input type="text" name="specs" value={formData.specs} onChange={handleFormChange} /></div>
                    <div className="form-group"><label>Purchase Date</label><input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleFormChange} /></div>
                  </div>
                  <div className="form-row">
                    <div className="form-group"><label>Warranty Expiry</label><input type="date" name="warrantyExpiry" value={formData.warrantyExpiry} onChange={handleFormChange} /></div>
                    <div className="form-group"></div>
                  </div>
                </div>

                <div className="form-details-section">
                  <h4>Account Credentials</h4>
                  <div className="form-row">
                    <div className="form-group"><label>Outlook Email</label><input type="email" name="outlookEmail" value={formData.outlookEmail} onChange={handleFormChange} /></div>
                    <div className="form-group"><label>Outlook Password</label><input type="text" name="outlookPassword" value={formData.outlookPassword} onChange={handleFormChange} /></div>
                  </div>
                </div>

                <div className="form-details-section">
                  <h4>Network Info</h4>
                  <div className="form-row">
                    <div className="form-group"><label>WiFi MAC Address</label><input type="text" name="wifiMac" value={formData.wifiMac} onChange={handleFormChange} /></div>
                    <div className="form-group"><label>LAN MAC Address</label><input type="text" name="lanMac" value={formData.lanMac} onChange={handleFormChange} /></div>
                  </div>
                </div>

                <div className="form-group" style={{marginTop: '1rem'}}>
                  <label>Notes</label><textarea name="notes" rows="3" value={formData.notes} onChange={handleFormChange}></textarea>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn-submit">Save Device</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedLaptop && (
          <div id="modal-detail" className={`modal detail-modal ${activeModal === 'detail' ? '' : 'hidden'}`}>
            <div className="modal-header">
              <h3>Device Details</h3>
              <button className="close-btn" onClick={closeModal}><i className="ri-close-line"></i></button>
            </div>
            <div className="modal-body full-detail-view" style={{paddingTop: '1rem'}}>
              
              <div className="detail-hero" style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem'}}>
                <div className="detail-hero-icon" style={{width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: 'var(--bg-color)'}}><i className="ri-macbook-line"></i></div>
                <div><div className="d-title" style={{fontSize: '1.5rem', fontWeight: 600}}>{selectedLaptop.deviceName}</div><div className="d-asset" style={{fontFamily: 'monospace', color: 'var(--text-muted)'}}>{selectedLaptop.assetId}</div></div>
                <div style={{marginLeft: 'auto'}} className={`status-badge ${selectedLaptop.status === 'In Use' ? 'status-in-use' : selectedLaptop.status === 'In Stock' ? 'status-in-stock' : 'status-repair'}`}>{selectedLaptop.status}</div>
              </div>

              <div className="section-card">
                <h4>Basic Info</h4>
                <div className="full-d-grid">
                  <div className="d-item"><div className="d-label">Asset ID</div><div className="d-value">{selectedLaptop.assetId}</div></div>
                  <div className="d-item"><div className="d-label">Device Name</div><div className="d-value">{selectedLaptop.deviceName}</div></div>
                  <div className="d-item"><div className="d-label">Purchase Date</div><div className="d-value">{selectedLaptop.purchaseDate || '-'}</div></div>
                  <div className="d-item"><div className="d-label">Warranty Expiry</div><div className="d-value">{selectedLaptop.warrantyExpiry || '-'}</div></div>
                </div>
              </div>

              <div className="section-card">
                <h4>Assignment</h4>
                <div className="full-d-grid">
                  <div className="d-item"><div className="d-label">Employee</div><div className="d-value">{selectedLaptop.employeeName || '-'}</div></div>
                  <div className="d-item"><div className="d-label">Company</div><div className="d-value">{selectedLaptop.company || '-'}</div></div>
                  <div className="d-item"><div className="d-label">Department</div><div className="d-value">{selectedLaptop.department || '-'}</div></div>
                </div>
              </div>

              <div className="section-card">
                <h4>Technical Specifications</h4>
                <div className="full-d-grid">
                  <div className="d-item"><div className="d-label">Brand & Model</div><div className="d-value">{selectedLaptop.brandModel || '-'}</div></div>
                  <div className="d-item"><div className="d-label">Serial Number</div><div className="d-value">{selectedLaptop.serialNumber || '-'}</div></div>
                  <div className="d-item"><div className="d-label">RAM & Storage</div><div className="d-value">{selectedLaptop.specs || '-'}</div></div>
                </div>
              </div>

              <div className="section-card">
                <h4>Account Credentials & Network</h4>
                <div className="full-d-grid">
                  <div className="d-item"><div className="d-label">Outlook Email</div><div className="d-value">{selectedLaptop.outlookEmail || '-'}</div></div>
                  <div className="d-item"><div className="d-label">Outlook Password</div><div className="d-value">{selectedLaptop.outlookPassword || '-'}</div></div>
                  <div className="d-item"><div className="d-label">WiFi MAC</div><div className="d-value">{selectedLaptop.wifiMac || '-'}</div></div>
                  <div className="d-item"><div className="d-label">LAN MAC</div><div className="d-value">{selectedLaptop.lanMac || '-'}</div></div>
                </div>
              </div>

              {selectedLaptop.notes && (
                <div className="section-card">
                  <h4>Notes</h4>
                  <p style={{fontSize: '0.95rem', lineHeight: '1.5'}}>{selectedLaptop.notes}</p>
                </div>
              )}

              {userRole === 'admin' && (
                <div className="modal-footer" style={{justifyContent: 'space-between'}}>
                  <div className="action-bar" style={{marginTop: 0}}>
                    <button className="btn-icon" onClick={() => openAddModal(selectedLaptop)}><i className="ri-pencil-line"></i></button>
                    <button className="btn-icon btn-icon-danger" onClick={() => setShowConfirm(true)}><i className="ri-delete-bin-line"></i></button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      {userRole === 'admin' && (
        <div id="confirm-overlay" className={`modal-overlay ${showConfirm ? '' : 'hidden'}`} style={{ zIndex: 200 }}>
          <div className="modal" style={{ maxWidth: '400px', padding: '2rem' }}>
            <div className="modal-body text-center">
               <div className="confirm-icon" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }}>
                   <i className="ri-error-warning-line"></i>
               </div>
               <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 600 }}>Are you sure?</h3>
               <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>This action cannot be undone.</p>
               <div className="modal-footer justify-center" style={{ marginTop: 0 }}>
                   <button className="btn-cancel" onClick={() => setShowConfirm(false)}>Cancel</button>
                   <button className="btn-danger" onClick={() => deleteLaptop(selectedLaptop.id)}>Delete</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
