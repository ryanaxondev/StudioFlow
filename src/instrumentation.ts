export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const [{ getServerEnvironment }, { parseApplicationDatabaseEnvironment }] =
      await Promise.all([import("./server/env"), import("./db/config")]);

    getServerEnvironment();
    parseApplicationDatabaseEnvironment(process.env);
  }
}
