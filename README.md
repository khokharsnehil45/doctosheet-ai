# 📄 DocToSheet AI — Production Micro-SaaS

> Turn unstructured financial & legal documents (bank statements, invoices, and lease abstracts) into structured CSV and Excel files in seconds.

---

## 🚀 Key Features

- **Document Extraction Engine**:
  - **Bank Statements**: Extracts transaction dates, merchant descriptions, categorized expenses, debits, credits, and running balances.
  - **Invoices & Receipts**: Itemizes deliverables, hourly rates/unit prices, tax deductions, and calculates line totals.
  - **Lease Abstracts**: Summarizes key legal covenants, commencement dates, base rents, security deposits, CAM fees, and section references.
- **AI & Deterministic Parsing**:
  - Direct integration with Google Gemini Flash (`gemini-1.5-flash`) structured JSON output.
  - Robust 100% offline deterministic regex fallback parser for zero-latency execution without API keys.
  - Bring-Your-Own-Key (BYOK) custom Gemini API key support stored locally in client memory.
- **Export Capabilities**:
  - 1-Click **RFC 4180 compliant CSV** with UTF-8 BOM encoding for native Microsoft Excel compatibility.
  - 1-Click **Microsoft Excel (.XLS)** spreadsheet export.
  - **Copy to Clipboard (TSV)** for direct paste into Google Sheets & Microsoft 365.
  - **JSON Export** for developers and API pipelines.
- **Monetization & Paywall**:
  - Local browser credit tracking (2 Free Data Conversions).
  - Stripe mock checkout router with dynamic coupon discounting (`LAUNCH50`, `EARLYBIRD`).
  - Pro tier unlock ($19/mo or $99 lifetime) with interactive payment simulation, license key activation, and celebration confetti.
- **Minimalist Aesthetic**:
  - Crisp typography-driven interface with generous whitespace, subtle zinc borders, and zero clutter.
  - Live in-table cell editing, row search filtering, and row deletion.

---

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
To enable server-side Gemini 1.5 Flash parsing:
```bash
export GEMINI_API_KEY="your-google-gemini-api-key"
```
*(DocToSheet AI functions with full fidelity in Offline Deterministic Engine mode even without an API key).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Test Suite
```bash
npm test
```

### 5. Production Build
```bash
npm run build
npm start
```

---

## 📁 Architecture Overview

```
doctosheet-ai/
├── app/
│   ├── api/
│   │   ├── parse/route.ts        # Gemini AI & fallback parsing endpoint
│   │   └── checkout/route.ts     # Stripe checkout session simulation
│   ├── layout.tsx                # App metadata and global styles
│   └── page.tsx                  # Single-screen dashboard UI
├── components/
│   ├── Header.tsx                # Minimalist header with live credits pill & Pro badge
│   ├── DocumentTypeSelector.tsx  # Flat schema selector [Bank, Invoice, Lease]
│   ├── InputZone.tsx             # File dropzone, paste box, sample presets
│   ├── PreviewTable.tsx          # Responsive editable data grid with live filter
│   ├── ExportToolbar.tsx         # CSV / Excel / TSV / JSON export buttons
│   ├── StatCards.tsx             # Record count, net amount, and engine stats
│   ├── PaywallModal.tsx          # $19/mo Pro paywall & Stripe checkout router
│   └── SettingsModal.tsx         # BYOK Gemini key & quota reset developer tools
├── lib/
│   ├── types.ts                  # TypeScript models & schemas
│   ├── gemini.ts                 # Gemini 1.5 Flash structured parser
│   ├── fallbackParser.ts         # High-precision offline regex fallback parser
│   ├── exportUtils.ts            # RFC 4180 CSV, TSV & Excel XML builders
│   ├── quota.ts                  # Local storage credit management & Pro state
│   └── samples.ts                # Realistic test datasets (Bank, Invoice, Lease)
└── tests/
    ├── verify-parsers.test.js    # Unit tests for CSV escaping & TSV format
    └── run-all-tests.js          # E2E test runner for parsers and pricing logic
```

---

## 📜 License
MIT License. Built for solo founders and micro-SaaS developers.
