const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
require('dotenv').config();

// Force Node.js to use Google and Cloudflare DNS to bypass local ISP blocks!
dns.setServers([
  '8.8.8.8',
  '1.1.1.1'
]);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Laptop Schema Must Be Defined First!
const laptopSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  assetId: { type: String, required: true },
  deviceName: { type: String, required: true },
  employeeName: String,
  status: { type: String, required: true },
  company: String,
  department: String,
  brandModel: String,
  serialNumber: String,
  specs: String,
  purchaseDate: String,
  warrantyExpiry: String,
  outlookEmail: String,
  outlookPassword: String,
  wifiMac: String,
  lanMac: String,
  notes: String,
});

const Laptop = mongoose.model('Laptop', laptopSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  // Seed mock data if collection is empty
  const count = await Laptop.countDocuments();
  if (count === 0) {
    const mockData = [
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
    await Laptop.insertMany(mockData);
    console.log('Mock data seeded');
  }
})
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/api/laptops', async (req, res) => {
  try {
    const laptops = await Laptop.find();
    res.json(laptops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/laptops', async (req, res) => {
  try {
    const laptop = new Laptop(req.body);
    await laptop.save();
    res.status(201).json(laptop);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/laptops/:id', async (req, res) => {
  try {
    const laptop = await Laptop.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!laptop) return res.status(404).json({ error: 'Laptop not found' });
    res.json(laptop);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/laptops/:id', async (req, res) => {
  try {
    const laptop = await Laptop.findOneAndDelete({ id: req.params.id });
    if (!laptop) return res.status(404).json({ error: 'Laptop not found' });
    res.json({ message: 'Laptop deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
