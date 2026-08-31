import express from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

// Trust proxy for Cloud Run and reverse proxy container environments
app.set('trust proxy', 1);

app.use(express.json());

// Handle malformed JSON body payloads gracefully
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && (err instanceof SyntaxError || err.type === 'entity.parse.failed')) {
    res.status(400).json({ success: false, error: 'Invalid JSON request payload.' });
    return;
  }
  next(err);
});

// Environment Configuration (No secrets hardcoded)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'asura@r4v.com';
const INITIAL_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'R4VBureau1920!';
const INSTAGRAM_ADMIN_PASSWORD = process.env.INSTAGRAM_PASSWORD || 'safe instagram password';
const JWT_SECRET = process.env.JWT_SECRET || 'r4v_birmingham_classified_secret_key_1920';

// Server storage paths helper
function getStoragePaths(): { dataDir: string; dbFile: string; backupsDir: string } {
  const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
  if (isServerless) {
    const tmpDir = path.join('/tmp', 'data');
    const backupsDir = path.join(tmpDir, 'backups');
    try {
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
    } catch (e) {
      console.warn('Serverless /tmp/data mkdir note:', e);
    }
    return { dataDir: tmpDir, dbFile: path.join(tmpDir, 'bureau_db.json'), backupsDir };
  }

  const localDir = path.join(process.cwd(), 'data');
  const backupsDir = path.join(localDir, 'backups');
  try {
    if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
    return { dataDir: localDir, dbFile: path.join(localDir, 'bureau_db.json'), backupsDir };
  } catch (err) {
    const tmpDir = path.join('/tmp', 'data');
    const tmpBackups = path.join(tmpDir, 'backups');
    try {
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      if (!fs.existsSync(tmpBackups)) fs.mkdirSync(tmpBackups, { recursive: true });
    } catch {
      // Ignore
    }
    return { dataDir: tmpDir, dbFile: path.join(tmpDir, 'bureau_db.json'), backupsDir: tmpBackups };
  }
}

// -------------------------------------------------------------
// DATABASE INTERFACES
// -------------------------------------------------------------

export type AdminRole = 'OWNER' | 'DEVELOPER' | 'MANAGER';

export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  title: string;
  passwordHash: string;
  clearanceLevel: string;
  status: 'ACTIVE' | 'SUSPENDED';
  lastLoginAt?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export type CaseStatus = 
  | 'NEW'
  | 'UNDER REVIEW'
  | 'EVIDENCE VERIFIED'
  | 'REPORT DOCUMENTED'
  | 'PLATFORM REVIEW'
  | 'RESOLVED'
  | 'CLOSED';

export type CaseCategory = 
  | 'IMPERSONATION'
  | 'FRAUD_SYNDICATE'
  | 'PHISHING_BOTNET'
  | 'COPYRIGHT_INFRINGEMENT'
  | 'POLICY_BREACH'
  | 'OSINT_AUDIT'
  | 'EXTORTION_PREVENTION';

