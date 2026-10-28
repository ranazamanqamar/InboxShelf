export type ErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "MISSING_CREDENTIALS"
  | "VALIDATION_ERROR"
  | "UPSTREAM_ERROR";

export function jsonError(
  status: number,
  code: ErrorCode,
  message: string,
): Response {
  return Response.json(
    { error: { code, message, requestId: crypto.randomUUID() } },
    { status },
  );
}

export function jsonOk(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}
