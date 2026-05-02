import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';
import Groq from "groq-sdk";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

console.log('--- SERVER STARTING UP ---');
dotenv.config();

const app = express();
const PORT = 3000;
let groq: any;

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

  // Initialize Groq lazily or safely
  const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    console.warn('WARNING: GROQ_API_KEY or VITE_GROQ_API_KEY is not defined. AI features will be unavailable.');
  } else {
    try {
      groq = new Groq({ apiKey: GROQ_API_KEY });
      console.log('Groq SDK initialized successfully');
    } catch (err: any) {
      console.error('Failed to initialize Groq SDK:', err.message);
    }
  }

  const upload = multer({ dest: 'uploads/' });

  // --- MIDDLEWARE ---

  // Middleware to log all requests
  app.use((req, res, next) => {
    // Log only if it's not a noise request (like vite hmr which should be disabled anyway)
    if (!req.url.includes('vite') && !req.url.includes('node_modules')) {
      console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
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
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
      if (err) return res.sendStatus(403);
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
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // --- GROQ AI ROUTES ---
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, lang } = req.body;
      const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
      
      if (!apiKey || !groq) {
        return res.status(503).json({ error: "GROQ AI Service is not configured or failed to initialize. Please check GROQ_API_KEY in the Settings menu." });
      }

      const systemPrompt = `You are PestiSense Agri AI, an expert agricultural advisor specializing in tomato cultivation in Madanapalle, Andhra Pradesh, India. 
      Answer the farmer's questions in ${lang === 'te' ? 'Telugu' : 'English'}. 
      Provide scientific, practical, and safe advice. 
      The area is famous for the Madanapalle Tomato Market.
      If recommending pesticides, strictly mention that they should be CIBRC (Central Insecticides Board & Registration Committee) approved. 
      Keep answers concise, technical yet simple for a farmer.`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({ 
            role: m.role === 'user' ? 'user' : 'assistant', 
            content: m.text 
          }))
        ],
        model: "llama-3.3-70b-versatile",
      });

      const botText = chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't process that.";
      res.json({ text: botText });
    } catch (err: any) {
      console.error('Groq Chat Error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/identify-pesticide', upload.single('image'), async (req: any, res) => {
    try {
      const file = req.file;
      const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

      if (!apiKey || !groq) {
        return res.status(503).json({ error: "GROQ AI Service is not configured or failed to initialize. Please check GROQ_API_KEY in the Settings menu." });
      }

      if (!file) {
        return res.status(400).json({ error: "No image file provided." });
      }

      const base64Image = fs.readFileSync(file.path, { encoding: 'base64' });

      const prompt = `Identify this agricultural pesticide/fertilizer from the bottle/label shown. 
      Extract these specific fields:
      1. Product Name
      2. Active Ingredient
      3. Formulation (e.g. 75% WP, 10% EC, 23% SC)
      4. Usage for Tomato crops (if mentioned or recommended)
      5. Safety Warning
      
      Respond STRICTLY in JSON format: { "name": string, "active": string, "form": string, "usage": string, "warning": string }`;

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${file.mimetype};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        model: "llama-3.2-11b-vision-preview",
        response_format: { type: "json_object" }
      });

      // Cleanup local file
      fs.unlinkSync(file.path);

      const content = response.choices[0]?.message?.content || '{}';
      res.json(JSON.parse(content));
    } catch (err: any) {
      console.error('Groq Vision Error:', err);
      res.status(500).json({ error: err.message });
    }
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
    if (!user) return res.sendStatus(404);
    res.json({ id: user._id, name: user.name, email: user.email });
  });

  app.post('/api/analysis', optionalAuth, upload.fields([
    { name: 'leaf_image', maxCount: 1 },
    { name: 'soil_report', maxCount: 1 }
  ]), async (req: any, res) => {
    const userId = req.user ? new ObjectId(req.user.id) : null;

    try {
      const { location, growthStage } = req.body;
      const files = req.files;
      
      // Simulated AI detection
      const diagnosis = {
        disease: {
          en: "Early Blight",
          te: "తొలి దశ ఎండు తెగులు"
        },
        severity: "Medium",
        confidence: 92
      };

      const weather = {
        temp: 29,
        humidity: 62,
        rainChance: 15,
        soilMoisture: 48
      };

      const sprayTiming = {
        en: "Safe to spray today. Ideal window: 4:00 PM – 6:30 PM.",
        te: "ఈరోజు పిచికారీ చేయడానికి అనువైన సమయం. సాయంత్రం 4:00 - 6:30 గంటల మధ్య పిచికారీ చేయండి."
      };

      const recommendations = [
        {
          brand: "Nativo 75 WG",
          activeIngredient: "Tebuconazole + Trifloxystrobin",
          score: 95,
          legality: "Approved",
          costPerAcre: 850,
          repeatInterval: "12-15 Days",
          concentration: "75% WG",
          dose_acre: "100g",
          dose_15L: "10g",
          reason: {
            en: "Strongest systemic and contact protection. Best for currently high humidity.",
            te: "అత్యుత్తమ రక్షణను ఇస్తుంది. ప్రస్తుత వాతావరణానికి ఇది సరిగ్గా సరిపోతుంది."
          }
        },
        {
          brand: "Amistar Top",
          activeIngredient: "Azoxystrobin + Difenoconazole",
          score: 88,
          legality: "Approved",
          costPerAcre: 1100,
          repeatInterval: "14 Days",
          concentration: "32.5% SC",
          dose_acre: "200ml",
          dose_15L: "20ml",
          reason: {
            en: "Good curative action, but slightly more expensive.",
            te: "ఇది వ్యాధిని నిరోధించడంలో బాగా పనిచేస్తుంది, కానీ ధర కొంచెం ఎక్కువ."
          }
        },
        {
          brand: "Bavistin",
          activeIngredient: "Carbendazim 50% WP",
          score: 72,
          legality: "Approved",
          costPerAcre: 350,
          repeatInterval: "10 Days",
          concentration: "50% WP",
          dose_acre: "250g",
          dose_15L: "25g",
          reason: {
            en: "Budget friendly, but less effective against resistant strains.",
            te: "తక్కువ ధరలో వస్తుంది, కానీ తీవ్రత ఎక్కువగా ఉంటే తక్కువ పని చేస్తుంది."
          }
        }
      ];

      const analysisResult = {
        location,
        growthStage,
        diagnosis,
        weather,
        sprayTiming,
        recommendations,
        analyzedAt: new Date()
      };

      if (userId) {
        await db.collection('analysis_history').insertOne({
          userId,
          ...analysisResult
        });
      }

      res.json(analysisResult);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Analysis failed' });
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
    res.status(404).json({ error: `API route not found: ${req.originalUrl}` });
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
