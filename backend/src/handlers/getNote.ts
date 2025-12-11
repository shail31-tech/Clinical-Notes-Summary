import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getNote as get } from "../common/dynamoStore";
import { jsonResponse, errorResponse } from "../common/response";

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const noteId = event.pathParameters?.noteId;
    if (!noteId) {
      return errorResponse(400, "Missing noteId");
    }

    const note = await get(noteId);
    if (!note) {
      return errorResponse(404, "Note not found");
    }

    return jsonResponse(200, note);
  } catch (err) {
    console.error(err);
    return errorResponse(500, "Failed to get note");
  }
}
