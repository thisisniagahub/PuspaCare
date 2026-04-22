# PUSPACare v3.0 — A-Z Improvement Roadmap
## Deep Research & Comprehensive Audit Report

---

## PART 1: NGO LEGIT MALAYSIA — BENCHMARK ANALYSIS

### NGO-NGO Terkemuka Malaysia & Teknologi Mereka

| # | NGO | Fokus | Teknologi/Pelantar | Apa Boleh Dipelajari |
|---|-----|-------|--------------------|-----------------------|
| 1 | **Yayasan Hasanah** (Khazanah) | Impact-based foundation, grant management | Hasanah Academy (mobile app), Hasanah Special Grant portal, SDG-aligned impact measurement | ★ Grant lifecycle management, Impact KPI tracking per programme, Digital learning platform |
| 2 | **Lembaga Zakat Selangor (LZS)** | Zakat collection & distribution | Blockchain e-Wakalah (Masverse partnership, 2025), Digital payment integration, Real-time monitoring | ★ Blockchain transparency untuk zakat/waqf distribution, Real-time tracking, Digital receipts |
| 3 | **One Hope Charity & Welfare** | Kebajikan masyarakat, bantuan | LHDN tax exemption automation, Online donation platform, Social media integration | ★ Auto LHDN tax receipt (s44(6)), Public transparency dashboard |
| 4 | **SOLS Health / SOLS 24/7** | Education, community development | Full digital NGO management, Volunteer management system, Online learning | ★ Volunteer matching & hour logging, Multi-branch management |
| 5 | **MERCY Malaysia** | Bantuan bencana, perubatan | Disaster response system, Real-time field reporting, Volunteer coordination, Inventory management | ★ Emergency response workflow, GPS-based resource deployment |
| 6 | **Yayasan Bumi Senang** | OKU empowerment | Digital accessibility tools, Case management for OKU beneficiaries | ★ Accessibility compliance (WCAG), OKU-specific case tracking |
| 7 | **Persatuan Kebajikan Islam Malaysia (PERKIM)** | Dakwah, kebajikan | Multi-state branch management, Zakat distribution tracking | ★ Multi-cawangan system, Centralized reporting |
| 8 | **Malaysian AIDS Council** | Health advocacy | Donor CRM, Grant management, Programme evaluation | ★ Health data privacy (PDPA), Outcome-based evaluation |

### Trend Teknologi NGO Global 2025 (Dari 10 Kajian Web)

1. **AI-Powered Case Management** — LiveImpact, Bloomerang menggunakan AI untuk auto-scoring, prioritization
2. **Blockchain Zakat/Waqf** — LZS + Masverse pioneer blockchain distribution (Okt 2025)
3. **Donor Relationship Management (DRM)** — Data analytics, multi-channel communications, recurring giving
4. **Volunteer Management Software** — Shift scheduling, hour logging, certificate generation, impact tracking
5. **SDG Impact Measurement** — UN SDG framework, APPGM-SDG Malaysia, impact indicators
6. **eKYC & AMLA Compliance** — BNM Policy Document eKYC (April 2024), risk-based approach
7. **Digital Tax Receipts** — LHDN s44(6) automation, donor tax relief
8. **Multi-Branch ERP** — Financial consolidation, approval workflows, audit trails
9. **Mobile-First Engagement** — Push notifications, WhatsApp integration, mobile forms
10. **Data-Driven Decision Making** — Dashboards, predictive analytics, reporting automation

---

## PART 2: CURRENT PUSPA AUDIT

### Modul Status (26 Modul)

#### ✅ MODUL REAL BERFUNCSI (15 modul)

