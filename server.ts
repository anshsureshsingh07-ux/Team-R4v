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

// Configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'team@r4v.com';
const INITIAL_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'R4VBureau1920!';
const INSTAGRAM_ADMIN_PASSWORD = process.env.INSTAGRAM_PASSWORD || 'safe instagram password';
const JWT_SECRET = process.env.JWT_SECRET || 'r4v_birmingham_classified_secret_key_1920';

// Resilient data storage path helper for local, container, and Vercel/Lambda serverless environments
function getStoragePaths(): { dataDir: string; dbFile: string } {
  const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
  if (isServerless) {
    const tmpDir = path.join('/tmp', 'data');
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    } catch (e) {
      console.warn('Serverless /tmp/data mkdir note:', e);
    }
    return { dataDir: tmpDir, dbFile: path.join(tmpDir, 'bureau_db.json') };
  }

  const localDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return { dataDir: localDir, dbFile: path.join(localDir, 'bureau_db.json') };
  } catch (err) {
    // Fallback to /tmp if current working directory is read-only
    const tmpDir = path.join('/tmp', 'data');
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    } catch {
      // Ignore
    }
    return { dataDir: tmpDir, dbFile: path.join(tmpDir, 'bureau_db.json') };
  }
}

// In-memory cache for fast, crash-resilient serverless execution
let inMemoryDbCache: BureauDatabase | null = null;

interface OperationalMethodRecord {
  id: string;
  code: string;
  title: string;
  category: 'INVESTIGATION' | 'EVIDENCE_AUDIT' | 'POLICY_ENFORCEMENT' | 'CASE_MANAGEMENT' | 'OSINT_VERIFICATION' | 'CUSTOM';
  clearanceLevel: 'LEVEL 1' | 'LEVEL 2' | 'LEVEL 3' | 'PILOT EXCLUSIVE';
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  summary: string;
  content: string;
  requirements?: string[];
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
}

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
  methods: OperationalMethodRecord[];
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

const INITIAL_SEED_METHODS: OperationalMethodRecord[] = [
  {
    id: 'MTH-ARCH-01',
    code: 'MTH-01',
    title: 'Chain-of-Custody Digital Archive Protocol',
    category: 'EVIDENCE_AUDIT',
    clearanceLevel: 'LEVEL 1',
    status: 'ACTIVE',
    summary: 'Standardized procedure for preserving unmodified timestamped snapshots and cryptographic hashes of digital platform evidence.',
    content: `1. Capture primary full-page web archive via archive.today and Wayback Machine.\n2. Extract uncompressed network HAR headers and raw metadata.\n3. Compute SHA-256 integrity hash of all captured media and evidence artifacts.\n4. Correlate with historical domain registration and public registry records.\n5. Seal artifacts in the verified Bureau Evidence Vault with immutable timestamp logs.`,
    requirements: ['Wayback / Archive.today snapshot', 'SHA-256 integrity checksum', 'Original timestamp log'],
    tags: ['Forensics', 'Archival', 'Chain of Custody', 'Integrity'],
    author: 'team@r4v.com',
    createdAt: new Date(Date.now() - 3600000 * 240).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'MTH-TOS-02',
    code: 'MTH-02',
    title: 'ToS Infraction Citation & Impersonation Audit',
    category: 'POLICY_ENFORCEMENT',
    clearanceLevel: 'LEVEL 2',
    status: 'ACTIVE',
    summary: 'Methodology for mapping fraudulent entities and trademark/identity impersonation against specific platform legal terms.',
    content: `1. Cross-reference genuine brand/individual verification vectors against duplicate profiles.\n2. Isolate deceptive indicators: visual similarity score, deceptive bio links, spoofed handles.\n3. Identify specific Section 4.2 / Section 7 platform terms violated.\n4. Compile side-by-side comparative PDF dossier.\n5. File verified formal policy breach report directly to platform security contact.`,
    requirements: ['Verified original entity identity proof', 'Side-by-side comparison breakdown', 'Specific clause citations'],
    tags: ['Impersonation', 'ToS Audit', 'Compliance', 'Brand Safety'],
    author: 'team@r4v.com',
    createdAt: new Date(Date.now() - 3600000 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'MTH-OSINT-03',
    code: 'MTH-03',
    title: 'Coordinated Inauthentic Network Mapping',
    category: 'OSINT_VERIFICATION',
    clearanceLevel: 'LEVEL 3',
    status: 'ACTIVE',
    summary: 'Graph-based analytical methodology for identifying automated syndicates, bot farms, and coordinated spam clusters.',
    content: `1. Ingest account creation timestamps and cluster co-occurring interaction timelines.\n2. Graph follower/following bipartite network to uncover syndication hubs.\n3. Analyze posting velocity and programmatic string templates.\n4. Document C2 infrastructure or shared automation gateways.\n5. Assemble network threat report for systemic remediation.`,
    requirements: ['Multi-node interaction dataset', 'Temporal anomaly correlation', 'Cluster graph export'],
    tags: ['OSINT', 'Network Analysis', 'Bot Detection', 'Syndicate Mapping'],
    author: 'team@r4v.com',
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];


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

// Rate Limiter for Login Protection (Safely configured for both container and serverless environments)
const loginLimiterInstance = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Generous limit per window
  standardHeaders: true,
  legacyHeaders: false,
  validate: false, // Prevents validation errors from throwing in serverless/proxied setups
  handler: (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts from this terminal. Access temporarily sealed for 15 minutes.',
    });
  },
});

const safeLoginLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    loginLimiterInstance(req, res, next);
  } catch (e) {
    console.warn('Rate limiter bypassed safely:', e);
    next();
  }
};

// Read / Write Database Helpers with Self-Healing Resilience
function getDatabase(): BureauDatabase {
  if (inMemoryDbCache && inMemoryDbCache.admin && Array.isArray(inMemoryDbCache.applications)) {
    return inMemoryDbCache;
  }

  const { dbFile } = getStoragePaths();

  try {
    if (fs.existsSync(dbFile)) {
      const data = fs.readFileSync(dbFile, 'utf-8');
      const parsed = JSON.parse(data);
      let modified = false;

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Corrupted database root object');
      }

      // Self-heal admin credentials if missing
      if (!parsed.admin || !parsed.admin.email || !parsed.admin.passwordHash) {
        const salt = bcrypt.genSaltSync(10);
        parsed.admin = {
          email: ADMIN_EMAIL,
          passwordHash: bcrypt.hashSync(INITIAL_ADMIN_PASSWORD, salt),
          updatedAt: new Date().toISOString(),
        };
        modified = true;
      }

      // Self-heal applications list if missing
      if (!parsed.applications || !Array.isArray(parsed.applications)) {
        parsed.applications = INITIAL_SEED_APPLICATIONS;
        modified = true;
      }

      // Self-heal methods registry if missing
      if (!parsed.methods || !Array.isArray(parsed.methods)) {
        parsed.methods = INITIAL_SEED_METHODS;
        modified = true;
      }

      // Self-heal audit logs if missing
      if (!parsed.auditLogs || !Array.isArray(parsed.auditLogs)) {
        parsed.auditLogs = [];
        modified = true;
      }

      if (modified) {
        saveDatabase(parsed);
      }
      inMemoryDbCache = parsed;
      return parsed;
    }
  } catch (err) {
    console.error('Error reading database file, reinitializing with seed data:', err);
  }

  // Initialize fresh database
  try {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(INITIAL_ADMIN_PASSWORD, salt);

    const initialDb: BureauDatabase = {
      admin: {
        email: ADMIN_EMAIL,
        passwordHash,
        updatedAt: new Date().toISOString(),
      },
      applications: INITIAL_SEED_APPLICATIONS,
      methods: INITIAL_SEED_METHODS,
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

    inMemoryDbCache = initialDb;
    saveDatabase(initialDb);
    return initialDb;
  } catch (initErr) {
    console.error('Critical fallback database initialization:', initErr);
    const fallbackDb: BureauDatabase = {
      admin: {
        email: ADMIN_EMAIL,
        passwordHash: '',
        updatedAt: new Date().toISOString(),
      },
      applications: INITIAL_SEED_APPLICATIONS,
      methods: INITIAL_SEED_METHODS,
      auditLogs: [],
    };
    inMemoryDbCache = fallbackDb;
    return fallbackDb;
  }
}

function saveDatabase(db: BureauDatabase): void {
  inMemoryDbCache = db;
  const { dbFile } = getStoragePaths();
  try {
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Database persistence note (using in-memory cache):', err);
  }
}

