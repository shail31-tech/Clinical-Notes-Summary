import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";

import { createNote } from "../common/dynamoStore";
import { summarizeClinicalNote } from "../common/llm";
import { jsonResponse, errorResponse } from "../common/response";

const UploadNoteSchema = z.object({
  title: z.string().min(1),
  rawText: z.string().min(1),
});

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return errorResponse(400, "Missing request body");
    }

    const parsed = UploadNoteSchema.safeParse(JSON.parse(event.body));
    if (!parsed.success) {
      return errorResponse(400, "Invalid request body");
    }

    const { title, rawText } = parsed.data;

    // 1) Call LLM to summarize note + extract ICD codes
    const llmSummary = await summarizeClinicalNote(rawText);

    // 2) Save enriched note to DynamoDB as COMPLETED
    const note = await createNote({
      title,
      rawText,
      status: "COMPLETED",
      createdAt: new Date().toISOString(),
      chiefComplaint: llmSummary.chiefComplaint,
      historyOfPresentIllness: llmSummary.historyOfPresentIllness,
      assessment: llmSummary.assessment,
      plan: llmSummary.plan,
      medications: llmSummary.medications,
      allergies: llmSummary.allergies,
      icdCodes: llmSummary.icdCodes,
    });

    // 3) Return full note record to frontend
    return jsonResponse(201, note);
  } catch (err) {
    console.error("uploadNote error", err);
    return errorResponse(500, "Internal server error");
  }
}
