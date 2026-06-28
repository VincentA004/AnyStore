import type { HttpRequest, HttpResponseInit } from '@azure/functions';

export async function readJson<T>(request: HttpRequest): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error('Invalid JSON body.');
  }
}

export function jsonResponse(body: unknown, status = 200): HttpResponseInit {
  return {
    status,
    jsonBody: body,
    headers: {
      'Content-Type': 'application/json',
    },
  };
}
