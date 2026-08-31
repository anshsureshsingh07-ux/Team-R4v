export interface Leader {
  id: string;
  name: string;
  role: 'OWNER' | 'MAIN MANAGER';
  label: 'OWNER' | 'MANAGER';
  image: string;
  clearanceLevel: string;
  dossierNumber: string;
  appointed: string;
  division: string;
  status: string;
}

export interface ArchiveCase {
  id: string;
  caseNumber: string;
  title: string;
  status: 'DOCUMENTED' | 'RESOLVED' | 'ACTIVE' | 'ARCHIVED';
  date: string;
  category: string;
  description: string;
  evidence: 'AVAILABLE' | 'SEALED' | 'VERIFIED' | 'UNDER REVIEW';
  evidencePoints: string[];
  findings: string;
  filedBy: string;
  platform: string;
}

export interface OperationStep {
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
  criteria: string[];
  duration: string;
  seal: string;
}

export interface CodeRule {
  number: string;
  title: string;
  summary: string;
  detail: string;
}

export interface BulletinPost {
  id: string;
  date: string;
  title: string;
  issueNo: string;
  headline: string;
  summary: string;
  fullText: string;
  columnist: string;
}

export interface SiteStatistics {
  documentedCases: string;
  resolvedCases: string;
  activeMembers: string;
  archivedReports: string;
}

// -------------------------------------------------------------
// ADMIN HIERARCHY & ROLES
// -------------------------------------------------------------

export type AdminRole = 'OWNER' | 'DEVELOPER' | 'MANAGER';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  title: string;
  status: 'ACTIVE' | 'SUSPENDED';
  clearanceLevel: string;
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminSession {
  user: AdminUser;
  token: string;
  expiresIn: string;
}

// -------------------------------------------------------------
// APPLICATION MANAGEMENT
// -------------------------------------------------------------

export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected' | 'On Hold' | 'Needs Review';

export interface ApplicationRecord {
  id: string;
  username: string;
  email: string;
  ageConfirmed: boolean;
  reason: string;
  skills: string;
  experience: string;
  socialHandle?: string;
  codeAgreed: boolean;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  reviewNotes?: string;
  reviewedBy?: string;
  archived?: boolean;
}

// -------------------------------------------------------------
// NOTIFICATION SYSTEM
// -------------------------------------------------------------

export type NotificationType = 
  | 'APPLICATION_APPROVED'
  | 'APPLICATION_REJECTED'
  | 'APPLICATION_ON_HOLD'
  | 'APPLICATION_SUBMITTED'
  | 'SYSTEM_BROADCAST';

export type NotificationDeliveryStatus = 
  | 'DELIVERED'
  | 'SENT_VIA_EMAIL_AND_INAPP'
  | 'PENDING_DISPATCH';

export interface NotificationRecord {
  id: string;
  userId?: string;
  applicantEmail: string;
  applicantName?: string;
  applicationId: string;
  type: NotificationType;
  title: string;
  message: string;
  channels: ('EMAIL' | 'IN_APP')[];
  deliveryStatus: NotificationDeliveryStatus;
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

// -------------------------------------------------------------
// CASE MANAGEMENT
// -------------------------------------------------------------

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

export interface CaseNote {
  id: string;
  author: string;
  authorEmail: string;
  authorRole: AdminRole;
  content: string;
  createdAt: string;
}

export interface CaseActivity {
  id: string;
  action: string;
  admin: string;
  timestamp: string;
  details: string;
}

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
  notes: CaseNote[];
  activityHistory: CaseActivity[];
  createdAt: string;
  updatedAt: string;
}

// -------------------------------------------------------------
// MEMBER MANAGEMENT
// -------------------------------------------------------------

export type MemberRole = 'OPERATIVE' | 'SENIOR_AGENT' | 'SPECIALIST' | 'LEAD_INVESTIGATOR' | 'SECTION_CHIEF';
export type MemberStatus = 'ACTIVE' | 'PROBATION' | 'SUSPENDED' | 'RETIRED';

export interface MemberRecord {
  id: string;
  username: string;
  email: string;
  division: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  casesAssigned: number;
  clearanceLevel: string;
  notes?: string;
  socialHandle?: string;
}

// -------------------------------------------------------------
// AUDIT LOGS
// -------------------------------------------------------------

