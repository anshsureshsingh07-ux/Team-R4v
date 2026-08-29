import { Leader, ArchiveCase, OperationStep, CodeRule, BulletinPost, SiteStatistics } from '../types';
import heroOfficeImg from '../assets/images/hero_noir_office_1787991099232.jpg';
import asuraImg from '../assets/images/leader_asura_1787991113900.jpg';
import blackoutImg from '../assets/images/leader_blackout_1787991127050.jpg';
import aizenImg from '../assets/images/leader_aizen_1787991142216.jpg';
import newspaperTextureImg from '../assets/images/vintage_newspaper_texture_1787991162072.jpg';

export const ASSETS = {
  heroOffice: heroOfficeImg,
  leaderAsura: asuraImg,
  leaderBlackout: blackoutImg,
  leaderAizen: aizenImg,
  newspaperTexture: newspaperTextureImg,
};

export const SITE_INFO = {
  name: "TEAM R4V",
  subname: "THE WATCHERS",
  mainTagline: "NO NOISE. NO MERCY. ONLY RESULTS.",
  secondaryTagline: "We watch. We document. We act.",
  motto: "Evidence before accusation. Rules before revenge.",
  heroQuote: "Every action leaves a trace.",
  operationalQuote: "One valid report is stronger than a thousand false ones.",
  classifiedQuote: "The archive records what the internet forgets.",
  footerTagline: "We document. We verify. We report responsibly.",
  year: "2026",
};

/**
 * CENTRALIZED EDITABLE STATISTICS
 * Users can customize these metrics directly in this configuration.
 */
export const STATISTICS: SiteStatistics = {
  documentedCases: "000+",
  resolvedCases: "000+",
  activeMembers: "000+",
  archivedReports: "000+",
};

export const LEADERSHIP_DATA: Leader[] = [
  {
    id: "asura",
    name: "ASURA",
    role: "OWNER",
    label: "OWNER",
    image: ASSETS.leaderAsura,
    clearanceLevel: "LEVEL 01 // SUPREME OVERSIGHT",
    dossierNumber: "DIR-001-ASURA",
    appointed: "AUG 2024",
    division: "Executive Council & Strategic Command",
    status: "ACTIVE DIRECTIVE",
  },
  {
    id: "blackout",
    name: "BLACKOUT",
    role: "MAIN MANAGER",
    label: "MANAGER",
    image: ASSETS.leaderBlackout,
    clearanceLevel: "LEVEL 02 // TACTICAL OPERATIONS",
    dossierNumber: "OPS-002-BLCK",
    appointed: "OCT 2024",
    division: "Intelligence Verification & Archive Integrity",
    status: "FIELD ACTIVE",
  },
  {
    id: "aizen",
    name: "AIZEN",
    role: "MAIN MANAGER",
    label: "MANAGER",
    image: ASSETS.leaderAizen,
    clearanceLevel: "LEVEL 02 // LOGISTICS & AUDIT",
    dossierNumber: "OPS-003-AIZN",
    appointed: "NOV 2024",
    division: "Policy Enforcement & Evidence Verification",
    status: "FIELD ACTIVE",
  },
];

