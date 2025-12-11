// backend/src/common/store.ts
import type { NoteSummary } from "../models/note";
import { v4 as uuidv4 } from "uuid";

let NOTES: NoteSummary[] = [];

const DEMO_USER = "demo-user"; // later replace with Cognito user id

export function createNote(title: string): NoteSummary {
  const note: NoteSummary = {
    noteId: uuidv4(),
    userId: DEMO_USER,
    createdAt: new Date().toISOString(),
    title,
    status: "PENDING",
  };
  NOTES = [note, ...NOTES];
  return note;
}

export function listNotes(): NoteSummary[] {
  return NOTES.filter((n) => n.userId === DEMO_USER);
}

export function getNote(noteId: string): NoteSummary | undefined {
  return NOTES.find((n) => n.noteId === noteId && n.userId === DEMO_USER);
}
