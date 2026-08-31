import { Leader, ArchiveCase, OperationStep, CodeRule, BulletinPost, SiteStatistics, OperationalMethod } from '../types';
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
  communityStatus: "KING OF BANNING // MOST POWERFUL IN COM",
  powerTitle: "THE UNCONTESTED AUTHORITY IN BANNING COM & TRUST & SAFETY",
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

/**
 * PUBLIC OPERATIONAL METHODS REPOSITORY
 * Live-synced with the central database and freely accessible for investigation & reporting.
 */
export const INITIAL_OPERATIONAL_METHODS: OperationalMethod[] = [
  {
    id: "MTH-IG-01",
    code: "MTH-01",
    title: "Instagram Platform Policy Infraction & Impersonation Neutralization",
    category: "POLICY_ENFORCEMENT",
    clearanceLevel: "LEVEL 1",
    status: "ACTIVE",
    platform: "Instagram / Meta",
    downloadsCount: 1420,
    successRate: "99.4%",
    executionTime: "15-45 Minutes",
    summary: "Systematic protocol for documenting identity cloning, deceptive handles, and coordinated harassment syndicates violating Meta Community Standards §3.2.",
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
      "Original owner verified identification or government ID proof",
      "Timestamped archive link of infringing profile & stories",
      "Exact numeric Instagram User ID (UID)",
      "Chain-of-custody affidavit format"
    ],
    tags: ["Instagram", "Banning Com", "Impersonation", "Meta T&S", "Takedown Protocol"],
    author: "asura@r4v.com",
    createdAt: "2026-08-01T12:00:00.000Z",
    updatedAt: "2026-08-29T18:30:00.000Z",
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
    id: "MTH-TG-02",
    code: "MTH-02",
    title: "Telegram Malicious Node & Scam Syndicate Dismantling Protocol",
    category: "INVESTIGATION",
    clearanceLevel: "LEVEL 2",
    status: "ACTIVE",
    platform: "Telegram Messenger",
    downloadsCount: 1180,
    successRate: "98.7%",
    executionTime: "30-90 Minutes",
    summary: "Multi-layered investigation methodology to expose and dismantle phishing bots, cyber-extortion hubs, and illicit carding channels.",
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
      "Permanent Telegram message links (t.me/c/...)",
      "Target channel numeric ID and access hash",
      "Associated phishing URLs / domain names",
      "Cryptocurrency transaction hashes (if applicable)"
    ],
    tags: ["Telegram", "Phishing Takedown", "Scam Syndicate", "Bot Disruption", "OSINT"],
    author: "blackout@r4v.com",
    createdAt: "2026-08-10T10:00:00.000Z",
    updatedAt: "2026-08-28T14:15:00.000Z",
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
    id: "MTH-OSINT-03",
    code: "MTH-03",
    title: "Coordinated Inauthentic Network & Bot-Farm Syndicate Mapping",
    category: "OSINT_VERIFICATION",
    clearanceLevel: "LEVEL 3",
    status: "ACTIVE",
    platform: "Cross-Platform Hub",
    downloadsCount: 954,
    successRate: "97.9%",
    executionTime: "2-4 Hours",
    summary: "Graph-based analytical methodology for identifying automated syndicates, astroturfing clusters, and coordinated spam botnets.",
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
      "Multi-node account dataset (JSON/CSV)",
      "Temporal interaction timeline logs",
      "Network cluster graph export (Gephi / Cytoscape compatible)",
      "Lexical phrase repetition index"
    ],
    tags: ["OSINT", "Bot Detection", "Network Graphing", "Syndicate Mapping", "King of Banning"],
    author: "aizen@r4v.com",
    createdAt: "2026-08-12T09:00:00.000Z",
    updatedAt: "2026-08-29T21:00:00.000Z",
    payloadTemplate: `[R4V NETWORK THREAT MAPPING REPORT]
SUBJECT: Coordinated Inauthentic Behavior Syndicate
CLUSTER SIZE: [NUMBER_OF_ACCOUNTS] Linked Nodes
CENTRAL HUB: @[HUB_ACCOUNT_1], @[HUB_ACCOUNT_2]
COORDINATION METRIC: 94.2% Temporal Synchronization
OBSERVED PATTERN: Automated mass distribution of malicious redirection links.
PACKET ATTACHMENT: SHA256_[CLUSTER_DATA_HASH].json`
  },
  {
    id: "MTH-DMCA-04",
    code: "MTH-04",
    title: "High-Velocity Copyright, DMCA & Trademark Escalation Dossier",
    category: "EVIDENCE_AUDIT",
    clearanceLevel: "LEVEL 1",
    status: "ACTIVE",
    platform: "Global Web & Platforms",
    downloadsCount: 1680,
    successRate: "99.8%",
    executionTime: "10-30 Minutes",
    summary: "Legally fortified notice of infringement framework conforming to 17 U.S.C. § 512(c) and international intellectual property treaties.",
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
      "Original work URL or copyright registration certificate",
      "Exact infringing direct URL paths",
      "Authorized representative physical/electronic signature",
      "Statement of good faith under penalty of perjury"
    ],
    tags: ["DMCA", "Copyright", "Trademark", "IP Protection", "Fast Takedown"],
    author: "asura@r4v.com",
    createdAt: "2026-08-15T15:00:00.000Z",
    updatedAt: "2026-08-29T11:45:00.000Z",
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
  {
    id: "MTH-ATO-05",
    code: "MTH-05",
    title: "Account Takeover (ATO) & Credential Compromise Rapid Strike",
    category: "CASE_MANAGEMENT",
    clearanceLevel: "LEVEL 2",
    status: "ACTIVE",
    platform: "Cross-Platform Social & Gaming",
    downloadsCount: 1310,
    successRate: "98.2%",
    executionTime: "20-60 Minutes",
    summary: "Emergency containment and recovery framework for unauthorized access, session hijacking, SIM swap victims, and compromised credentials.",
    content: `PHASE 1: PERIMETER LOCKDOWN & FORENSIC SNAPSHOT
1. Terminate all active sessions via platform account security center if partial access remains.
2. Invalidate OAuth authorized application tokens and developer API keys.
3. Record IP logins, suspicious device user-agents, and unauthorized email/2FA phone modifications.

PHASE 2: REPUTATION & MALFEASANCE DEFENSE
4. Issue immediate public notification across verified alternate channels warning community against unauthorized DMs.
5. Document fraudulent posts or fraudulent crypto promotions published during compromise window.

PHASE 3: TRUST & SAFETY RESTORATION FILING
6. Submit historic account creation billing records, original registration email history, and government ID selfie verification.
7. Demand rollback of unauthorized 2FA modifications and reset to original recovery email.`,
    requirements: [
      "Original email invoice / billing receipts",
      "Account founding date & initial linked phone number",
      "Compromised session IP timestamp ledger",
      "Verified government-issued identification"
    ],
    tags: ["Account Recovery", "ATO Strike", "Security Lockdown", "Banning Com", "Emergency"],
    author: "blackout@r4v.com",
    createdAt: "2026-08-18T14:20:00.000Z",
    updatedAt: "2026-08-30T09:10:00.000Z",
    payloadTemplate: `[CRITICAL ESCALATION: ACCOUNT TAKEOVER (ATO) COMPROMISE]
ACCOUNT IDENTIFIER: @[ACCOUNT_HANDLE] (Linked ID: [ACCOUNT_ID])
COMPROMISE TIMECODE: [UTC_TIMESTAMP_OF_BREACH]
ATTACK VECTOR: Unauthorized 2FA Swap / Session Hijack
ORIGINAL VERIFIED EMAIL: [ORIGINAL_EMAIL]
ROGUE MODIFIED EMAIL: [ATTACKER_EMAIL]
REQUESTED ACTIONS:
1. Immediate freeze of account @[ACCOUNT_HANDLE] to prevent fraudulent community interaction.
2. Invalidation of all existing session tokens.
3. Restoration to founding contact: [ORIGINAL_EMAIL].`
  },
  {
    id: "MTH-TIER1-06",
    code: "MTH-06",
    title: "Dangerous Organizations & Severe Threat Priority Removal Packet",
    category: "POLICY_ENFORCEMENT",
    clearanceLevel: "LEVEL 3",
    status: "ACTIVE",
    platform: "Global Platform Tier-1 Desks",
    downloadsCount: 890,
    successRate: "99.9%",
    executionTime: "5-20 Minutes",
    summary: "Tier-1 rapid escalation dossier for immediate neutralization of doxxing hubs, swatting syndicates, violent extremism, and CSAM threats.",
    content: `PHASE 1: HIGH-SEVERITY RISK ASSESSMENT
1. Verify immediate physical safety hazards, direct credibly violent threats, or distribution of non-consensual personal data (doxxing).
2. Archive exact raw message payloads, target PII, and distribution multipliers before deletion.

PHASE 2: JURISDICTIONAL PLATFORM CLASSIFICATION
3. Map offenses directly to platform zero-tolerance clauses (e.g. Meta Severe Harassment & Danger, Telegram Zero-Tolerance, Discord Community Guidelines §1).
4. Extract server guild IDs, channel hashes, message snowflakes, and user discriminator IDs.

PHASE 3: EMERGENCY PRIORITY DISPATCH
5. Route through designated platform law enforcement / priority emergency escalation queues.
6. Provide structured evidence bundle with unredacted cryptographic verification hashes.`,
    requirements: [
      "Raw message snowflakes or permanent link anchors",
      "Immediate harm risk evaluation affidavit",
      "Cryptographic archive of PII disclosure / threat strings",
      "Direct platform emergency intake endpoint"
    ],
    tags: ["Tier-1 Priority", "Severe Harm", "Anti-Doxxing", "King of Banning", "Emergency Strike"],
    author: "asura@r4v.com",
    createdAt: "2026-08-20T08:00:00.000Z",
    updatedAt: "2026-08-30T16:00:00.000Z",
    payloadTemplate: `[EMERGENCY TIER-1 PRIORITY ESCALATION PACKET]
SEVERITY LEVEL: CRITICAL (IMMEDIATE REMOVAL MANDATE)
TARGET THREAT: [DOXXING_HUB / VIOLENT_EXTREMISM / HARASSMENT_SYNDICATE]
PLATFORM IDENTIFIERS:
- Entity / Guild ID: [IDENTIFIER_1]
- Specific Offense Anchors: [MESSAGE_SNOWFLAKE_LINKS]
EVIDENCE SUMMARY:
Documented release of non-public personal identifiable information (PII) with explicit malicious intent.
URGENCY: Immediate server-level purge and credential termination requested.`
  }
];

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
