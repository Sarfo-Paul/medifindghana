const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to require specific roles
const requireRole = (roles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Access token required' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Pharmacy API is running' });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: role || 'USER'
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pharmacy Routes
app.get('/api/pharmacies', async (req, res) => {
  try {
    const { region, city, search } = req.query;
    
    let where = {};
    
    if (region) {
      where.region = region;
    }
    
    if (city) {
      where.city = city;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } }
      ];
    }

    // Use the schema's relation name `pharmacyDrugs` and map to `drugs` for frontend compatibility
    const pharmaciesRaw = await prisma.pharmacy.findMany({
      where,
      include: {
        pharmacyDrugs: {
          include: {
            drug: true
          }
        }
      }
    });

    const pharmacies = pharmaciesRaw.map((p) => ({
      ...p,
      drugs: (p.pharmacyDrugs || []).map((pd) => ({
        id: pd.id,
        drug: pd.drug,
        price: pd.price,
        quantity: pd.quantity,
        inStock: pd.inStock
      }))
    }));

    res.json(pharmacies);
  } catch (error) {
    console.error('Get pharmacies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/pharmacies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: parseInt(id) },
      include: {
        pharmacyDrugs: {
          include: {
            drug: true
          }
        }
      }
    });

    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    const result = {
      ...pharmacy,
      drugs: (pharmacy.pharmacyDrugs || []).map((pd) => ({
        id: pd.id,
        drug: pd.drug,
        price: pd.price,
        quantity: pd.quantity,
        inStock: pd.inStock
      }))
    };

    res.json(result);
  } catch (error) {
    console.error('Get pharmacy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/pharmacies', authenticateToken, requireRole(['ADMIN','PHARMACY_OWNER']), async (req, res) => {
  try {
    const { name, address, region, city, phone, latitude, longitude, openingHours } = req.body;

    if (!name || !address || !region || !city) {
      return res.status(400).json({ error: 'Name, address, region, and city are required' });
    }

    const pharmacy = await prisma.pharmacy.create({
      data: {
        name,
        address,
        region,
        city,
        phone: phone || null,
        latitude: latitude || null,
        longitude: longitude || null,
        openingHours: openingHours || null
      }
    });

    res.status(201).json(pharmacy);
  } catch (error) {
    console.error('Create pharmacy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin user management
app.get('/api/admin/users', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/admin/users/:id/role', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required' });

    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role }
    });

    res.json({ id: updated.id, role: updated.role });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin drug management
app.get('/api/admin/drugs', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const drugs = await prisma.drug.findMany({
      include: {
        pharmacyDrugs: { include: { pharmacy: true } }
      }
    });
    res.json(drugs);
  } catch (error) {
    console.error('Get admin drugs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/drugs/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.drug.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete drug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin pharmacy management
app.get('/api/admin/pharmacies', authenticateToken, requireRole(['ADMIN','PHARMACY_OWNER']), async (req, res) => {
  try {
    const pharmaciesRaw = await prisma.pharmacy.findMany({
      include: {
        pharmacyDrugs: { include: { drug: true } }
      }
    });

    const pharmacies = pharmaciesRaw.map((p) => ({
      ...p,
      drugs: (p.pharmacyDrugs || []).map((pd) => ({
        id: pd.id,
        drug: pd.drug,
        price: pd.price,
        quantity: pd.quantity,
        inStock: pd.inStock
      }))
    }));

    res.json(pharmacies);
  } catch (error) {
    console.error('Get admin pharmacies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/pharmacies/:id', authenticateToken, requireRole(['ADMIN','PHARMACY_OWNER']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.pharmacy.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete pharmacy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Announcements
app.get('/api/announcements', async (req, res) => {
  try {
    // Exclude any legacy/admin-only announcement about admin tools
    const announcements = await prisma.announcement.findMany({
      where: {
        NOT: [
          { title: { contains: 'Admin Tools Enabled' } },
          { body: { contains: 'Admins can now manage' } }
        ]
      },
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/announcements', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { title, body, authorId } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body,
        authorId: authorId || req.user.id
      }
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/announcements/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.announcement.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Drug Routes
app.get('/api/drugs', async (req, res) => {
  try {
    const { search, category } = req.query;
    
    let where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { genericName: { contains: search } }
      ];
    }
    
    if (category) {
      where.category = category;
    }

    const drugs = await prisma.drug.findMany({
      where,
      include: {
        pharmacyDrugs: {
          include: {
            pharmacy: true
          }
        }
      }
    });

    res.json(drugs);
  } catch (error) {
    console.error('Get drugs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/drugs', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { name, genericName, category, description, dosageForm, strength } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const drug = await prisma.drug.create({
      data: {
        name,
        genericName: genericName || null,
        category,
        description: description || null,
        dosageForm: dosageForm || null,
        strength: strength || null
      }
    });

    res.status(201).json(drug);
  } catch (error) {
    console.error('Create drug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pharmacy Drug Availability Routes
app.post('/api/pharmacy-drugs', authenticateToken, async (req, res) => {
  try {
    const { pharmacyId, drugId, price, quantity, inStock } = req.body;

    if (!pharmacyId || !drugId) {
      return res.status(400).json({ error: 'Pharmacy ID and Drug ID are required' });
    }

    const pharmacyDrug = await prisma.pharmacyDrug.create({
      data: {
        pharmacyId: parseInt(pharmacyId),
        drugId: parseInt(drugId),
        price: price || null,
        quantity: quantity || 0,
        inStock: inStock !== undefined ? inStock : true
      },
      include: {
        pharmacy: true,
        drug: true
      }
    });

    res.status(201).json(pharmacyDrug);
  } catch (error) {
    console.error('Create pharmacy drug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/pharmacy-drugs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { price, quantity, inStock } = req.body;

    const pharmacyDrug = await prisma.pharmacyDrug.update({
      where: { id: parseInt(id) },
      data: {
        price,
        quantity,
        inStock
      },
      include: {
        pharmacy: true,
        drug: true
      }
    });

    res.json(pharmacyDrug);
  } catch (error) {
    console.error('Update pharmacy drug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search for drugs in pharmacies
app.get('/api/search', async (req, res) => {
  try {
    const { drugName, region, city, inStock } = req.query;

    if (!drugName) {
      return res.status(400).json({ error: 'Drug name is required for search' });
    }

    const results = await prisma.pharmacyDrug.findMany({
      where: {
        drug: {
          OR: [
            { name: { contains: drugName } },
            { genericName: { contains: drugName } }
          ]
        },
        pharmacy: {
          region: region || undefined,
          city: city || undefined
        },
        inStock: inStock === 'true' ? true : undefined
      },
      include: {
        pharmacy: true,
        drug: true
      }
    });

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Ghanaian regions and cities
app.get('/api/locations/regions', async (req, res) => {
  const regions = [
    'Greater Accra', 'Ashanti', 'Western', 'Central', 'Volta', 
    'Eastern', 'Northern', 'Upper East', 'Upper West', 'Brong-Ahafo'
  ];
  res.json(regions);
});

app.get('/api/locations/cities/:region', async (req, res) => {
  const { region } = req.params;
  
  const citiesByRegion = {
    'Greater Accra': ['Accra', 'Tema', 'Madina', 'Dansoman', 'Labadi'],
    'Ashanti': ['Kumasi', 'Obuasi', 'Ejisu', 'Mampong', 'Konongo'],
    'Western': ['Takoradi', 'Sekondi', 'Tarkwa', 'Axim', 'Elubo'],
    'Central': ['Cape Coast', 'Kasoa', 'Winneba', 'Mankessim', 'Saltpond'],
    'Volta': ['Ho', 'Hohoe', 'Keta', 'Aflao', 'Sogakope'],
    'Eastern': ['Koforidua', 'Nsawam', 'Akosombo', 'Aburi', 'Suhum'],
    'Northern': ['Tamale', 'Yendi', 'Savelugu', 'Bimbilla', 'Walewale'],
    'Upper East': ['Bolgatanga', 'Navrongo', 'Bawku', 'Zebilla', 'Sandema'],
    'Upper West': ['Wa', 'Lawra', 'Tumu', 'Jirapa', 'Nandom'],
    'Brong-Ahafo': ['Sunyani', 'Techiman', 'Wenchi', 'Bechem', 'Dormaa']
  };

  const cities = citiesByRegion[region] || [];
  res.json(cities);
});

// Simple AI endpoint: uses OpenAI if OPENAI_API_KEY present, otherwise a lightweight DB-backed fallback
app.post('/api/ai', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // If OpenAI key is configured, proxy the request
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a helpful assistant for a Ghanaian pharmacy search website.' },
              { role: 'user', content: prompt }
            ],
            max_tokens: 512,
            temperature: 0.2
          })
        });

        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || JSON.stringify(data);
        return res.json({ text });
      } catch (err) {
        console.error('OpenAI request failed', err);
        // fall through to fallback
      }
    }

    // Fallback: attempt to interpret the prompt to run a small DB search
    if (/find|where|nearest|pharmacy|drug|stock|available|price/i.test(prompt)) {
      // naive extraction of a drug name
      const match = prompt.match(/for\s+([a-zA-Z0-9\- ]+)/i);
      const drugName = match ? match[1].trim().split(/[,.]/)[0] : prompt.split(' ').slice(-2).join(' ');
      const results = await prisma.pharmacyDrug.findMany({
        where: {
          drug: { name: { contains: drugName } }
        },
        include: { pharmacy: true, drug: true },
        take: 6
      });

      const summary = results.map(r => `${r.drug.name} at ${r.pharmacy.name} (${r.pharmacy.city}) - ${r.inStock ? 'In stock' : 'Out of stock'}${r.price ? ` - GHS ${r.price}` : ''}`).join('\n');
      return res.json({ text: `Top matches:\n${summary || 'No results found for "' + drugName + '"'}` });
    }

    return res.json({ text: 'AI assistant is not configured. To enable advanced AI responses, set OPENAI_API_KEY in server/.env. You can still ask find queries like "Find Paracetamol in Accra".' });
  } catch (error) {
    console.error('AI endpoint error:', error);
    res.status(500).json({ error: 'AI endpoint failed' });
  }
});

// Dashboard statistics (public)
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalPharmacies = await prisma.pharmacy.count();
    const totalDrugs = await prisma.drug.count();
    const totalUsers = await prisma.user.count();
    const availableDrugs = await prisma.pharmacyDrug.count({
      where: { inStock: true }
    });

    res.json({
      totalPharmacies,
      totalDrugs,
      totalUsers,
      availableDrugs
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});