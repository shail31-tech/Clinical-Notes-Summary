// backend/src/common/response.ts
import type { APIGatewayProxyResult } from "aws-lambda";

export function jsonResponse(
  statusCode: number,
  body: unknown
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*", // later restrict
    },
    body: JSON.stringify(body),
  };
}

export function errorResponse(
  statusCode: number,
  message: string
): APIGatewayProxyResult {
  return jsonResponse(statusCode, { error: message });
}
