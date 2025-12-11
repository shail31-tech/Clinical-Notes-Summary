// src/common/llm.ts

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

export interface IcdCode {
  code: string;
  description: string;
  confidence: number;
}

export interface LlmNoteSummary {
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  assessment?: string;
  plan?: string;
  medications?: string[];
  allergies?: string[];
  icdCodes?: IcdCode[];
}

/**
 * Naive fallback summarizer if the Bedrock call fails.
 * 'reason' helps us debug why the fallback was used.
 */
function fallbackSummary(rawText: string, reason: string): LlmNoteSummary {
  const firstLine = rawText.split("\n")[0]?.slice(0, 200) ?? "";
  return {
    chiefComplaint: firstLine || "See full note in rawText.",
    historyOfPresentIllness: rawText.slice(0, 600),
    assessment: `LLM summary unavailable (${reason}). Using fallback summary.`,
    plan: "Review note manually and update the plan as needed.",
    medications: [],
    allergies: [],
    icdCodes: [
      {
        code: "R69",
        description: "Unknown and unspecified causes of morbidity",
        confidence: 0.1,
      },
    ],
  };
}

// Use region from Lambda env; default to us-east-1
const REGION = process.env.AWS_REGION || "us-east-1";

// Mixtral 8x7B Instruct on Bedrock
const BEDROCK_MODEL_ID =
  process.env.BEDROCK_MODEL_ID || "mistral.mixtral-8x7b-instruct-v0:1";

const bedrockClient = new BedrockRuntimeClient({ region: REGION });

/**
 * Call Amazon Bedrock (Mixtral 8x7B instruct) to summarize a clinical note
 * and extract structured information + ICD-10 codes.
 */
export async function summarizeClinicalNote(
  rawText: string
): Promise<LlmNoteSummary> {
  console.log("Invoking Bedrock model:", BEDROCK_MODEL_ID, "in", REGION);

  const systemPrompt = `
You are a clinical documentation assistant.

TASK:
Given a raw clinical note, you must:
1. Extract a concise chief complaint (1–2 sentences).
2. Summarize the history of present illness (3–6 sentences, focused on timeline, key symptoms, and risk factors).
3. Provide a brief assessment (1–3 sentences).
4. Provide a brief plan (bullet-style in plain text, but still as one string).
5. Extract medication names as a string array.
6. Extract allergy names as a string array.
7. Infer likely ICD-10-CM codes (up to 5) with a short description and confidence between 0 and 1.

OUTPUT FORMAT:
Return ONLY valid JSON with this exact shape:

{
  "chiefComplaint": string,
  "historyOfPresentIllness": string,
  "assessment": string,
  "plan": string,
  "medications": string[],
  "allergies": string[],
  "icdCodes": [
    {
      "code": string,
      "description": string,
      "confidence": number
    }
  ]
}

RULES:
- Do NOT include any text before or after the JSON.
- If you are unsure about a field, use a best-effort guess based on the note.
- If no medications or allergies are documented, use an empty array [] for that field.
- Use real ICD-10-CM codes where possible; if truly unsure, use a generic code like "R69".
`;

  // Mistral instruct models like prompts in [INST] ... [/INST] format
  const mistralPrompt = `<s>[INST]
${systemPrompt}

CLINICAL NOTE:
${rawText}
[/INST]</s>`;

  const body = JSON.stringify({
    prompt: mistralPrompt,
    max_tokens: 800,
    temperature: 0.2,
    top_p: 0.9,
  });

  try {
    const command = new InvokeModelCommand({
      modelId: BEDROCK_MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: new TextEncoder().encode(body),
    });

    const response = await bedrockClient.send(command);

    const decoded = new TextDecoder("utf-8").decode(response.body);

    // Bedrock Mistral response shape is typically:
    // { "outputs": [ { "text": "..." } ] }
    let rawTextOutput: string | undefined;

    try {
      const parsed = JSON.parse(decoded) as any;
      if (parsed && Array.isArray(parsed.outputs) && parsed.outputs[0]?.text) {
        rawTextOutput = parsed.outputs[0].text as string;
      } else if (typeof parsed === "string") {
        rawTextOutput = parsed;
      } else {
        console.error(
          "Unexpected Bedrock response shape:",
          decoded.slice(0, 500)
        );
        return fallbackSummary(rawText, "unexpected Bedrock response shape");
      }
    } catch (err) {
      console.error("Failed to parse Bedrock JSON envelope:", err, decoded);
      return fallbackSummary(rawText, "Bedrock envelope parse error");
    }

    // Extract JSON object from model output
    const firstBrace = rawTextOutput.indexOf("{");
    const lastBrace = rawTextOutput.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      console.error(
        "Could not find JSON object in Bedrock output:",
        rawTextOutput.slice(0, 300)
      );
      return fallbackSummary(rawText, "no JSON object in Bedrock output");
    }

    const jsonSlice = rawTextOutput.slice(firstBrace, lastBrace + 1);

    try {
      const parsed = JSON.parse(jsonSlice);

      const result: LlmNoteSummary = {
        chiefComplaint: parsed.chiefComplaint ?? "",
        historyOfPresentIllness: parsed.historyOfPresentIllness ?? "",
        assessment: parsed.assessment ?? "",
        plan: parsed.plan ?? "",
        medications: Array.isArray(parsed.medications)
          ? parsed.medications
          : [],
        allergies: Array.isArray(parsed.allergies) ? parsed.allergies : [],
        icdCodes: Array.isArray(parsed.icdCodes) ? parsed.icdCodes : [],
      };

      return result;
    } catch (err) {
      console.error(
        "Failed to parse JSON from Bedrock output:",
        err,
        jsonSlice.slice(0, 300)
      );
      return fallbackSummary(rawText, "JSON parse error from Bedrock output");
    }
  } catch (err) {
    console.error("Bedrock InvokeModel failed, using fallback summary:", err);
    return fallbackSummary(rawText, "Bedrock InvokeModel error");
  }
}
