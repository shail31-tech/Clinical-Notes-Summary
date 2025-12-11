# Clinical Notes Summarization & ICD-10 Coding Assistant (AWS + LLM + React)

Live demo: **https://main.dyeexqtnav08a.amplifyapp.com**

This project is an end-to-end **clinical NLP system** built on **AWS** that:

- Ingests **raw clinical notes** (e.g., progress notes, ED notes)
- Stores them in a **serverless data store** (Amazon DynamoDB)
- Calls an **LLM (Amazon Bedrock – Mixtral 8x7B)** to:
  - Generate a **structured clinical summary**
  - Suggest **ICD-10 diagnosis codes** with confidence scores
- Exposes everything through a **React + TypeScript UI** where users can:
  - Upload notes
  - View structured summaries (CC, HPI, Assessment, Plan)
  - Review ICD-10 suggestions
  - Browse previously processed notes

It’s designed as a realistic **portfolio-grade project** for healthcare data science / ML roles.

---

## 1. High-Level Architecture

### User Flow (Current Implementation)

1. User opens the **React + Vite frontend** (hosted on **AWS Amplify**).
2. User pastes or uploads a clinical note and clicks **Upload**.
3. The frontend calls a **Serverless backend API** (AWS API Gateway + Lambda).
4. The backend:
   - Stores the note in **DynamoDB** (`clinical-notes-table`)
   - Calls **Amazon Bedrock** (Mixtral 8x7B instruct) with a carefully engineered prompt
   - Parses the model’s JSON output into:
     - `chiefComplaint`
     - `historyOfPresentIllness`
     - `assessment`
     - `plan`
     - `medications[]`
     - `allergies[]`
     - `icdCodes[]` (code, description, confidence)
   - Updates the DynamoDB item with the LLM output and marks status `COMPLETED`
5. The frontend **Dashboard** lists all notes from DynamoDB and shows their status.
6. Clicking a note opens the **Note Detail** view with:
   - Structured summary fields
   - ICD-10 suggestions in a table

### Current Core AWS Services

- **AWS Amplify Hosting** – Static hosting + CI/CD for the React app  
- **Amazon API Gateway (HTTP API)** – Public HTTPS endpoints (`/notes`)  
- **AWS Lambda** – `uploadNote`, `listNotes`, `getNote` functions (Node.js + TypeScript)  
- **Amazon DynamoDB** – Serverless NoSQL store for notes + summaries  
- **Amazon Bedrock** – LLM inference (Mistral Mixtral 8x7B instruct) for summarization + coding  

### Planned / Future Extensions (Nice Talking Points)

These are **not yet implemented** but are natural next steps:

- **S3** for raw note storage and longer-term archival  
- **PHI redaction / masking** either in-Lambda or via a small ETL job  
- **AWS Glue** jobs for batch cleaning, analytics, and offline enrichment  
- **Amazon OpenSearch** for full-text search across historical notes  
- **Amazon Cognito / Amplify Auth** for user authentication & role-based access  

You can mention these in interviews explicitly as *future roadmap items*.

---

## 2. Tech Stack

### Frontend

- **React** + **TypeScript**
- **Vite** for fast dev and build
- **Tailwind CSS** for styling
- **React Router** for navigation
- Hosted on **AWS Amplify** (GitHub-connected CI/CD)

### Backend

- **Node.js** + **TypeScript**
- **AWS Lambda** handlers:
  - `uploadNote` – POST `/notes`
  - `listNotes` – GET `/notes`
  - `getNote` – GET `/notes/{noteId}`
- **Serverless Framework** for infrastructure-as-code:
  - API Gateway routes
  - Lambda functions
  - DynamoDB table
  - Bedrock IAM permissions

### LLM / NLP

- **Amazon Bedrock**:
  - Model: `mistral.mixtral-8x7b-instruct-v0:1`
- Prompt engineering for:
  - SOAP-like summary (CC, HPI, Assessment, Plan)
  - Medication & allergy extraction
  - ICD-10 code inference with confidence scores
- Robust JSON parsing with **fallback** logic if the model output is malformed

---

## 3. Features

- **Clinical note upload** via web UI
- **Serverless ingestion pipeline** to DynamoDB
- **Automatic summarization** into structured fields:
  - Chief complaint
  - History of present illness
  - Assessment
  - Plan
- **ICD-10 code suggestions**:
  - Code, description, confidence
- **Status tracking**: `PENDING` → `COMPLETED`
- **Dashboard** of historical notes
- **Note detail view** with full structured summary

---

## 4. Repository Structure (Actual Project)

```text
Clinical-Notes-Summary/
├─ README.md
├─ .gitignore
│
├─ backend/                    # Lambda + Serverless backend
│  ├─ package.json
│  ├─ package-lock.json
│  ├─ tsconfig.json
│  ├─ serverless.yml           # API GW + Lambdas + DynamoDB + IAM
│  └─ src/
│     ├─ common/
│     │  ├─ dynamoStore.ts     # DynamoDB CRUD helpers
│     │  ├─ llm.ts             # Bedrock Mixtral 8x7B integration
│     │  ├─ logger.ts          # Simple logging helper
│     │  └─ response.ts        # API Gateway response helpers
│     ├─ handlers/
│     │  ├─ uploadNote.ts      # POST /notes
│     │  ├─ listNotes.ts       # GET /notes
│     │  └─ getNote.ts         # GET /notes/{noteId}
│     └─ models/
│        └─ note.ts            # Note / summary TypeScript types
│
└─ frontend/                   # React + Vite + Tailwind frontend
   ├─ package.json
   ├─ package-lock.json
   ├─ tsconfig.json
   ├─ tsconfig.app.json
   ├─ tsconfig.node.json
   ├─ vite.config.ts
   ├─ postcss.config.js
   ├─ tailwind.config.js
   ├─ index.html
   └─ src/
      ├─ main.tsx              # App entry point
      ├─ App.tsx               # Routes + layout shell
      ├─ index.css             # Tailwind entry
      ├─ App.css
      ├─ api/
      │  └─ notes.ts           # listNotes, getNote, uploadNote -> API Gateway
      ├─ components/
      │  ├─ layout/
      │  │  └─ Navbar.tsx
      │  ├─ notes/
      │  │  ├─ NoteSummaryCard.tsx
      │  │  └─ CodeSuggestionTable.tsx
      │  └─ upload/
      │     └─ NoteUploadForm.tsx
      ├─ pages/
      │  ├─ DashboardPage.tsx
      │  ├─ NoteDetailPage.tsx
      │  └─ UploadPage.tsx
      └─ types/
         └─ index.ts           # NoteSummary, ICDCode types
