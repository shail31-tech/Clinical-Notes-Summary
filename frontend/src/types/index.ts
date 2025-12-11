export type ICDCode = {
    code: string;
    description: string;
    confidence: number; // 0–1
    rationale: string;
  };
  
  export type NoteStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  
  export type NoteSummary = {
    noteId: string;
    createdAt: string;
    title: string;
    status: NoteStatus;
  
    // LLM summary output
    chiefComplaint?: string;
    historyOfPresentIllness?: string;
    assessment?: string;
    plan?: string;
  
    medications?: string[];
    allergies?: string[];
    icdCodes?: ICDCode[];
  
    // NEW — store user’s original note
    rawText?: string;
  };
  
  