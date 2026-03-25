// Data Models
const STORAGE_KEY = 'laptop_inventory_v1';
const MOCK_DATA = [
    {
        id: 'AST-001',
        assetId: 'AST-001',
        deviceName: 'MacBook Pro 16" M2',
        employeeName: 'Sarah Jenkins',
        status: 'In Use',
        company: 'Soham',
        department: 'Design',
        brandModel: 'Apple MacBook Pro',
        serialNumber: 'C02HG82HD',
        specs: '32GB RAM, 1TB SSD',
        purchaseDate: '2023-01-15',
        warrantyExpiry: '2026-01-15',
        outlookEmail: 'sarah.j@soham.com',
        outlookPassword: 'Password123!',
        wifiMac: '00:1A:2B:3C:A1',
        lanMac: '00:1A:2B:3C:A2',
        notes: 'Assigned with magic mouse'
    },
    {
        id: 'AST-002',
        assetId: 'AST-002',
        deviceName: 'Dell XPS 15',
        employeeName: 'Mike Chen',
        status: 'Repair',
        company: 'Texoham',
        department: 'Engineering',
        brandModel: 'Dell XPS 9520',
        serialNumber: 'DL928374',
        specs: '64GB RAM, 2TB SSD',
        purchaseDate: '2022-11-04',
        warrantyExpiry: '2025-11-04',
        outlookEmail: 'mike.c@texoham.com',
        outlookPassword: 'SecurePassword1',
        wifiMac: '1A:2B:3C:4D:5E',
        lanMac: '',
        notes: 'Screen flickering issue reported. Awaiting parts.'
    },
    {
        id: 'AST-003',
        assetId: 'AST-003',
        deviceName: 'Lenovo ThinkPad X1',
        employeeName: 'Unassigned',
        status: 'In Stock',
        company: 'Innomayi',
        department: 'IT',
        brandModel: 'Lenovo ThinkPad X1 Carbon Gen 10',
        serialNumber: 'PF382910',
        specs: '16GB RAM, 512GB SSD',
        purchaseDate: '2024-02-10',
        warrantyExpiry: '2027-02-10',
        outlookEmail: '',
        outlookPassword: '',
        wifiMac: 'F1:E2:D3:C4:B5',
        lanMac: 'F1:E2:D3:C4:B6',
        notes: 'Ready for new hire'
    }
];

// API Base URL
const API_BASE = 'http://localhost:3001/api';

// LaptopStore with API calls
class LaptopStore {
    static async getLaptops() {
        try {
            const response = await fetch(`${API_BASE}/laptops`);
            if (!response.ok) throw new Error('Failed to fetch laptops');
            return await response.json();
        } catch (error) {
            console.error('Error fetching laptops:', error);
            return [];
        }
    }

    static async addLaptop(laptop) {
        try {
            laptop.id = laptop.assetId + '-' + Date.now();
            const response = await fetch(`${API_BASE}/laptops`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(laptop)
            });
            if (!response.ok) throw new Error('Failed to add laptop');
            return await response.json();
        } catch (error) {
            console.error('Error adding laptop:', error);
            throw error;
        }
    }

    static async updateLaptop(id, updatedData) {
        try {
            const response = await fetch(`${API_BASE}/laptops/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            if (!response.ok) throw new Error('Failed to update laptop');
            return await response.json();
        } catch (error) {
            console.error('Error updating laptop:', error);
            throw error;
        }
    }

    static async deleteLaptop(id) {
        try {
            const response = await fetch(`${API_BASE}/laptops/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete laptop');
            return await response.json();
        } catch (error) {
            console.error('Error deleting laptop:', error);
            throw error;
        }
    }
}

// UI State & Elements
const DOM = {
    viewDashboard: document.getElementById('view-dashboard'),
    viewGrid: document.getElementById('view-grid'),
    btnShowAdd: document.getElementById('btn-show-add'),
    btnShowGrid: document.getElementById('btn-show-grid'),
    btnBackDash: document.getElementById('btn-back-dash'),
    btnShowAddFromGrid: document.getElementById('btn-show-add-from-grid'),
    
    laptopGrid: document.getElementById('laptop-grid'),
    searchInput: document.getElementById('search-input'),
    emptyState: document.getElementById('empty-state'),

    modalOverlay: document.getElementById('modal-overlay'),
    modalAdd: document.getElementById('modal-add'),
    modalDetail: document.getElementById('modal-detail'),
    formAdd: document.getElementById('add-laptop-form'),
    formTitle: document.getElementById('form-title'),
    
    confirmOverlay: document.getElementById('confirm-overlay'),
    confirmYes: document.getElementById('btn-confirm-yes'),
    confirmCancel: document.getElementById('btn-confirm-cancel')
};

