const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const PRIMARY_MODEL = "gpt-4o";
const FALLBACK_MODEL = "gpt-4o-mini";

interface StructuredCompletionParams {
  systemPrompt: string;
  userPrompt: string;
  schemaName: string;
  schema: Record<string, unknown>;
}

interface OpenAiChatCompletionResponse {
  choices: { message: { content: string | null } }[];
}

async function requestCompletion(
  model: string,
  { systemPrompt, userPrompt, schemaName, schema }: StructuredCompletionParams,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: schemaName, strict: true, schema },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const data = (await response.json()) as OpenAiChatCompletionResponse;
  const content = data.choices[0]?.message.content;
  if (!content) {
    throw new Error("OpenAI response did not include content");
  }

  return content;
}

export async function createStructuredCompletion(
  params: StructuredCompletionParams,
): Promise<unknown> {
  let content: string;
  try {
    content = await requestCompletion(PRIMARY_MODEL, params);
  } catch {
    content = await requestCompletion(FALLBACK_MODEL, params);
  }

  return JSON.parse(content);
}