export type AuditAction = 
  | 'LOGIN' 
  | 'FAILED_LOGIN' 
  | 'LOGOUT' 
  | 'APPLICATION_REVIEWED' 
  | 'APPLICATION_APPROVED'
  | 'APPLICATION_REJECTED'
  | 'APPLICATION_ON_HOLD'
  | 'APPLICATION_REQUEST_INFO'
  | 'APPLICATION_ARCHIVED'
  | 'NOTIFICATION_DISPATCHED'
  | 'STATUS_CHANGED' 
  | 'NOTE_ADDED'
  | 'CASE_CREATED'
  | 'CASE_UPDATED'
  | 'CASE_ASSIGNED'
  | 'EVIDENCE_UPLOADED'
  | 'MEMBER_ADDED'
  | 'MEMBER_UPDATED'
  | 'MEMBER_SUSPENDED'
  | 'MEMBER_REINSTATED'
  | 'ROLE_CHANGED'
  | 'CONFIG_CHANGED'
  | 'ORGANIZATION_UPDATED'
  | 'BACKUP_CREATED'
  | 'SECURITY_EVENT'
  | 'METHOD_CREATED'
  | 'METHOD_UPDATED'
  | 'METHOD_DELETED'
  | 'METHOD_ARCHIVED';

export interface AuditLogRecord {
  id: string;
  admin: string;
  adminEmail: string;
  adminRole: AdminRole | 'SYSTEM';
  action: AuditAction;
  target: string;
  targetId?: string;
  details: string;
  timestamp: string;
  ip?: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL' | 'SECURITY';
}

// -------------------------------------------------------------
// OPERATIONAL METHODS
// -------------------------------------------------------------

export type MethodCategory =
  | 'INVESTIGATION'
  | 'EVIDENCE_AUDIT'
  | 'POLICY_ENFORCEMENT'
  | 'CASE_MANAGEMENT'
  | 'OSINT_VERIFICATION'
  | 'CUSTOM';

export type MethodClearance = 'LEVEL 1' | 'LEVEL 2' | 'LEVEL 3' | 'PILOT EXCLUSIVE';
export type MethodStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export interface OperationalMethod {
  id: string;
  code: string;
  title: string;
  category: MethodCategory;
  clearanceLevel: MethodClearance;
  status: MethodStatus;
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

// -------------------------------------------------------------
// DEVELOPER CONSOLE & SYSTEM HEALTH
// -------------------------------------------------------------

export interface SystemHealthData {
  server: {
    status: 'ONLINE' | 'DEGRADED' | 'MAINTENANCE';
    uptimeSeconds: number;
    nodeVersion: string;
    environment: string;
    memoryUsageMB: number;
    platform: string;
  };
  database: {
    status: 'CONNECTED' | 'DISCONNECTED';
    driver: string;
    fileSizeBytes: number;
    totalRecords: number;
    lastBackupAt?: string;
    migrationVersion: string;
  };
  storage: {
    status: 'ONLINE';
    mode: 'LOCAL_PERSISTENT' | 'TMP_FALLBACK';
    path: string;
  };
  api: {
    status: 'OPTIMAL';
    latencyMs: number;
    requestsHandled: number;
    errorRate: string;
  };
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

export interface DatabaseBackup {
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

// -------------------------------------------------------------
// R4V CASE ANALYZER (AI-ASSISTED POLICY & EVIDENCE ANALYSIS)
// -------------------------------------------------------------

export type AnalyzerConfidence = 'HIGH' | 'MODERATE' | 'LOW';

export interface PolicyCategoryMatch {
  id: string;
  name: string;
  count: number; // Represents pieces of evidence identified, NOT reports to submit
  confidence: AnalyzerConfidence;
  relevantEvidence: string;
  analysisRationale: string;
  missingInfo: string;
  sufficiencyForHumanReview: string;
  ruleCitation?: string;
}

export type AnalyzerResultStatus =
  | 'ANALYZED'
  | 'ANALYSIS_INCOMPLETE'
  | 'EVIDENCE_CONFLICT'
  | 'NO_POLICY_MATCH';

export interface UploadedEvidenceItem {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  textSnippet?: string;
  uploadedAt: string;
}

export interface CaseAnalysisResult {
  status: AnalyzerResultStatus;
  statusTitle: string;
  statusMessage: string;
  caseId: string;
  subjectUsername: string;
  analyzedAt: string;
  categories: PolicyCategoryMatch[];
  evidenceReceivedCount: number;
  evidenceCategorized: boolean;
  humanReviewRequired: boolean;
  evidenceStatusItems: Array<{
    label: string;
    state: 'checked' | 'warning' | 'neutral';
    detail: string;
  }>;
  recommendedNextStep: string;
  policyReferences: Array<{
    platform: string;
    title: string;
    url: string;
    summary: string;
  }>;
  evidenceSummary: string[];
  rawDescription: string;
  reviewerNotes?: string;
  savedCaseId?: string;
  savedToDatabase?: boolean;
}

