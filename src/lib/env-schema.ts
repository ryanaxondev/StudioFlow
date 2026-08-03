import { z } from "zod";

export const serverEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

type EnvironmentInput = Readonly<Record<string, string | undefined>>;

export function parseServerEnvironment(
  environment: EnvironmentInput,
): ServerEnvironment {
  return serverEnvironmentSchema.parse(environment);
}