// Application Initialization
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    // Routing
    DOM.btnShowGrid.addEventListener('click', () => switchView('grid'));
    DOM.btnBackDash.addEventListener('click', () => switchView('dashboard'));
    
    // Add Laptop Triggers
    DOM.btnShowAdd.addEventListener('click', () => {
        DOM.formTitle.innerText = 'Add New Laptop';
        delete DOM.formAdd.dataset.editId;
        openModal(DOM.modalAdd);
    });
    DOM.btnShowAddFromGrid.addEventListener('click', () => {
        DOM.formTitle.innerText = 'Add New Laptop';
        delete DOM.formAdd.dataset.editId;
        openModal(DOM.modalAdd);
    });
    
    // Modal Close Triggers
    document.querySelectorAll('.close-btn, .close-btn-cancel').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    DOM.modalOverlay.addEventListener('mousedown', (e) => {
        if (e.target === DOM.modalOverlay) closeModal();
    });

    // Filtering
    DOM.searchInput.addEventListener('input', (e) => {
        renderLaptops(e.target.value.toLowerCase());
    });

    // Form Submit
    DOM.formAdd.addEventListener('submit', handleFormSubmit);
}

// Routing / View Toggle
function switchView(viewName) {
    if (viewName === 'dashboard') {
        DOM.viewGrid.classList.remove('active');
        // Wait for fade out
        setTimeout(() => {
            DOM.viewGrid.classList.add('hidden');
            DOM.viewDashboard.classList.remove('hidden');
            // Allow display change before active class to trigger transition
            setTimeout(() => DOM.viewDashboard.classList.add('active'), 50);
        }, 150);
    } else if (viewName === 'grid') {
        DOM.viewDashboard.classList.remove('active');
        setTimeout(() => {
            DOM.viewDashboard.classList.add('hidden');
            DOM.viewGrid.classList.remove('hidden');
            setTimeout(() => DOM.viewGrid.classList.add('active'), 50);
            DOM.searchInput.value = '';
            renderLaptops();
        }, 150);
    }
}

// Modal Logic
function openModal(modalEl) {
    DOM.modalOverlay.classList.remove('hidden');
    DOM.modalAdd.classList.add('hidden');
    DOM.modalDetail.classList.add('hidden');
    
    modalEl.classList.remove('hidden');
}

function closeModal() {
    DOM.modalOverlay.classList.add('hidden');
    setTimeout(() => {
        DOM.modalAdd.classList.add('hidden');
        DOM.modalDetail.classList.add('hidden');
        DOM.formAdd.reset();
        DOM.modalDetail.innerHTML = '';
        delete DOM.formAdd.dataset.editId; 
    }, 300); // Wait for transition
}

// Render Laptops Grid
async function renderLaptops(filterText = '') {
    const laptops = await LaptopStore.getLaptops();
    DOM.laptopGrid.innerHTML = '';
    
    const filtered = laptops.filter(l => 
        (l.deviceName || '').toLowerCase().includes(filterText) ||
        (l.employeeName || '').toLowerCase().includes(filterText) ||
        (l.assetId || '').toLowerCase().includes(filterText) ||
        (l.company || '').toLowerCase().includes(filterText) ||
        (l.serialNumber || '').toLowerCase().includes(filterText)
    );

    if (filtered.length === 0) {
        DOM.emptyState.classList.remove('hidden');
    } else {
        DOM.emptyState.classList.add('hidden');
    }

    filtered.forEach((laptop, index) => {
        const delay = index * 0.05; // stagger animation
        const companyId = (laptop.company || 'soham').toLowerCase();
        const companyClass = `accent-${companyId}`;
        
        let statusClass = 'status-in-use';
        if (laptop.status === 'In Stock') statusClass = 'status-in-stock';
        if (laptop.status === 'Repair') statusClass = 'status-repair';

        const card = document.createElement('div');
        card.className = `laptop-card ${companyClass}`;
        card.style.animationDelay = `${delay}s`;
        card.onclick = () => showQuickView(laptop);

        card.innerHTML = `
            <div class="card-header">
                <div class="card-icon-small"><i class="ri-macbook-line"></i></div>
                <div class="status-badge ${statusClass}">${laptop.status}</div>
            </div>
            <div class="card-title">${escapeHTML(laptop.deviceName)}</div>
            <div class="card-asset">${escapeHTML(laptop.assetId)}</div>
            <div class="card-user">
                <i class="ri-user-line"></i> ${escapeHTML(laptop.employeeName || 'Unassigned')}
            </div>
            ${laptop.company ? `<div style="margin-top:0.75rem; font-size:0.75rem; color:var(--text-muted); opacity: 0.8; font-weight: 500;">🏢 ${escapeHTML(laptop.company)}</div>` : ''}
        `;
        DOM.laptopGrid.appendChild(card);
    });
}

