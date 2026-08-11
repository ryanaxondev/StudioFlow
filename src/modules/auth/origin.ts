export function hasTrustedAuthenticationOrigin(
  headers: Headers,
  authenticationBaseUrl: string,
): boolean {
  const origin = headers.get("origin");
  if (!origin) {
    return false;
  }

  try {
    return new URL(origin).origin === new URL(authenticationBaseUrl).origin;
  } catch {
    return false;
  }
}
