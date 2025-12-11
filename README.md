# Clinical Notes Summarization & ICD-10 Coding Assistant (AWS + LLM + React)

https://main.dyeexqtnav08a.amplifyapp.com

This project is an end-to-end **clinical NLP system** built on **AWS** that:

- Ingests **raw clinical notes** (e.g., progress notes, discharge summaries)
- Runs a **data engineering pipeline** to clean and lightly de-identify (mask PHI) the text
- Calls an **LLM (AWS Bedrock)** to:
  - Generate a **structured clinical summary**
  - Suggest **ICD-10 diagnosis codes** with rationales
- Exposes everything through a **React + TypeScript UI** where users can:
  - Upload notes
  - View structured summaries
  - Review ICD-10 suggestions
  - Search previously processed notes

> ⚠️ This project is for **educational / portfolio** purposes and not production-grade for real PHI or HIPAA workloads.

---

## 1. High-Level Architecture

**User Flow**

1. User logs in via **Cognito/Amplify Auth**.
2. User uploads or pastes a clinical note through the **React UI**.
3. Backend stores the raw note in **S3** and metadata in **DynamoDB**.
4. A **data pipeline** (Glue / Lambda) cleans and masks PHI in the note.
5. A **Lambda** calls **AWS Bedrock** with the cleaned note:
   - Returns a structured summary (JSON).
   - Returns ICD-10 code candidates (code, description, confidence, rationale).
6. Processed results are saved back to DynamoDB (and/or S3).
7. The UI shows:
   - Original (masked) text
   - Structured summary (HPI, Assessment, Plan, Meds, etc.)
   - ICD-10 table with confidence scores + rationale.
8. Optional: Notes and summaries are indexed in **OpenSearch** for search.

**Core AWS Services**

- **S3** – Raw and cleaned notes
- **AWS Glue** – Data cleaning & PHI masking jobs (ETL)
- **AWS Lambda** – API handlers + LLM processing
- **API Gateway** – HTTPS API for the frontend
- **AWS Bedrock** – LLM for summarization & ICD-10 coding
- **DynamoDB** – Metadata + summaries + ICD-10 results
- **Cognito / Amplify Auth** – Authentication
- **OpenSearch (optional)** – Full-text and semantic search

---

## 2. Tech Stack

**Frontend**

- React + TypeScript
- Vite (or Create React App)
- AWS Amplify (hosting + auth integration)
- Axios / Fetch for API calls

**Backend**

- Node.js + TypeScript
- AWS Lambda (API + async processing)
- API Gateway (REST)
- AWS Bedrock SDK (for LLM inference)

**Data Engineering**

- AWS Glue (PySpark ETL scripts)
- S3 as data lake
- Simple PHI masking with regex & transformations

**Infrastructure as Code**

- AWS CDK (TypeScript) or Serverless Framework
- GitHub Actions for CI (lint, build, basic tests)

---

## 3. Repository Structure

```text
clinical-notes-llm-assistant/
├─ README.md
├─ LICENSE
├─ .gitignore
├─ .env.example
├─ package.json                # Root-level scripts (lint, format, etc.)
├─ tsconfig.base.json
├─ docs/
│  ├─ architecture-overview.md
│  ├─ api-design.md
│  ├─ data-pipeline-design.md
│  ├─ llm-prompt-design.md
│  ├─ ui-ux-wireframes.md
│  └─ demo-script.md
│
├─ infra/                      # IaC – AWS CDK or Serverless
│  ├─ cdk.json
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ bin/
│  │  └─ clinical-notes-llm-assistant.ts
│  └─ lib/
│     ├─ networking-stack.ts
│     ├─ storage-stack.ts        # S3, DynamoDB, OpenSearch, KMS
│     ├─ auth-stack.ts           # Cognito user pool / identity pool
│     ├─ api-stack.ts            # API Gateway + Lambdas
│     ├─ bedrock-stack.ts        # Bedrock permissions/config
│     └─ glue-stack.ts           # Glue jobs, crawlers, IAM roles
│
├─ frontend/                   # React + TypeScript UI
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ vite.config.ts
│  ├─ public/
│  └─ src/
│     ├─ main.tsx
│     ├─ App.tsx
│     ├─ api/
│     │  ├─ client.ts           # Axios/fetch wrapper
│     │  ├─ notes.ts            # uploadNote, getNote, listNotes, searchNotes
│     │  └─ auth.ts
│     ├─ components/
│     │  ├─ layout/
│     │  │  ├─ Navbar.tsx
│     │  │  └─ Sidebar.tsx
│     │  ├─ upload/
│     │  │  └─ NoteUploadForm.tsx
│     │  ├─ notes/
│     │  │  ├─ NoteSummaryCard.tsx
│     │  │  └─ CodeSuggestionTable.tsx
│     │  └─ search/
│     │     └─ NoteSearchBar.tsx
│     ├─ pages/
│     │  ├─ DashboardPage.tsx
│     │  ├─ NoteDetailPage.tsx
│     │  └─ SettingsPage.tsx
│     ├─ hooks/
│     │  └─ useNotes.ts
│     ├─ context/
│     │  └─ AuthContext.tsx
│     ├─ styles/
│     │  └─ global.css
│     └─ types/
│        └─ index.ts            # Note, Summary, ICDCode, User types
│
├─ backend/                    # Lambdas + backend logic
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ src/
│  │  ├─ common/
│  │  │  ├─ logger.ts
│  │  │  ├─ response.ts         # API Gateway response helpers
│  │  │  ├─ validation.ts       # zod / yup schemas
│  │  │  └─ bedrock-client.ts   # Bedrock call wrapper
│  │  ├─ models/
│  │  │  ├─ note.ts             # Dynamo/S3 utilities
│  │  │  └─ icd-code.ts
│  │  ├─ handlers/
│  │  │  ├─ uploadNote.ts       # POST /notes
│  │  │  ├─ getNote.ts          # GET /notes/{id}
│  │  │  ├─ listNotes.ts        # GET /notes
│  │  │  ├─ searchNotes.ts      # GET /notes/search
│  │  │  ├─ processNoteLLM.ts   # async LLM processing (SQS/EventBridge)
│  │  │  └─ healthCheck.ts
│  │  └─ prompts/
│  │     ├─ summarize-note.prompt.txt
│  │     └─ icd10-coding.prompt.txt
│  └─ serverless.yml            # Optional, if using Serverless instead of CDK
│
├─ data-pipeline/              # Glue / ETL
│  ├─ glue-scripts/
│  │  ├─ clean_and_mask_notes.py
│  │  ├─ generate_embeddings.py   # optional, for search
│  │  └─ schema_inference.py
│  ├─ jobs/
│  │  ├─ glue-job-clean-notes.md
│  │  └─ glue-job-embeddings.md
│  ├─ sample-data/
│  │  ├─ raw_notes/
│  │  │  └─ sample_note_01.json
│  │  └─ cleaned_notes/
│  │     └─ sample_note_01_cleaned.json
│  └─ notebooks/
│     ├─ exploration-notes.ipynb
│     └─ icd-code-analysis.ipynb
│
├─ scripts/                    # Local helper scripts
│  ├─ deploy-all.sh
│  ├─ deploy-frontend.sh
│  ├─ deploy-infra.sh
│  └─ seed-sample-data.ts
│
└─ .github/
   └─ workflows/
      ├─ ci-frontend.yml
      ├─ ci-backend.yml
      └─ ci-infra.yml
