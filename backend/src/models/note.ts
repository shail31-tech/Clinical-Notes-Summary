// backend/src/models/note.ts
export type NoteStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type ICDCode = {
  code: string;
  description: string;
  confidence: number; // 0–1
  rationale: string;
};

export type NoteSummary = {
  noteId: string;
  userId: string;           // later from auth; for now hardcoded
  createdAt: string;
  title: string;
  status: NoteStatus;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  assessment?: string;
  plan?: string;
  medications?: string[];
  allergies?: string[];
  icdCodes?: ICDCode[];
};
