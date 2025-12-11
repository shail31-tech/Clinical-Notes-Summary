import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { listNotes as list } from "../common/dynamoStore";
import { jsonResponse, errorResponse } from "../common/response";

export async function handler(
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const items = await list();
    return jsonResponse(200, { items });
  } catch (err) {
    console.error(err);
    return errorResponse(500, "Failed to list notes");
  }
}
