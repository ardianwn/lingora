export type TutorCorrection = {
  original_text: string;
  corrected_text: string;
  error_type: string;
  explanation_id: string;
};

export type TutorResponse = {
  reply: string;
  corrections: TutorCorrection[];
  vocabulary_suggestions: string[];
  follow_up_question: string;
  session_complete: boolean;
};

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type NvidiaChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const MAX_INPUT_CHARS = 12_000;
const MAX_OUTPUT_TOKENS = 700;
const REQUEST_TIMEOUT_MS = 20_000;
const MAX_RETRIES = 1;

function parseTutorResponse(content: string): TutorResponse {
  const parsed: unknown = JSON.parse(content);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('NVIDIA response is not an object.');
  }

  const value = parsed as Record<string, unknown>;
  if (
    typeof value.reply !== 'string' ||
    typeof value.follow_up_question !== 'string' ||
    typeof value.session_complete !== 'boolean' ||
    !Array.isArray(value.corrections) ||
    !Array.isArray(value.vocabulary_suggestions)
  ) {
    throw new Error('NVIDIA response does not match the tutor contract.');
  }

  const corrections = value.corrections.filter(
    (correction): correction is TutorCorrection =>
      typeof correction === 'object' &&
      correction !== null &&
      typeof (correction as Record<string, unknown>).original_text === 'string' &&
      typeof (correction as Record<string, unknown>).corrected_text === 'string' &&
      typeof (correction as Record<string, unknown>).error_type === 'string' &&
      typeof (correction as Record<string, unknown>).explanation_id === 'string',
  );

  const vocabularySuggestions = value.vocabulary_suggestions.filter(
    (suggestion): suggestion is string => typeof suggestion === 'string',
  );

  return {
    reply: value.reply.slice(0, MAX_INPUT_CHARS),
    corrections,
    vocabulary_suggestions: vocabularySuggestions.slice(0, 10),
    follow_up_question: value.follow_up_question.slice(0, 500),
    session_complete: value.session_complete,
  };
}

function isRetryable(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

export async function generateTutorResponse(
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<TutorResponse> {
  const apiKey = Deno.env.get('NVIDIA_API_KEY');
  const model = Deno.env.get('NVIDIA_MODEL');
  const baseUrl = Deno.env.get('NVIDIA_BASE_URL') ?? 'https://integrate.api.nvidia.com/v1';

  if (!apiKey || !model) {
    throw new Error('NVIDIA provider is not configured on the server.');
  }

  const totalInputLength = messages.reduce((total, message) => total + message.content.length, 0);
  if (totalInputLength > MAX_INPUT_CHARS) {
    throw new Error('Tutor input exceeds the configured limit.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  signal?.addEventListener('abort', () => controller.abort(), { once: true });

  try {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.4,
          max_tokens: MAX_OUTPUT_TOKENS,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      if (response.ok) {
        const payload = (await response.json()) as NvidiaChatResponse;
        const content = payload.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('NVIDIA response did not contain message content.');
        }
        return parseTutorResponse(content);
      }

      if (!isRetryable(response.status) || attempt === MAX_RETRIES) {
        throw new Error(`NVIDIA request failed with status ${response.status}.`);
      }
    }
  } finally {
    clearTimeout(timeout);
  }

  throw new Error('NVIDIA request did not complete.');
}