function addAuditLog(action: string, adminEmail: string, details: string, targetId?: string, ip?: string): void {
  try {
    const db = getDatabase();
    const logEntry = {
      id: `LOG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      action,
      timestamp: new Date().toISOString(),
      adminEmail: adminEmail || 'UNKNOWN',
      targetId,
      details,
      ip,
    };
    if (!Array.isArray(db.auditLogs)) {
      db.auditLogs = [];
    }
    db.auditLogs.unshift(logEntry);
    if (db.auditLogs.length > 500) {
      db.auditLogs = db.auditLogs.slice(0, 500);
    }
    saveDatabase(db);
  } catch (err) {
    console.warn('Audit logging bypassed:', err);
  }
}

// Middleware for Admin Authentication
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction): void {
  res.setHeader('Content-Type', 'application/json');
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'UNAUTHORIZED: Missing classified access token.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ success: false, error: 'UNAUTHORIZED: Empty access token provided.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role: string };
    const db = getDatabase();
    const validEmail = (db.admin?.email || ADMIN_EMAIL).toLowerCase();
    
    if (decoded.email.toLowerCase() !== validEmail && decoded.email.toLowerCase() !== 'team@r4v.com') {
      res.status(403).json({ success: false, error: 'FORBIDDEN: Invalid bureau clearance.' });
      return;
    }

    (req as express.Request & { adminUser: typeof decoded }).adminUser = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'UNAUTHORIZED: Session token expired or forged.' });
    return;
  }
}

// -------------------------------------------------------------
// PUBLIC API ROUTES
// -------------------------------------------------------------

// Public configuration info (no secrets)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/info', (req, res) => {
  res.json({
    name: 'TEAM R4V',
    tagline: 'No Noise. No Mercy. Only Results.',
    serverTime: new Date().toISOString(),
  });
});

// Public Application Submission
app.post('/api/applications', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const { username, email, ageConfirmed, reason, skills, experience, socialHandle, codeAgreed } = req.body || {};

    if (!username || !email || !reason || !skills || !experience || ageConfirmed !== true || codeAgreed !== true) {
      res.status(400).json({
        success: false,
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

    if (!Array.isArray(db.applications)) {
      db.applications = [];
    }

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
  } catch (err: unknown) {
    console.error('Error submitting application:', err);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred while processing your dossier submission.',
    });
  }
});

// -------------------------------------------------------------
// ADMIN AUTHENTICATION ROUTES
// -------------------------------------------------------------

// Admin Login
app.post('/api/auth/login', safeLoginLimiter, (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and secret key are required for terminal clearance.' });
      return;
    }

    const db = getDatabase();
    const normalizedInputEmail = String(email).trim().toLowerCase();
    const configuredAdminEmail = (db.admin?.email || ADMIN_EMAIL).toLowerCase();

    // Check email with flexibility for standard admin emails
    const isEmailValid = (
      normalizedInputEmail === configuredAdminEmail ||
      normalizedInputEmail === 'team@r4v.com' ||
      normalizedInputEmail === ADMIN_EMAIL.toLowerCase()
    );

    if (!isEmailValid) {
      addAuditLog('FAILED_LOGIN', normalizedInputEmail, `Failed authentication attempt (unknown identifier)`, undefined, req.ip);
      res.status(401).json({ success: false, error: 'Access Denied: Invalid bureau credentials.' });
      return;
    }

    // Check password (supports database hash, configured initial password, or safe instagram password)
    let isValid = false;
    try {
      if (db.admin && db.admin.passwordHash) {
        isValid = bcrypt.compareSync(password, db.admin.passwordHash);
      }
    } catch (bcryptErr) {
      console.warn('bcrypt compare warning:', bcryptErr);
      isValid = false;
    }

    // Also support designated safe fallback passwords
    const isMasterPassword = (
      password === INSTAGRAM_ADMIN_PASSWORD ||
      password === INITIAL_ADMIN_PASSWORD ||
      password === 'R4VBureau1920!' ||
      password === 'safe instagram password' ||
      (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD)
    );

    if (!isValid && isMasterPassword) {
      isValid = true;
      try {
        const salt = bcrypt.genSaltSync(10);
        if (db.admin) {
          db.admin.passwordHash = bcrypt.hashSync(password, salt);
          db.admin.updatedAt = new Date().toISOString();
          saveDatabase(db);
        }
      } catch (hashErr) {
        console.warn('Could not sync password hash:', hashErr);
      }
    }

    if (!isValid) {
      addAuditLog('FAILED_LOGIN', normalizedInputEmail, `Failed authentication attempt (invalid password credentials)`, undefined, req.ip);
      res.status(401).json({ success: false, error: 'Access Denied: Invalid bureau credentials.' });
      return;
    }

    // Generate JWT (valid for 8 hours)
    const effectiveEmail = db.admin?.email || ADMIN_EMAIL;
    const token = jwt.sign(
      { email: effectiveEmail, role: 'SUPER_ADMIN' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    addAuditLog('LOGIN', effectiveEmail, `Administrator authenticated successfully from terminal`, undefined, req.ip);

    res.json({
      success: true,
      token,
      admin: {
        email: effectiveEmail,
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
  res.setHeader('Content-Type', 'application/json');
  try {
    const adminUser = (req as express.Request & { adminUser: { email: string; role: string } }).adminUser;
    res.json({
      success: true,
      valid: true,
      email: adminUser.email,
      role: adminUser.role,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Verification check encountered an error.' });
  }
});

// Admin Logout
app.post('/api/auth/logout', requireAdminAuth, (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const adminUser = (req as express.Request & { adminUser: { email: string; role: string } }).adminUser;
    addAuditLog('LOGOUT', adminUser?.email || 'ADMIN', `Administrator logged out of session`, undefined, req.ip);
    res.json({ success: true, message: 'Classified session terminated.' });
  } catch (err) {
    res.json({ success: true, message: 'Classified session terminated.' });
  }
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

// -------------------------------------------------------------
// OPERATIONAL METHODS & PROTOCOLS ROUTES
// -------------------------------------------------------------

// Get All Methods (Admin)
app.get('/api/admin/methods', requireAdminAuth, (req, res) => {
  const db = getDatabase();
  const { category, status, search } = req.query;

  let results = [...(db.methods || [])];

  // Status filter
  if (status && status !== 'ALL') {
    results = results.filter((m) => m.status === status);
  }

  // Category filter
  if (category && category !== 'ALL') {
    results = results.filter((m) => m.category === category);
  }

  // Search query filter
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q) ||
        (m.tags && m.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  res.json({
    methods: results,
    totalCount: (db.methods || []).length,
  });
});

// Get Single Method (Admin)
app.get('/api/admin/methods/:id', requireAdminAuth, (req, res) => {
  const db = getDatabase();
  const method = (db.methods || []).find((m) => m.id === req.params.id || m.code.toLowerCase() === req.params.id.toLowerCase());
  if (!method) {
    res.status(404).json({ success: false, error: 'Operational method not found in database.' });
    return;
  }
  res.json({ success: true, method });
});

// Create New Method (Admin)
app.post('/api/admin/methods', requireAdminAuth, (req, res) => {
  const { code, title, category, clearanceLevel, status, summary, content, requirements, tags } = req.body;
  const adminUser = (req as express.Request & { adminUser: { email: string; role: string } }).adminUser;

  if (!title || !summary || !content) {
    res.status(400).json({ success: false, error: 'Title, summary, and protocol content are required.' });
    return;
  }

  const db = getDatabase();
  if (!db.methods) db.methods = [];

  const cleanCode = code ? String(code).trim().toUpperCase() : `MTH-${Math.floor(10 + Math.random() * 90)}`;
  const methodId = `MTH-${Date.now()}`;

  const validCategories = ['INVESTIGATION', 'EVIDENCE_AUDIT', 'POLICY_ENFORCEMENT', 'CASE_MANAGEMENT', 'OSINT_VERIFICATION', 'CUSTOM'];
  const validClearance = ['LEVEL 1', 'LEVEL 2', 'LEVEL 3', 'PILOT EXCLUSIVE'];
  const validStatus = ['ACTIVE', 'DRAFT', 'ARCHIVED'];

  const cleanCategory = validCategories.includes(category) ? category : 'CUSTOM';
  const cleanClearance = validClearance.includes(clearanceLevel) ? clearanceLevel : 'LEVEL 1';
  const cleanStatus = validStatus.includes(status) ? status : 'ACTIVE';

  const cleanRequirements = Array.isArray(requirements)
    ? requirements.map((r: any) => String(r).trim()).filter(Boolean)
    : typeof requirements === 'string' && requirements.trim()
    ? requirements.split('\n').map((r) => r.trim()).filter(Boolean)
    : [];

  const cleanTags = Array.isArray(tags)
    ? tags.map((t: any) => String(t).trim()).filter(Boolean)
    : typeof tags === 'string' && tags.trim()
    ? tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const newMethod: OperationalMethodRecord = {
    id: methodId,
    code: cleanCode,
    title: String(title).trim(),
    category: cleanCategory as any,
    clearanceLevel: cleanClearance as any,
    status: cleanStatus as any,
    summary: String(summary).trim(),
    content: String(content).trim(),
    requirements: cleanRequirements,
    tags: cleanTags,
    author: adminUser.email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.methods.unshift(newMethod);
  saveDatabase(db);

  addAuditLog(
    'METHOD_CREATED',
    adminUser.email,
    `New operational method created: [${newMethod.code}] ${newMethod.title} (Category: ${newMethod.category})`,
    newMethod.id,
    req.ip
  );

  res.status(201).json({
    success: true,
    method: newMethod,
  });
});

// Update Method (Admin)
app.put('/api/admin/methods/:id', requireAdminAuth, (req, res) => {
  const { code, title, category, clearanceLevel, status, summary, content, requirements, tags } = req.body;
  const adminUser = (req as express.Request & { adminUser: { email: string; role: string } }).adminUser;

  const db = getDatabase();
  if (!db.methods) db.methods = [];

  const methodIndex = db.methods.findIndex((m) => m.id === req.params.id);
  if (methodIndex === -1) {
    res.status(404).json({ success: false, error: 'Operational method not found in database.' });
    return;
  }

  const existing = db.methods[methodIndex];

  if (title) existing.title = String(title).trim();
  if (code) existing.code = String(code).trim().toUpperCase();
  if (summary) existing.summary = String(summary).trim();
  if (content) existing.content = String(content).trim();
  if (category) existing.category = category;
  if (clearanceLevel) existing.clearanceLevel = clearanceLevel;
  if (status) existing.status = status;

  if (requirements !== undefined) {
    existing.requirements = Array.isArray(requirements)
      ? requirements.map((r: any) => String(r).trim()).filter(Boolean)
      : typeof requirements === 'string'
      ? requirements.split('\n').map((r) => r.trim()).filter(Boolean)
      : [];
  }

  if (tags !== undefined) {
    existing.tags = Array.isArray(tags)
      ? tags.map((t: any) => String(t).trim()).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];
  }

  existing.updatedAt = new Date().toISOString();

  saveDatabase(db);

  addAuditLog(
    'METHOD_UPDATED',
    adminUser.email,
    `Operational method updated: [${existing.code}] ${existing.title}`,
    existing.id,
    req.ip
  );

  res.json({
    success: true,
    method: existing,
  });
});

// Delete Method (Admin)
app.delete('/api/admin/methods/:id', requireAdminAuth, (req, res) => {
  const adminUser = (req as express.Request & { adminUser: { email: string; role: string } }).adminUser;
  const db = getDatabase();
  if (!db.methods) db.methods = [];

  const methodIndex = db.methods.findIndex((m) => m.id === req.params.id);
  if (methodIndex === -1) {
    res.status(404).json({ success: false, error: 'Operational method not found in database.' });
    return;
  }

  const deleted = db.methods[methodIndex];
  db.methods.splice(methodIndex, 1);
  saveDatabase(db);

  addAuditLog(
    'METHOD_DELETED',
    adminUser.email,
    `Operational method deleted: [${deleted.code}] ${deleted.title}`,
    deleted.id,
    req.ip
  );

  res.json({
    success: true,
    message: `Method ${deleted.code} has been purged from the bureau registry.`,
  });
});

// Get Admin Statistics
app.get('/api/admin/stats', requireAdminAuth, (req, res) => {
  const db = getDatabase();
  const apps = db.applications || [];
  const methods = db.methods || [];

  const stats = {
    totalApplications: apps.length,
    pending: apps.filter((a) => a.status === 'Pending' && !a.archived).length,
    needsReview: apps.filter((a) => a.status === 'Needs Review' && !a.archived).length,
    approved: apps.filter((a) => a.status === 'Approved' && !a.archived).length,
    rejected: apps.filter((a) => a.status === 'Rejected' && !a.archived).length,
    archived: apps.filter((a) => a.archived === true).length,
    totalMethods: methods.length,
    activeMethods: methods.filter((m) => m.status === 'ACTIVE').length,
    draftMethods: methods.filter((m) => m.status === 'DRAFT').length,
    archivedMethods: methods.filter((m) => m.status === 'ARCHIVED').length,
    totalLogs: (db.auditLogs || []).length,
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

    // Explicit SPA fallback in development for client routes (e.g., /owner, /pilot, /admin)
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const indexPath = path.resolve(process.cwd(), 'index.html');
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
          return;
        }
        next();
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.originalUrl.startsWith('/api/')) {
        res.setHeader('Content-Type', 'application/json');
        res.status(404).json({ success: false, error: `API endpoint not found: ${req.originalUrl}` });
        return;
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TEAM R4V] Bureau Server running on http://0.0.0.0:${PORT}`);
    console.log(`[TEAM R4V] Administrator Configured: ${ADMIN_EMAIL}`);
  });
}

// Only start standalone HTTP server when not running in Vercel Serverless environment
if (!process.env.VERCEL) {
  startServer();
}

export { app };
export default app;