// Form Handlers
async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(DOM.formAdd);
    const data = Object.fromEntries(formData.entries());

    try {
        if (DOM.formAdd.dataset.editId) {
            await LaptopStore.updateLaptop(DOM.formAdd.dataset.editId, data);
        } else {
            await LaptopStore.addLaptop(data);
        }
        
        closeModal();
        if (DOM.viewGrid.classList.contains('active')) {
            await renderLaptops();
        }
    } catch (error) {
        alert('Error saving laptop: ' + error.message);
    }
}

// Detail Views
function showQuickView(laptop) {
    let statusClass = 'status-in-use';
    if (laptop.status === 'In Stock') statusClass = 'status-in-stock';
    if (laptop.status === 'Repair') statusClass = 'status-repair';

    DOM.modalDetail.innerHTML = `
        <div class="modal-header">
            <h3>Device Overview</h3>
            <button class="close-btn" onclick="closeModal()"><i class="ri-close-line"></i></button>
        </div>
        <div class="modal-body quick-view">
            <div class="detail-hero">
                <div class="detail-hero-icon"><i class="ri-macbook-line"></i></div>
                <div>
                    <div class="d-title">${escapeHTML(laptop.deviceName)}</div>
                    <div class="d-asset">${escapeHTML(laptop.assetId)}</div>
                </div>
                <div style="margin-left:auto;">
                    <span class="status-badge ${statusClass}">${laptop.status}</span>
                </div>
            </div>
            
            <div class="d-grid">
                <div class="d-item">
                    <div class="d-label">Assigned To</div>
                    <div class="d-value">${escapeHTML(laptop.employeeName || 'Unassigned')}</div>
                </div>
                <div class="d-item">
                    <div class="d-label">Company</div>
                    <div class="d-value">${escapeHTML(laptop.company || 'N/A')}</div>
                </div>
                <div class="d-item">
                    <div class="d-label">RAM & Storage</div>
                    <div class="d-value">${escapeHTML(laptop.specs || 'N/A')}</div>
                </div>
                <div class="d-item">
                    <div class="d-label">Brand & Model</div>
                    <div class="d-value">${escapeHTML(laptop.brandModel || 'N/A')}</div>
                </div>
            </div>
            
            <div class="modal-footer" style="justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border-color); margin-top: 1rem;">
                <div class="action-bar" style="margin:0;">
                    <button class="btn-icon" title="Edit" onclick="editLaptop('${laptop.id}')"><i class="ri-pencil-line"></i></button>
                    <button class="btn-icon btn-icon-danger" title="Delete" onclick="confirmDelete('${laptop.id}')"><i class="ri-delete-bin-line"></i></button>
                </div>
                <button class="primary-btn" onclick="showFullView('${laptop.id}')">
                    Full Details <i class="ri-arrow-right-line"></i>
                </button>
            </div>
        </div>
    `;
    openModal(DOM.modalDetail);
}

// Global functions for inline HTML event handlers injected dynamically
window.closeModal = closeModal;
window.editLaptop = async (id) => {
    try {
        const laptops = await LaptopStore.getLaptops();
        const laptop = laptops.find(l => l.id === id);
        if (!laptop) return;
        
        // Populate form fields
        Object.keys(laptop).forEach(key => {
            const input = DOM.formAdd.elements[key];
            if (input) input.value = laptop[key];
        });
        
        DOM.formAdd.dataset.editId = laptop.id;
        DOM.formTitle.innerText = 'Edit Laptop';
        openModal(DOM.modalAdd);
    } catch (error) {
        alert('Error loading laptop: ' + error.message);
    }
};

window.confirmDelete = async (id) => {
    DOM.confirmOverlay.classList.remove('hidden');
    DOM.confirmYes.onclick = async () => {
        try {
            await LaptopStore.deleteLaptop(id);
            DOM.confirmOverlay.classList.add('hidden');
            closeModal();
            if (DOM.viewGrid.classList.contains('active')) {
                await renderLaptops(DOM.searchInput.value.toLowerCase());
            }
        } catch (error) {
            alert('Error deleting laptop: ' + error.message);
        }
    };
    DOM.confirmCancel.onclick = () => {
        DOM.confirmOverlay.classList.add('hidden');
    };
};

