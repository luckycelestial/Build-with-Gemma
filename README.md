<div align="center">

# ⚡ FinCent — AI CTO Manufacturing Operations OS

### *Autonomous AI Operations Team & Executive AI CTO for SME Precision Manufacturers*

[![Built with Gemma](https://img.shields.io/badge/Built%20With-Gemma%20AI-blueviolet?style=for-the-badge&logo=google)](https://ai.google.dev/gemma)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

---

<img src="docs/screenshots/control-room.png" alt="FinCent Executive Control Room" width="100%" />

</div>

## 🌟 Executive Summary

**FinCent** transforms SME manufacturing businesses from manual, fragmented dashboard checking into an **autonomous, self-coordinating AI Operations Team led by an Executive AI CTO**.

Rather than presenting static analytics, FinCent continuously:
* 📡 **Observes Business Events** — Inflation surges, inventory stockouts, WhatsApp supplier quotes, invoice delays.
* 🤖 **Evaluates Operating SOPs** — Dynamically matches business events to operational Standard Operating Procedures.
* ⚡ **Plans & Coordinates DAG Workflows** — Delegates execution to specialized AI Worker Managers.
* 🛡️ **Requests 1-Click Owner Approvals** — Pauses critical monetary & binding steps until the owner approves via web or WhatsApp.
* 🔨 **Executes Verified Business Tools** — Modifies Tally ERP ledgers, creates purchase orders, and dispatches supplier RFQs via 43 registered tools.
* 📊 **Reports Financial Outcomes** — Quantifies daily margin protected, stockouts prevented, and hours saved.

---

## 📸 Product Experience Gallery

### 1. Executive Control Room & Pitch Demo Simulator
*Simulate a live manufacturing business day in 120 seconds with real-time DAG progression across all worker nodes.*

![FinCent Control Room](docs/screenshots/control-room.png)

---

### 2. Onboarding Wizard
*Tailor Gemma intelligence to your exact tracking methods (Notebook, Excel spreadsheets, or Tally ERP).*

![Onboarding Setup](docs/screenshots/onboarding.png)

---

### 3. Business Operations OS Hub (`/operations`)
*Unified operational command center listing 8 active domain worker nodes, running DAG graphs, and audit trails.*

![Operations OS](docs/screenshots/operations.png)

---

### 4. Pricing & Margin Defense (`/pricing-agent`)
*Defends product gross margin corridors against raw material price spikes with automated BOM surcharge pass-through.*

![Pricing Defense](docs/screenshots/pricing_agent.png)

---

### 5. Supplier RFQ & Procurement (`/supplier-agent`)
*Automates supplier quote requests, vendor lead-time comparisons, and OCR invoice parsing.*

![Supplier Procurement](docs/screenshots/supplier-rfq.png)

---

### 6. Accounts Receivable & Collections (`/collections-agent`)
*Aging ledger analysis with automated AI collection outreach generator (Gentle / Professional / Firm tones).*

![Collections AR](docs/screenshots/collections-ar.png)

---

### 7. Revenue Intelligence & SHAP Explainability (`/revenue-intelligence`)
*Time-series XGBoost ML predictions with 8-week forecasting and SHAP feature waterfall attribution.*

![Revenue Intelligence](docs/screenshots/revenue-forecast.png)

---

### 8. Market Intelligence & Commodity News Crawler (`/market-intelligence`)
*Real-time RSS news crawler indexing Peenya cluster steel spot prices, aluminum indices, and power tariffs.*

![Market Signals](docs/screenshots/market-signals.png)

---

### 9. Customer Credit & Concentration Matrix (`/customer-intelligence`)
*Customer concentration analysis, credit policy recommendations, and payment delay risk badges.*

![Customer Intelligence](docs/screenshots/customer-intelligence.png)

---

### 10. Executive Reports Center (`/reports`)
*Automated PDF executive briefing memo generator compiling 8 operation summaries into print-ready reports.*

![Reports Center](docs/screenshots/reports-center.png)

---

### 11. AI CFO Consultation Chat (`/ask-ai-cfo`)
*Interactive financial copilot streaming responses from local Ollama (`gemma4:cloud`) models.*

![AI CFO Chat](docs/screenshots/ai-cfo-chat.png)

---

### 12. What-If Machine & Margin Simulator (`/what-if-simulator`)
*Interactive scenario sliders for raw material costs, customer order multipliers, and machine capacity utilization.*

![What-If Simulator](docs/screenshots/what-if-simulator.png)

---

### 13. Executive AI CTO Advisory Board (`/executive-advisor`)
*Strategic operational decision checklists correlated across internal sales ledgers and external market signals.*

![Executive Advisor](docs/screenshots/executive-advisor.png)

---

## 🏗️ Architecture Overview

```
                      +----------------------------------+
                      |       Business Event Stream      |
                      |  (News, Invoices, WhatsApp, ERP) |
                      +-----------------+----------------+
                                        |
                                        v
                      +-----------------+----------------+
                      |        Executive AI CTO          |
                      |   (Gemma LLM Reasoning Layer)    |
                      +-----------------+----------------+
                                        |
                                        v
                      +-----------------+----------------+
                      |     SOP Evaluation & Matcher     |
                      +-----------------+----------------+
                                        |
                                        v
                      +-----------------+----------------+
                      |     Workflow Engine (DAGs)       |
                      +-------+------------------+-------+
                              |                  |
                              v                  v
                 +------------+---+          +---+------------+
                 | Autonomous     |          | Owner Approval |
                 | Step Execution |          | Gate (1-Click) |
                 +------------+---+          +---+------------+
                              |                  |
                              +--------+---------+
                                       |
                                       v
                      +----------------+-----------------+
                      |    Capability Tool Registry      |
                      |      (43 Business Tools)         |
                      +----------------+-----------------+
                                       |
                                       v
                      +----------------+-----------------+
                      |   Tally ERP / WhatsApp / Database|
                      +----------------------------------+
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* **Node.js**: `v20.0.0+`
* **PostgreSQL**: PostgreSQL database instance running locally or hosted.
* **Ollama**: Local Ollama server running with `gemma4:cloud` or `gemma:7b`.

### 2. Environment Setup
Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/revenue_agent"
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="gemma4:cloud"
PORT=5000
```

### 3. Installation & Database Migration
```bash
# Install dependencies
npm install

# Push Prisma schema to PostgreSQL
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 4. Running the Development Server
```bash
npm run dev
```
Open **`http://localhost:5000`** in your browser.

---

## 🧪 Integration Verification

Run the comprehensive end-to-end scratchpad test suite:

```bash
npx tsx scripts/test-scratchpad-features.ts
```

This verifies:
* ✅ 43 Business Capability Tools
* ✅ 8 Business Operations & DAG Execution
* ✅ Action Center 1-Click Approvals
* ✅ 8 Domain Worker Agents
* ✅ Real-time Story Engine & 120s Startup Pitch Simulator

---

<div align="center">

**FinCent AI CTO Platform** — *Evolving SME Manufacturing from Dashboards to Autonomous AI Execution.*

</div>