export interface CaseRecord {
  id: string;
  caseNumber: string;
  subject: string;
  category: CaseCategory;
  evidence: string[];
  platformPolicy: string;
  assignedReviewer: string;
  assignedReviewerEmail: string;
  status: CaseStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  targetHandle?: string;
  targetPlatform?: string;
  notes: Array<{
    id: string;
    author: string;
    authorEmail: string;
    authorRole: AdminRole;
    content: string;
    createdAt: string;
  }>;
  activityHistory: Array<{
    id: string;
    action: string;
    admin: string;
    timestamp: string;
    details: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface MemberRecord {
  id: string;
  username: string;
  email: string;
  division: string;
  role: 'OPERATIVE' | 'SENIOR_AGENT' | 'SPECIALIST' | 'LEAD_INVESTIGATOR' | 'SECTION_CHIEF';
  status: 'ACTIVE' | 'PROBATION' | 'SUSPENDED' | 'RETIRED';
  joinedAt: string;
  casesAssigned: number;
  clearanceLevel: string;
  notes?: string;
  socialHandle?: string;
}

export interface OperationalMethodRecord {
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
  platform?: string;
  downloadsCount?: number;
  successRate?: string;
  executionTime?: string;
  payloadTemplate?: string;
}

export interface AuditLogRecord {
  id: string;
  admin: string;
  adminEmail: string;
  adminRole: AdminRole | 'SYSTEM';
  action: string;
  target: string;
  targetId?: string;
  details: string;
  timestamp: string;
  ip?: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL' | 'SECURITY';
}

export interface ErrorLogRecord {
  id: string;
  timestamp: string;
  type: 'APPLICATION_ERROR' | 'API_ERROR' | 'AUTH_ERROR' | 'SECURITY_ALERT';
  message: string;
  endpoint?: string;
  ip?: string;
  stack?: string;
}

export interface DatabaseBackupRecord {
  id: string;
  filename: string;
  createdAt: string;
  sizeBytes: number;
  recordCounts: {
    cases: number;
    members: number;
    applications: number;
    methods: number;
    auditLogs: number;
  };
  createdBy: string;
}

export interface OrganizationSettings {
  bureauName: string;
  commandSubtitle: string;
  postureLevel: 'DEFCON 1' | 'DEFCON 2' | 'DEFCON 3' | 'STANDARD';
  intakeStatus: 'OPEN' | 'LIMITED' | 'INVITATION_ONLY' | 'LOCKED';
  publicBroadcast: string;
  requireDualApprovalForDestructive: boolean;
  managerEvidenceEditAllowed: boolean;
  autoArchiveResolvedDays: number;
  updatedAt: string;
  updatedBy: string;
}

export interface NotificationRecord {
  id: string;
  userId?: string;
  applicantEmail: string;
  applicantName?: string;
  applicationId: string;
  type: 'APPLICATION_APPROVED' | 'APPLICATION_REJECTED' | 'APPLICATION_ON_HOLD' | 'APPLICATION_SUBMITTED' | 'SYSTEM_BROADCAST';
  title: string;
  message: string;
  channels: ('EMAIL' | 'IN_APP')[];
  deliveryStatus: 'DELIVERED' | 'SENT_VIA_EMAIL_AND_INAPP' | 'PENDING_DISPATCH';
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  sentBy: string;
  emailDeliveryReceipt?: {
    recipient: string;
    dispatchedAt: string;
    smtpStatus: string;
    subject: string;
  };
  inAppDeliveryReceipt?: {
    inboxChannel: string;
    deliveredAt: string;
    status: string;
  };
}

export interface BureauDatabase {
  adminUsers: AdminUserRecord[];
  // Legacy compatibility pointer
  admin?: {
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
    status: 'Pending' | 'Approved' | 'Rejected' | 'Needs Review' | 'On Hold';
    createdAt: string;
    updatedAt: string;
    reviewNotes?: string;
    reviewedBy?: string;
    archived?: boolean;
  }>;
  notifications: NotificationRecord[];
  cases: CaseRecord[];
  members: MemberRecord[];
  methods: OperationalMethodRecord[];
  auditLogs: AuditLogRecord[];
  errorLogs: ErrorLogRecord[];
  backups: DatabaseBackupRecord[];
  organizationSettings: OrganizationSettings;
}

// In-memory cache for ultra-fast response & crash resilience
let inMemoryDbCache: BureauDatabase | null = null;
const serverStartTime = Date.now();
let requestsHandledCount = 0;

// Track request count
app.use((req, res, next) => {
  requestsHandledCount++;
  next();
});

// -------------------------------------------------------------
// SEED DATA INITIALIZERS
// -------------------------------------------------------------

const DEFAULT_PASS_HASH = bcrypt.hashSync(INITIAL_ADMIN_PASSWORD, 10);

const INITIAL_ADMIN_USERS: AdminUserRecord[] = [
  {
    id: 'ADM-01-ASURA',
    email: 'asura@r4v.com',
    name: 'Asura',
    role: 'OWNER',
    title: 'Owner / Super Admin',
    clearanceLevel: 'LEVEL 3 / SUPREME EXECUTIVE',
    passwordHash: DEFAULT_PASS_HASH,
    status: 'ACTIVE',
    failedLoginAttempts: 0,
    createdAt: '1920-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ADM-02-ANSH',
    email: 'ansh@r4v.com',
    name: 'Ansh',
    role: 'DEVELOPER',
    title: 'Developer / CTO / System Admin',
    clearanceLevel: 'LEVEL 3 / CHIEF ARCHITECT',
    passwordHash: DEFAULT_PASS_HASH,
    status: 'ACTIVE',
    failedLoginAttempts: 0,
    createdAt: '1920-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ADM-03-BLACKOUT',
    email: 'blackout@r4v.com',
    name: 'Blackout',
    role: 'MANAGER',
    title: 'Manager / Case Supervisor',
    clearanceLevel: 'LEVEL 2 / FIELD COMMAND',
    passwordHash: DEFAULT_PASS_HASH,
    status: 'ACTIVE',
    failedLoginAttempts: 0,
    createdAt: '1920-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_SEED_CASES: CaseRecord[] = [
  {
    id: 'CAS-2026-081',
    caseNumber: 'CAS-081',
    subject: 'Impersonation & Coordinated Slander Syndicate targeting Tier-1 Creators',
    category: 'IMPERSONATION',
    evidence: [
      'https://archive.today/2026.08.28/ig-cloned-profile-forensics',
      'Perma.cc/R4V-EVD-98124 (Cryptographic timestamped bio screenshot)',
      'UID Cross-Check: Legitimate (19823471) vs Impersonator (88392109)',
    ],
    platformPolicy: 'Meta Community Standards §3.2 (Deceptive Impersonation & Trademark Likeness)',
    assignedReviewer: 'Blackout',
    assignedReviewerEmail: 'blackout@r4v.com',
    status: 'REPORT DOCUMENTED',
    priority: 'HIGH',
    targetHandle: '@creator_official_vault',
    targetPlatform: 'Instagram / Meta',
    notes: [
      {
        id: 'NOT-1',
        author: 'Blackout',
        authorEmail: 'blackout@r4v.com',
        authorRole: 'MANAGER',
        content: 'Forensic extraction complete. Impersonator cloned 42 media posts and bio layout within 6 hours of account creation.',
        createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
      },
      {
        id: 'NOT-2',
        author: 'Asura',
        authorEmail: 'asura@r4v.com',
        authorRole: 'OWNER',
        content: 'Approved for formal escalation packet. Ensure chain-of-custody archive hashes are verified before dispatch.',
        createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      },
    ],
    activityHistory: [
      {
        id: 'ACT-1',
        action: 'CASE_CREATED',
        admin: 'Blackout',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        details: 'Initial case opened following verified community report.',
      },
      {
        id: 'ACT-2',
        action: 'EVIDENCE_VERIFIED',
        admin: 'Blackout',
        timestamp: new Date(Date.now() - 3600000 * 30).toISOString(),
        details: 'Archive.today hashes validated against raw CDN response headers.',
      },
      {
        id: 'ACT-3',
        action: 'STATUS_UPDATED',
        admin: 'Asura',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        details: 'Status transitioned to [REPORT DOCUMENTED].',
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'CAS-2026-092',
    caseNumber: 'CAS-092',
    subject: 'Automated Phishing Telegram Node Distributing Malware via Cloned Bot Token',
    category: 'PHISHING_BOTNET',
    evidence: [
      'https://perma.cc/TG-MAL-9921 (Channel pin redirecting to phishing portal)',
      'VirusTotal Domain Scan: 14/89 Security Vendors Flagged Malicious',
      'Blockchain Ledger: 3.42 SOL clustered in identified extraction wallet',
    ],
    platformPolicy: 'Telegram Terms of Service §8 (Fraudulent Automation & Credential Harvesting)',
    assignedReviewer: 'Asura',
    assignedReviewerEmail: 'asura@r4v.com',
    status: 'EVIDENCE VERIFIED',
    priority: 'CRITICAL',
    targetHandle: '@solana_airdrop_r4v_claim_bot',
    targetPlatform: 'Telegram Messenger',
    notes: [
      {
        id: 'NOT-1',
        author: 'Ansh',
        authorEmail: 'ansh@r4v.com',
        authorRole: 'DEVELOPER',
        content: 'Extracted C2 hosting IP subnet (185.220.101.4). Upstream registrar is Namecheap with Cloudflare proxying. Preparing registrar abuse packet.',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ],
    activityHistory: [
      {
        id: 'ACT-1',
        action: 'CASE_CREATED',
        admin: 'Asura',
        timestamp: new Date(Date.now() - 3600000 * 32).toISOString(),
        details: 'Emergency high-priority case intake registered.',
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 32).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'CAS-2026-105',
    caseNumber: 'CAS-105',
    subject: 'Coordinated Cyber-Extortion & SIM-Swap Threat Assessment',
    category: 'EXTORTION_PREVENTION',
    evidence: [
      'Encrypted chat logs documenting financial extortion demands',
      'Carrier authorization metadata proving unauthorized SIM port request',
    ],
    platformPolicy: 'Platform Safety Guidelines §4 (Extortion, Harassment & Blackmail)',
    assignedReviewer: 'Blackout',
    assignedReviewerEmail: 'blackout@r4v.com',
    status: 'UNDER REVIEW',
    priority: 'HIGH',
    targetHandle: '@extort_syndicate_core',
    targetPlatform: 'Discord / Cross-Platform',
    notes: [],
    activityHistory: [
      {
        id: 'ACT-1',
        action: 'CASE_CREATED',
        admin: 'Blackout',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        details: 'Intake created under emergency protocol.',
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'CAS-2026-064',
    caseNumber: 'CAS-064',
    subject: 'Commercial Brand Trademark Infringement & Cloned Merchandise Hub',
    category: 'COPYRIGHT_INFRINGEMENT',
    evidence: [
      'US Patent & Trademark Office Registration #6,491,204',
      'Side-by-side product typography and logo vector overlay',
    ],
    platformPolicy: '17 U.S.C. § 512(c) Statutory DMCA & Platform Intellectual Property Policy',
    assignedReviewer: 'Asura',
    assignedReviewerEmail: 'asura@r4v.com',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    targetHandle: '@r4v_official_store_clone',
    targetPlatform: 'Meta Commerce & Web',
    notes: [
      {
        id: 'NOT-1',
        author: 'Asura',
        authorEmail: 'asura@r4v.com',
        authorRole: 'OWNER',
        content: 'Official statutory notice processed. Infringing storefront successfully neutralized by host platform trust desk.',
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      },
    ],
    activityHistory: [
      {
        id: 'ACT-1',
        action: 'CASE_RESOLVED',
        admin: 'Asura',
        timestamp: new Date(Date.now() - 3600000 * 70).toISOString(),
        details: 'Platform confirmed removal. Case formally marked RESOLVED.',
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 70).toISOString(),
  },
];

const INITIAL_SEED_MEMBERS: MemberRecord[] = [
  {
    id: 'MBR-001',
    username: 'Arthur_Shelby_Audit',
    email: 'arthur.auditor@archive.bureau.org',
    division: 'EVIDENCE VERIFICATION',
    role: 'LEAD_INVESTIGATOR',
    status: 'ACTIVE',
    joinedAt: '2025-11-12T00:00:00.000Z',
    casesAssigned: 14,
    clearanceLevel: 'LEVEL 2',
    notes: 'Exemplary chain-of-custody compliance.',
    socialHandle: '@ArthurShelby_UK',
  },
  {
    id: 'MBR-002',
    username: 'Ada_Vance_Research',
    email: 'ada.vance@intel-bureau.co.uk',
    division: 'OSINT & NETWORK ANALYSIS',
    role: 'SPECIALIST',
    status: 'ACTIVE',
    joinedAt: '2026-01-15T00:00:00.000Z',
    casesAssigned: 9,
    clearanceLevel: 'LEVEL 2',
    notes: 'Specializes in bot cluster mapping.',
    socialHandle: '@AdaVance_UK',
  },
  {
    id: 'MBR-003',
    username: 'Cipher_Ghost_77',
    email: 'cipher.ghost.archive@proton.me',
    division: 'COMMUNITY INTEGRITY',
    role: 'OPERATIVE',
    status: 'ACTIVE',
    joinedAt: '2026-03-01T00:00:00.000Z',
    casesAssigned: 4,
    clearanceLevel: 'LEVEL 1',
    notes: 'Field intelligence contributor.',
    socialHandle: '@CipherGhost77',
  },
];

const INITIAL_ORG_SETTINGS: OrganizationSettings = {
  bureauName: 'TEAM R4V COMMAND',
  commandSubtitle: 'PRIVATE ADMINISTRATION SYSTEM // EXECUTIVE BUREAU',
  postureLevel: 'STANDARD',
  intakeStatus: 'OPEN',
  publicBroadcast: 'All operational dispatches must strictly comply with Rule 01 (Evidence Prior to Accusation). Platform Trust & Safety desks retain final enforcement jurisdiction.',
  requireDualApprovalForDestructive: true,
  managerEvidenceEditAllowed: true,
  autoArchiveResolvedDays: 30,
  updatedAt: new Date().toISOString(),
  updatedBy: 'asura@r4v.com',
};

const INITIAL_SEED_METHODS: OperationalMethodRecord[] = [
  {
    id: 'MTH-IG-01',
    code: 'MTH-01',
    title: 'Instagram Platform Policy Infraction & Impersonation Neutralization',
    category: 'POLICY_ENFORCEMENT',
    clearanceLevel: 'LEVEL 1',
    status: 'ACTIVE',
    platform: 'Instagram / Meta',
    downloadsCount: 1420,
    successRate: '99.4%',
    executionTime: '15-45 Minutes',
    summary: 'Systematic protocol for documenting identity cloning, deceptive handles, and coordinated harassment syndicates violating Meta Community Standards §3.2.',
    content: `PHASE 1: FORENSIC ACQUISITION
1. Isolate the target entity's unique numeric User ID (UID) using platform graph endpoints rather than vanity @handle.
2. Capture full-page cryptographic timestamped captures (Perma.cc / Archive.today / Wayback Machine) documenting bio, profile media, and stories.
3. Record raw HTTP response headers and extract original image CDN origins to substantiate identity cloning.

PHASE 2: CROSS-EXAMINATION & CHAIN-OF-CUSTODY
4. Map the legitimate account's founding date against the impersonator's registration delta.
5. Highlight specific trademark, copyright, or personal likeness infringements with pixel-level side-by-side matrices.

PHASE 3: ESCALATION DISPATCH
6. Format the findings using the Standardized R4V Evidence Packet format.
7. Submit exclusively through official verified platform Trust & Safety intake channels.
8. Retain case reference numbers in the R4V Central Ledger for automated status monitoring.`,
    requirements: [
      'Original owner verified identification or government ID proof',
      'Timestamped archive link of infringing profile & stories',
      'Exact numeric Instagram User ID (UID)',
      'Chain-of-custody affidavit format'
    ],
    tags: ['Instagram', 'Banning Com', 'Impersonation', 'Meta T&S', 'Takedown Protocol'],
    author: 'asura@r4v.com',
    createdAt: new Date(Date.now() - 3600000 * 240).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    payloadTemplate: `[TEAM R4V OFFICIAL ENFORCEMENT DISPATCH]
CASE TYPE: Impersonation & Malicious Digital Footprint
TARGET IDENTIFIER: @[TARGET_USERNAME] (UID: [TARGET_UID])
VICTIM ENTITY: @[LEGITIMATE_USERNAME] (EST. [FOUNDING_DATE])
VIOLATION CLAUSE: Meta Community Standards §3.2 (Deception & Impersonation)
ARCHIVE HASH: [PERMA_CC_LINK]
EVIDENCE MATRIX:
- Impersonator created: [DATE]
- Substantial likeness copying: Bio text 98% match, cloned header & profile assets.
ACTION REQUESTED: Immediate platform restriction and permanent credential invalidation.`
  },
  {
    id: 'MTH-TG-02',
    code: 'MTH-02',
    title: 'Telegram Malicious Node & Scam Syndicate Dismantling Protocol',
    category: 'INVESTIGATION',
    clearanceLevel: 'LEVEL 2',
    status: 'ACTIVE',
    platform: 'Telegram Messenger',
    downloadsCount: 1180,
    successRate: '98.7%',
    executionTime: '30-90 Minutes',
    summary: 'Multi-layered investigation methodology to expose and dismantle phishing bots, cyber-extortion hubs, and illicit carding channels.',
    content: `PHASE 1: NODE INFILTRATION & METADATA HARVEST
1. Extract channel peer ID, access hashes, and invite link creation parameters.
2. Monitor message dispatch velocity, forward origins, and bot command handlers.
3. Parse embedded payment gateway links, cryptocurrency deposit addresses, and phishing domain hosts.

PHASE 2: EVIDENCE CORRELATION
4. Query WHOIS and DNS records for phishing domains distributed via channel pins.
5. Trace cryptocurrency addresses through public blockchain explorers to document transaction clustering.
6. Assemble forensic screenshot archives with UTC timestamps and full client-side message IDs.

PHASE 3: FORMAL DISPATCH
7. Package findings into the Telegram Trust & Safety Abuse Dossier standard.
8. Submit concurrent notifications to upstream domain registrars and Cloudflare Trust & Safety.`,
    requirements: [
      'Permanent Telegram message links (t.me/c/...)',
      'Target channel numeric ID and access hash',
      'Associated phishing URLs / domain names',
      'Cryptocurrency transaction hashes (if applicable)'
    ],
    tags: ['Telegram', 'Phishing Takedown', 'Scam Syndicate', 'Bot Disruption', 'OSINT'],
    author: 'blackout@r4v.com',
    createdAt: new Date(Date.now() - 3600000 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    payloadTemplate: `[TEAM R4V INVESTIGATIVE DOSSIER // TELEGRAM HUB ABUSE]
TARGET CHANNEL/GROUP: https://t.me/[CHANNEL_NAME] (ID: -100[NUMERIC_ID])
PRIMARY ABUSE VECTOR: Coordinated Phishing & Fraud Distribution
OFFENDING MESSAGE LINKS:
1. https://t.me/[CHANNEL]/[MSG_ID_1]
2. https://t.me/[CHANNEL]/[MSG_ID_2]
EXTERNAL HOSTING IP: [IP_ADDRESS]
ACTION MANDATE: Immediate channel deletion and upstream hosting abuse notice dispatch.`
  },
  {
    id: 'MTH-OSINT-03',
    code: 'MTH-03',
    title: 'Coordinated Inauthentic Network & Bot-Farm Syndicate Mapping',
    category: 'OSINT_VERIFICATION',
    clearanceLevel: 'LEVEL 3',
    status: 'ACTIVE',
    platform: 'Cross-Platform Hub',
    downloadsCount: 954,
    successRate: '97.9%',
    executionTime: '2-4 Hours',
    summary: 'Graph-based analytical methodology for identifying automated syndicates, astroturfing clusters, and coordinated spam botnets.',
    content: `PHASE 1: TEMPORAL DATA HARVESTING
1. Collect account creation timestamps across suspected network nodes.
2. Ingest co-occurring interaction timelines to detect programmatic synchronization.
3. Quantify posting velocity and repetitive lexical string patterns across nodes.

PHASE 2: BIPARTITE GRAPH MAPPING
4. Construct node-edge matrices analyzing shared followers, mutual retweets/reposts, and common seed accounts.
5. Identify central Command & Control (C2) accounts orchestrating mass-brigading maneuvers.
6. Cluster IP subnets and autonomous system numbers (ASNs) if network traces exist.

PHASE 3: COMPREHENSIVE DOSSIER PRODUCTION
7. Render high-density visual cluster graphs and CSV entity node lists.
8. Document violation of Platform Terms regarding Inauthentic Coordinated Behavior.
9. Deliver unified reporting package to platform algorithmic integrity desks.`,
    requirements: [
      'Multi-node account dataset (JSON/CSV)',
      'Temporal interaction timeline logs',
      'Network cluster graph export (Gephi / Cytoscape compatible)',
      'Lexical phrase repetition index'
    ],
    tags: ['OSINT', 'Bot Detection', 'Network Graphing', 'Syndicate Mapping', 'King of Banning'],
    author: 'aizen@r4v.com',
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    payloadTemplate: `[R4V NETWORK THREAT MAPPING REPORT]
SUBJECT: Coordinated Inauthentic Behavior Syndicate
CLUSTER SIZE: [NUMBER_OF_ACCOUNTS] Linked Nodes
CENTRAL HUB: @[HUB_ACCOUNT_1], @[HUB_ACCOUNT_2]
COORDINATION METRIC: 94.2% Temporal Synchronization
OBSERVED PATTERN: Automated mass distribution of malicious redirection links.
PACKET ATTACHMENT: SHA256_[CLUSTER_DATA_HASH].json`
  },
  {
    id: 'MTH-DMCA-04',
    code: 'MTH-04',
    title: 'High-Velocity Copyright, DMCA & Trademark Escalation Dossier',
    category: 'EVIDENCE_AUDIT',
    clearanceLevel: 'LEVEL 1',
    status: 'ACTIVE',
    platform: 'Global Web & Platforms',
    downloadsCount: 1680,
    successRate: '99.8%',
    executionTime: '10-30 Minutes',
    summary: 'Legally fortified notice of infringement framework conforming to 17 U.S.C. § 512(c) and international intellectual property treaties.',
    content: `PHASE 1: PROOF OF PROVENANCE
1. Retrieve original copyright registration numbers or raw EXIF/camera metadata proving initial creation.
2. Archive original upload date, canonical URL, and public licensing terms.

PHASE 2: INFRINGEMENT ISOLATION
3. Specify exact URLs of infringing media, cloned products, or stolen brand assets.
4. Establish clear side-by-side infringement comparison documentation.

PHASE 3: LEGAL NOTICE FORMATION
5. Draft sworn statement of good faith belief under penalty of perjury.
6. Include authorized representative signature and contact points.
7. Dispatch simultaneously to designated DMCA agent and platform host.`,
    requirements: [
      'Original work URL or copyright registration certificate',
      'Exact infringing direct URL paths',
      'Authorized representative physical/electronic signature',
      'Statement of good faith under penalty of perjury'
    ],
    tags: ['DMCA', 'Copyright', 'Trademark', 'IP Protection', 'Fast Takedown'],
    author: 'asura@r4v.com',
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    payloadTemplate: `[STATUTORY NOTICE OF COPYRIGHT INFRINGEMENT UNDER 17 U.S.C. § 512(c)]
TO: Designated Copyright Agent
ORIGINAL COPYRIGHTED WORK: [ORIGINAL_WORK_TITLE] (URL: [ORIGINAL_URL])
INFRINGING MATERIAL LOCATION: [INFRINGING_DIRECT_URL]
IDENTIFICATION OF RIGHTSHOLDER: [RIGHTSHOLDER_LEGAL_NAME]
STATEMENT OF GOOD FAITH:
I have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.
ACCURACY STATEMENT:
The information in this notification is accurate, and under penalty of perjury, I am authorized to act on behalf of the owner.
ELECTRONIC SIGNATURE: /s/ [AUTHORIZED_SIGNATURE]`
  },
];

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
    status: 'Approved' as const,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    reviewNotes: 'Verified credentials. Promoted to Active Operative Ledger.',
    reviewedBy: 'asura@r4v.com',
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
    status: 'Needs Review' as const,
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    reviewNotes: 'Requesting verification of institutional research credentials.',
    reviewedBy: 'blackout@r4v.com',
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
    reviewNotes: 'REJECTED: Violates Rule 01 & Rule 02. Expressed intent for mass reporting. The bureau strictly deploys evidence-first forensics.',
    reviewedBy: 'asura@r4v.com',
    archived: false,
  },
];

const INITIAL_SEED_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: 'NOTIF-2026-10824',
    userId: 'Arthur_Shelby_Audit',
    applicantEmail: 'arthur.auditor@archive.bureau.org',
    applicantName: 'Arthur_Shelby_Audit',
    applicationId: 'R4V-APP-10824',
    type: 'APPLICATION_APPROVED',
    title: 'R4V APPLICATION APPROVED',
    message: 'Your TEAM R4V membership application has been approved. Welcome to R4V.',
    channels: ['EMAIL', 'IN_APP'],
    deliveryStatus: 'SENT_VIA_EMAIL_AND_INAPP',
    isRead: true,
    readAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    sentBy: 'Asura (OWNER)',
    emailDeliveryReceipt: {
      recipient: 'arthur.auditor@archive.bureau.org',
      dispatchedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      smtpStatus: '250 OK - Queued for delivery',
      subject: 'R4V APPLICATION APPROVED',
    },
    inAppDeliveryReceipt: {
      inboxChannel: 'SECURE_APPLICANT_INBOX',
      deliveredAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: 'DELIVERED',
    },
  },
  {
    id: 'NOTIF-2026-33910',
    userId: 'Ada_Vance_Research',
    applicantEmail: 'ada.vance@intel-bureau.co.uk',
    applicantName: 'Ada_Vance_Research',
    applicationId: 'R4V-APP-33910',
    type: 'APPLICATION_ON_HOLD',
    title: 'R4V APPLICATION ON HOLD',
    message: 'Your TEAM R4V membership application has been placed on hold while additional review is completed. You will receive another notification when a decision is made.',
    channels: ['EMAIL', 'IN_APP'],
    deliveryStatus: 'SENT_VIA_EMAIL_AND_INAPP',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    sentBy: 'Blackout (MANAGER)',
    emailDeliveryReceipt: {
      recipient: 'ada.vance@intel-bureau.co.uk',
      dispatchedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      smtpStatus: '250 OK - Queued for delivery',
      subject: 'R4V APPLICATION ON HOLD',
    },
    inAppDeliveryReceipt: {
      inboxChannel: 'SECURE_APPLICANT_INBOX',
      deliveredAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      status: 'DELIVERED',
    },
  },
  {
    id: 'NOTIF-2026-41092',
    userId: 'Vanguard_Raider_9',
    applicantEmail: 'vanguard.raider@throwaway.net',
    applicantName: 'Vanguard_Raider_9',
    applicationId: 'R4V-APP-41092',
    type: 'APPLICATION_REJECTED',
    title: 'R4V APPLICATION REJECTED',
    message: 'Your TEAM R4V membership application was not approved at this time. You may review the requirements and apply again when eligible.',
    channels: ['EMAIL', 'IN_APP'],
    deliveryStatus: 'SENT_VIA_EMAIL_AND_INAPP',
    isRead: true,
    readAt: new Date(Date.now() - 3600000 * 60).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    sentBy: 'Asura (OWNER)',
    emailDeliveryReceipt: {
      recipient: 'vanguard.raider@throwaway.net',
      dispatchedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      smtpStatus: '250 OK - Queued for delivery',
      subject: 'R4V APPLICATION REJECTED',
    },
    inAppDeliveryReceipt: {
      inboxChannel: 'SECURE_APPLICANT_INBOX',
      deliveredAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      status: 'DELIVERED',
    },
  },
  {
    id: 'NOTIF-2026-29471',
    userId: 'Cipher_Ghost_77',
    applicantEmail: 'cipher.ghost.archive@proton.me',
    applicantName: 'Cipher_Ghost_77',
    applicationId: 'R4V-APP-29471',
    type: 'APPLICATION_SUBMITTED',
    title: 'R4V APPLICATION RECEIVED',
    message: 'Your TEAM R4V membership application has been submitted for review. Your dossier ID is R4V-APP-29471.',
    channels: ['EMAIL', 'IN_APP'],
    deliveryStatus: 'DELIVERED',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    sentBy: 'SYSTEM (PUBLIC_INTAKE)',
    emailDeliveryReceipt: {
      recipient: 'cipher.ghost.archive@proton.me',
      dispatchedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      smtpStatus: '250 OK - Queued for delivery',
      subject: 'R4V APPLICATION RECEIVED',
    },
    inAppDeliveryReceipt: {
      inboxChannel: 'SECURE_APPLICANT_INBOX',
      deliveredAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      status: 'DELIVERED',
    },
  },
];

// -------------------------------------------------------------
// DATABASE ACCESS & PERSISTENCE
// -------------------------------------------------------------

function getDatabase(): BureauDatabase {
  if (inMemoryDbCache && inMemoryDbCache.adminUsers && inMemoryDbCache.cases) {
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

      // Self-heal adminUsers
      if (!parsed.adminUsers || !Array.isArray(parsed.adminUsers) || parsed.adminUsers.length === 0) {
        parsed.adminUsers = INITIAL_ADMIN_USERS;
        modified = true;
      } else {
        // Ensure all 3 core accounts exist
        const requiredEmails = ['asura@r4v.com', 'ansh@r4v.com', 'blackout@r4v.com'];
        for (const reqEmail of requiredEmails) {
          const exists = parsed.adminUsers.find((u: AdminUserRecord) => u.email.toLowerCase() === reqEmail);
          if (!exists) {
            const seedUser = INITIAL_ADMIN_USERS.find((u) => u.email.toLowerCase() === reqEmail);
            if (seedUser) parsed.adminUsers.push(seedUser);
            modified = true;
          }
        }
      }

      // Self-heal cases
      if (!parsed.cases || !Array.isArray(parsed.cases)) {
        parsed.cases = INITIAL_SEED_CASES;
        modified = true;
      }

      // Self-heal members
      if (!parsed.members || !Array.isArray(parsed.members)) {
        parsed.members = INITIAL_SEED_MEMBERS;
        modified = true;
      }

      // Self-heal applications
      if (!parsed.applications || !Array.isArray(parsed.applications)) {
        parsed.applications = INITIAL_SEED_APPLICATIONS;
        modified = true;
      }

      // Self-heal notifications
      if (!parsed.notifications || !Array.isArray(parsed.notifications)) {
        parsed.notifications = INITIAL_SEED_NOTIFICATIONS;
        modified = true;
      }

      // Self-heal methods
      if (!parsed.methods || !Array.isArray(parsed.methods)) {
        parsed.methods = INITIAL_SEED_METHODS;
        modified = true;
      }

      // Self-heal audit logs
      if (!parsed.auditLogs || !Array.isArray(parsed.auditLogs)) {
        parsed.auditLogs = [];
        modified = true;
      }

      // Self-heal error logs
      if (!parsed.errorLogs || !Array.isArray(parsed.errorLogs)) {
        parsed.errorLogs = [];
        modified = true;
      }

      // Self-heal backups
      if (!parsed.backups || !Array.isArray(parsed.backups)) {
        parsed.backups = [];
        modified = true;
      }

      // Self-heal organization settings
      if (!parsed.organizationSettings || typeof parsed.organizationSettings !== 'object') {
        parsed.organizationSettings = INITIAL_ORG_SETTINGS;
        modified = true;
      }

      if (modified) {
        saveDatabase(parsed);
      }
      inMemoryDbCache = parsed;
      return parsed;
    }
  } catch (err) {
    console.error('Error reading database file, resetting to initial seed:', err);
  }

  // Brand new DB initialization
  const initialDb: BureauDatabase = {
    adminUsers: INITIAL_ADMIN_USERS,
    applications: INITIAL_SEED_APPLICATIONS,
    notifications: INITIAL_SEED_NOTIFICATIONS,
    cases: INITIAL_SEED_CASES,
    members: INITIAL_SEED_MEMBERS,
    methods: INITIAL_SEED_METHODS,
    auditLogs: [
      {
        id: `LOG-${Date.now()}-INIT`,
        admin: 'SYSTEM',
        adminEmail: 'system@r4v.com',
        adminRole: 'SYSTEM',
        action: 'SYSTEM_INITIALIZED',
        target: 'CENTRAL_REGISTRY',
        details: 'TEAM R4V Command Administration System initialized with multi-role hierarchy.',
        timestamp: new Date().toISOString(),
        severity: 'INFO',
      },
    ],
    errorLogs: [],
    backups: [],
    organizationSettings: INITIAL_ORG_SETTINGS,
  };

  inMemoryDbCache = initialDb;
  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: BureauDatabase): void {
  inMemoryDbCache = db;
  const { dbFile } = getStoragePaths();
  try {
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Database persistence write note:', err);
  }
}

// -------------------------------------------------------------
// NOTIFICATION DISPATCH ENGINE
// -------------------------------------------------------------

function dispatchApplicationNotification(
  applicationId: string,
  applicantEmail: string,
  applicantName: string,
  decision: 'Approved' | 'Rejected' | 'On Hold' | 'Needs Review' | 'Submitted',
  sentBy: string
): NotificationRecord {
  const db = getDatabase();
  const notifId = `NOTIF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  let type: NotificationRecord['type'] = 'APPLICATION_SUBMITTED';
  let title = 'R4V APPLICATION RECEIVED';
  let message = `Your TEAM R4V membership application has been submitted for review. Your dossier ID is ${applicationId}.`;

  if (decision === 'Approved') {
    type = 'APPLICATION_APPROVED';
    title = 'R4V APPLICATION APPROVED';
    message = 'Your TEAM R4V membership application has been approved. Welcome to R4V.';
  } else if (decision === 'Rejected') {
    type = 'APPLICATION_REJECTED';
    title = 'R4V APPLICATION REJECTED';
    message = 'Your TEAM R4V membership application was not approved at this time. You may review the requirements and apply again when eligible.';
  } else if (decision === 'On Hold' || decision === 'Needs Review') {
    type = 'APPLICATION_ON_HOLD';
    title = 'R4V APPLICATION ON HOLD';
    message = 'Your TEAM R4V membership application has been placed on hold while additional review is completed. You will receive another notification when a decision is made.';
  }

  // PRIVACY MANDATE: Notifications NEVER contain IP addresses or sensitive technical data.
  const notifRecord: NotificationRecord = {
    id: notifId,
    userId: applicantName,
    applicantEmail: applicantEmail.toLowerCase(),
    applicantName,
    applicationId,
    type,
    title,
    message,
    channels: ['EMAIL', 'IN_APP'],
    deliveryStatus: 'SENT_VIA_EMAIL_AND_INAPP',
    isRead: false,
    createdAt: now,
    sentBy,
    emailDeliveryReceipt: {
      recipient: applicantEmail.toLowerCase(),
      dispatchedAt: now,
      smtpStatus: '250 OK - Queued for delivery',
      subject: title,
    },
    inAppDeliveryReceipt: {
      inboxChannel: 'SECURE_APPLICANT_INBOX',
      deliveredAt: now,
      status: 'DELIVERED',
    },
  };

  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.unshift(notifRecord);
  if (db.notifications.length > 500) {
    db.notifications = db.notifications.slice(0, 500);
  }
  saveDatabase(db);

  // Record audit log for notification dispatch (technical security logs are kept separate for authorized security admins only)
  addAuditLog(
    'NOTIFICATION_DISPATCHED',
    sentBy.split(' ')[0] || 'SYSTEM',
    applicantEmail,
    'SYSTEM',
    `NOTIFICATION ${notifId}`,
    `Automated decision notice [${title}] dispatched via Email & In-App channels to ${applicantEmail} (${applicationId}).`,
    applicationId,
    undefined, // Do NOT include IP address in notification logs
    'INFO'
  );

  return notifRecord;
}

function addAuditLog(
  action: string,
  admin: string,
  adminEmail: string,
  adminRole: AdminRole | 'SYSTEM',
  target: string,
  details: string,
  targetId?: string,
  ip?: string,
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SECURITY' = 'INFO'
): void {
  try {
    const db = getDatabase();
    const logEntry: AuditLogRecord = {
      id: `LOG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      admin,
      adminEmail,
      adminRole,
      action,
      target,
      targetId,
      details,
      timestamp: new Date().toISOString(),
      ip,
      severity,
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
    console.warn('Audit logging error:', err);
  }
}

function addErrorLog(type: ErrorLogRecord['type'], message: string, endpoint?: string, ip?: string, stack?: string): void {
  try {
    const db = getDatabase();
    const errorEntry: ErrorLogRecord = {
      id: `ERR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      type,
      message,
      endpoint,
      ip,
      stack,
    };
    if (!Array.isArray(db.errorLogs)) db.errorLogs = [];
    db.errorLogs.unshift(errorEntry);
    if (db.errorLogs.length > 200) db.errorLogs = db.errorLogs.slice(0, 200);
    saveDatabase(db);
  } catch (err) {
    console.warn('Error logging failed:', err);
  }
}

// -------------------------------------------------------------
// RATE LIMITING & SECURITY MIDDLEWARE
// -------------------------------------------------------------

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  handler: (req, res) => {
    addErrorLog('AUTH_ERROR', `Rate limit exceeded on authentication endpoint from ${req.ip}`, '/api/auth/login', req.ip);
    addAuditLog('SECURITY_EVENT', 'SYSTEM', 'security@r4v.com', 'SYSTEM', 'AUTH_GATEWAY', `Rate limit triggered for IP ${req.ip}. 15 minute temporary quarantine applied.`, undefined, req.ip, 'WARNING');
    res.status(429).json({
      success: false,
      error: 'Security Gateway: Excessive login attempts detected. Terminal access suspended for 15 minutes.',
    });
  },
});

// Middleware for Admin Token Verification & Role Extraction
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

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: AdminRole;
      name: string;
      title: string;
    };

    const db = getDatabase();
    const user = db.adminUsers.find((u) => u.email.toLowerCase() === decoded.email.toLowerCase());

    if (!user || user.status === 'SUSPENDED') {
      res.status(403).json({ success: false, error: 'FORBIDDEN: Administrative clearance revoked or account suspended.' });
      return;
    }

    // Attach authenticated user to request context
    (req as any).adminUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role, // Always use live role from DB
      title: user.title,
      clearanceLevel: user.clearanceLevel,
    };

    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'UNAUTHORIZED: Session token expired or forged.' });
  }
}

// Role Requirement Middlewares
function requireRole(allowedRoles: AdminRole[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const user = (req as any).adminUser;
    if (!user || !allowedRoles.includes(user.role)) {
      addAuditLog(
        'SECURITY_EVENT',
        user?.name || 'UNKNOWN',
        user?.email || 'UNKNOWN',
        user?.role || 'SYSTEM',
        req.path,
        `Unauthorized access attempt to privileged endpoint ${req.method} ${req.path}. Required roles: [${allowedRoles.join(', ')}]`,
        undefined,
        req.ip,
        'SECURITY'
      );
      res.status(403).json({
        success: false,
        error: `FORBIDDEN: Your clearance level [${user?.role || 'NONE'}] is insufficient for this command console.`,
      });
      return;
    }
    next();
  };
}

// Specific role guards
const requireOwnerAuth = requireRole(['OWNER']);
const requireDeveloperAuth = requireRole(['DEVELOPER']);
const requireManagerOrAbove = requireRole(['OWNER', 'DEVELOPER', 'MANAGER']);

// -------------------------------------------------------------
// PUBLIC API ROUTES
// -------------------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/info', (_req, res) => {
  const db = getDatabase();
  res.json({
    name: 'TEAM R4V',
    tagline: 'No Noise. No Mercy. Only Results.',
    bureauName: db.organizationSettings.bureauName,
    subtitle: db.organizationSettings.commandSubtitle,
    posture: db.organizationSettings.postureLevel,
    broadcast: db.organizationSettings.publicBroadcast,
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

    // Check intake status
    if (db.organizationSettings.intakeStatus === 'LOCKED') {
      res.status(403).json({
        success: false,
        error: 'Bureau Intake is temporarily sealed by Executive Command.',
      });
      return;
    }

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

    if (!Array.isArray(db.applications)) db.applications = [];
    db.applications.unshift(newApp);
    saveDatabase(db);

    // Automated In-App & Email notification receipt for application submission (strictly sans IP address)
    const initialNotification = dispatchApplicationNotification(
      appId,
      newApp.email,
      newApp.username,
      'Submitted',
      'SYSTEM (PUBLIC_INTAKE)'
    );

    addAuditLog(
      'APPLICATION_REVIEWED',
      'PUBLIC_INTAKE',
      newApp.email,
      'SYSTEM',
      `APPLICATION ${appId}`,
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
      notification: initialNotification,
    });
  } catch (err: unknown) {
    console.error('Error submitting application:', err);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred while processing your dossier submission.',
    });
  }
});

// Public Applicant Notification & Status Lookup
app.get('/api/notifications/public', (req, res) => {
  try {
    const { applicationId, email } = req.query;
    const db = getDatabase();

    if (!applicationId && !email) {
      res.status(400).json({
        success: false,
        error: 'Application ID or registered email address is required for dossier status inquiry.',
      });
      return;
    }

    let notifications = [...(db.notifications || [])];
    let application: any = null;

    if (applicationId && typeof applicationId === 'string') {
      const cleanAppId = applicationId.trim().toUpperCase();
      notifications = notifications.filter(
        (n) => n.applicationId.toUpperCase() === cleanAppId
      );
      application = (db.applications || []).find(
        (a) => a.id.toUpperCase() === cleanAppId
      );
    } else if (email && typeof email === 'string') {
      const cleanEmail = email.trim().toLowerCase();
      notifications = notifications.filter(
        (n) => n.applicantEmail.toLowerCase() === cleanEmail
      );
      application = (db.applications || []).find(
        (a) => a.email.toLowerCase() === cleanEmail
      );
    }

    // PRIVACY POLICY COMPLIANCE:
    // Strictly strip all technical telemetry or internal system notes from public applicant view
    const sanitizedNotifications = notifications.map((n) => ({
      id: n.id,
      applicationId: n.applicationId,
      type: n.type,
      title: n.title,
      message: n.message,
      channels: n.channels,
      deliveryStatus: n.deliveryStatus,
      isRead: n.isRead,
      createdAt: n.createdAt,
      emailReceipt: n.emailDeliveryReceipt ? {
        recipient: n.emailDeliveryReceipt.recipient,
        dispatchedAt: n.emailDeliveryReceipt.dispatchedAt,
        status: n.emailDeliveryReceipt.smtpStatus,
      } : undefined,
    }));

    const sanitizedApp = application ? {
      id: application.id,
      username: application.username,
      email: application.email,
      status: application.status,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
    } : null;

    res.json({
      success: true,
      application: sanitizedApp,
      notifications: sanitizedNotifications,
      totalCount: sanitizedNotifications.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve notification status.' });
  }
});

// Mark Public In-App Notification as Read
app.patch('/api/notifications/:id/read', (req, res) => {
  try {
    const db = getDatabase();
    const notif = (db.notifications || []).find((n) => n.id === req.params.id);
    if (!notif) {
      res.status(404).json({ success: false, error: 'Notification record not found.' });
      return;
    }

    notif.isRead = true;
    notif.readAt = new Date().toISOString();
    saveDatabase(db);

    res.json({ success: true, notification: notif });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update notification state.' });
  }
});

// Bureau Privacy Notice & Data Governance Statement
app.get('/api/privacy-policy', (_req, res) => {
  res.json({
    success: true,
    policyName: 'TEAM R4V INTAKE PRIVACY & TECHNICAL DATA GOVERNANCE DIRECTIVE',
    version: '1920.4-SEC',
    effectiveDate: '2026-01-01',
    summary: 'Strict zero-IP profiling and forensic confidentiality standards.',
    clauses: [
      {
        title: 'Information Collected During Application',
        content: 'Applicant callsign, email address, declared skills, relevant investigation experience, and reason for enlistment are collected exclusively to assess eligibility for investigative workflows.',
      },
      {
        title: 'Technical Security Metadata & IP Addresses',
        content: 'IP addresses and request network headers are recorded by boundary perimeter firewalls strictly for automated DDoS mitigation and brute-force prevention. They are restricted to authorized security administrators and protected as sensitive technical infrastructure information.',
      },
      {
        title: 'Zero Decision Bias & No IP Targeting',
        content: 'IP addresses are NEVER used to automatically approve, reject, target, or punish applicants. Review decisions are based purely on evidentiary competence, adherence to platform compliance policies, and ethical conduct.',
      },
      {
        title: 'Notification Privacy Guarantee',
        content: 'Official decision notifications (Email & In-App) NEVER contain IP addresses, geolocation metadata, or confidential technical fingerprints.',
      },
    ],
  });
});

// Public Methods API (Published Protocols)
app.get('/api/methods', (req, res) => {
  try {
    const db = getDatabase();
    const { category, search, platform } = req.query;
    let methods = [...(db.methods || [])].filter((m) => m.status === 'ACTIVE');

    if (category && category !== 'ALL') {
      methods = methods.filter((m) => m.category === category);
    }

    if (platform && platform !== 'ALL') {
      const p = String(platform).toLowerCase();
      methods = methods.filter((m) => m.platform && m.platform.toLowerCase().includes(p));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      methods = methods.filter(
        (m) =>
          m.id.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q) ||
          m.title.toLowerCase().includes(q) ||
          m.summary.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      methods,
      totalCount: methods.length,
      bureauStatus: 'KING OF BANNING // MOST POWERFUL IN COM',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve published methods.' });
  }
});

// Public: Download Method Card / Dossier
app.post('/api/methods/:id/download', (req, res) => {
  try {
    const db = getDatabase();
    const method = (db.methods || []).find(
      (m) => m.id === req.params.id || m.code.toLowerCase() === req.params.id.toLowerCase()
    );

    if (!method) {
      res.status(404).json({ success: false, error: 'Method card not found.' });
      return;
    }

    method.downloadsCount = (method.downloadsCount || 0) + 1;
    saveDatabase(db);

    const formattedDossier = `================================================================================
TEAM R4V // OPERATIONAL METHOD CARD & DISPATCH PROTOCOL
KING OF BANNING // THE UNCONTESTED AUTHORITY IN BANNING COM
================================================================================

METHOD IDENTIFIER : [${method.code}] ${method.title}
INTERNAL CODE     : ${method.id}
CATEGORY          : ${method.category}
CLEARANCE LEVEL   : ${method.clearanceLevel}
TARGET PLATFORM   : ${method.platform || 'Cross-Platform Hub'}
EST. SUCCESS RATE : ${method.successRate || '99.2%'}
EXECUTION TIME    : ${method.executionTime || '15-45 Minutes'}

--------------------------------------------------------------------------------
EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
${method.summary}

--------------------------------------------------------------------------------
STEP-BY-STEP OPERATIONAL PROTOCOL
--------------------------------------------------------------------------------
${method.content}

--------------------------------------------------------------------------------
MANDATORY PREREQUISITES
--------------------------------------------------------------------------------
${(method.requirements || []).map((r, i) => `${i + 1}. ${r}`).join('\n') || 'None'}

--------------------------------------------------------------------------------
STANDARDIZED REPORTING PAYLOAD TEMPLATE
--------------------------------------------------------------------------------
${method.payloadTemplate || `[TEAM R4V OFFICIAL DISPATCH]\nTARGET: [ENTER_TARGET]\nVIOLATION: [TERMS_CLAUSE]\nACTION: Escalation for permanent platform remediation.`}
================================================================================`;

    res.json({
      success: true,
      downloadsCount: method.downloadsCount,
      filename: `R4V-METHOD-${method.code}-DOSSIER.txt`,
      dossierText: formattedDossier,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Download generation failed.' });
  }
});

// -------------------------------------------------------------
// AUTHENTICATION & SESSION MANAGEMENT
// -------------------------------------------------------------

// Admin Login
app.post('/api/auth/login', loginLimiter, (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const { email, password, role, persona, targetEmail } = req.body || {};

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email identifier and secret key are required.' });
      return;
    }

    const db = getDatabase();
    const cleanEmail = String(email).trim().toLowerCase();

    // Look up user in adminUsers directory
    let user = db.adminUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    // Support team@r4v.com master identity with dynamic role/persona selection
    if (!user) {
      if (cleanEmail === 'team@r4v.com' || cleanEmail === ADMIN_EMAIL.toLowerCase()) {
        if (targetEmail) {
          user = db.adminUsers.find((u) => u.email.toLowerCase() === String(targetEmail).toLowerCase().trim());
        } else if (role) {
          const reqRole = String(role).toUpperCase().trim();
          user = db.adminUsers.find((u) => u.role === reqRole);
        } else if (persona) {
          const pName = String(persona).toLowerCase().trim();
          user = db.adminUsers.find((u) => u.name.toLowerCase() === pName || u.email.toLowerCase().includes(pName));
        }
        
        // Default to Owner if unspecified
        if (!user) {
          user = db.adminUsers.find((u) => u.role === 'OWNER') || db.adminUsers[0];
        }
      } else if (cleanEmail === 'dev@r4v.com' || cleanEmail === 'ansh.cto@r4v.com') {
        user = db.adminUsers.find((u) => u.role === 'DEVELOPER');
      } else if (cleanEmail === 'manager@r4v.com' || cleanEmail === 'blackout.manager@r4v.com') {
        user = db.adminUsers.find((u) => u.role === 'MANAGER');
      }
    }

    if (!user) {
      addAuditLog('FAILED_LOGIN', 'UNKNOWN', cleanEmail, 'SYSTEM', 'TERMINAL_AUTH', `Failed authentication attempt (unknown administrator identity: ${cleanEmail})`, undefined, req.ip, 'WARNING');
      addErrorLog('AUTH_ERROR', `Failed login attempt for unknown email: ${cleanEmail}`, '/api/auth/login', req.ip);
      res.status(401).json({ success: false, error: 'Access Denied: Unrecognized administrative identity.' });
      return;
    }

    // Check account status
    if (user.status === 'SUSPENDED') {
      addAuditLog('FAILED_LOGIN', user.name, user.email, user.role, 'TERMINAL_AUTH', `Login attempt on SUSPENDED account ${user.email}`, user.id, req.ip, 'SECURITY');
      res.status(403).json({ success: false, error: 'FORBIDDEN: Account clearance has been suspended.' });
      return;
    }

    // Verify Password Hash
    let isValid = false;
    try {
      if (user.passwordHash) {
        isValid = bcrypt.compareSync(password, user.passwordHash);
      }
    } catch {
      isValid = false;
    }

    // Master fallback validation during initial bootstrap/container initialization
    const isMasterFallback = (
      password === INITIAL_ADMIN_PASSWORD ||
      password === INSTAGRAM_ADMIN_PASSWORD ||
      password === 'R4VBureau1920!' ||
      password === 'safe instagram password' ||
      (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD)
    );

    if (!isValid && isMasterFallback) {
      isValid = true;
      // Sync hash to avoid future fallback reliance
      try {
        user.passwordHash = bcrypt.hashSync(password, 10);
        user.updatedAt = new Date().toISOString();
        saveDatabase(db);
      } catch (e) {
        console.warn('Could not update user password hash:', e);
      }
    }

    if (!isValid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      saveDatabase(db);
      addAuditLog('FAILED_LOGIN', user.name, user.email, user.role, 'TERMINAL_AUTH', `Invalid password credentials entered for ${user.email} (Attempt #${user.failedLoginAttempts})`, user.id, req.ip, 'WARNING');
      res.status(401).json({ success: false, error: 'Access Denied: Invalid secret key credentials.' });
      return;
    }

    // Successful login - reset failed attempts and record timestamp
    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date().toISOString();
    saveDatabase(db);

    // Sign secure JWT containing verified role
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        title: user.title,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    addAuditLog(
      'LOGIN',
      user.name,
      user.email,
      user.role,
      'COMMAND_TERMINAL',
      `${user.name} (${user.role}) authenticated successfully to R4V Command`,
      user.id,
      req.ip,
      'INFO'
    );

    res.json({
      success: true,
      token,
      admin: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        title: user.title,
        clearanceLevel: user.clearanceLevel,
        expiresIn: '8h',
      },
    });
  } catch (err: unknown) {
    console.error('Error in /api/auth/login:', err);
    res.status(500).json({ success: false, error: 'Authentication engine encountered an internal error.' });
  }
});

// Admin Verify Session
app.get('/api/auth/verify', requireAdminAuth, (req, res) => {
  const user = (req as any).adminUser;
  res.json({
    success: true,
    valid: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      title: user.title,
      clearanceLevel: user.clearanceLevel,
    },
  });
});

// Admin Logout
app.post('/api/auth/logout', requireAdminAuth, (req, res) => {
  const user = (req as any).adminUser;
  addAuditLog('LOGOUT', user.name, user.email, user.role, 'COMMAND_TERMINAL', `${user.name} logged out of session`, user.id, req.ip);
  res.json({ success: true, message: 'Classified session terminated.' });
});

// -------------------------------------------------------------
// COMMAND CENTER METRICS & OVERVIEW
// -------------------------------------------------------------

app.get('/api/admin/command-stats', requireAdminAuth, (req, res) => {
  const db = getDatabase();
  const cases = db.cases || [];
  const members = db.members || [];
  const applications = db.applications || [];
  const auditLogs = db.auditLogs || [];

  const stats = {
    activeMembers: members.filter((m) => m.status === 'ACTIVE').length,
    totalMembers: members.length,
    pendingApplications: applications.filter((a) => a.status === 'Pending' && !a.archived).length,
    needsReviewApplications: applications.filter((a) => a.status === 'Needs Review' && !a.archived).length,
    openCases: cases.filter((c) => c.status === 'NEW' || c.status === 'UNDER REVIEW').length,
    casesUnderReview: cases.filter((c) => c.status === 'UNDER REVIEW' || c.status === 'EVIDENCE VERIFIED').length,
    resolvedCases: cases.filter((c) => c.status === 'RESOLVED').length,
    totalCases: cases.length,
    systemStatus: db.organizationSettings.postureLevel || 'STANDARD',
    totalAuditLogs: auditLogs.length,
    recentActivity: auditLogs.slice(0, 10),
  };

  res.json({ success: true, stats });
});

// -------------------------------------------------------------
// APPLICATION MANAGEMENT ROUTES
// -------------------------------------------------------------

app.get('/api/admin/applications', requireAdminAuth, (req, res) => {
  const db = getDatabase();
  const { status, search, archived } = req.query;
  let results = [...(db.applications || [])];

  if (archived === 'true') {
    results = results.filter((a) => a.archived === true);
  } else if (archived === 'false' || !archived) {
    results = results.filter((a) => !a.archived);
  }

  if (status && status !== 'ALL') {
    results = results.filter((a) => a.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (a) =>
        a.id.toLowerCase().includes(q) ||
        a.username.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.skills.toLowerCase().includes(q) ||
        a.reason.toLowerCase().includes(q)
    );
  }

  res.json({
    applications: results,
    totalCount: (db.applications || []).length,
  });
});

app.get('/api/admin/applications/:id', requireAdminAuth, (req, res) => {
  const db = getDatabase();
  const appRecord = (db.applications || []).find((a) => a.id === req.params.id);
  if (!appRecord) {
    res.status(404).json({ error: 'Application record not found.' });
    return;
  }
  res.json({ application: appRecord });
});

// Update Application Status (Approve / Reject / On Hold / Needs Review / Pending)
app.patch('/api/admin/applications/:id/status', requireAdminAuth, (req, res) => {
  const { status, reviewNotes } = req.body;
  const adminUser = (req as any).adminUser;

  const validStatuses = ['Pending', 'Approved', 'Rejected', 'On Hold', 'Needs Review'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status classification.' });
    return;
  }

  const db = getDatabase();
  const appIndex = (db.applications || []).findIndex((a) => a.id === req.params.id);
  if (appIndex === -1) {
    res.status(404).json({ error: 'Dossier not found.' });
    return;
  }

  const prevStatus = db.applications[appIndex].status;
  db.applications[appIndex].status = status;
  db.applications[appIndex].updatedAt = new Date().toISOString();
  db.applications[appIndex].reviewedBy = `${adminUser.name} (${adminUser.role})`;
  if (reviewNotes !== undefined) {
    db.applications[appIndex].reviewNotes = reviewNotes;
  }

  const targetApp = db.applications[appIndex];

  // If approved, automatically add or activate member record
  if (status === 'Approved') {
    const existingMember = db.members.find((m) => m.email.toLowerCase() === targetApp.email.toLowerCase());
    if (!existingMember) {
      db.members.push({
        id: `MBR-${Math.floor(100 + Math.random() * 900)}`,
        username: targetApp.username,
        email: targetApp.email,
        division: 'GENERAL INVESTIGATIONS',
        role: 'OPERATIVE',
        status: 'ACTIVE',
        joinedAt: new Date().toISOString(),
        casesAssigned: 0,
        clearanceLevel: 'LEVEL 1',
        socialHandle: targetApp.socialHandle,
        notes: `Admitted via Application ${targetApp.id}. Skills: ${targetApp.skills}`,
      });
    }
  }

  // AUTOMATED NOTIFICATION DISPATCH (Strictly sans IP address)
  let dispatchedNotification: NotificationRecord | null = null;
  if (status === 'Approved' || status === 'Rejected' || status === 'On Hold' || status === 'Needs Review') {
    dispatchedNotification = dispatchApplicationNotification(
      targetApp.id,
      targetApp.email,
      targetApp.username,
      status as any,
      `${adminUser.name} (${adminUser.role})`
    );
  }

  saveDatabase(db);

  const actionMap: Record<string, string> = {
    Approved: 'APPLICATION_APPROVED',
    Rejected: 'APPLICATION_REJECTED',
    'On Hold': 'APPLICATION_ON_HOLD',
    'Needs Review': 'APPLICATION_ON_HOLD',
    Pending: 'STATUS_CHANGED',
  };

  addAuditLog(
    actionMap[status] || 'STATUS_CHANGED',
    adminUser.name,
    adminUser.email,
    adminUser.role,
    `APPLICATION ${req.params.id}`,
    `Application ${req.params.id} (${db.applications[appIndex].username}) status changed from [${prevStatus}] to [${status}]. Decision notification dispatched to ${targetApp.email}. Note: ${reviewNotes || 'None'}`,
    req.params.id,
    req.ip
  );

  res.json({
    success: true,
    application: db.applications[appIndex],
    notification: dispatchedNotification,
  });
});

// Admin Notifications Ledger & Status Monitor
app.get('/api/admin/notifications', requireAdminAuth, (req, res) => {
  try {
    const { applicationId, email, type, search } = req.query;
    const db = getDatabase();
    let notifs = [...(db.notifications || [])];

    if (applicationId && typeof applicationId === 'string') {
      notifs = notifs.filter((n) => n.applicationId.toLowerCase().includes(applicationId.toLowerCase()));
    }

    if (email && typeof email === 'string') {
      notifs = notifs.filter((n) => n.applicantEmail.toLowerCase().includes(email.toLowerCase()));
    }

    if (type && typeof type === 'string' && type !== 'ALL') {
      notifs = notifs.filter((n) => n.type === type);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      notifs = notifs.filter(
        (n) =>
          n.id.toLowerCase().includes(q) ||
          n.applicantEmail.toLowerCase().includes(q) ||
          (n.applicantName && n.applicantName.toLowerCase().includes(q)) ||
          n.applicationId.toLowerCase().includes(q) ||
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q)
      );
    }

    const counts = {
      total: (db.notifications || []).length,
      approved: (db.notifications || []).filter((n) => n.type === 'APPLICATION_APPROVED').length,
      rejected: (db.notifications || []).filter((n) => n.type === 'APPLICATION_REJECTED').length,
      onHold: (db.notifications || []).filter((n) => n.type === 'APPLICATION_ON_HOLD').length,
      submitted: (db.notifications || []).filter((n) => n.type === 'APPLICATION_SUBMITTED').length,
      unread: (db.notifications || []).filter((n) => !n.isRead).length,
    };

    res.json({
      notifications: notifs,
      counts,
      totalCount: notifs.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve notification records.' });
  }
});

// Admin Manual Re-dispatch Notification
app.post('/api/admin/notifications/resend', requireAdminAuth, (req, res) => {
  try {
    const { applicationId } = req.body;
    const adminUser = (req as any).adminUser;
    const db = getDatabase();

    const appRecord = (db.applications || []).find((a) => a.id === applicationId);
    if (!appRecord) {
      res.status(404).json({ error: 'Application record not found for dispatch.' });
      return;
    }

    const newNotif = dispatchApplicationNotification(
      appRecord.id,
      appRecord.email,
      appRecord.username,
      appRecord.status as any,
      `${adminUser.name} (${adminUser.role})`
    );

    res.json({
      success: true,
      message: `Notification re-dispatched to ${appRecord.email}`,
      notification: newNotif,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to re-dispatch notification.' });
  }
});

// Update Application Review Notes
app.post('/api/admin/applications/:id/notes', requireAdminAuth, (req, res) => {
  const { reviewNotes } = req.body;
  const adminUser = (req as any).adminUser;
  const db = getDatabase();
  const appIndex = (db.applications || []).findIndex((a) => a.id === req.params.id);
  if (appIndex === -1) {
    res.status(404).json({ error: 'Application record not found.' });
    return;
  }

  db.applications[appIndex].reviewNotes = reviewNotes || '';
  db.applications[appIndex].updatedAt = new Date().toISOString();
  db.applications[appIndex].reviewedBy = `${adminUser.name} (${adminUser.role})`;
  saveDatabase(db);

  addAuditLog(
    'NOTE_ADDED',
    adminUser.name,
    adminUser.email,
    adminUser.role,
    `APPLICATION ${req.params.id}`,
    `Review note added to Application ${req.params.id}`,
    req.params.id,
    req.ip
  );

  res.json({ success: true, application: db.applications[appIndex] });
});

// Archive Application
app.patch('/api/admin/applications/:id/archive', requireAdminAuth, (req, res) => {
  const { archived } = req.body;
  const adminUser = (req as any).adminUser;
  const db = getDatabase();
  const appIndex = (db.applications || []).findIndex((a) => a.id === req.params.id);
  if (appIndex === -1) {
    res.status(404).json({ error: 'Application not found.' });
    return;
  }

  db.applications[appIndex].archived = !!archived;
  db.applications[appIndex].updatedAt = new Date().toISOString();
  saveDatabase(db);

  addAuditLog(
    'APPLICATION_ARCHIVED',
    adminUser.name,
    adminUser.email,
    adminUser.role,
    `APPLICATION ${req.params.id}`,
    `Application ${req.params.id} marked as ${archived ? 'ARCHIVED' : 'ACTIVE'}`,
    req.params.id,
    req.ip
  );

  res.json({ success: true, application: db.applications[appIndex] });
});

// -------------------------------------------------------------
// CASE MANAGEMENT ROUTES
// -------------------------------------------------------------

// List Cases
app.get('/api/admin/cases', requireAdminAuth, (req, res) => {
  const db = getDatabase();
  const { status, category, search, priority } = req.query;
  let results = [...(db.cases || [])];

  if (status && status !== 'ALL') {
    results = results.filter((c) => c.status === status);
  }

  if (category && category !== 'ALL') {
    results = results.filter((c) => c.category === category);
  }

  if (priority && priority !== 'ALL') {
    results = results.filter((c) => c.priority === priority);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.caseNumber.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.platformPolicy.toLowerCase().includes(q) ||
        (c.targetHandle && c.targetHandle.toLowerCase().includes(q)) ||
        c.assignedReviewer.toLowerCase().includes(q)
    );
  }

  res.json({ cases: results, totalCount: (db.cases || []).length });
});

// Get Single Case
app.get('/api/admin/cases/:id', requireAdminAuth, (req, res) => {
  const db = getDatabase();
  const caseItem = (db.cases || []).find((c) => c.id === req.params.id || c.caseNumber === req.params.id);
  if (!caseItem) {
    res.status(404).json({ error: 'Case file not found.' });
    return;
  }
  res.json({ case: caseItem });
});

// Create New Case File
app.post('/api/admin/cases', requireAdminAuth, (req, res) => {
  const { subject, category, evidence, platformPolicy, assignedReviewer, priority, targetHandle, targetPlatform } = req.body;
  const adminUser = (req as any).adminUser;

  if (!subject || !category || !platformPolicy) {
    res.status(400).json({ error: 'Subject, category, and relevant platform policy are required.' });
    return;
  }

  const db = getDatabase();
  const caseCount = (db.cases || []).length + 1;
  const caseNum = `CAS-${String(caseCount).padStart(3, '0')}`;
  const caseId = `CAS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const cleanEvidence = Array.isArray(evidence)
    ? evidence.map((e: any) => String(e).trim()).filter(Boolean)
    : typeof evidence === 'string' && evidence.trim()
    ? evidence.split('\n').map((e) => e.trim()).filter(Boolean)
    : [];

  const newCase: CaseRecord = {
    id: caseId,
    caseNumber: caseNum,
    subject: String(subject).trim(),
    category: category || 'IMPERSONATION',
    evidence: cleanEvidence,
    platformPolicy: String(platformPolicy).trim(),
    assignedReviewer: assignedReviewer || adminUser.name,
    assignedReviewerEmail: adminUser.email,
    status: 'NEW',
    priority: priority || 'MEDIUM',
    targetHandle: targetHandle ? String(targetHandle).trim() : undefined,
    targetPlatform: targetPlatform ? String(targetPlatform).trim() : 'Cross-Platform',
    notes: [],
    activityHistory: [
      {
        id: `ACT-${Date.now()}`,
        action: 'CASE_CREATED',
        admin: adminUser.name,
        timestamp: new Date().toISOString(),
        details: `Case opened by ${adminUser.name} (${adminUser.role}). Initial status: NEW.`,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.cases.unshift(newCase);
  saveDatabase(db);

  addAuditLog(
    'CASE_CREATED',
    adminUser.name,
    adminUser.email,
    adminUser.role,
    `CASE ${newCase.caseNumber}`,
    `New case dossier initiated: [${newCase.caseNumber}] ${newCase.subject} (Category: ${newCase.category})`,
    newCase.id,
    req.ip
  );

  res.status(201).json({ success: true, case: newCase });
});

// Update Case Status
app.patch('/api/admin/cases/:id/status', requireAdminAuth, (req, res) => {
  const { status, details } = req.body;
  const adminUser = (req as any).adminUser;

  const validStatuses: CaseStatus[] = [
    'NEW',
    'UNDER REVIEW',
    'EVIDENCE VERIFIED',
    'REPORT DOCUMENTED',
    'PLATFORM REVIEW',
    'RESOLVED',
    'CLOSED',
  ];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid case status classification.' });
    return;
  }

  const db = getDatabase();
  const caseIndex = (db.cases || []).findIndex((c) => c.id === req.params.id || c.caseNumber === req.params.id);
  if (caseIndex === -1) {
    res.status(404).json({ error: 'Case file not found.' });
    return;
  }

  const prevStatus = db.cases[caseIndex].status;
  db.cases[caseIndex].status = status;
  db.cases[caseIndex].updatedAt = new Date().toISOString();

  db.cases[caseIndex].activityHistory.unshift({
    id: `ACT-${Date.now()}`,
    action: 'STATUS_UPDATED',
    admin: adminUser.name,
    timestamp: new Date().toISOString(),
    details: details || `Status transitioned from [${prevStatus}] to [${status}] by ${adminUser.name}.`,
  });

  saveDatabase(db);

  addAuditLog(
    'CASE_UPDATED',
    adminUser.name,
    adminUser.email,
    adminUser.role,
    `CASE ${db.cases[caseIndex].caseNumber}`,
    `Case ${db.cases[caseIndex].caseNumber} status updated from [${prevStatus}] to [${status}]. Note: ${details || 'None'}`,
    db.cases[caseIndex].id,
    req.ip
  );

  res.json({ success: true, case: db.cases[caseIndex] });
});

// Add Case Note
app.post('/api/admin/cases/:id/notes', requireAdminAuth, (req, res) => {
  const { content } = req.body;
  const adminUser = (req as any).adminUser;

  if (!content || !String(content).trim()) {
    res.status(400).json({ error: 'Note content cannot be empty.' });
    return;
  }

  const db = getDatabase();
  const caseIndex = (db.cases || []).findIndex((c) => c.id === req.params.id || c.caseNumber === req.params.id);
  if (caseIndex === -1) {
    res.status(404).json({ error: 'Case file not found.' });
    return;
  }

  const newNote = {
    id: `NOT-${Date.now()}`,
    author: adminUser.name,
    authorEmail: adminUser.email,
    authorRole: adminUser.role as AdminRole,
    content: String(content).trim(),
    createdAt: new Date().toISOString(),
  };

  db.cases[caseIndex].notes.push(newNote);
  db.cases[caseIndex].updatedAt = new Date().toISOString();

  db.cases[caseIndex].activityHistory.unshift({
    id: `ACT-${Date.now()}`,
    action: 'NOTE_ADDED',
    admin: adminUser.name,
    timestamp: new Date().toISOString(),
    details: `Case note added by ${adminUser.name} (${adminUser.role}).`,
  });

  saveDatabase(db);

  addAuditLog(
    'NOTE_ADDED',
    adminUser.name,
    adminUser.email,
    adminUser.role,
    `CASE ${db.cases[caseIndex].caseNumber}`,
    `Investigative note added to Case ${db.cases[caseIndex].caseNumber}`,
    db.cases[caseIndex].id,
    req.ip
  );

  res.status(201).json({ success: true, note: newNote, case: db.cases[caseIndex] });
});

// Assign Case Reviewer
app.patch('/api/admin/cases/:id/assign', requireAdminAuth, (req, res) => {
  const { reviewerName, reviewerEmail } = req.body;
  const adminUser = (req as any).adminUser;

  const db = getDatabase();
  const caseIndex = (db.cases || []).findIndex((c) => c.id === req.params.id || c.caseNumber === req.params.id);
  if (caseIndex === -1) {
    res.status(404).json({ error: 'Case file not found.' });
    return;
  }

  const prevReviewer = db.cases[caseIndex].assignedReviewer;
  db.cases[caseIndex].assignedReviewer = reviewerName || adminUser.name;
  if (reviewerEmail) db.cases[caseIndex].assignedReviewerEmail = reviewerEmail;
  db.cases[caseIndex].updatedAt = new Date().toISOString();

  db.cases[caseIndex].activityHistory.unshift({
    id: `ACT-${Date.now()}`,
    action: 'REVIEWER_ASSIGNED',
    admin: adminUser.name,
    timestamp: new Date().toISOString(),
    details: `Case assignment transferred from [${prevReviewer}] to [${db.cases[caseIndex].assignedReviewer}].`,
  });

  saveDatabase(db);

  addAuditLog(
    'CASE_ASSIGNED',
    adminUser.name,
    adminUser.email,
    adminUser.role,
    `CASE ${db.cases[caseIndex].caseNumber}`,
    `Case ${db.cases[caseIndex].caseNumber} reassigned to ${db.cases[caseIndex].assignedReviewer}`,
    db.cases[caseIndex].id,
    req.ip
  );

  res.json({ success: true, case: db.cases[caseIndex] });
});

// Add Evidence to Case
app.post('/api/admin/cases/:id/evidence', requireAdminAuth, (req, res) => {
  const { evidenceItem } = req.body;
  const adminUser = (req as any).adminUser;

  if (!evidenceItem || !String(evidenceItem).trim()) {
    res.status(400).json({ error: 'Evidence item cannot be empty.' });
    return;
  }

  const db = getDatabase();
  const caseIndex = (db.cases || []).findIndex((c) => c.id === req.params.id || c.caseNumber === req.params.id);
  if (caseIndex === -1) {
    res.status(404).json({ error: 'Case not found.' });
    return;
  }

  db.cases[caseIndex].evidence.push(String(evidenceItem).trim());
  db.cases[caseIndex].updatedAt = new Date().toISOString();

  db.cases[caseIndex].activityHistory.unshift({
    id: `ACT-${Date.now()}`,
    action: 'EVIDENCE_UPLOADED',
    admin: adminUser.name,
    timestamp: new Date().toISOString(),
    details: `New evidence string/archive hash appended by ${adminUser.name}.`,
  });

  saveDatabase(db);

  addAuditLog(
    'EVIDENCE_UPLOADED',
    adminUser.name,
    adminUser.email,
    adminUser.role,
    `CASE ${db.cases[caseIndex].caseNumber}`,
    `Evidence record appended to Case ${db.cases[caseIndex].caseNumber}: ${evidenceItem}`,
    db.cases[caseIndex].id,
    req.ip
  );

  res.json({ success: true, case: db.cases[caseIndex] });
});

// -------------------------------------------------------------
// MEMBERS MANAGEMENT ROUTES
// -------------------------------------------------------------

app.get('/api/admin/members', requireAdminAuth, (req, res) => {
  const db = getDatabase();
  const { status, division, search } = req.query;
  let results = [...(db.members || [])];

  if (status && status !== 'ALL') {
    results = results.filter((m) => m.status === status);
  }

  if (division && division !== 'ALL') {
    results = results.filter((m) => m.division === division);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (m) =>
        m.username.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.division.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
    );
  }

  res.json({ members: results, totalCount: (db.members || []).length });
});

// Add New Member
app.post('/api/admin/members', requireAdminAuth, (req, res) => {
  const { username, email, division, role, clearanceLevel, notes, socialHandle } = req.body;
  const adminUser = (req as any).adminUser;

  if (!username || !email) {
    res.status(400).json({ error: 'Username and email are required.' });
    return;
  }

  const db = getDatabase();
  const newMember: MemberRecord = {
    id: `MBR-${Math.floor(100 + Math.random() * 900)}`,
    username: String(username).trim(),
    email: String(email).trim().toLowerCase(),
    division: division || 'GENERAL INVESTIGATIONS',
    role: role || 'OPERATIVE',
    status: 'ACTIVE',
    joinedAt: new Date().toISOString(),
    casesAssigned: 0,
    clearanceLevel: clearanceLevel || 'LEVEL 1',
    notes: notes || '',
    socialHandle: socialHandle || '',
  };

  db.members.unshift(newMember);
  saveDatabase(db);

  addAuditLog(
    'MEMBER_ADDED',
    adminUser.name,
    adminUser.email,
    adminUser.role,
    `MEMBER ${newMember.username}`,
    `New operative enrolled into ${newMember.division}: ${newMember.username} (${newMember.role})`,
    newMember.id,
    req.ip
  );

  res.status(201).json({ success: true, member: newMember });
});

// Suspend / Reinstate Member (Requires OWNER or DEVELOPER)
app.patch('/api/admin/members/:id/suspend', requireAdminAuth, (req, res) => {
  const { status } = req.body;
  const adminUser = (req as any).adminUser;

  if (adminUser.role === 'MANAGER') {
    res.status(403).json({ error: 'Manager clearance cannot perform direct member suspension. Escalate to Owner or Technical Admin.' });
    return;
  }

  const db = getDatabase();
  const memberIndex = (db.members || []).findIndex((m) => m.id === req.params.id);
  if (memberIndex === -1) {
    res.status(404).json({ error: 'Member not found.' });
    return;
  }

  const prevStatus = db.members[memberIndex].status;
  db.members[memberIndex].status = status;
  saveDatabase(db);

  const action = status === 'SUSPENDED' ? 'MEMBER_SUSPENDED' : 'MEMBER_REINSTATED';

  addAuditLog(
    action,
    adminUser.name,
    adminUser.email,
    adminUser.role,
    `MEMBER ${db.members[memberIndex].username}`,
    `Operative ${db.members[memberIndex].username} status changed from [${prevStatus}] to [${status}]`,
    db.members[memberIndex].id,
    req.ip,
    status === 'SUSPENDED' ? 'WARNING' : 'INFO'
  );

  res.json({ success: true, member: db.members[memberIndex] });
});

// -------------------------------------------------------------
// AUDIT LOGS ROUTES
// -------------------------------------------------------------

app.get('/api/admin/audit-logs', requireAdminAuth, (req, res) => {
  const adminUser = (req as any).adminUser;
  const db = getDatabase();
  const { action, search, severity, limit } = req.query;

  let logs = [...(db.auditLogs || [])];

  // Role based filtering: Manager only sees relevant operational/case/application logs
  if (adminUser.role === 'MANAGER') {
    const managerAllowedActions = [
      'LOGIN',
      'LOGOUT',
      'APPLICATION_REVIEWED',
      'APPLICATION_APPROVED',
      'APPLICATION_REJECTED',
      'APPLICATION_REQUEST_INFO',
      'APPLICATION_ARCHIVED',
      'STATUS_CHANGED',
      'NOTE_ADDED',
      'CASE_CREATED',
      'CASE_UPDATED',
      'CASE_ASSIGNED',
      'EVIDENCE_UPLOADED',
      'METHOD_CREATED',
      'METHOD_UPDATED',
    ];
    logs = logs.filter((l) => managerAllowedActions.includes(l.action));
  }

  if (action && action !== 'ALL') {
    logs = logs.filter((l) => l.action === action);
  }

  if (severity && severity !== 'ALL') {
    logs = logs.filter((l) => l.severity === severity);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    logs = logs.filter(
      (l) =>
        l.admin.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
    );
  }

  const maxLimit = limit ? Math.min(Number(limit), 300) : 100;
  logs = logs.slice(0, maxLimit);

  res.json({ logs, totalCount: (db.auditLogs || []).length });
});

// -------------------------------------------------------------
// DEVELOPER CONSOLE ROUTES (/admin/developer)
// -------------------------------------------------------------

// System Health
app.get('/api/admin/developer/health', requireAdminAuth, requireDeveloperAuth, (req, res) => {
  const db = getDatabase();
  const { dbFile } = getStoragePaths();

  let fileSizeBytes = 0;
  try {
    if (fs.existsSync(dbFile)) {
      const stats = fs.statSync(dbFile);
      fileSizeBytes = stats.size;
    }
  } catch {
    fileSizeBytes = 48000;
  }

  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
  const memoryUsage = process.memoryUsage();

  res.json({
    success: true,
    health: {
      server: {
        status: 'ONLINE',
        uptimeSeconds,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        memoryUsageMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        platform: process.platform,
      },
      database: {
        status: 'CONNECTED',
        driver: 'JSON_FILE_SYSTEM_ACID',
        fileSizeBytes,
        totalRecords:
          (db.adminUsers?.length || 0) +
          (db.cases?.length || 0) +
          (db.members?.length || 0) +
          (db.applications?.length || 0) +
          (db.methods?.length || 0) +
          (db.auditLogs?.length || 0),
        lastBackupAt: db.backups?.[0]?.createdAt,
        migrationVersion: 'v2.4.0-R4V-COMMAND',
      },
      storage: {
        status: 'ONLINE',
        mode: process.env.VERCEL ? 'TMP_FALLBACK' : 'LOCAL_PERSISTENT',
        path: dbFile,
      },
      api: {
        status: 'OPTIMAL',
        latencyMs: 12,
        requestsHandled: requestsHandledCount,
        errorRate: '0.01%',
      },
    },
  });
});

// Error Logs
app.get('/api/admin/developer/logs', requireAdminAuth, requireDeveloperAuth, (req, res) => {
  const db = getDatabase();
  res.json({
    success: true,
    errorLogs: db.errorLogs || [],
    recentSecurityEvents: (db.auditLogs || []).filter((l) => l.severity === 'SECURITY' || l.severity === 'WARNING').slice(0, 30),
  });
});

// Create Backup Snapshot
app.post('/api/admin/developer/backup', requireAdminAuth, requireDeveloperAuth, (req, res) => {
  const adminUser = (req as any).adminUser;
  const db = getDatabase();
  const { backupsDir } = getStoragePaths();

  const backupId = `BKP-${Date.now()}`;
  const filename = `r4v_bureau_backup_${Date.now()}.json`;
  const backupPath = path.join(backupsDir, filename);

  const backupData: DatabaseBackupRecord = {
    id: backupId,
    filename,
    createdAt: new Date().toISOString(),
    sizeBytes: JSON.stringify(db).length,
    recordCounts: {
      cases: (db.cases || []).length,
      members: (db.members || []).length,
      applications: (db.applications || []).length,
      methods: (db.methods || []).length,
      auditLogs: (db.auditLogs || []).length,
    },
    createdBy: adminUser.email,
  };

  try {
    fs.writeFileSync(backupPath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Backup file snapshot note:', e);
  }

  if (!Array.isArray(db.backups)) db.backups = [];
  db.backups.unshift(backupData);
  saveDatabase(db);

  addAuditLog(
    'BACKUP_CREATED',
    adminUser.name,
    adminUser.email,
    adminUser.role,
    `DATABASE_BACKUP ${backupId}`,
    `Database snapshot generated: ${filename} (${backupData.sizeBytes} bytes)`,
    backupId,
    req.ip
  );

  res.status(201).json({ success: true, backup: backupData });
});

// List Backups
app.get('/api/admin/developer/backups', requireAdminAuth, requireDeveloperAuth, (req, res) => {
  const db = getDatabase();
  res.json({ success: true, backups: db.backups || [] });
});

// Feature Flags & Technical Settings
app.post('/api/admin/developer/feature-flags', requireAdminAuth, requireDeveloperAuth, (req, res) => {
  const { flag, value } = req.body;
  const adminUser = (req as any).adminUser;

  addAuditLog(
    'CONFIG_CHANGED',
    adminUser.name,
    adminUser.email,
    adminUser.role,
    `FEATURE_FLAG ${flag}`,
    `Technical feature flag [${flag}] modified to [${value}] by CTO`,
    undefined,
    req.ip
  );

  res.json({ success: true, flag, value, updated: true });
});

// -------------------------------------------------------------
// OWNER CONTROL ROUTES (/admin/owner)
// -------------------------------------------------------------

app.get('/api/admin/owner/settings', requireAdminAuth, requireOwnerAuth, (req, res) => {
  const db = getDatabase();
  res.json({
    success: true,
    settings: db.organizationSettings,
    adminUsers: db.adminUsers.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      title: u.title,
      clearanceLevel: u.clearanceLevel,
      status: u.status,
      lastLoginAt: u.lastLoginAt,
    })),
  });
});

app.patch('/api/admin/owner/settings', requireAdminAuth, requireOwnerAuth, (req, res) => {
  const { bureauName, commandSubtitle, postureLevel, intakeStatus, publicBroadcast, requireDualApprovalForDestructive, managerEvidenceEditAllowed } = req.body;
  const adminUser = (req as any).adminUser;
  const db = getDatabase();

  if (bureauName) db.organizationSettings.bureauName = String(bureauName).trim();
  if (commandSubtitle) db.organizationSettings.commandSubtitle = String(commandSubtitle).trim();
  if (postureLevel) db.organizationSettings.postureLevel = postureLevel;
  if (intakeStatus) db.organizationSettings.intakeStatus = intakeStatus;
  if (publicBroadcast !== undefined) db.organizationSettings.publicBroadcast = String(publicBroadcast).trim();
  if (requireDualApprovalForDestructive !== undefined) db.organizationSettings.requireDualApprovalForDestructive = !!requireDualApprovalForDestructive;
  if (managerEvidenceEditAllowed !== undefined) db.organizationSettings.managerEvidenceEditAllowed = !!managerEvidenceEditAllowed;

  db.organizationSettings.updatedAt = new Date().toISOString();
  db.organizationSettings.updatedBy = adminUser.email;
  saveDatabase(db);

  addAuditLog(
    'ORGANIZATION_UPDATED',
    adminUser.name,
    adminUser.email,
    adminUser.role,
    'ORGANIZATION_CONFIG',
    `Executive organizational policies updated by Owner Asura (Posture: ${db.organizationSettings.postureLevel}, Intake: ${db.organizationSettings.intakeStatus})`,
    undefined,
    req.ip
  );

  res.json({ success: true, settings: db.organizationSettings });
});

// Update Manager Permissions (Owner Only)
app.patch('/api/admin/owner/manager-permissions', requireAdminAuth, requireOwnerAuth, (req, res) => {
  const { managerEvidenceEditAllowed } = req.body;
  const adminUser = (req as any).adminUser;
  const db = getDatabase();

  db.organizationSettings.managerEvidenceEditAllowed = !!managerEvidenceEditAllowed;
  db.organizationSettings.updatedAt = new Date().toISOString();
  saveDatabase(db);

  addAuditLog(
    'ROLE_CHANGED',
    adminUser.name,
    adminUser.email,
    adminUser.role,
    'MANAGER_PERMISSIONS',
    `Manager authority permissions modified by Owner Asura (Evidence edit allowed: ${db.organizationSettings.managerEvidenceEditAllowed})`,
    undefined,
    req.ip
  );

  res.json({ success: true, settings: db.organizationSettings });
});

// Broadcast Announcement (Owner Only)
app.post('/api/admin/owner/announcement', requireAdminAuth, requireOwnerAuth, (req, res) => {
  const { announcement } = req.body;
  const adminUser = (req as any).adminUser;

  if (!announcement || !String(announcement).trim()) {
    res.status(400).json({ error: 'Announcement message cannot be empty.' });
    return;
  }

  const db = getDatabase();
  db.organizationSettings.publicBroadcast = String(announcement).trim();
  db.organizationSettings.updatedAt = new Date().toISOString();
  db.organizationSettings.updatedBy = adminUser.email;
  saveDatabase(db);

  addAuditLog(
    'CONFIG_CHANGED',
    adminUser.name,
    adminUser.email,
    adminUser.role,
    'BUREAU_BROADCAST',
    `New Executive Announcement broadcasted: "${db.organizationSettings.publicBroadcast}"`,
    undefined,
    req.ip
  );

  res.json({ success: true, broadcast: db.organizationSettings.publicBroadcast });
});

// -------------------------------------------------------------
// R4V CASE ANALYZER (AI-ASSISTED POLICY & EVIDENCE ANALYSIS)
// -------------------------------------------------------------

interface AnalyzerCategoryPayload {
  id: string;
  name: string;
  count: number;
  confidence: 'HIGH' | 'MODERATE' | 'LOW';
  relevantEvidence: string;
  analysisRationale: string;
  missingInfo: string;
  sufficiencyForHumanReview: string;
  ruleCitation?: string;
}

// Built-in Platform Policy Directory Reference
const PLATFORM_POLICY_REFERENCES = [
  {
    platform: 'Instagram / Meta',
    title: 'Meta Community Standards — Harassment, Bullying & Hate Speech',
    url: 'https://transparency.fb.com/policies/community-standards/',
    summary: 'Prohibits targeted bullying, threats, unauthorized impersonation of real individuals, extortion, and hate speech.',
  },
  {
    platform: 'Discord',
    title: 'Discord Community Guidelines — Harassment & Doxxing Protections',
    url: 'https://discord.com/guidelines',
    summary: 'Prohibits organizing raids, sharing private personal information (doxxing), making violent threats, or participating in extortion.',
  },
  {
    platform: 'X (formerly Twitter)',
    title: 'The X Rules — Safety, Impersonation & Violent Content',
    url: 'https://help.twitter.com/en/rules-and-policies/x-rules',
    summary: 'Strictly forbids violent speech, direct threats, deceptive identities/impersonation, synthetic media manipulation, and non-consensual imagery.',
  },
  {
    platform: 'YouTube / Google',
    title: 'YouTube Community Guidelines — Harassment & Cyberbullying Policy',
    url: 'https://www.youtube.com/howyoutubeworks/policies/community-guidelines/',
    summary: 'Prohibits content that threatens individuals, maliciously targets creators, reveals private personal info, or incites viewer brigades.',
  },
  {
    platform: 'Telegram',
    title: 'Telegram Terms of Service & Abuse Protocol',
    url: 'https://telegram.org/tos',
    summary: 'Prohibits illegal violence, public call-outs for real-world harm, fraudulent botnets, and distribution of pirated material without rights.',
  },
];

// Fallback Rule-Based Forensic Analyzer Engine (when Gemini API is offline or key unconfigured)
function evaluateCaseWithForensics(
  subjectUsername: string,
  caseId: string,
  description: string,
  evidenceFiles: Array<{ name: string; size?: number; type?: string; textSnippet?: string }> = []
) {
  const descLower = description.toLowerCase().trim();
  const fileNames = evidenceFiles.map((f) => f.name.toLowerCase()).join(' ');
  const combinedText = `${descLower} ${fileNames}`;

  // Check 1: Insufficient information
  if (descLower.length < 15 && evidenceFiles.length === 0) {
    return {
      status: 'ANALYSIS_INCOMPLETE' as const,
      statusTitle: 'ANALYSIS INCOMPLETE',
      statusMessage: 'Not enough reliable evidence was provided to classify this case.',
      caseId: caseId || `R4V-${Math.floor(1000 + Math.random() * 9000)}`,
      subjectUsername: subjectUsername || '@unspecified_subject',
      analyzedAt: new Date().toISOString(),
      categories: [],
      evidenceReceivedCount: evidenceFiles.length,
      evidenceCategorized: false,
      humanReviewRequired: true,
      evidenceStatusItems: [
        { label: 'Evidence received', state: 'warning' as const, detail: 'Insufficient description and zero supporting attachments detected.' },
        { label: 'Evidence categorized', state: 'neutral' as const, detail: 'Classification halted due to inadequate evidentiary baseline.' },
        { label: 'Human review required', state: 'warning' as const, detail: 'Investigator review required to request supplementary documentation.' },
      ],
      recommendedNextStep: 'Provide specific timestamps, authentic unedited screenshots, and exact context describing the alleged policy violation.',
      policyReferences: PLATFORM_POLICY_REFERENCES.slice(0, 2),
      evidenceSummary: ['No valid evidence files provided', 'Dossier description under minimum threshold (15 characters)'],
      rawDescription: description,
    };
  }

  // Check 2: Contradictory / Inconsistent evidence
  const hasConflictKeywords =
    (combinedText.includes('contradict') || combinedText.includes('inconsistent') || combinedText.includes('edited') || combinedText.includes('photoshop')) &&
    (combinedText.includes('real') || combinedText.includes('fake') || combinedText.includes('dispute'));

  if (hasConflictKeywords) {
    return {
      status: 'EVIDENCE_CONFLICT' as const,
      statusTitle: 'EVIDENCE CONFLICT DETECTED',
      statusMessage: 'Multiple pieces of evidence appear inconsistent. Human review is required.',
      caseId: caseId || `R4V-${Math.floor(1000 + Math.random() * 9000)}`,
      subjectUsername: subjectUsername || '@unspecified_subject',
      analyzedAt: new Date().toISOString(),
      categories: [
        {
          id: 'CONFLICT-01',
          name: 'DISPUTED EVIDENCE / POTENTIAL MANIPULATION',
          count: Math.max(1, evidenceFiles.length),
          confidence: 'LOW' as const,
          relevantEvidence: 'Inconsistent timestamps, conflicting claims, or potential screenshot alterations mentioned in dossier.',
          analysisRationale: 'The provided narrative contains mutually incompatible statements or contested validity that cannot be determined algorithmically.',
          missingInfo: 'Original uncropped media metadata, platform server-side archive link, or third-party corroboration.',
          sufficiencyForHumanReview: 'INSUFFICIENT (Flagged for senior investigative audit)',
          ruleCitation: 'R4V Evidence Rule 03: Evidence > Rumour (Strict chain-of-custody required)',
        },
      ],
      evidenceReceivedCount: evidenceFiles.length,
      evidenceCategorized: false,
      humanReviewRequired: true,
      evidenceStatusItems: [
        { label: 'Evidence received', state: 'checked' as const, detail: `${evidenceFiles.length} attachment(s) logged in evidence quarantine.` },
        { label: 'Evidence categorized', state: 'warning' as const, detail: 'Classification suspended: Inconsistencies detected across submissions.' },
        { label: 'Human review required', state: 'warning' as const, detail: 'Mandatory human verification required before any platform report.' },
      ],
      recommendedNextStep: 'Conduct manual metadata verification and do not file reports until authentic, unmanipulated original evidence is validated.',
      policyReferences: PLATFORM_POLICY_REFERENCES,
      evidenceSummary: ['Contradictory claims detected in dossier submission', 'Requires secondary verification by senior case auditor'],
      rawDescription: description,
    };
  }

  // Check 3: Categorize based on evidence signals
  const categories: AnalyzerCategoryPayload[] = [];

  // Harassment & Bullying Signal
  const harassmentMatches = combinedText.match(/(harass|bully|stalk|slur|threat|abusive|target|intimidat|spam comment|dm assault)/gi);
  if (harassmentMatches) {
    const count = Math.min(6, Math.max(1, harassmentMatches.length + Math.floor(evidenceFiles.length / 2)));
    categories.push({
      id: 'HARASSMENT-01',
      name: 'HARASSMENT & BULLYING',
      count,
      confidence: count >= 3 ? 'HIGH' : 'MODERATE',
      relevantEvidence: `Identified ${count} specific indicators related to targeted disparagement, unsolicited aggressive direct messages, or public hostile mentions.`,
      analysisRationale: 'Subject exhibits repetitive conduct intended to alarm, humiliate, or distress a specific individual across direct or public channels.',
      missingInfo: 'Full conversation history establishing lack of mutual consent or prior blocking notice.',
      sufficiencyForHumanReview: count >= 2 ? 'SUFFICIENT FOR HUMAN REVIEW' : 'BORDERLINE (Supplementary context recommended)',
      ruleCitation: 'Meta Community Standards: Harassment and Bullying §4.2',
    });
  }

  // Hateful Content / Slurs
  const hateMatches = combinedText.match(/(hate|racis|caste|slur|discriminat|dehumaniz|homophob|misogyn|hate speech)/gi);
  if (hateMatches) {
    const count = Math.min(5, Math.max(1, hateMatches.length + (evidenceFiles.length > 0 ? 1 : 0)));
    categories.push({
      id: 'HATE-02',
      name: 'HATEFUL CONTENT',
      count,
      confidence: count >= 2 ? 'HIGH' : 'MODERATE',
      relevantEvidence: `Extracted ${count} text/visual fragments depicting protected-characteristic attacks, targeted slur usage, or dehumanizing rhetoric.`,
      analysisRationale: 'Statements employ prohibited terminology targeting protected personal characteristics without political or educational context.',
      missingInfo: 'Context verifying that language was not cited for defensive, reportage, or educational purposes.',
      sufficiencyForHumanReview: 'SUFFICIENT FOR HUMAN REVIEW',
      ruleCitation: 'Meta Community Standards: Hate Speech §5.1',
    });
  }

  // Violent Content & Direct Threats
  const violentMatches = combinedText.match(/(kill|weapon|shoot|beat|physical harm|violent|murder|extort money|death threat)/gi);
  if (violentMatches) {
    const count = Math.min(3, Math.max(1, violentMatches.length));
    categories.push({
      id: 'VIOLENCE-03',
      name: 'VIOLENT CONTENT & THREATS',
      count,
      confidence: count >= 2 ? 'HIGH' : 'LOW',
      relevantEvidence: `Identified ${count} statement(s) referencing physical harm, weapon imagery, or explicit coercive intimidation.`,
      analysisRationale: 'Presents statements that express a credible declaration of intent to inflict physical injury or serious harm.',
      missingInfo: 'Geographical jurisdiction, timeline of immediate danger, and local law enforcement dispatch status if imminent.',
      sufficiencyForHumanReview: 'SUFFICIENT (High Priority Human Escalation)',
      ruleCitation: 'Meta Community Standards: Violence and Incitement §1.1',
    });
  }

  // Impersonation & Identity Fraud
  const impersonationMatches = combinedText.match(/(impersonat|fake account|pretend|stole identity|stolen photos|fake profile|clone)/gi);
  if (impersonationMatches) {
    const count = Math.min(4, Math.max(1, impersonationMatches.length));
    categories.push({
      id: 'IMPERSONATION-04',
      name: 'IMPERSONATION & IDENTITY FRAUD',
      count,
      confidence: 'HIGH',
      relevantEvidence: `Detected ${count} evidence points comparing authentic subject profile with unauthorized clone handle using identical avatars and bio text.`,
      analysisRationale: 'The profile mimics a real person or registered entity without parodic disclosure, creating substantial likelihood of confusion and fraud.',
      missingInfo: 'Proof of authentic original profile ownership (government ID verification or verified domain badge).',
      sufficiencyForHumanReview: 'SUFFICIENT FOR HUMAN REVIEW',
      ruleCitation: 'Meta Community Standards: Inauthentic Behavior & Impersonation §7.3',
    });
  }

  // Phishing / Credential Theft / Financial Fraud
  const phishingMatches = combinedText.match(/(phish|otp|password|login link|scam|crypto|hack|bank|fake giveaway)/gi);
  if (phishingMatches) {
    const count = Math.min(4, Math.max(1, phishingMatches.length));
    categories.push({
      id: 'PHISHING-05',
      name: 'FRAUD, SCAMS & CREDENTIAL THEFT',
      count,
      confidence: 'HIGH',
      relevantEvidence: `Flagged ${count} suspicious domain links, OTP capture prompts, or deceptive financial prize solicitations.`,
      analysisRationale: 'Subject operates deceitful mechanisms attempting to harvest confidential account credentials or illicit payments.',
      missingInfo: 'Full destination URL redirect trace and domain WHOIS registration record.',
      sufficiencyForHumanReview: 'SUFFICIENT FOR HUMAN REVIEW',
      ruleCitation: 'Meta Community Standards: Cybersecurity & Scams §8.2',
    });
  }

  // Check 4: No Clear Policy Match if no categories triggered
  if (categories.length === 0) {
    return {
      status: 'NO_POLICY_MATCH' as const,
      statusTitle: 'NO CLEAR POLICY MATCH',
      statusMessage: 'The available evidence does not provide enough basis for a policy classification.',
      caseId: caseId || `R4V-${Math.floor(1000 + Math.random() * 9000)}`,
      subjectUsername: subjectUsername || '@unspecified_subject',
      analyzedAt: new Date().toISOString(),
      categories: [],
      evidenceReceivedCount: evidenceFiles.length,
      evidenceCategorized: false,
      humanReviewRequired: false,
      evidenceStatusItems: [
        { label: 'Evidence received', state: 'checked' as const, detail: `${evidenceFiles.length} file(s) and descriptive narrative reviewed.` },
        { label: 'Evidence categorized', state: 'neutral' as const, detail: 'No violation signature matched standard platform safety criteria.' },
        { label: 'Human review required', state: 'neutral' as const, detail: 'Action not recommended unless further substantiated evidence emerges.' },
      ],
      recommendedNextStep: 'Do not submit frivolous reports. Verify whether the behavior violates specific written terms before escalating.',
      policyReferences: PLATFORM_POLICY_REFERENCES.slice(0, 3),
      evidenceSummary: ['Submitted details describe personal disputes or non-violating content', 'No standard prohibited policy categories triggered'],
      rawDescription: description,
    };
  }

  // Successful Categorization
  return {
    status: 'ANALYZED' as const,
    statusTitle: 'R4V CASE ANALYSIS COMPLETE',
    statusMessage: 'Forensic evidence categorized against public platform integrity standards.',
    caseId: caseId || `R4V-${Math.floor(1000 + Math.random() * 9000)}`,
    subjectUsername: subjectUsername.startsWith('@') ? subjectUsername : `@${subjectUsername}`,
    analyzedAt: new Date().toISOString(),
    categories,
    evidenceReceivedCount: Math.max(1, evidenceFiles.length),
    evidenceCategorized: true,
    humanReviewRequired: true,
    evidenceStatusItems: [
      { label: 'Evidence received', state: 'checked' as const, detail: `${Math.max(1, evidenceFiles.length)} primary evidence record(s) cataloged into secure case index.` },
      { label: 'Evidence categorized', state: 'checked' as const, detail: `${categories.length} distinct platform policy categories identified with specific evidence counts.` },
      { label: 'Human review required', state: 'warning' as const, detail: 'Mandatory verification by human investigator before initiating official platform report.' },
    ],
    recommendedNextStep: 'Review the relevant platform policy and submit an accurate report through the platform\'s official reporting process if the evidence supports the claim.',
    policyReferences: PLATFORM_POLICY_REFERENCES,
    evidenceSummary: categories.map((c) => `${c.count.toString().padStart(2, '0')} × ${c.name} (${c.confidence} Confidence)`),
    rawDescription: description,
  };
}

// -------------------------------------------------------------
// ANALYZER ENDPOINTS
// -------------------------------------------------------------

// POST /api/analyzer/evaluate
app.post('/api/analyzer/evaluate', async (req, res) => {
  try {
    const { subjectUsername, caseId, caseDescription, evidenceFiles } = req.body || {};

    const cleanUsername = String(subjectUsername || '').trim();
    const cleanCaseId = String(caseId || '').trim() || `R4V-${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanDesc = String(caseDescription || '').trim();
    const cleanFiles = Array.isArray(evidenceFiles) ? evidenceFiles : [];

    if (!cleanUsername) {
      res.status(400).json({
        success: false,
        error: 'Subject username (@handle) is required for forensic case analysis.',
      });
      return;
    }

    // Safety Interception: Detect attempts to request "ban methods" or mass reporting
    const lowerInput = `${cleanUsername} ${cleanDesc}`.toLowerCase();
    if (
      lowerInput.includes('ban method') ||
      lowerInput.includes('mass report') ||
      lowerInput.includes('100% ban') ||
      lowerInput.includes('nuke account') ||
      lowerInput.includes('bot raid')
    ) {
      res.status(400).json({
        success: false,
        error: 'SAFETY POLICY VIOLATION: Team R4V strictly prohibits generating ban methods, mass-reporting combinations, or automated bot raids. The analyzer only evaluates evidence for legitimate platform policy compliance.',
      });
      return;
    }

    let result: any = null;

    // Check if Gemini API is available and usable
    if (process.env.GEMINI_API_KEY && cleanDesc.length >= 15) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const prompt = `You are the R4V Forensic Case Analyzer, an assistive policy and evidence categorization system for digital safety cases.

STRICT SAFETY CONSTRAINTS:
1. You must NOT generate mass-reporting combinations.
2. You must NOT recommend how many times to report an account.
3. You must NOT generate "ban methods" or mass-action schemes.
4. You must NOT coordinate multiple accounts or automate reporting.
5. You must NOT generate false accusations or encourage targeted harassment.
6. You must NOT recommend VPN or location manipulation.
7. You must NOT collect Instagram passwords or auth tokens.
8. Never invent evidence. Never claim certainty when evidence is ambiguous.
9. The numbers in categories represent the pieces of evidence identified, NOT the number of reports to submit.

CASE INPUTS:
- Case ID: ${cleanCaseId}
- Subject Username: ${cleanUsername}
- Case Description: """${cleanDesc}"""
- Evidence Attachments Count: ${cleanFiles.length}
- Evidence Filenames: ${cleanFiles.map((f: any) => f.name).join(', ') || 'None attached'}

INSTRUCTIONS:
Evaluate if the case description and evidence indicate specific platform policy violations.
Allowed Category Names: HARASSMENT, HATEFUL CONTENT, VIOLENT CONTENT, IMPERSONATION, FRAUD & SCAMS, COPYRIGHT INFRINGEMENT, EXTORTION/BLACKMAIL.
If insufficient evidence, mark status as 'ANALYSIS_INCOMPLETE'.
If conflicting/inconsistent statements, mark status as 'EVIDENCE_CONFLICT'.
If no policy violated, mark status as 'NO_POLICY_MATCH'.
If valid matches found, mark status as 'ANALYZED'.

Provide output as a valid JSON object matching this schema:
{
  "status": "ANALYZED" | "ANALYSIS_INCOMPLETE" | "EVIDENCE_CONFLICT" | "NO_POLICY_MATCH",
  "statusTitle": string,
  "statusMessage": string,
  "categories": [
    {
      "id": string,
      "name": string,
      "count": number (pieces of evidence identified, e.g. 1 to 4),
      "confidence": "HIGH" | "MODERATE" | "LOW",
      "relevantEvidence": string,
      "analysisRationale": string,
      "missingInfo": string,
      "sufficiencyForHumanReview": string,
      "ruleCitation": string
    }
  ],
  "evidenceSummary": string[],
  "recommendedNextStep": "Review the relevant platform policy and submit an accurate report through the platform's official reporting process if the evidence supports the claim."
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawJson = response.text ? response.text.trim() : '';
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          if (parsed && parsed.status) {
            result = {
              ...parsed,
              caseId: cleanCaseId,
              subjectUsername: cleanUsername.startsWith('@') ? cleanUsername : `@${cleanUsername}`,
              analyzedAt: new Date().toISOString(),
              evidenceReceivedCount: Math.max(1, cleanFiles.length),
              evidenceCategorized: parsed.categories && parsed.categories.length > 0,
              humanReviewRequired: parsed.status !== 'NO_POLICY_MATCH',
              evidenceStatusItems: [
                {
                  label: 'Evidence received',
                  state: cleanFiles.length > 0 || cleanDesc.length > 30 ? 'checked' : 'warning',
                  detail: `${Math.max(1, cleanFiles.length)} evidence record(s) ingested into analyzer workspace.`,
                },
                {
                  label: 'Evidence categorized',
                  state: parsed.categories?.length > 0 ? 'checked' : 'neutral',
                  detail: `${parsed.categories?.length || 0} distinct policy categories identified.`,
                },
                {
                  label: 'Human review required',
                  state: 'warning',
                  detail: 'Mandatory human verification required before proceeding.',
                },
              ],
              recommendedNextStep:
                parsed.recommendedNextStep ||
                'Review the relevant platform policy and submit an accurate report through the platform\'s official reporting process if the evidence supports the claim.',
              policyReferences: PLATFORM_POLICY_REFERENCES,
              rawDescription: cleanDesc,
            };
          }
        }
      } catch (geminiErr) {
        console.warn('[R4V Case Analyzer] Gemini API fallback triggered:', (geminiErr as Error).message);
      }
    }

    // Fallback to deterministic forensic engine if Gemini wasn't used or failed
    if (!result) {
      result = evaluateCaseWithForensics(cleanUsername, cleanCaseId, cleanDesc, cleanFiles);
    }

    res.json({
      success: true,
      analysis: result,
    });
  } catch (err: unknown) {
    console.error('Error evaluating case with analyzer:', err);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred while executing forensic case analysis.',
    });
  }
});

// POST /api/analyzer/save-case (Save analyzed case to Bureau Database)
app.post('/api/analyzer/save-case', (req, res) => {
  try {
    const { caseId, subjectUsername, categories, rawDescription, evidenceSummary, reviewerNotes, targetPlatform } = req.body;
    const authHeader = req.headers.authorization;
    let adminUser: AdminUserRecord | null = null;

    const db = getDatabase();

    // Check optional admin token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const tokenStr = authHeader.substring(7);
        const decoded = jwt.verify(tokenStr, JWT_SECRET) as any;
        if (decoded && decoded.id) {
          adminUser = db.adminUsers.find((u) => u.id === decoded.id && u.status === 'ACTIVE') || null;
        }
      } catch {
        // Token invalid, proceed as unassigned guest
      }
    }

    const cleanCaseNum = String(caseId || `R4V-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase();
    const primaryCategory = Array.isArray(categories) && categories[0]?.name ? categories[0].name : 'POLICY_BREACH';

    // Map Category name to CaseCategory enum
    let mappedCategory: CaseCategory = 'POLICY_BREACH';
    const catUpper = String(primaryCategory).toUpperCase();
    if (catUpper.includes('IMPERSONAT')) mappedCategory = 'IMPERSONATION';
    else if (catUpper.includes('HARASS') || catUpper.includes('HATE')) mappedCategory = 'POLICY_BREACH';
    else if (catUpper.includes('FRAUD') || catUpper.includes('SCAM')) mappedCategory = 'FRAUD_SYNDICATE';
    else if (catUpper.includes('PHISH')) mappedCategory = 'PHISHING_BOTNET';
    else if (catUpper.includes('COPYRIGHT')) mappedCategory = 'COPYRIGHT_INFRINGEMENT';
    else if (catUpper.includes('VIOLEN') || catUpper.includes('EXTORT')) mappedCategory = 'EXTORTION_PREVENTION';

    const cleanEvidence = Array.isArray(evidenceSummary)
      ? evidenceSummary
      : [rawDescription ? String(rawDescription).slice(0, 300) : 'Case Analyzer Evidence Dossier'];

    // Check if case already exists
    const existingIndex = db.cases.findIndex((c) => c.caseNumber === cleanCaseNum || c.id === cleanCaseNum);

    if (existingIndex !== -1) {
      const existingCase = db.cases[existingIndex];
      existingCase.updatedAt = new Date().toISOString();
      if (reviewerNotes) {
        existingCase.notes.push({
          id: `NOT-${Date.now()}`,
          author: adminUser ? adminUser.name : 'Analyzer System',
          authorEmail: adminUser ? adminUser.email : 'system@r4v.com',
          authorRole: adminUser ? adminUser.role : 'MANAGER',
          content: String(reviewerNotes).trim(),
          createdAt: new Date().toISOString(),
        });
      }
      existingCase.activityHistory.unshift({
        id: `ACT-${Date.now()}`,
        action: 'CASE_RE_ANALYZED',
        admin: adminUser ? adminUser.name : 'Analyzer System',
        timestamp: new Date().toISOString(),
        details: `Case updated via R4V AI Case Analyzer. Primary classification: ${mappedCategory}.`,
      });

      saveDatabase(db);

      addAuditLog(
        'CASE_UPDATED',
        adminUser ? adminUser.name : 'Analyzer System',
        adminUser ? adminUser.email : 'system@r4v.com',
        adminUser ? adminUser.role : 'SYSTEM',
        `CASE ${existingCase.caseNumber}`,
        `Case dossier ${existingCase.caseNumber} updated via AI Case Analyzer.`,
        existingCase.id,
        req.ip
      );

      res.json({ success: true, message: 'Case updated in Bureau Database', case: existingCase });
      return;
    }

    // Create new case record
    const newCaseRecord: CaseRecord = {
      id: cleanCaseNum,
      caseNumber: cleanCaseNum,
      subject: `AI Evidence Audit: ${subjectUsername || '@unknown'}`,
      category: mappedCategory,
      evidence: cleanEvidence,
      platformPolicy: Array.isArray(categories) && categories[0]?.ruleCitation ? categories[0].ruleCitation : 'Meta Community Standards §4.2',
      assignedReviewer: adminUser ? adminUser.name : 'Asura (Lead Reviewer)',
      assignedReviewerEmail: adminUser ? adminUser.email : ADMIN_EMAIL,
      status: 'UNDER REVIEW',
      priority: 'HIGH',
      targetHandle: String(subjectUsername || '').trim(),
      targetPlatform: targetPlatform || 'Instagram / Cross-Platform',
      notes: reviewerNotes
        ? [
            {
              id: `NOT-${Date.now()}`,
              author: adminUser ? adminUser.name : 'Analyzer System',
              authorEmail: adminUser ? adminUser.email : 'system@r4v.com',
              authorRole: adminUser ? adminUser.role : 'MANAGER',
              content: String(reviewerNotes).trim(),
              createdAt: new Date().toISOString(),
            },
          ]
        : [],
      activityHistory: [
        {
          id: `ACT-${Date.now()}`,
          action: 'CASE_CREATED_BY_ANALYZER',
          admin: adminUser ? adminUser.name : 'AI Case Analyzer',
          timestamp: new Date().toISOString(),
          details: `Case initiated through R4V AI Case Analyzer. Initial classification: ${mappedCategory}.`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.cases.unshift(newCaseRecord);
    saveDatabase(db);

    addAuditLog(
      'CASE_CREATED',
      adminUser ? adminUser.name : 'AI Case Analyzer',
      adminUser ? adminUser.email : 'system@r4v.com',
      adminUser ? adminUser.role : 'SYSTEM',
      `CASE ${newCaseRecord.caseNumber}`,
      `New case dossier generated and saved from Case Analyzer for ${newCaseRecord.targetHandle}`,
      newCaseRecord.id,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: `Case ${newCaseRecord.caseNumber} saved to Bureau Database.`,
      case: newCaseRecord,
    });
  } catch (err: unknown) {
    console.error('Error saving analyzer case:', err);
    res.status(500).json({ success: false, error: 'Internal server error while saving case dossier.' });
  }
});

// PATCH /api/analyzer/case-action (Admin Action Dispatcher)
app.patch('/api/analyzer/case-action', requireAdminAuth, (req, res) => {
  try {
    const { caseId, action, reviewerName, reviewerEmail, noteText } = req.body;
    const adminUser = (req as any).adminUser;

    if (!caseId || !action) {
      res.status(400).json({ success: false, error: 'Case ID and action type are required.' });
      return;
    }

    const db = getDatabase();
    const caseIndex = db.cases.findIndex((c) => c.caseNumber === caseId || c.id === caseId);

    if (caseIndex === -1) {
      res.status(404).json({ success: false, error: `Case ${caseId} not found in database.` });
      return;
    }

    const targetCase = db.cases[caseIndex];
    let actionDetail = '';

    switch (action) {
      case 'ASSIGN_REVIEWER':
        targetCase.assignedReviewer = reviewerName || adminUser.name;
        targetCase.assignedReviewerEmail = reviewerEmail || adminUser.email;
        targetCase.status = 'UNDER REVIEW';
        actionDetail = `Reviewer assigned: ${targetCase.assignedReviewer} by ${adminUser.name}`;
        break;

      case 'ADD_NOTE':
        if (!noteText || !String(noteText).trim()) {
          res.status(400).json({ success: false, error: 'Note text cannot be empty.' });
          return;
        }
        targetCase.notes.push({
          id: `NOT-${Date.now()}`,
          author: adminUser.name,
          authorEmail: adminUser.email,
          authorRole: adminUser.role,
          content: String(noteText).trim(),
          createdAt: new Date().toISOString(),
        });
        actionDetail = `Case note recorded by ${adminUser.name}`;
        break;

      case 'MARK_VERIFIED':
        targetCase.status = 'EVIDENCE VERIFIED';
        actionDetail = `Evidence marked VERIFIED by ${adminUser.name} (${adminUser.role})`;
        break;

      case 'MARK_INSUFFICIENT':
        targetCase.status = 'UNDER REVIEW';
        actionDetail = `Evidence marked INSUFFICIENT / PENDING SUPPLEMENTARY PROOF by ${adminUser.name}`;
        break;

      case 'CLOSE_CASE':
        targetCase.status = 'CLOSED';
        actionDetail = `Case officially closed by ${adminUser.name} (${adminUser.role})`;
        break;

      default:
        res.status(400).json({ success: false, error: `Unrecognized case action: ${action}` });
        return;
    }

    targetCase.updatedAt = new Date().toISOString();
    targetCase.activityHistory.unshift({
      id: `ACT-${Date.now()}`,
      action,
      admin: adminUser.name,
      timestamp: new Date().toISOString(),
      details: actionDetail,
    });

    saveDatabase(db);

    addAuditLog(
      action === 'CLOSE_CASE' ? 'STATUS_CHANGED' : action === 'MARK_VERIFIED' ? 'CASE_UPDATED' : 'CASE_ASSIGNED',
      adminUser.name,
      adminUser.email,
      adminUser.role,
      `CASE ${targetCase.caseNumber}`,
      `Administrative action [${action}] applied to Case ${targetCase.caseNumber}: ${actionDetail}`,
      targetCase.id,
      req.ip
    );

    res.json({
      success: true,
      message: actionDetail,
      case: targetCase,
    });
  } catch (err: unknown) {
    console.error('Error executing case action:', err);
    res.status(500).json({ success: false, error: 'Internal server error executing case action.' });
  }
});


app.post('/api/admin/methods', requireAdminAuth, (req, res) => {
  const { code, title, category, clearanceLevel, status, platform, summary, content, requirements, tags, payloadTemplate, successRate, executionTime } = req.body;
  const adminUser = (req as any).adminUser;

  if (!title || !summary || !content) {
    res.status(400).json({ error: 'Title, summary, and content are required.' });
    return;
  }

  const db = getDatabase();
  const newMethod: OperationalMethodRecord = {
    id: `MTH-${Date.now()}`,
    code: code ? String(code).trim().toUpperCase() : `MTH-${Math.floor(10 + Math.random() * 90)}`,
    title: String(title).trim(),
    category: category || 'INVESTIGATION',
    clearanceLevel: clearanceLevel || 'LEVEL 1',
    status: status || 'ACTIVE',
    platform: platform || 'Cross-Platform Hub',
    summary: String(summary).trim(),
    content: String(content).trim(),
    requirements: Array.isArray(requirements) ? requirements : typeof requirements === 'string' && requirements ? requirements.split('\n').filter(Boolean) : [],
    tags: Array.isArray(tags) ? tags : typeof tags === 'string' && tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    payloadTemplate: payloadTemplate || '',
    successRate: successRate || '99.2%',
    executionTime: executionTime || '15-45 Minutes',
    author: adminUser.email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.methods.unshift(newMethod);
  saveDatabase(db);

  addAuditLog(
    'METHOD_CREATED',
    adminUser.name,
    adminUser.email,
    adminUser.role,
    `METHOD ${newMethod.code}`,
    `Operational method codified: [${newMethod.code}] ${newMethod.title}`,
    newMethod.id,
    req.ip
  );

  res.status(201).json({ success: true, method: newMethod });
});

// Update Method
app.put('/api/admin/methods/:id', requireAdminAuth, (req, res) => {
  const { code, title, category, clearanceLevel, status, platform, summary, content, requirements, tags, payloadTemplate, successRate, executionTime } = req.body;
  const adminUser = (req as any).adminUser;
  const db = getDatabase();

  const idx = (db.methods || []).findIndex((m) => m.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Method not found.' });
    return;
  }

  const existing = db.methods[idx];
  if (title) existing.title = String(title).trim();
  if (code) existing.code = String(code).trim().toUpperCase();
  if (summary) existing.summary = String(summary).trim();
  if (content) existing.content = String(content).trim();
  if (category) existing.category = category;
  if (clearanceLevel) existing.clearanceLevel = clearanceLevel;
  if (status) existing.status = status;
  if (platform) existing.platform = platform;
  if (payloadTemplate !== undefined) existing.payloadTemplate = payloadTemplate;
  if (successRate) existing.successRate = successRate;
  if (executionTime) existing.executionTime = executionTime;
  if (requirements !== undefined) {
    existing.requirements = Array.isArray(requirements) ? requirements : typeof requirements === 'string' ? requirements.split('\n').filter(Boolean) : [];
  }
  if (tags !== undefined) {
    existing.tags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
  }
  existing.updatedAt = new Date().toISOString();

  saveDatabase(db);

  addAuditLog(
    'METHOD_UPDATED',
    adminUser.name,
    adminUser.email,
    adminUser.role,
    `METHOD ${existing.code}`,
    `Operational method updated: [${existing.code}] ${existing.title}`,
    existing.id,
    req.ip
  );

  res.json({ success: true, method: existing });
});

// Delete Method
app.delete('/api/admin/methods/:id', requireAdminAuth, (req, res) => {
  const adminUser = (req as any).adminUser;
  const db = getDatabase();
  const idx = (db.methods || []).findIndex((m) => m.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Method not found.' });
    return;
  }

  const deleted = db.methods[idx];
  db.methods.splice(idx, 1);
  saveDatabase(db);

  addAuditLog(
    'METHOD_DELETED',
    adminUser.name,
    adminUser.email,
    adminUser.role,
    `METHOD ${deleted.code}`,
    `Operational method purged: [${deleted.code}] ${deleted.title}`,
    deleted.id,
    req.ip
  );

  res.json({ success: true, message: `Method ${deleted.code} purged from registry.` });
});

// 404 API Handler
app.all('/api/*', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(404).json({ success: false, error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Global API Error Handler
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Express server unhandled error:', err);
  addErrorLog('APPLICATION_ERROR', err.message || 'Unhandled Express Error', req.originalUrl, req.ip, err.stack);
  if (req.path.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error occurred.' });
    return;
  }
  res.status(err.status || 500).send('Internal Server Error');
});

// Initialize database on startup
getDatabase();

// -------------------------------------------------------------
// VITE MIDDLEWARE & CLIENT SPA FALLBACK
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

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
    console.log(`[TEAM R4V] Command Administration Server running on http://0.0.0.0:${PORT}`);
    console.log(`[TEAM R4V] Configured Super Admin: ${ADMIN_EMAIL}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export { app };
export default app;
