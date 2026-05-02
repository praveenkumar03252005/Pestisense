import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

console.log('--- SERVER STARTING UP ---');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// ... (existing config and state) ...

async function startServer() {
  // MongoDB Connection
  const MONGO_URI = process.env.MONGODB_URI;
  const DB_NAME = 'pestisense';
  let db: any;

  // Background connection
  if (!MONGO_URI) {
    console.warn('WARNING: MONGODB_URI is not defined. Database functionality will be unavailable.');
  } else {
    if (MONGO_URI.includes('atlas-sql')) {
      console.warn('Detected Atlas SQL connection string. This is usually NOT compatible with standard drivers. Please use the "Connect your application" string from Atlas.');
    }

    console.log('Initiating MongoDB connection in background...');
    MongoClient.connect(MONGO_URI, { 
      connectTimeoutMS: 5000, 
      serverSelectionTimeoutMS: 5000,
      appName: 'pestisense-app'
    })
      .then(client => {
        db = client.db(DB_NAME);
        console.log('Successfully connected to MongoDB');
      })
      .catch(err => {
        console.error('MongoDB connection failed:', err.message);
        console.error('TIP: Ensure your IP is allowlisted in MongoDB Atlas (Network Access -> Add IP Address -> Allow Access from Anywhere).');
      });
  }

  // Cloudinary Config
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Ensure uploads directory exists
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
    console.log('Created uploads/ directory');
  }

  const upload = multer({ dest: 'uploads/' });

  // --- MIDDLEWARE ---

  // Middleware to log all requests
  app.use((req, res, next) => {
    if (!req.url.includes('vite') && !req.url.includes('node_modules')) {
      console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    }
    next();
  });

  // Database availability check - Warning only, no 503 block for demo purposes
  app.use('/api', (req, res, next) => {
    if (!db && !['/api/health', '/api/auth/google/url'].includes(req.path)) {
      console.warn(`[API] DB not connected: ${req.originalUrl} - Some features may not save data.`);
    }
    next();
  });

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized: Missing token' });
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden: Invalid token' });
      req.user = user;
      next();
    });
  };

  // Optional Auth Middleware
  const optionalAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return next();
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
      if (!err) req.user = user;
      next();
    });
  };

  // --- API ROUTES ---

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), env: process.env.NODE_ENV });
  });

  // --- SOIL DATA ---
  app.get('/api/soil', async (req, res) => {
    try {
      // Mock data matching the frontend's expected format if no real records
      const mockSoil = {
        nutrients: [
          { name: 'Nitrogen', symbol: 'N', value: 24, max: 50, target: 40, unit: 'mg/kg' },
          { name: 'Phosphorous', symbol: 'P', value: 12, max: 30, target: 25, unit: 'mg/kg' },
          { name: 'Potassium', symbol: 'K', value: 45, max: 60, target: 50, unit: 'mg/kg' },
          { name: 'Organic Carbon', symbol: 'OC', value: 0.6, max: 1.5, target: 1.2, unit: '%' }
        ],
        ratios: {
          npk: '4:1:3',
          cn: '12:1'
        }
      };
      
      if (db) {
        const records = await db.collection('soil_records').find().sort({ date: -1 }).limit(1).toArray();
        if (records.length > 0) {
            // If we found a record, we could potentially transform it, 
            // but for now we'll stick to the structured format our UI needs.
            return res.json(records[0].data || mockSoil);
        }
      }
      
      res.json(mockSoil);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/soil', async (req, res) => {
    try {
      const record = { ...req.body, date: new Date() };
      await db.collection('soil_records').insertOne(record);
      res.json({ status: 'saved' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- REVIEWS ---
  app.get('/api/reviews', async (req, res) => {
    try {
      const { pesticide_id, area } = req.query;
      const query: any = {};
      if (pesticide_id && pesticide_id !== 'all') query.pesticide_id = pesticide_id;
      if (area) query.reviewer_village = { $regex: area, $options: 'i' };
      
      const docs = await db.collection('reviews').find(query).sort({ created_at: -1 }).toArray();
      res.json(docs); // Return array directly
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/reviews', async (req, res) => {
    try {
      const review = { ...req.body, created_at: new Date() };
      await db.collection('reviews').insertOne(review);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- DISEASE HOTSPOTS ---
  app.get('/api/disease-hotspots', async (req, res) => {
    try {
        const hotspots = [
            { area_name: 'Madanapalle', disease_name: 'Early Blight', prevalence_percentage: 72, coords: [13.6288, 78.5015] },
            { area_name: 'Punganur', disease_name: 'Late Blight', prevalence_percentage: 50, coords: [13.5500, 78.4500] },
            { area_name: 'Chittoor', disease_name: 'TYLCV', prevalence_percentage: 30, coords: [13.7000, 78.6000] }
        ];
        res.json(hotspots); // Return array directly
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
  });

  // --- WEATHER FORECAST ---
  app.get('/api/weather-forecast', async (req, res) => {
    try {
        const forecast = [
            { day: 'Mon', temp: 31, condition: 'Sunny', rain: 5 },
            { day: 'Tue', temp: 32, condition: 'Sunny', rain: 0 },
            { day: 'Wed', temp: 30, condition: 'Cloudy', rain: 20 },
            { day: 'Thu', temp: 28, condition: 'Rain', rain: 75 },
            { day: 'Fri', temp: 29, condition: 'Storm', rain: 60 },
            { day: 'Sat', temp: 30, condition: 'Cloudy', rain: 15 },
            { day: 'Sun', temp: 32, condition: 'Sunny', rain: 0 }
        ];
        res.json(forecast); // Return array directly
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });
      
      console.log(`Signup attempt for email: ${email}`);
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        console.log(`Signup failed: User ${email} already exists`);
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = { name, email, password: hashedPassword, createdAt: new Date() };
      
      const result = await db.collection('users').insertOne(user);
      console.log(`User created successfully: ${email}`);
      
      const token = jwt.sign({ id: result.insertedId, email }, process.env.JWT_SECRET || 'secret');
      res.json({ token, user: { id: result.insertedId, name, email } });
    } catch (err: any) {
      console.error('Signup Error:', err.message);
      res.status(500).json({ error: 'Internal server error during signup', details: err.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(`Login attempt for email: ${email}`);
      
      const user = await db.collection('users').findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        console.log(`Login failed for email: ${email} - Invalid credentials`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET || 'secret');
      console.log(`User logged in successfully: ${email}`);
      res.json({ token, user: { id: user._id, name: user.name, email } });
    } catch (err: any) {
      console.error('Login Error:', err.message);
      res.status(500).json({ error: 'Internal server error during login', details: err.message });
    }
  });

  // --- GOOGLE OAUTH ROUTES ---

  app.get('/api/auth/google/url', (req, res) => {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    
    // Construct base URL robustly
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = process.env.APP_URL || `${protocol}://${host}`;
    const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/auth/google/callback`;
    
    console.log(`Generating Google Auth URL. Base: ${baseUrl}, Redirect: ${redirectUri}`);

    const options = {
      redirect_uri: redirectUri,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ 
        error: 'GOOGLE_CLIENT_ID is not configured. Please set it in AI Studio settings.',
        redirectUriSuggestion: redirectUri
      });
    }

    const qs = new URLSearchParams(options);
    res.json({ url: `${rootUrl}?${qs.toString()}` });
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    const code = req.query.code as string;
    const host = req.get('host');
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = process.env.APP_URL || `${protocol}://${host}`;
    const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/auth/google/callback`;

    try {
      if (!db) {
        throw new Error('Database connection is not established. Please check your MONGODB_URI.');
      }
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error('Google OAuth credentials missing (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)');
      }

      // Exchange code for tokens
      const axios = (await import('axios')).default;
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });

      const { access_token, id_token } = tokenResponse.data;

      // Fetch user info
      const googleUserResponse = await (await import('axios')).default.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        }
      );

      const googleUser = googleUserResponse.data;

      // Upsert user in our DB
      let user = await db.collection('users').findOne({ email: googleUser.email });
      
      if (!user) {
        const newUser = {
          name: googleUser.name,
          email: googleUser.email,
          avatar: googleUser.picture,
          googleId: googleUser.id,
          createdAt: new Date(),
        };
        const result = await db.collection('users').insertOne(newUser);
        user = { ...newUser, _id: result.insertedId };
      }

      const token = jwt.sign(
        { id: user._id, email: user.email }, 
        process.env.JWT_SECRET || 'secret'
      );

      // Send postMessage and close popup
      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ 
                type: 'GOOGLE_AUTH_SUCCESS', 
                token: '${token}',
                user: ${JSON.stringify({ id: user._id, name: user.name, email: user.email })}
              }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    } catch (error: any) {
      const errorDetail = error.response?.data || error.message;
      console.error('Google Auth Error:', errorDetail);
      res.status(500).send(`
        <html>
          <body style="font-family: sans-serif; padding: 20px;">
            <h1 style="color: #d32f2f;">Authentication Failed</h1>
            <p>There was an error communicating with Google. Please check your credentials in AI Studio settings.</p>
            <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(errorDetail, null, 2)}</pre>
            <button onclick="window.close()" style="padding: 10px 20px; cursor: pointer;">Close Window</button>
          </body>
        </html>
      `);
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user._id, name: user.name, email: user.email });
  });

  app.post('/api/analysis/save', authenticateToken, async (req: any, res) => {
    const userId = new ObjectId(req.user.id);
    try {
      if (db) {
        const record = {
          userId,
          ...req.body,
          analyzedAt: new Date(req.body.analyzedAt || new Date())
        };
        await db.collection('analysis_history').insertOne(record);
        res.json({ success: true });
      } else {
        res.status(503).json({ error: "Database not connected" });
      }
    } catch (err: any) {
      console.error('Save Analysis Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/history', authenticateToken, async (req: any, res) => {
    try {
      const records = await db.collection('analysis_history')
        .find({ userId: new ObjectId(req.user.id) })
        .sort({ analyzedAt: -1 })
        .toArray();
      
      const formatted = records.map(r => ({
        id: r._id,
        disease: r.diagnosis.disease,
        location: r.location,
        date: r.analyzedAt
      }));

      res.json(formatted);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- VITE MIDDLEWARE / STATIC FILES ---

  // Handle API 404s
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.url}` });
  });

  // Final catch-all for any errors that slipped through
  app.use((err: any, req: any, res: any, next: any) => {
    if (req.path.startsWith('/api/')) {
      console.error('FINAL API ERROR:', err);
      return res.status(500).json({ 
        error: 'Critical API Error', 
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
    next(err);
  });

  // Static files and fallbacks
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    // Development fallback using Vite
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[${new Date().toLocaleTimeString()}] Server listening on http://0.0.0.0:${PORT}`);
    console.log(`[${new Date().toLocaleTimeString()}] Mode: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(err => {
  console.error('FATAL ERROR DURING STARTUP:', err);
  process.exit(1);
});
