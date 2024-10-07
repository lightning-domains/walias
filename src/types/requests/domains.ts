import { z } from "zod";

export const DomainRegisterSchema = z.object({
  relays: z.array(z.string().url()).min(1),
});

export const DomainUpdateSchema = z.object({
  relays: z.array(z.string().url()).optional(),
  adminPubkey: z
    .string()
    .regex(/^[a-f0-9]{64}$/i, "Admin public key must be a 32 bytes hex string")
    .optional(),
  rootPrivkey: z
    .string()
    .regex(/^[a-f0-9]{64}$/i, "Root private key must be a 32 bytes hex string")
    .optional(),
});

export type DomainRegisterBody = z.infer<typeof DomainRegisterSchema>;
export type DomainUpdateBody = DomainRegisterBody;