| # | Modul | Lines | Status | API? | Database? | Kualiti |
|---|-------|-------|--------|------|-----------|---------|
| 1 | Dashboard | 992 | ✅ Real | ✅ 5 sub-routes | ✅ Prisma | Advanced — Hero banner, stats, charts |
| 2 | Ahli (Members) | 1,706 | ✅ Real | ✅ Full CRUD | ✅ Prisma | Advanced — CRUD, search, pagination |
| 3 | Kes (Cases) | 2,434 | ✅ Real | ✅ Full CRUD | ✅ Prisma | Advanced — 12-status workflow, scoring |
| 4 | Program | 1,340 | ✅ Real | ✅ Full CRUD | ✅ Prisma | Advanced — Categories, budget tracking |
| 5 | Derma (Donations) | 1,670 | ✅ Real | ✅ Full CRUD | ✅ Prisma | Advanced — ISF segregation, zakat categories |
| 6 | Pindahan (Disbursements) | 1,539 | ✅ Real | ✅ Full CRUD | ✅ Prisma | Advanced — Multi-approval, receipt |
| 7 | Aktiviti (Kanban) | 1,207 | ✅ Real | ✅ Full CRUD | ✅ Prisma | Intermediate — DnD kanban board |
| 8 | Pematuhan (Compliance) | 803 | ✅ Real | ✅ CRUD | ✅ Prisma | Intermediate — Checklist, org profile |
| 9 | Admin | 1,622 | ✅ Real | ✅ | ✅ Prisma | Intermediate — User management |
| 10 | Laporan (Reports) | 745 | ✅ Real | ✅ | ✅ Prisma | Intermediate — Basic reports |
| 11 | AI Tools | 1,606 | ✅ Real | ✅ | Mock data | Advanced — Chat, image gen, VLM |
| 12 | eKYC | 460 | ⚠️ UI Only | ✅ 3 routes | ❌ Mock | Advanced UI — Wizard, liveness sim |
| 13 | TapSecure | 487 | ⚠️ UI Only | ✅ 5 routes | ❌ Mock | Advanced UI — Device binding, biometric |
| 14 | Lembaga Pengarah | — | ✅ (in Compliance) | ✅ CRUD | ✅ Prisma | Basic — Part of compliance module |
| 15 | Rakan Kongsi | — | ✅ (in Compliance) | ✅ CRUD | ✅ Prisma | Basic — Part of compliance module |

#### ❌ MODUL PLACEHOLDER (8 modul)

| # | Modul | Lines | Status | Catatan |
|---|-------|-------|--------|---------|
| 16 | Sukarelawan | 197 | ❌ Placeholder | Kosong — "Akan Datang" |
| 17 | Penderma (CRM) | 201 | ❌ Placeholder | Kosong — "Akan Datang" |
| 18 | Dokumen | 281 | ❌ Placeholder | Kosong — "Akan Datang" |
| 19-25 | OpenClaw (7 sub-modul) | 2,376 total | ❌ Mock UI | Server cards, tanpa backend real |

### API Routes Status (25 routes)

| Route | Methods | Real DB? | Notes |
|-------|---------|----------|-------|
| `/api/v1/members` | GET/POST/PUT/DELETE | ✅ Prisma | Full CRUD, search, pagination |
| `/api/v1/cases` | GET/POST/PUT/DELETE | ✅ Prisma | Full CRUD, status workflow |
| `/api/v1/donations` | GET/POST/PUT/DELETE | ✅ Prisma | Full CRUD, ISF fields |
| `/api/v1/programmes` | GET/POST/PUT/DELETE | ✅ Prisma | Full CRUD |
| `/api/v1/disbursements` | GET/POST/PUT/DELETE | ✅ Prisma | Full CRUD |
| `/api/v1/activities` | GET/POST/PUT/DELETE | ✅ Prisma | Full CRUD |
| `/api/v1/dashboard` | GET | ✅ Prisma | Stats aggregation |
| `/api/v1/dashboard/*` | GET (4 sub) | ✅ Prisma | Member dist, monthly donations |
| `/api/v1/ekyc` | GET/POST | ❌ Mock | Returns mock data |
| `/api/v1/ekyc/verify` | POST | ❌ Mock | Returns mock confirmation |
| `/api/v1/ekyc/reject` | POST | ❌ Mock | Returns mock rejection |
| `/api/v1/tapsecure/*` | GET/POST/PUT/DELETE | ❌ Mock | 5 routes, all mock data |
| `/api/v1/compliance` | GET/POST/PUT/DELETE | ✅ Prisma | Full CRUD |
| `/api/v1/board-members` | GET/POST/PUT/DELETE | ✅ Prisma | Full CRUD |
| `/api/v1/partners` | GET/POST/PUT/DELETE | ✅ Prisma | Full CRUD |
| `/api/v1/organization` | GET/PUT | ✅ Prisma | Org profile |
| `/api/v1/reports` | GET | ✅ Prisma | Report generation |

### Prisma Schema: 22 Models ✅

User, Member, HouseholdMember, Programme, Case, CaseNote, CaseDocument,
Donation, Disbursement, Activity, OrganizationProfile, BoardMember, Partner,
ImpactMetric, PublicReport, ComplianceChecklist, AuditLog, Notification,
Capture, EKYCVerification, DeviceBinding, SecurityLog

---

## PART 3: A-Z IMPROVEMENT ROADMAP

### FASA 1: FIX & STABILIZE (Critical — 1-2 minggu)

