import express from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Trust proxy for Cloud Run and reverse proxy container environments
app.set('trust proxy', 1);

app.use(express.json());

// Handle malformed JSON body payloads gracefully with JSON error responses
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && (err instanceof SyntaxError || err.type === 'entity.parse.failed')) {
    res.status(400).json({ success: false, error: 'Invalid JSON request payload.' });
    return;
  }
  next(err);
});

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'bureau_db.json');

// Configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'team@r4v.com';
const INITIAL_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'R4VBureau1920!';
const INSTAGRAM_ADMIN_PASSWORD = process.env.INSTAGRAM_PASSWORD || 'safe instagram password';
const JWT_SECRET = process.env.JWT_SECRET || 'r4v_birmingham_classified_secret_key_1920';

interface BureauDatabase {
  admin: {
    email: string;
    passwordHash: string;
    updatedAt: string;
  };
  applications: Array<{
    id: string;
    username: string;
    email: string;
    ageConfirmed: boolean;
    reason: string;
    skills: string;
    experience: string;
    socialHandle?: string;
    codeAgreed: boolean;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Needs Review';
    createdAt: string;
    updatedAt: string;
    reviewNotes?: string;
    reviewedBy?: string;
    archived?: boolean;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    timestamp: string;
    adminEmail: string;
    targetId?: string;
    details: string;
    ip?: string;
  }>;
}

// Initial seed applications for realistic dossier presentation
const INITIAL_SEED_APPLICATIONS = [
  {
    id: 'R4V-APP-10824',
    username: 'Arthur_Shelby_Audit',
    email: 'arthur.auditor@archive.bureau.org',
    ageConfirmed: true,
    reason: 'To establish uncompromising chain-of-custody protocols for digital platform policy infractions and prevent manufactured harassment campaigns.',
    skills: 'Digital Forensics, Metadata Verification, Wayback Machine / Archive.today indexing, Terms of Service compliance analysis.',
    experience: '3 years moderating cybersecurity forums and filing verified incident dossiers with platform trust & safety councils.',
    socialHandle: '@ArthurShelby_UK (Telegram)',
    codeAgreed: true,
    status: 'Needs Review' as const,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    reviewNotes: 'Initial dossier verified. Awaiting secondary review on platform clause citation standards.',
    reviewedBy: 'team@r4v.com',
    archived: false,
  },
  {
    id: 'R4V-APP-29471',
    username: 'Cipher_Ghost_77',
    email: 'cipher.ghost.archive@proton.me',
    ageConfirmed: true,
    reason: 'Passionate about dismantling bot networks and preserving objective historical internet records without engaging in personal feuds.',
    skills: 'Network traffic analysis, OSINT data correlation, Telegram/Discord scam vector identification.',
    experience: 'Former trust & safety contributor for open-source intelligence research groups.',
    socialHandle: '@CipherGhost77 (Discord)',
    codeAgreed: true,
    status: 'Pending' as const,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    reviewNotes: '',
    archived: false,
  },
  {
    id: 'R4V-APP-33910',
    username: 'Ada_Vance_Research',
    email: 'ada.vance@intel-bureau.co.uk',
    ageConfirmed: true,
    reason: 'Deeply respect the R4V ethos of "Evidence before accusation". Seeking to contribute structured research on recurring phishing infrastructures.',
    skills: 'Lexical analysis, Phishing URL clustering, Evidence documentation formatting.',
    experience: 'Information security undergraduate researcher with 2 published incident briefs.',
    socialHandle: '@AdaVance_UK (Discord)',
    codeAgreed: true,
    status: 'Approved' as const,
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    reviewNotes: 'Vetted and verified. Assigned to Archival Review Bureau.',
    reviewedBy: 'team@r4v.com',
    archived: false,
  },
  {
    id: 'R4V-APP-41092',
    username: 'Vanguard_Raider_9',
    email: 'vanguard.raider@throwaway.net',
    ageConfirmed: true,
    reason: 'I want to help takedown accounts fast and mass report abusers on IG.',
    skills: 'Fast typing, mass account creation.',
    experience: 'None formal.',
    socialHandle: '@VanguardRaider (Telegram)',
    codeAgreed: true,
    status: 'Rejected' as const,
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    reviewNotes: 'REJECTED: Violates Rule 01 & Rule 02. Expressed intent for mass reporting and lacked understanding of the R4V evidence-first protocol.',
    reviewedBy: 'team@r4v.com',
    archived: false,
  },
];