window.showFullView = async (id) => {
    try {
        const laptops = await LaptopStore.getLaptops();
        const laptop = laptops.find(l => l.id === id);
        if (!laptop) return;
        
        DOM.modalDetail.innerHTML = `
            <div class="modal-header">
                <h3 style="display:flex; align-items: center; gap: 0.5rem;">
                    <button class="icon-btn" style="width: 32px; height: 32px; font-size: 1.1rem; border: none; box-shadow: none;" onclick='showQuickView(${JSON.stringify(laptop).replace(/'/g, "&#39;")})'>
                        <i class="ri-arrow-left-line"></i>
                    </button> Full Device Details
                </h3>
                <button class="close-btn" onclick="closeModal()"><i class="ri-close-line"></i></button>
            </div>
            <div class="modal-body full-detail-view" style="padding-top: 1rem;">
                
                <div class="section-card">
                    <h4>Basic Info</h4>
                    <div class="full-d-grid">
                        <div class="d-item"><div class="d-label">Asset ID</div><div class="d-value">${escapeHTML(laptop.assetId)}</div></div>
                        <div class="d-item"><div class="d-label">Device Name</div><div class="d-value">${escapeHTML(laptop.deviceName)}</div></div>
                        <div class="d-item"><div class="d-label">Status</div><div class="d-value">${laptop.status}</div></div>
                        <div class="d-item"><div class="d-label">Purchase Date</div><div class="d-value">${escapeHTML(laptop.purchaseDate || '-')}</div></div>
                        <div class="d-item"><div class="d-label">Warranty Expiry</div><div class="d-value">${escapeHTML(laptop.warrantyExpiry || '-')}</div></div>
                    </div>
                </div>

                <div class="section-card">
                    <h4>Assignment</h4>
                    <div class="full-d-grid">
                        <div class="d-item"><div class="d-label">Employee</div><div class="d-value">${escapeHTML(laptop.employeeName || '-')}</div></div>
                        <div class="d-item"><div class="d-label">Company</div><div class="d-value">${escapeHTML(laptop.company || '-')}</div></div>
                        <div class="d-item"><div class="d-label">Department</div><div class="d-value">${escapeHTML(laptop.department || '-')}</div></div>
                    </div>
                </div>

                <div class="section-card">
                    <h4>Account Credentials</h4>
                    <div class="full-d-grid">
                        <div class="d-item"><div class="d-label">Outlook Email</div><div class="d-value" style="text-transform: lowercase;">${escapeHTML(laptop.outlookEmail || '-')}</div></div>
                        <div class="d-item"><div class="d-label">Outlook Password</div><div class="d-value" style="font-family: monospace;">${escapeHTML(laptop.outlookPassword || '-')}</div></div>
                    </div>
                </div>

                <div class="section-card">
                    <h4>Technical Specifications</h4>
                    <div class="full-d-grid">
                        <div class="d-item"><div class="d-label">Brand & Model</div><div class="d-value">${escapeHTML(laptop.brandModel || '-')}</div></div>
                        <div class="d-item"><div class="d-label">Serial Number</div><div class="d-value">${escapeHTML(laptop.serialNumber || '-')}</div></div>
                        <div class="d-item"><div class="d-label">RAM & Storage</div><div class="d-value">${escapeHTML(laptop.specs || '-')}</div></div>
                    </div>
                </div>

                <div class="section-card">
                    <h4>Network Setup</h4>
                    <div class="full-d-grid">
                        <div class="d-item"><div class="d-label">WiFi MAC</div><div class="d-value">${escapeHTML(laptop.wifiMac || '-')}</div></div>
                        <div class="d-item"><div class="d-label">LAN MAC</div><div class="d-value">${escapeHTML(laptop.lanMac || '-')}</div></div>
                    </div>
                </div>

                ${laptop.notes ? `
                <div class="section-card">
                    <h4>Notes</h4>
                    <p style="font-size: 0.95rem; line-height: 1.5; color: var(--text-main);">${escapeHTML(laptop.notes)}</p>
                </div>
                ` : ''}
                
            </div>
        `;
    } catch (error) {
        alert('Error loading laptop details: ' + error.message);
    }
};

// Utility to prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
