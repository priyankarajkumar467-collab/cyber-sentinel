# CYBER SENTINEL

### Intelligent Cyber Threat & Network Anomaly Detection

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8.svg)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57.svg)](https://www.sqlite.org/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-yellow.svg)](https://www.python.org/)

**CYBER SENTINEL** is a real-time, explainable cybersecurity sentinel based on the hackathon challenge:
> *“Intelligent Cyber Threat and Network Anomaly Detection — Build a Real-Time Cybersecurity Sentinel Using Behavioral Anomaly Detection, Threat Classification, Explainable Evidence, and Risk-Based Policy Guardrails.”*

The system ingests network packet flow and telemetry, computes behavioral deviations, identifies unsupervised statistical outliers via **Isolation Forest**, classifies threat categories using **Random Forest**, synthesizes a deterministic $0$–$100$ risk score, formulates plain-language human-understandable evidence, and enforces security policy guardrails.

---

## 📌 Key Features

* **Real-Time Security Overview**: Instant assessment of network health within 5 seconds without cognitive overload.
* **Unsupervised Behavioral Anomaly Detection**: Built-in **Isolation Forest** calculating recursive isolation path lengths $c(n)$ to flag multi-dimensional anomalies without requiring pre-labeled data.
* **Supervised Threat Classification**: Multi-class **Random Forest** classifying traffic across 5 core categories:
  * 🟢 `Normal` (Benign baseline)
  * 🔴 `Port Scan` (Reconnaissance, high port diversity)
  * 🟡 `Brute Force` (Repeated authentication attempts)
  * 🔴 `Lateral Movement` (Internal subnet traversal, SMB/RPC)
  * 🔴 `Data Exfiltration` (High-volume outbound egress)
* **Deterministic 0–100 Risk Engine**:
  $$\text{Risk Score} = w_{\text{anomaly}} \cdot \text{AnomalySignal} + w_{\text{class}} \cdot \text{ClassifierConfidence} + w_{\text{evidence}} \cdot \text{EvidenceFactor}$$
  Mapped to:
  * $0$–$30$: **Normal** (🟢)
  * $31$–$70$: **Suspicious** (🟡)
  * $71$–$100$: **Malicious** (🔴)
* **Explainable Evidence (XAI)**: Generates human-readable bullet points and an AI explanation summary (*e.g., "The source contacted a large number of ports within a short period. This behavior is consistent with port scanning."*), plus an optional technical drilldown.
* **Autonomous Security Policy Guardrails**: Configurable maximum risk threshold (default: $70$) triggering clear breach alerts and recommended analyst reviews without performing dangerous disruptive changes.
* **Durable SQLite Incident Ledger**: Persists all detections and audit telemetry into `data/sentinel.sqlite`.
* **▶ Interactive Hackathon Demo Runner**: One-click simulation of 4 realistic attack scenarios with animated 6-stage pipeline tracing.
* **Direct GitHub Integration**: In-app **Push to GitHub** integration allowing one-click export of full project source files directly into a new or existing GitHub repository.

---

## 🏗️ Architecture & Technology Stack

```text
[ Raw Telemetry ] ──> [ Feature Engineering ] ──> [ Isolation Forest ]
                                              ├──> [ Threat Classifier ]
                                                          │
                                                          ▼
[ Guardrail Alert ] <── [ SQLite Ledger ] <── [ Risk Engine & Evidence Generator ]
```

### Frontend
* **React 19** & **TypeScript**
* **Vite 8**
* **Tailwind CSS 4**
* **Lucide Icons** & **Motion**

### Backend & ML Pipeline
* **Node.js (v20+) / Express**: Full-stack API server mounting Vite in development or serving static builds.
* **Python 3.10+ & FastAPI**: Standalone reference microservice located in `backend/main.py`.
* **Isolation Forest**: Unsupervised binary tree isolation ensemble.
* **Random Forest**: Supervised multi-class decision ensemble.
* **SQLite Database**: Native durable relational ledger via `node:sqlite` (`data/sentinel.sqlite`).

---

## 📂 Project Structure

```text
cyber-sentinel/
├── src/                                  # Frontend UI (React + TypeScript + Tailwind)
│   ├── components/
│   │   ├── Navbar.tsx                   # Sentinel header & real-time monitoring status
│   │   ├── SummaryCards.tsx             # 4 key metric cards (Events, Threats, Risk, Status)
│   │   ├── RiskBar.tsx                  # 0-100 Horizontal risk indicator
│   │   ├── AlertsTable.tsx              # Live threat alerts with severity badges
│   │   ├── ThreatDetailPanel.tsx        # Explainable evidence & AI reasoning modal
│   │   ├── ThreatCategories.tsx         # 5 problem statement threat categories
│   │   ├── BehaviorAnalysis.tsx         # Real-time behavioral telemetry metrics
│   │   ├── DetectionPipeline.tsx        # 6-stage visual pipeline status
│   │   ├── PolicyGuardrail.tsx          # Risk threshold & breach management
│   │   ├── DemoRunner.tsx               # Interactive hackathon demo runner
│   │   ├── TelemetryUploader.tsx        # CSV / JSON ingestion & sample data
│   │   └── GitHubModal.tsx              # In-app GitHub export dialog
│   ├── pages/
│   │   ├── DashboardPage.tsx            # Main Security Overview
│   │   ├── AlertsPage.tsx               # Full audit log & triage filters
│   │   ├── AnalyzePage.tsx              # Ingestion & live scenario testing
│   │   └── AboutPage.tsx                # How Cyber Sentinel works (7 steps)
│   ├── services/
│   │   └── api.ts                       # Frontend API client
│   ├── types/
│   │   └── sentinel.ts                  # TypeScript definitions
│   └── App.tsx
│
├── backend/                              # Machine Learning & Backend Services
│   ├── database/
│   │   └── db.ts                        # SQLite database using node:sqlite
│   ├── feature_engineering/
│   │   └── features.ts                  # Port diversity, rate, failed auth, egress
│   ├── detection/
│   │   └── isolation_forest.ts          # Isolation Forest unsupervised anomaly model
│   ├── models/
│   │   └── threat_classifier.ts         # Random Forest 5-class threat classifier
│   ├── services/
│   │   ├── risk_engine.ts               # Deterministic 0-100 risk scoring
│   │   ├── evidence_generator.ts        # Human-readable evidence & AI explanations
│   │   ├── github_service.ts            # GitHub REST API exporter & Git tree builder
│   │   └── pipeline.ts                  # End-to-end security pipeline coordinator
│   └── main.py                          # FastAPI reference implementation
│
├── data/
│   └── demo_telemetry.csv               # Synthetic network capture dataset
│
├── server.ts                            # Full-stack Express server with Vite middleware
├── requirements.txt                     # Python dependencies
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
├── .env.example
└── README.md
```

---

## ⚡ Getting Started (Local Setup)

### Prerequisites
* **Node.js**: v20 or v22+
* **npm** or **bun** / **yarn**
* *(Optional)* **Python**: 3.10+ (only if running the FastAPI reference backend)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/cyber-sentinel.git
cd cyber-sentinel
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
*(No external API keys are required for the core detection pipeline; all ML models run deterministically locally).*

### 4. Run the Full-Stack Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser. The dev server runs Express on port `3000` with the complete API and Vite frontend hot-reloading.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🐍 Running the Standalone Python Backend (Optional)

If you prefer to run the standalone Python FastAPI service:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python backend/main.py
```
The FastAPI documentation will be available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & system status |
| `GET` | `/api/statistics` | Dashboard telemetry statistics & aggregates |
| `GET` | `/api/alerts` | Paginated list of recent threat alerts |
| `GET` | `/api/alerts/:id` | Detailed evidence and technical metrics for an alert |
| `PATCH` | `/api/alerts/:id/status` | Update alert triage status (`New`, `Reviewed`, `Resolved`) |
| `GET` | `/api/policy` | Retrieve current security policy risk threshold |
| `POST` | `/api/policy` | Update guardrail maximum allowed risk score |
| `POST` | `/api/analyze` | Ingest and process telemetry event(s) through the pipeline |
| `POST` | `/api/demo/run` | Execute one of the 4 hackathon attack scenarios |
| `POST` | `/api/reset` | Reset SQLite audit database to baseline demo state |
| `GET` | `/api/github/preview` | Preview files to be committed to GitHub |
| `POST` | `/api/github/push` | Push project repository directly to GitHub |

---

## 🧪 Hackathon Demo Scenarios

Click **▶ Run Demo** in the top navigation or navigate to the **Analyze** tab to run any of the 4 scenarios:

1. **Scenario 1 — Normal Traffic**: Standard HTTPS sessions to internal server; Risk score: **18/100** (`Normal`).
2. **Scenario 2 — Port Scan**: Rapid SYN packets probing 42 distinct destination ports; Risk score: **82/100** (`Malicious`).
3. **Scenario 3 — Brute Force**: 37 repeated failed authentications on SSH port 22; Risk score: **76/100** (`Malicious`).
4. **Scenario 4 — Data Exfiltration**: 850 MB outbound transfer to unfamiliar external address; Risk score: **91/100** (`Malicious`).

---

## 🔒 Security & Privacy

* GitHub Personal Access Tokens (PAT) entered in the export UI are utilized strictly in-memory over HTTPS to create the repository commit and are **never logged, persisted to disk, or stored in any database**.
* The `.gitignore` file strictly blocks `.env*`, `data/*.sqlite`, `node_modules`, and cache files from ever being committed to GitHub.

---

## 📜 License

Licensed under the [Apache License, Version 2.0](LICENSE).
