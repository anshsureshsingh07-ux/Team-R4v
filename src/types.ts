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

export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Needs Review';

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

export type AuditAction = 
  | 'LOGIN' 
  | 'FAILED_LOGIN' 
  | 'LOGOUT' 
  | 'APPLICATION_REVIEWED' 
  | 'STATUS_CHANGED' 
  | 'APPLICATION_ARCHIVED' 
  | 'NOTE_ADDED';

export interface AuditLogRecord {
  id: string;
  action: AuditAction;
  timestamp: string;
  adminEmail: string;
  targetId?: string;
  details: string;
  ip?: string;
}

export interface AdminSession {
  email: string;
  role: 'SUPER_ADMIN' | 'BUREAU_ADMIN';
  token: string;
  expiresAt: number;
}
