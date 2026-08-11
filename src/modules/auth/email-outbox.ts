import {
  createCipheriv,
  createDecipheriv,
  hkdfSync,
  randomBytes,
} from "node:crypto";

import { eq } from "drizzle-orm";
import { z } from "zod";

import type { DatabaseClient } from "../../db/client";
import { insertOutboxEvent } from "../../db/repositories/outbox";
import { users, type JsonObject } from "../../db/schema";
import { withTransaction } from "../../db/transactions";
import type { AuthenticationMessageEnvironment } from "./environment";
import type { AuthenticationEmailSender, MagicLinkEmail } from "./email";

export const AUTHENTICATION_MAGIC_LINK_DELIVERY_EVENT =
  "authentication.magic-link.deliver";

const protectedPayloadSchema = z.object({
  version: z.literal(1),
  algorithm: z.literal("aes-256-gcm"),
  iv: z.string().min(1),
  ciphertext: z.string().min(1),
  authenticationTag: z.string().min(1),
});

const magicLinkEmailSchema = z.object({
  to: z.string().email(),
  url: z.string().url(),
});

const encryptionSalt = Buffer.from(
  "studioflow:authentication-message:v1",
  "utf8",
);
const encryptionInfo = Buffer.from(
  AUTHENTICATION_MAGIC_LINK_DELIVERY_EVENT,
  "utf8",
);
const additionalAuthenticatedData = Buffer.from(
  AUTHENTICATION_MAGIC_LINK_DELIVERY_EVENT,
  "utf8",
);

function encryptionKey(secret: string): Buffer {
  return Buffer.from(
    hkdfSync("sha256", secret, encryptionSalt, encryptionInfo, 32),
  );
}

export function protectAuthenticationMagicLink(
  message: MagicLinkEmail,
  secret: string,
): JsonObject {
  const validated = magicLinkEmailSchema.parse({
    to: message.to.trim().toLowerCase(),
    url: message.url,
  });
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(secret), iv);
  cipher.setAAD(additionalAuthenticatedData);

  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(validated), "utf8"),
    cipher.final(),
  ]);

  return {
    version: 1,
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
    authenticationTag: cipher.getAuthTag().toString("base64url"),
  };
}

export function revealAuthenticationMagicLink(
  payload: JsonObject,
  secret: string,
): MagicLinkEmail {
  try {
    const protectedPayload = protectedPayloadSchema.parse(payload);
    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(secret),
      Buffer.from(protectedPayload.iv, "base64url"),
    );
    decipher.setAAD(additionalAuthenticatedData);
    decipher.setAuthTag(
      Buffer.from(protectedPayload.authenticationTag, "base64url"),
    );

    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(protectedPayload.ciphertext, "base64url")),
      decipher.final(),
    ]).toString("utf8");

    return magicLinkEmailSchema.parse(JSON.parse(plaintext));
  } catch {
    throw new Error("Protected authentication message could not be opened.");
  }
}

export function createQueuedAuthenticationEmailSender(
  database: DatabaseClient,
  environment: AuthenticationMessageEnvironment,
): AuthenticationEmailSender {
  return {
    async sendMagicLink(message) {
      const normalizedEmail = message.to.trim().toLowerCase();

      await withTransaction(database, async ({ db }) => {
        const [user] = await db
          .select({
            id: users.id,
            disabledAt: users.disabledAt,
          })
          .from(users)
          .where(eq(users.email, normalizedEmail))
          .limit(1);

        if (!user || user.disabledAt) {
          throw new Error(
            "Authentication email recipient is not eligible for delivery.",
          );
        }

        await insertOutboxEvent(db, {
          aggregateType: "user",
          aggregateId: user.id,
          eventType: AUTHENTICATION_MAGIC_LINK_DELIVERY_EVENT,
          payload: protectAuthenticationMagicLink(
            { to: normalizedEmail, url: message.url },
            environment.AUTH_MESSAGE_ENCRYPTION_SECRET,
          ),
        });
      });
    },
  };
}