#### 1.1 ✅ Sambung eKYC ke Database
**Masalah**: eKYC module guna mock data, API routes return fake data
- [ ] Convert eKYC API routes guna Prisma (model EKYCVerification sudah wujud!)
- [ ] Connect wizard form → POST /api/v1/ekyc (simpan gambar IC, selfie ke DB)
- [ ] Connect verification list → GET /api/v1/ekyc (read from DB)
- [ ] Approve/reject → PUT EKYCVerification record
**Sumber**: Model already has: icFrontUrl, icBackUrl, selfieUrl, livenessScore, faceMatchScore, bnmCompliant, amlaScreening, riskLevel

#### 1.2 ✅ Sambung TapSecure ke Database
**Masalah**: Device binding & security logs guna mock data
- [ ] Convert TapSecure API routes guna Prisma (models DeviceBinding, SecurityLog sudah wujud!)
- [ ] Implement real device fingerprinting (canvas + WebGL)
- [ ] Connect security log table to actual user actions

#### 1.3 ✅ Authentication & Authorization
**Masalah**: Tiada login system — sesiapa boleh akses semua
- [ ] Implement NextAuth.js (sudah ada dalam package.json!)
- [ ] Role-based access: admin, ops, finance, volunteer
- [ ] Protected API routes middleware
- [ ] Session management dengan JWT

#### 1.4 ✅ File Upload Infrastructure
**Masalah**: Gambar IC, selfie disimpan sebagai base64 dalam memory sahaja
- [ ] Setup Supabase Storage bucket untuk dokumen
- [ ] Upload endpoint: POST /api/v1/upload
- [ ] Replace base64 with URL references in eKYC, Case Documents

### FASA 2: BUILD MISSING MODULES (High — 2-3 minggu)

#### 2.1 ✅ Sukarelawan (Volunteer Management System)
**Benchmark**: LiveImpact, Golden, Civic Champs, MERCY Malaysia
- [ ] **Model Baru**: Volunteer, VolunteerDeployment, VolunteerHourLog, VolunteerCertificate
- [ ] Daftar sukarelawan dengan profil lengkap (kemahiran, kebolehsediaan, lokasi)
- [ ] Penjejakan penempatan mengikut program & lokasi
- [ ] Log jam khidmat dengan kelulusan penyelia
- [ ] Penjanaan sijil PDF (Canvas/Puppeteer)
- [ ] Dashboard statistik & heatmap penempatan
- [ ] Matching algorithm: volunteer skills ↔ programme needs

#### 2.2 ✅ CRM Penderma (Donor Relationship Management)
**Benchmark**: Bloomerang, One Hope Charity, LHDN s44(6)
- [ ] **Model Baru**: Donor, DonorCommunication, RecurringDonation, TaxReceipt
- [ ] Profil penderma terpisah dari Donation (hubungan 1-to-many)
- [ ] Sejarah derma lengkap per penderma
- [ ] **Resit Cukai LHDN s44(6)**: Auto-generate PDF receipt selaras format LHDN
  - No. rujukan derma
  - Nama & IC penderma
  - Jumlah derma (RM)
  - Tandatangan digital NGO
  - Approval ref LHDN
- [ ] Derma berulang (recurring): Monthly/quarterly auto-tracking
- [ ] Komunikasi penderma: Email templates, thank-you automation
- [ ] Donor segmentation: Major donor, regular, occasional, lapsed
- [ ] Analytics: Retention rate, LTV, average gift size

#### 2.3 ✅ Gudang Dokumen (Document Management)
**Benchmark**: ROS eROSES system, ISO 27001 compliance
- [ ] **Model Baru**: Document, DocumentCategory, DocumentVersion, DocumentPermission
- [ ] Upload & organize documents by category
- [ ] Version control (track changes)
- [ ] Role-based document access (PDPA compliance)
- [ ] Expiry tracking for ROS certificates, LHDN approvals
- [ ] Digital signing for constitution amendments
- [ ] Full-text search across documents

#### 2.4 ✅ Bual AI (Real AI Integration)
**Masalah**: AI module ada tapi guna placeholder
- [ ] Connect AI chat ke z-ai-web-dev-sdk (LLM skill)
- [ ] Context-aware: AI boleh baca data ahli, kes, derma untuk jawab soalan
- [ ] Auto-generate reports from natural language
- [ ] Smart recommendations: "Ahli X layak untuk Programme Y"

### FASA 3: ADVANCED FEATURES (Medium — 2-4 minggu)

