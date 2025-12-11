import type { NoteSummary } from "../types";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  "https://427jhpudk5.execute-api.us-east-1.amazonaws.com";

/**
 * GET /notes
 * Returns a list of note summaries from the backend (DynamoDB).
 */
export async function listNotes(): Promise<NoteSummary[]> {
  const res = await fetch(`${API_BASE}/notes`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`Failed to list notes: ${res.status}`);
  }

  const data = await res.json();

  // backend may return either an array or { items: [...] }
  const items = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];

  // Map raw backend objects into NoteSummary shape
  return items.map((n: any) => ({
    noteId: n.noteId,
    createdAt: n.createdAt,
    title: n.title,
    status: n.status ?? "PENDING",
    rawText: n.rawText,

    chiefComplaint: n.chiefComplaint,
    historyOfPresentIllness: n.historyOfPresentIllness,
    assessment: n.assessment,
    plan: n.plan,
    medications: n.medications,
    allergies: n.allergies,
    icdCodes: n.icdCodes,
  })) as NoteSummary[];
}

/**
 * GET /notes/{noteId}
 */
export async function getNote(noteId: string): Promise<NoteSummary | null> {
  const res = await fetch(`${API_BASE}/notes/${noteId}`, {
    method: "GET",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to get note: ${res.status}`);
  }

  const n = await res.json();

  const mapped: NoteSummary = {
    noteId: n.noteId,
    createdAt: n.createdAt,
    title: n.title,
    status: n.status ?? "PENDING",
    rawText: n.rawText,

    chiefComplaint: n.chiefComplaint,
    historyOfPresentIllness: n.historyOfPresentIllness,
    assessment: n.assessment,
    plan: n.plan,
    medications: n.medications,
    allergies: n.allergies,
    icdCodes: n.icdCodes,
  };

  return mapped;
}

/**
 * POST /notes
 * This keeps the same signature your UI already uses: (rawText, title)
 */
export async function uploadNote(
  rawText: string,
  title: string
): Promise<NoteSummary> {
  const res = await fetch(`${API_BASE}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, rawText }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Upload note failed:", res.status, text);
    throw new Error(`Failed to upload note: ${res.status}`);
  }

  const n = await res.json();

  const mapped: NoteSummary = {
    noteId: n.noteId,
    createdAt: n.createdAt,
    title: n.title,
    status: n.status ?? "PENDING",
    rawText: n.rawText,

    chiefComplaint: n.chiefComplaint,
    historyOfPresentIllness: n.historyOfPresentIllness,
    assessment: n.assessment,
    plan: n.plan,
    medications: n.medications,
    allergies: n.allergies,
    icdCodes: n.icdCodes,
  };

  return mapped;
}
