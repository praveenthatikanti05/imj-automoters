// ============================================
// Mechanic Service Management System - Server
// Simple version: Express + JSON file storage
// ============================================

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Paths to our "database" files
const SERVICES_FILE = path.join(__dirname, 'data', 'services.json');
const REQUESTS_FILE = path.join(__dirname, 'data', 'requests.json');
const CONFIG_FILE = path.join(__dirname, 'data', 'config.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Helper functions to read/write JSON files ----------
function readJSON(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ---------- Simple auth middleware ----------
// The mechanic dashboard sends the token in the "Authorization" header.
// We just compare it to the token stored in config.json. Simple, not
// bank-grade security, but fine for a small internal tool.
function requireAuth(req, res, next) {
  const config = readJSON(CONFIG_FILE);
  const authHeader = req.headers['authorization'];
  if (authHeader === config.authToken) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// ================= ROUTES =================

// -- Get all services (public, shown to customers) --
app.get('/api/services', (req, res) => {
  const services = readJSON(SERVICES_FILE);
  res.json(services);
});

// -- Customer submits a new service request (public) --
app.post('/api/requests', (req, res) => {
  const { customerName, phone, email, vehicle, serviceId, notes } = req.body;

  if (!customerName || !phone || !vehicle || !serviceId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const requests = readJSON(REQUESTS_FILE);

  const newRequest = {
    id: Date.now(), // simple unique id based on timestamp
    customerName,
    phone,
    email: email || '',
    vehicle,
    serviceId,
    notes: notes || '',
    status: 'pending', // pending -> in-progress -> completed
    createdAt: new Date().toISOString(),
    seen: false // used to power the "new request" notification badge
  };

  requests.unshift(newRequest); // newest first
  writeJSON(REQUESTS_FILE, requests);

  res.status(201).json({ message: 'Request submitted successfully', request: newRequest });
});

// -- Mechanic login (public) --
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const config = readJSON(CONFIG_FILE);

  if (username === config.mechanicUsername && password === config.mechanicPassword) {
    res.json({ token: config.authToken });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

// -- Get all requests (mechanic only) --
app.get('/api/requests', requireAuth, (req, res) => {
  const requests = readJSON(REQUESTS_FILE);
  res.json(requests);
});

// -- Update a request's status (mechanic only) --
app.patch('/api/requests/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const requests = readJSON(REQUESTS_FILE);

  const requestIndex = requests.findIndex(r => r.id === id);
  if (requestIndex === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }

  if (status) requests[requestIndex].status = status;
  requests[requestIndex].seen = true;

  writeJSON(REQUESTS_FILE, requests);
  res.json({ message: 'Request updated', request: requests[requestIndex] });
});

// -- Mark all requests as seen (used to clear the notification badge) --
app.post('/api/requests/mark-seen', requireAuth, (req, res) => {
  const requests = readJSON(REQUESTS_FILE);
  requests.forEach(r => (r.seen = true));
  writeJSON(REQUESTS_FILE, requests);
  res.json({ message: 'All requests marked as seen' });
});

app.listen(PORT, () => {
  console.log(`Mechanic Service Management System running at http://localhost:${PORT}`);
});