#### 3.1 ✅ Laporan Kewangan & Audit
- [ ] Penyata Kewangan auto-generate (Income Statement, Balance Sheet)
- [ ] Trial Balance report
- [ ] Budget vs Actual comparison per programme
- [ ] Fund segregation report (ISF: Zakat, Sadaqah, Waqf, Infaq)
- [ ] Audit trail enhancement (immutable log per transaction)
- [ ] Export to Excel/PDF with professional formatting
- [ ] Monthly/quarterly/yearly auto-reporting

#### 3.2 ✅ Workflow Automation
- [ ] Case approval workflow: Draft → Submitted → Verifying → Approved → Disbursing
- [ ] Disbursement approval chain: Request → Finance Review → Approval → Payment
- [ ] Compliance checklist auto-trigger on events
- [ ] Notification system: Email + in-app notifications
- [ ] SLA tracking: Auto-escalate overdue cases

#### 3.3 ✅ Multi-Branch / Multi-Cawangan
- [ ] Branch/Cawangan model in Prisma
- [ ] Data isolation per branch (ops view only their branch)
- [ ] Consolidated reporting at HQ level
- [ ] Inter-branch fund transfers
- [ ] Branch performance comparison dashboard

#### 3.4 ✅ GPS & Field Operations
- [ ] Field visit tracking with GPS coordinates
- [ ] Check-in/check-out for volunteers at distribution points
- [ ] Beneficiary mapping on map (latitude/longitude)
- [ ] Route optimization for delivery/disbursement

### FASA 4: COMPLIANCE & TRANSPARENCY (Medium — 2-3 minggu)

#### 4.1 ✅ LHDN Tax Receipt Automation
- [ ] Auto-generate s44(6) tax receipts on donation confirmation
- [ ] Bulk receipt generation for year-end
- [ ] Donor portal: Download past receipts
- [ ] LHDN reporting format export
- [ ] Tax-deductible amount tracking (max 7% AGI)

#### 4.2 ✅ BNM AMLA/KYC Compliance
- [ ] Enhanced eKYC: Real OCR (not mock)
- [ ] AMLA screening integration (sanction lists)
- [ ] Risk assessment scoring algorithm
- [ ] Enhanced Due Diligence (EDD) for high-risk
- [ ] PEP (Politically Exposed Person) screening
- [ ] Compliance reporting dashboard

#### 4.3 ✅ ROS Compliance Dashboard
- [ ] AGM meeting tracker (annual due date)
- [ ] Constitution amendment workflow
- [ ] Annual return filing status
- [ ] Committee member term tracking
- [ ] ROS submission checklist

#### 4.4 ✅ PDPA 2010 Compliance
- [ ] Data retention policy enforcement
- [ ] Consent management (Donor, Member, Volunteer)
- [ ] Data subject access request (DSAR) workflow
- [ ] Privacy impact assessment
- [ ] Data breach notification protocol

### FASA 5: INNOVATION & CUTTING EDGE (Low — 3-5 minggu)

#### 5.1 ✅ Blockchain Transparency (Optional/Future)
**Benchmark**: LZS + Masverse e-Wakalah (Oct 2025)
- [ ] Immutable donation ledger
- [ ] Transparent fund flow: Donor → Programme → Beneficiary
- [ ] Smart contract for conditional disbursements
- [ ] Public transparency portal (donors can trace their funds)

#### 5.2 ✅ WhatsApp Business API Integration
- [ ] Automated donation receipts via WhatsApp
- [ ] Volunteer shift reminders
- [ ] Beneficiary status updates
- [ ] Two-way communication channel
- [ ] Broadcast announcements

#### 5.3 ✅ Mobile Progressive Web App (PWA)
- [ ] Install as mobile app
- [ ] Offline mode for field workers
- [ ] Push notifications
- [ ] Camera integration for eKYC, document capture
- [ ] Biometric login (fingerprint/face)

#### 5.4 ✅ Advanced Analytics & AI
- [ ] Predictive analytics: Churn risk for donors
- [ ] Anomaly detection: Fraud in disbursements
- [ ] Programme effectiveness scoring
- [ ] SDG alignment mapping
- [ ] Natural language report generation

#### 5.5 ✅ OpenClaw AI Integration (Real)
- [ ] Convert 7 OpenClaw placeholder modules ke real functionality
- [ ] MCP: Real server management for AI context
- [ ] Terminal: Real command execution interface
- [ ] Automation: Workflow automation builder
- [ ] Models: AI model configuration & testing
- [ ] Plugins: Extensible plugin system
- [ ] Integrations: Third-party service connections

---

## PART 4: PRIORITIZED IMPLEMENTATION ORDER

