export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const [
      { getServerEnvironment },
      { parseApplicationDatabaseEnvironment },
      { parseAuthenticationEnvironment, parseAuthenticationMessageEnvironment },
    ] = await Promise.all([
      import("./server/env"),
      import("./db/config"),
      import("./modules/auth/environment"),
    ]);

    getServerEnvironment();
    parseApplicationDatabaseEnvironment(process.env);
    parseAuthenticationEnvironment(process.env);
    parseAuthenticationMessageEnvironment(process.env);
  }
}