export const ARCHIVE_CASES: ArchiveCase[] = [
  {
    id: "case-001",
    caseNumber: "CASE 001",
    title: "Impersonation & Coordinated Malfeasance Syndicate",
    status: "DOCUMENTED",
    date: "AUG 14, 2026",
    category: "Identity Fraud & Impersonation",
    description: "Multi-layered network engaged in identity cloning and targeted deception across major social platforms. All digital footprints captured and verified.",
    evidence: "AVAILABLE",
    evidencePoints: [
      "14 verified cryptographic chain timestamps",
      "Corroborated cross-account redirection routes",
      "Full forensic screenshot ledger with SHA-256 signatures",
      "Direct violation of Platform Terms §3.2 (Deceptive Practices)"
    ],
    findings: "The operative network operated under 9 alternate handles attempting to circumvent community trust guidelines. Case fully indexed for platform review.",
    filedBy: "Intelligence Desk #4",
    platform: "Cross-Platform Social Hub"
  },
  {
    id: "case-002",
    caseNumber: "CASE 002",
    title: "Commercial Scam Ring & Phishing Operation",
    status: "RESOLVED",
    date: "JUL 28, 2026",
    category: "Financial Scam & Phishing",
    description: "Automated predatory campaign circulating falsified promotional incentives designed to extract user authentication tokens.",
    evidence: "VERIFIED",
    evidencePoints: [
      "Malicious URL domain registry tracking",
      "42 corroborated user submission logs",
      "Platform trust & safety escalation dispatch acknowledged",
      "Account decommissioned by official moderation review"
    ],
    findings: "Official platform moderators took enforcement action within 18 hours of formal dossier presentation. Account group terminated.",
    filedBy: "Lead Auditor AIZEN",
    platform: "Public Network"
  },
  {
    id: "case-003",
    caseNumber: "CASE 003",
    title: "Extortion Threat & Targeted Harassment Group",
    status: "RESOLVED",
    date: "JUN 11, 2026",
    category: "Platform Terms Breach // Harassment",
    description: "Hostile actor group utilizing unprovoked blackmail attempts and brigading tactics to suppress legitimate community members.",
    evidence: "AVAILABLE",
    evidencePoints: [
      "Unedited communication transcripts preserved",
      "Timestamped platform metadata logging",
      "Third-party witness corroboration statements",
      "Zero retaliatory harassment initiated — strict evidence delivery only"
    ],
    findings: "Case resolved following direct platform abuse report with verified dossier. Sanction enacted without platform cross-contamination.",
    filedBy: "Field Desk BLACKOUT",
    platform: "Direct Messenger Service"
  },
  {
    id: "case-004",
    caseNumber: "CASE 004",
    title: "Copyright Infringement & Intellectual Plagiarism",
    status: "ARCHIVED",
    date: "MAY 03, 2026",
    category: "Copyright & Intellectual Property",
    description: "Systematic scrapers harvesting original creative assets and claiming commercial ownership through secondary front profiles.",
    evidence: "AVAILABLE",
    evidencePoints: [
      "Original creation timestamp proofs",
      "Visual hash matching comparison matrix",
      "Formal DMCA platform notice index"
    ],
    findings: "Content removed following standard legal-technical audit pipeline. File permanently archived in cold storage.",
    filedBy: "Archive Desk ASURA",
    platform: "Media Sharing Channel"
  },
  {
    id: "case-005",
    caseNumber: "CASE 005",
    title: "Botnet Amplification & Synthetic Engagement Swarm",
    status: "ACTIVE",
    date: "AUG 22, 2026",
    category: "Synthetic Manipulation & Spam",
    description: "Coordinated cluster of algorithmic profiles artificially inflating engagement metrics to manipulate platform recommendation algorithms.",
    evidence: "UNDER REVIEW",
    evidencePoints: [
      "Activity burst periodicity analysis",
      "Follower graph cluster topology mapping",
      "Pending secondary verification before submission"
    ],
    findings: "Final evidence validation currently underway. Compliance check against platform automation rules in progress.",
    filedBy: "Operations Unit #2",
    platform: "Microblogging Platform"
  },
  {
    id: "case-006",
    caseNumber: "CASE 006",
    title: "Mass Doxxing Enterprise & Sensitive Data Distribution",
    status: "DOCUMENTED",
    date: "AUG 02, 2026",
    category: "Privacy Violation & Doxxing",
    description: "Unlawful dissemination of personal identifying records and private contacts in public forum spaces.",
    evidence: "SEALED",
    evidencePoints: [
      "Redacted archival evidence bundle",
      "Urgent platform safety desk notification log",
      "Protected victim privacy safeguards applied"
    ],
    findings: "Content taken down with expedited safety review. Retained in internal cold vault under maximum clearance.",
    filedBy: "Command Directive",
    platform: "Public Forum"
  }
];

export const OPERATIONS_STEPS: OperationStep[] = [
  {
    stepNumber: "01",
    title: "REPORT RECEIVED",
    subtitle: "Intake & Initial Triage",
    description: "An incident submission or potential rule infraction is logged into the intake bureau. No immediate presumption of guilt is made.",
    criteria: [
      "Source verification and authenticity check",
      "Initial platform terms of service mapping",
      "Creation of an internal case index number",
      "Duplication check against existing dossiers"
    ],
    duration: "STAGE 1 — IMMEDIATE INGEST",
    seal: "LOGGED"
  },
  {
    stepNumber: "02",
    title: "EVIDENCE REVIEW",
    subtitle: "Forensic Corroboration",
    description: "Every claimed violation must be accompanied by raw, unedited, timestamped digital proof. Fabricated or edited media is immediately discarded.",
    criteria: [
      "Timestamp & cryptographic consistency check",
      "Metadata and archival preservation (Wayback / Perma.cc)",
      "Direct contextual analysis (preventing taken-out-of-context claims)",
      "Multi-analyst independent confirmation"
    ],
    duration: "STAGE 2 — RIGOROUS AUDIT",
    seal: "EXAMINED"
  },
  {
    stepNumber: "03",
    title: "RULE CHECK",
    subtitle: "Policy Compliance Mapping",
    description: "The case is cross-referenced against the specific hosting platform's Community Guidelines, Terms of Service, and applicable cyber policies.",
    criteria: [
      "Specific clause violation verification (e.g., Harassment, Impersonation, Fraud)",
      "Disqualification of personal disputes or frivolous grievances",
      "Strict prohibition check against vigilante retribution",
      "Final authorization by Senior Operations Manager"
    ],
    duration: "STAGE 3 — POLICY SCRUTINY",
    seal: "VERIFIED"
  },
  {
    stepNumber: "04",
    title: "PLATFORM REPORT",
    subtitle: "Official Channel Submission",
    description: "A comprehensive, factual dossier is submitted exclusively through the platform's designated official reporting channels and trust & safety portals.",
    criteria: [
      "Single structured report with organized evidence links",
      "Zero automated mass-brigading or botnet spam",
      "Clear, professional documentation with exact timecodes",
      "Preservation of report reference ticket numbers"
    ],
    duration: "STAGE 4 — OFFICIAL SUBMISSION",
    seal: "SUBMITTED"
  },
  {
    stepNumber: "05",
    title: "RESOLUTION",
    subtitle: "Outcome & Archival",
    description: "The platform's formal determination is observed and recorded. The dossier is archived in the permanent registry for institutional memory.",
    criteria: [
      "Recording of platform moderation enforcement",
      "Closing of case status (Resolved / Documented / Archived)",
      "Post-resolution case lock to prevent further inquiry",
      "Educational retrospective added to internal guidelines"
    ],
    duration: "STAGE 5 — FINAL REGISTRATION",
    seal: "CONCLUDED"
  }
];