### 🔴 TIER 1 — MESTI BUAT SEKARANG (Minggu 1-2)
| # | Task | Impact | Effort |
|---|------|--------|--------|
| 1 | Authentication (NextAuth) | 🔴 Critical security | 2 hari |
| 2 | eKYC → Real DB connection | 🔴 Critical compliance | 1 hari |
| 3 | TapSecure → Real DB connection | 🔴 Critical security | 1 hari |
| 4 | File upload infrastructure | 🔴 Critical for eKYC | 1 hari |

### 🟡 TIER 2 — TINGKAT KUALITI (Minggu 2-4)
| # | Task | Impact | Effort |
|---|------|--------|--------|
| 5 | Volunteer Management System | 🟡 High — core NGO need | 4 hari |
| 6 | Donor CRM + LHDN Tax Receipts | 🟡 High — donor retention | 4 hari |
| 7 | Document Management | 🟡 High — compliance | 3 hari |
| 8 | Workflow Automation (Case/Disbursement) | 🟡 High — efficiency | 3 hari |
| 9 | Notification System | 🟡 High — user engagement | 2 hari |

### 🟢 TIER 3 — ADVANCED (Minggu 4-8)
| # | Task | Impact | Effort |
|---|------|--------|--------|
| 10 | Financial Reports & Audit Trail | 🟢 Medium | 4 hari |
| 11 | Multi-Branch System | 🟢 Medium | 3 hari |
| 12 | GPS & Field Operations | 🟢 Medium | 3 hari |
| 13 | ROS Compliance Dashboard | 🟢 Medium | 2 hari |
| 14 | PDPA Compliance Module | 🟢 Medium | 2 hari |

### 🔵 TIER 4 — INNOVATION (Future)
| # | Task | Impact | Effort |
|---|------|--------|--------|
| 15 | WhatsApp Business API | 🔵 Nice-to-have | 3 hari |
| 16 | PWA Mobile App | 🔵 Nice-to-have | 5 hari |
| 17 | Advanced AI Analytics | 🔵 Nice-to-have | 5 hari |
| 18 | Blockchain Transparency | 🔵 Future/R&D | 10 hari |
| 19 | OpenClaw Real Integration | 🔵 Nice-to-have | 5 hari |

---

## PART 5: DATABASE SCHEMA ADDITIONS NEEDED

### New Models Required:

```prisma
// ── Volunteer Management ──
model Volunteer { ... }
model VolunteerDeployment { ... }
model VolunteerHourLog { ... }
model VolunteerCertificate { ... }

// ── Donor CRM ──
model Donor { ... }
model DonorCommunication { ... }
model RecurringDonation { ... }
model TaxReceipt { ... }

// ── Document Management ──
model Document { ... }
model DocumentCategory { ... }
model DocumentVersion { ... }

// ── Multi-Branch ──
model Branch { ... }

// ── Workflow ──
model Workflow { ... }
model WorkflowStep { ... }
model WorkflowApproval { ... }
```

### Existing Models Need Enhancement:

- **User**: Add branchId, lastActivityAt, twoFactorEnabled
- **Member**: Add branchId, consentDate, consentVersion (PDPA)
- **Donation**: Add donorId (FK to Donor), receiptId (FK to TaxReceipt)
- **Case**: Add workflowInstanceId, assignedBranchId
- **Notification**: Add channel (email/in-app/whatsapp), sentAt, readAt

---

## PART 6: KEY METRICS TO TRACK

### NGO Efficiency Metrics ( aligned SDG & BNM AMLA):
1. **Time-to-Disburse**: Avg days from case approval to disbursement
2. **Donor Retention Rate**: % donors who give again within 12 months
3. **Volunteer Engagement Score**: Hours logged / registered volunteers
4. **Case Resolution Rate**: % cases closed within SLA
5. **Fund Utilization Rate**: % disbursed vs total collected per programme
6. **Compliance Score**: % checklist items completed
7. **Beneficiary Reach**: Unique individuals served per quarter
8. **Cost-per-Beneficiary**: Total operating cost / beneficiaries served
9. **Digital Adoption Rate**: % operations done digitally vs manual
10. **Transparency Index**: % funds traceable from donor to beneficiary

---

*Generated from deep research of 10+ web sources covering Malaysian NGOs (Yayasan Hasanah, LZS, MERCY, One Hope, SOLS), global NGO software (LiveImpact, Bloomerang, Golden), BNM AMLA/KYC policies, LHDN tax exemption requirements, SDG impact measurement frameworks, and blockchain zakat distribution systems.*

*Last updated: July 2025*
