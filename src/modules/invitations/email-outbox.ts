import {
  createCipheriv,
  createDecipheriv,
  hkdfSync,
  randomBytes,
} from "node:crypto";

import { z } from "zod";

import type { JsonObject } from "../../db/schema";
import type { InvitationEmail } from "./email";

export const WORKSPACE_INVITATION_DELIVERY_EVENT =
  "invitation.workspace-member.deliver";
export const CLIENT_INVITATION_DELIVERY_EVENT =
  "invitation.client-member.deliver";

export type InvitationDeliveryEventType =
  | typeof WORKSPACE_INVITATION_DELIVERY_EVENT
  | typeof CLIENT_INVITATION_DELIVERY_EVENT;

const protectedPayloadSchema = z.object({
  version: z.literal(1),
  algorithm: z.literal("aes-256-gcm"),
  iv: z.string().min(1),
  ciphertext: z.string().min(1),
  authenticationTag: z.string().min(1),
});

const invitationEmailSchema = z.object({
  to: z.string().email(),
  url: z.string().url(),
});

const encryptionSalt = Buffer.from("studioflow:invitation-message:v1", "utf8");

function encryptionKey(
  secret: string,
  eventType: InvitationDeliveryEventType,
): Buffer {
  return Buffer.from(
    hkdfSync(
      "sha256",
      secret,
      encryptionSalt,
      Buffer.from(eventType, "utf8"),
      32,
    ),
  );
}

export function protectInvitationDelivery(
  message: InvitationEmail,
  secret: string,
  eventType: InvitationDeliveryEventType,
): JsonObject {
  const validated = invitationEmailSchema.parse({
    to: message.to.trim().toLowerCase(),
    url: message.url,
  });
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    "aes-256-gcm",
    encryptionKey(secret, eventType),
    iv,
  );
  cipher.setAAD(Buffer.from(eventType, "utf8"));

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

export function revealInvitationDelivery(
  payload: JsonObject,
  secret: string,
  eventType: InvitationDeliveryEventType,
): InvitationEmail {
  try {
    const protectedPayload = protectedPayloadSchema.parse(payload);
    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(secret, eventType),
      Buffer.from(protectedPayload.iv, "base64url"),
    );
    decipher.setAAD(Buffer.from(eventType, "utf8"));
    decipher.setAuthTag(
      Buffer.from(protectedPayload.authenticationTag, "base64url"),
    );

    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(protectedPayload.ciphertext, "base64url")),
      decipher.final(),
    ]).toString("utf8");

    return invitationEmailSchema.parse(JSON.parse(plaintext));
  } catch {
    throw new Error("Protected invitation message could not be opened.");
  }
}