export const CODE_RULES: CodeRule[] = [
  {
    number: "01",
    title: "NO FALSE REPORTS",
    summary: "Never fabricate evidence.",
    detail: "Integrity is the foundation of our existence. Any member found fabricating, manipulating, cropping to mislead, or forging evidence will be permanently expelled and their dossiers invalidated. Truth is our only weapon."
  },
  {
    number: "02",
    title: "NO HARASSMENT",
    summary: "Do not threaten or target individuals.",
    detail: "Team R4V is not a mob. We never initiate public brigading, direct-message intimidation, hate campaigns, or coordinated abusive behavior. We operate strictly through lawful documentation and platform mechanisms."
  },
  {
    number: "03",
    title: "EVIDENCE FIRST",
    summary: "Claims must be supported by evidence.",
    detail: "An allegation without verified, timestamped proof is treated as zero. Every report must pass independent verification before any platform submission is authorized. Presume nothing until proven."
  },
  {
    number: "04",
    title: "FOLLOW PLATFORM RULES",
    summary: "Reports should only concern genuine violations.",
    detail: "We operate in strict alignment with each platform's published terms of service. We do not weaponize reporting systems against lawful speech, opposing viewpoints, or benign accounts."
  },
  {
    number: "05",
    title: "NO PERSONAL VENDETTAS",
    summary: "R4V is not a tool for revenge.",
    detail: "Team R4V is strictly neutral and institutional. Personal conflicts, ego clashes, and retaliatory feuds have no place in our dossiers. If a matter is driven by spite rather than objective rule violation, it is rejected."
  }
];

export const BULLETIN_POSTS: BulletinPost[] = [
  {
    id: "bulletin-01",
    date: "AUG 29, 2026",
    title: "R4V SYSTEM UPDATE",
    issueNo: "DISPATCH VOL. XXIV // NO. 112",
    headline: "NEW PROTOCOLS FOR FORENSIC EVIDENCE VERIFICATION ENACTED",
    summary: "Executive Council codifies upgraded standards for cross-platform metadata preservation and anti-fabrication screening.",
    fullText: "BIRMINGHAM BUREAU — Effective immediately, all internal case files submitted to the R4V Central Archive must include dual-layered cryptographic hashes and independent archival backups. The Executive Council emphasizes that our mandate rests solely on unassailable truth and institutional restraint.",
    columnist: "Special Correspondent // Executive Desk"
  },
  {
    id: "bulletin-02",
    date: "JUL 19, 2026",
    title: "COMMUNITY INTEGRITY MEMORANDUM",
    issueNo: "DISPATCH VOL. XXIV // NO. 098",
    headline: "REITERATION OF NON-HARASSMENT DOCTRINE ACROSS ALL DIVISIONS",
    summary: "A direct advisory from Owner ASURA reinforcing our zero-tolerance policy against vigilante behavior and unauthorized contact.",
    fullText: "THE PRIVATE OFFICE — It has been brought to the attention of leadership that outside bad actors frequently attempt to emulate our signature. We remind all members: R4V does not conduct public shaming, nor do we contact suspects directly. Our evidence speaks quietly to official platform trustees.",
    columnist: "Chief Auditor // Bureau of Standards"
  },
  {
    id: "bulletin-03",
    date: "JUN 04, 2026",
    title: "ARCHIVE MILESTONE REPORT",
    issueNo: "DISPATCH VOL. XXIV // NO. 076",
    headline: "STANDARDIZED DOSSIER FORMAT 2.0 FORMALLY INTEGRATED",
    summary: "New vintage broadsheet documentation format adopted for seamless case indexing and historical transparency.",
    fullText: "CENTRAL ARCHIVE — Case files have now been indexed into standardized dossiers with unified classification metrics: Documented, Resolved, Active, and Archived. Transparency and methodical execution remain our highest operational virtue.",
    columnist: "Records Keeper // Archive Division"
  }
];
