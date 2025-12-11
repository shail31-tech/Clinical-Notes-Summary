import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.NOTES_TABLE!;

export interface NoteRecord {
  noteId: string;
  title: string;
  rawText: string;
  status: string;
  createdAt: string;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  assessment?: string;
  plan?: string;
  medications?: string[];
  allergies?: string[];
  icdCodes?: { code: string; description: string; confidence: number }[];
}

/**
 * Create a note in DynamoDB. If noteId is missing, it will be generated.
 */
export async function createNote(note: Omit<NoteRecord, "noteId"> & Partial<Pick<NoteRecord, "noteId">>) {
  const noteId = note.noteId ?? uuidv4();

  const item: NoteRecord = {
    ...note,
    noteId,
  } as NoteRecord;

  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );

  return item;
}

export async function listNotes() {
  const res = await ddb.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );
  return res.Items ?? [];
}

export async function getNote(noteId: string) {
  const res = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { noteId },
    })
  );
  return res.Item;
}
