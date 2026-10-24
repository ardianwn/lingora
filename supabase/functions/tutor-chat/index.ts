import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { generateTutorResponse } from '../_shared/nvidia.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

type RequestBody = {
  request_id?: string;
  messages?: Array<{
    role?: string;
    content?: string;
  }>;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Authentication required.' }, 401);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authorization } } },
  );
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: 'Authentication failed.' }, 401);
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return jsonResponse({ error: 'Request body must be valid JSON.' }, 400);
  }

  const messages = body.messages;
  const requestId = body.request_id;
  if (
    typeof requestId !== 'string' ||
    requestId.length < 16 ||
    requestId.length > 100 ||
    !Array.isArray(messages) ||
    messages.length < 1 ||
    messages.length > 20 ||
    messages.some(
      (message) =>
        !message ||
        !['user', 'assistant'].includes(message.role ?? '') ||
        typeof message.content !== 'string' ||
        message.content.length < 1 ||
        message.content.length > 4_000,
    )
  ) {
    return jsonResponse({ error: 'Messages are invalid or exceed the request limits.' }, 400);
  }

  const dailyLimit = Number.parseInt(Deno.env.get('NVIDIA_DAILY_REQUEST_LIMIT') ?? '20', 10);
  if (!Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 1000) {
    console.error('NVIDIA_DAILY_REQUEST_LIMIT is invalid.');
    return jsonResponse({ error: 'Tutor service is not configured.' }, 503);
  }

  const { data: reserved, error: reserveError } = await supabase.rpc('reserve_ai_usage', {
    p_provider: 'nvidia',
    p_model: Deno.env.get('NVIDIA_MODEL') ?? 'configured-model',
    p_request_id: requestId,
    p_daily_limit: dailyLimit,
  });

  if (reserveError) {
    console.error('tutor-chat usage reservation failed', { userId: user.id });
    return jsonResponse({ error: 'Tutor service is temporarily unavailable.' }, 503);
  }

  if (!reserved) {
    return jsonResponse({ error: 'Daily free tutor limit reached or request already used.' }, 429);
  }

  try {
    const tutorResponse = await generateTutorResponse(
      [
        {
          role: 'system',
          content:
            'You are a supportive English tutor. Return only valid JSON matching the tutor response contract. Ask one main question per turn. Never invent scores.',
        },
        ...messages.map((message) => ({
          role: message.role as 'user' | 'assistant',
          content: message.content as string,
        })),
      ],
    );

    await supabase
      .from('ai_usage_logs')
      .update({ request_status: 'succeeded' })
      .eq('user_id', user.id)
      .eq('request_id', requestId);

    return jsonResponse({ provider: 'nvidia', response: tutorResponse });
  } catch (error) {
    console.error('tutor-chat provider failure', {
      userId: user.id,
      message: error instanceof Error ? error.message : 'unknown',
    });
    await supabase
      .from('ai_usage_logs')
      .update({ request_status: 'failed' })
      .eq('user_id', user.id)
      .eq('request_id', requestId);
    return jsonResponse({ error: 'Tutor service is temporarily unavailable.' }, 502);
  }
});