// Read / Write Database Helpers
function getDatabase(): BureauDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading database file, reinitializing:', err);
  }

  // Initialize fresh database
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(INITIAL_ADMIN_PASSWORD, salt);

  const initialDb: BureauDatabase = {
    admin: {
      email: ADMIN_EMAIL,
      passwordHash,
      updatedAt: new Date().toISOString(),
    },
    applications: INITIAL_SEED_APPLICATIONS,
    auditLogs: [
      {
        id: `LOG-${Date.now()}-INIT`,
        action: 'SYSTEM_INITIALIZED',
        timestamp: new Date().toISOString(),
        adminEmail: 'SYSTEM',
        details: `R4V Classified Management System initialized with administrator ${ADMIN_EMAIL}.`,
      },
    ],
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: BureauDatabase): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

function addAuditLog(action: string, adminEmail: string, details: string, targetId?: string, ip?: string): void {
  const db = getDatabase();
  const logEntry = {
    id: `LOG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    action,
    timestamp: new Date().toISOString(),
    adminEmail,
    targetId,
    details,
    ip,
  };
  db.auditLogs.unshift(logEntry);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  saveDatabase(db);
}

// Rate Limiter for Login Protection
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
  },
  handler: (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts from this terminal. Access temporarily sealed for 15 minutes.',
    });
  },
});

// Middleware for Admin Authentication
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'UNAUTHORIZED: Missing classified access token.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role: string };
    const db = getDatabase();
    if (decoded.email !== db.admin.email) {
      res.status(403).json({ error: 'FORBIDDEN: Invalid bureau clearance.' });
      return;
    }
    (req as express.Request & { adminUser: typeof decoded }).adminUser = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'UNAUTHORIZED: Session token expired or forged.' });
    return;
  }
}

// -------------------------------------------------------------
// PUBLIC API ROUTES
// -------------------------------------------------------------

// Public configuration info (no secrets)
app.get('/api/info', (req, res) => {
  res.json({
    name: 'TEAM R4V',
    tagline: 'No Noise. No Mercy. Only Results.',
    serverTime: new Date().toISOString(),
  });
});

// Public Application Submission
app.post('/api/applications', (req, res) => {
  const { username, email, ageConfirmed, reason, skills, experience, socialHandle, codeAgreed } = req.body;

  if (!username || !email || !reason || !skills || !experience || ageConfirmed !== true || codeAgreed !== true) {
    res.status(400).json({
      error: 'Incomplete application dossier. All required fields and covenants must be affirmed.',
    });
    return;
  }

  const db = getDatabase();
  const appId = `R4V-APP-${Math.floor(10000 + Math.random() * 90000)}`;

  const newApp = {
    id: appId,
    username: String(username).trim(),
    email: String(email).trim().toLowerCase(),
    ageConfirmed: true,
    reason: String(reason).trim(),
    skills: String(skills).trim(),
    experience: String(experience).trim(),
    socialHandle: socialHandle ? String(socialHandle).trim() : undefined,
    codeAgreed: true,
    status: 'Pending' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reviewNotes: '',
    archived: false,
  };

  db.applications.unshift(newApp);
  saveDatabase(db);

  addAuditLog(
    'APPLICATION_SUBMITTED',
    'PUBLIC_INTAKE',
    `New membership application submitted by ${newApp.username} (${newApp.email})`,
    appId,
    req.ip
  );

  res.status(201).json({
    success: true,
    message: 'Your application has been submitted for review.',
    applicationId: appId,
    status: 'Pending',
    createdAt: newApp.createdAt,
  });
});

// -------------------------------------------------------------
// ADMIN AUTHENTICATION ROUTES
// -------------------------------------------------------------

// Admin Login
app.post('/api/auth/login', loginLimiter, (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and secret key are required for terminal clearance.' });
      return;
    }

    const db = getDatabase();
    const normalizedEmail = String(email).trim().toLowerCase();

    // Check email
    if (normalizedEmail !== db.admin.email.toLowerCase()) {
      addAuditLog('FAILED_LOGIN', normalizedEmail, `Failed authentication attempt (unknown identifier)`, undefined, req.ip);
      res.status(401).json({ success: false, error: 'Access Denied: Invalid bureau credentials.' });
      return;
    }

    // Check password (supports database hash, configured initial password, or safe instagram password)
    let isValid = false;
    try {
      isValid = bcrypt.compareSync(password, db.admin.passwordHash);
    } catch {
      isValid = false;
    }

    // Also support the designated safe Instagram password / configured secrets
    if (!isValid && (password === INSTAGRAM_ADMIN_PASSWORD || password === INITIAL_ADMIN_PASSWORD || password === process.env.ADMIN_PASSWORD)) {
      isValid = true;
      // Update hash in database to keep state synchronized
      const salt = bcrypt.genSaltSync(10);
      db.admin.passwordHash = bcrypt.hashSync(password, salt);
      db.admin.updatedAt = new Date().toISOString();
      saveDatabase(db);
    }

    if (!isValid) {
      addAuditLog('FAILED_LOGIN', db.admin.email, `Failed authentication attempt (invalid password credentials)`, undefined, req.ip);
      res.status(401).json({ success: false, error: 'Access Denied: Invalid bureau credentials.' });
      return;
    }

    // Generate JWT (valid for 8 hours)
    const token = jwt.sign(
      { email: db.admin.email, role: 'SUPER_ADMIN' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    addAuditLog('LOGIN', db.admin.email, `Administrator authenticated successfully from terminal`, undefined, req.ip);

    res.json({
      success: true,
      token,
      admin: {
        email: db.admin.email,
        role: 'SUPER_ADMIN',
        expiresIn: '8h',
      },
    });
  } catch (err: unknown) {
    console.error('Error in /api/auth/login:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error occurred while validating credentials.',
    });
  }
});

// Admin Verify Token
app.get('/api/auth/verify', requireAdminAuth, (req, res) => {
  const adminUser = (req as express.Request & { adminUser: { email: string; role: string } }).adminUser;
  res.json({
    valid: true,
    email: adminUser.email,
    role: adminUser.role,
  });
});

// Admin Logout
app.post('/api/auth/logout', requireAdminAuth, (req, res) => {
  const adminUser = (req as express.Request & { adminUser: { email: string; role: string } }).adminUser;
  addAuditLog('LOGOUT', adminUser.email, `Administrator logged out of session`, undefined, req.ip);
  res.json({ success: true, message: 'Classified session terminated.' });
});

// -------------------------------------------------------------
// PROTECTED ADMIN MANAGEMENT ROUTES
// -------------------------------------------------------------

// Get Applications List
app.get('/api/admin/applications', requireAdminAuth, (req, res) => {
  const db = getDatabase();
  const { status, search, archived } = req.query;

  let results = [...db.applications];

  // Filter archived
  if (archived === 'true') {
    results = results.filter((app) => app.archived === true);
  } else if (archived === 'false' || !archived) {
    results = results.filter((app) => !app.archived);
  }

  // Filter status
  if (status && status !== 'ALL') {
    results = results.filter((app) => app.status === status);
  }

  // Search filter
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (app) =>
        app.id.toLowerCase().includes(q) ||
        app.username.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.skills.toLowerCase().includes(q) ||
        app.reason.toLowerCase().includes(q) ||
        (app.socialHandle && app.socialHandle.toLowerCase().includes(q))
    );
  }

  res.json({
    applications: results,
    totalCount: db.applications.length,
  });
});

// Get Single Application Details
app.get('/api/admin/applications/:id', requireAdminAuth, (req, res) => {
  const db = getDatabase();
  const application = db.applications.find((a) => a.id === req.params.id);
  if (!application) {
    res.status(404).json({ error: 'Dossier not found in central registry.' });
    return;
  }
  res.json({ application });
});

// Update Application Status (Approve / Reject / Needs Review / Pending)
app.patch('/api/admin/applications/:id/status', requireAdminAuth, (req, res) => {
  const { status, reviewNotes } = req.body;
  const adminUser = (req as express.Request & { adminUser: { email: string; role: string } }).adminUser;

  const validStatuses = ['Pending', 'Approved', 'Rejected', 'Needs Review'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status classification.' });
    return;
  }

  const db = getDatabase();
  const appIndex = db.applications.findIndex((a) => a.id === req.params.id);
  if (appIndex === -1) {
    res.status(404).json({ error: 'Dossier not found.' });
    return;
  }

  const prevStatus = db.applications[appIndex].status;
  db.applications[appIndex].status = status;
  db.applications[appIndex].updatedAt = new Date().toISOString();
  db.applications[appIndex].reviewedBy = adminUser.email;
  if (reviewNotes !== undefined) {
    db.applications[appIndex].reviewNotes = reviewNotes;
  }

  saveDatabase(db);

  addAuditLog(
    'STATUS_CHANGED',
    adminUser.email,
    `Application ${req.params.id} (${db.applications[appIndex].username}) status updated from [${prevStatus}] to [${status}]. Notes: ${reviewNotes || 'None'}`,
    req.params.id,
    req.ip
  );

  res.json({
    success: true,
    application: db.applications[appIndex],
  });
});

// Update Review Notes
app.post('/api/admin/applications/:id/notes', requireAdminAuth, (req, res) => {
  const { reviewNotes } = req.body;
  const adminUser = (req as express.Request & { adminUser: { email: string; role: string } }).adminUser;

  const db = getDatabase();
  const appIndex = db.applications.findIndex((a) => a.id === req.params.id);
  if (appIndex === -1) {
    res.status(404).json({ error: 'Dossier not found.' });
    return;
  }

  db.applications[appIndex].reviewNotes = reviewNotes || '';
  db.applications[appIndex].updatedAt = new Date().toISOString();
  db.applications[appIndex].reviewedBy = adminUser.email;

  saveDatabase(db);

  addAuditLog(
    'NOTE_ADDED',
    adminUser.email,
    `Review notes updated for ${req.params.id}`,
    req.params.id,
    req.ip
  );

  res.json({
    success: true,
    application: db.applications[appIndex],
  });
});

// Archive / Unarchive Application
app.patch('/api/admin/applications/:id/archive', requireAdminAuth, (req, res) => {
  const { archived } = req.body;
  const adminUser = (req as express.Request & { adminUser: { email: string; role: string } }).adminUser;

  const db = getDatabase();
  const appIndex = db.applications.findIndex((a) => a.id === req.params.id);
  if (appIndex === -1) {
    res.status(404).json({ error: 'Dossier not found.' });
    return;
  }

  const isArchived = archived === true;
  db.applications[appIndex].archived = isArchived;
  db.applications[appIndex].updatedAt = new Date().toISOString();

  saveDatabase(db);

  addAuditLog(
    'APPLICATION_ARCHIVED',
    adminUser.email,
    `Application ${req.params.id} (${db.applications[appIndex].username}) marked as ${isArchived ? 'ARCHIVED' : 'ACTIVE'}`,
    req.params.id,
    req.ip
  );

  res.json({
    success: true,
    application: db.applications[appIndex],
  });
});

// Get Audit Logs
app.get('/api/admin/audit-logs', requireAdminAuth, (req, res) => {
  const db = getDatabase();
  const { action, limit } = req.query;

  let logs = [...db.auditLogs];
  if (action && action !== 'ALL') {
    logs = logs.filter((log) => log.action === action);
  }

  const maxLimit = limit ? Math.min(Number(limit), 200) : 100;
  logs = logs.slice(0, maxLimit);

  res.json({ logs, totalCount: db.auditLogs.length });
});

// Get Admin Statistics
app.get('/api/admin/stats', requireAdminAuth, (req, res) => {
  const db = getDatabase();
  const apps = db.applications;

  const stats = {
    totalApplications: apps.length,
    pending: apps.filter((a) => a.status === 'Pending' && !a.archived).length,
    needsReview: apps.filter((a) => a.status === 'Needs Review' && !a.archived).length,
    approved: apps.filter((a) => a.status === 'Approved' && !a.archived).length,
    rejected: apps.filter((a) => a.status === 'Rejected' && !a.archived).length,
    archived: apps.filter((a) => a.archived === true).length,
    totalLogs: db.auditLogs.length,
  };

  res.json({ stats });
});

// 404 handler for unmatched API routes (before static / SPA fallback)
app.all('/api/*', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(404).json({
    success: false,
    error: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global API error handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Express server unhandled error:', err);
  if (req.path.startsWith('/api/') || req.originalUrl.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'Internal server error occurred.',
    });
    return;
  }
  res.status(err.status || 500).send('Internal Server Error');
});

// Initialize database on boot
getDatabase();

// -------------------------------------------------------------
// VITE MIDDLEWARE & STATIC SERVING
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TEAM R4V] Bureau Server running on http://0.0.0.0:${PORT}`);
    console.log(`[TEAM R4V] Administrator Configured: ${ADMIN_EMAIL}`);
  });
}

startServer();
