import { startWorker } from "./runtime/start";

startWorker().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
