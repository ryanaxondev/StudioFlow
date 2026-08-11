import { z } from "zod";

const localBaseUrl = "http://127.0.0.1:3000";
const localSecret = "studioflow-local-auth-secret-change-before-production";
const localMessageEncryptionSecret =
  "studioflow-local-auth-message-encryption-secret-change-before-production";
const localMailpitApiUrl = "http://127.0.0.1:8025";
const localFromAddress = "access@studioflow.local";

export const nodeEnvironmentSchema = z
  .enum(["development", "test", "production"])
  .default("development");

const authenticationEnvironmentSchema = z.object({
  NODE_ENV: nodeEnvironmentSchema,
  BETTER_AUTH_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
});

const authenticationMessageEnvironmentSchema = z.object({
  NODE_ENV: nodeEnvironmentSchema,
  AUTH_MESSAGE_ENCRYPTION_SECRET: z.string().min(32),
});

const mailpitEnvironmentSchema = z.object({
  MAILPIT_API_URL: z.string().url(),
  AUTH_EMAIL_FROM: z.string().email(),
});

export type NodeEnvironment = z.infer<typeof nodeEnvironmentSchema>;
export type AuthenticationEnvironment = z.infer<
  typeof authenticationEnvironmentSchema
>;
export type AuthenticationMessageEnvironment = z.infer<
  typeof authenticationMessageEnvironmentSchema
>;
export type MailpitEnvironment = z.infer<typeof mailpitEnvironmentSchema>;

type EnvironmentInput = Readonly<Record<string, string | undefined>>;

export function parseAuthenticationEnvironment(
  environment: EnvironmentInput,
): AuthenticationEnvironment {
  const nodeEnvironment = nodeEnvironmentSchema.parse(environment.NODE_ENV);

  return authenticationEnvironmentSchema.parse({
    NODE_ENV: nodeEnvironment,
    BETTER_AUTH_URL:
      environment.BETTER_AUTH_URL ??
      (nodeEnvironment === "production" ? undefined : localBaseUrl),
    BETTER_AUTH_SECRET:
      environment.BETTER_AUTH_SECRET ??
      (nodeEnvironment === "production" ? undefined : localSecret),
  });
}

export function parseAuthenticationMessageEnvironment(
  environment: EnvironmentInput,
): AuthenticationMessageEnvironment {
  const nodeEnvironment = nodeEnvironmentSchema.parse(environment.NODE_ENV);

  return authenticationMessageEnvironmentSchema.parse({
    NODE_ENV: nodeEnvironment,
    AUTH_MESSAGE_ENCRYPTION_SECRET:
      environment.AUTH_MESSAGE_ENCRYPTION_SECRET ??
      (nodeEnvironment === "production"
        ? undefined
        : localMessageEncryptionSecret),
  });
}

export function parseMailpitEnvironment(
  environment: EnvironmentInput,
): MailpitEnvironment {
  return mailpitEnvironmentSchema.parse({
    MAILPIT_API_URL: environment.MAILPIT_API_URL ?? localMailpitApiUrl,
    AUTH_EMAIL_FROM: environment.AUTH_EMAIL_FROM ?? localFromAddress,
  });
}
