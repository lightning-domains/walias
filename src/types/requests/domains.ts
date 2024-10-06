import { z } from "zod";

export const DomainRegisterSchema = z.object({
  relays: z.array(z.string().url()),
  adminPubkey: z.string(),
  rootPrivkey: z.string().optional(),
});

export const DomainUpdateSchema = z.object({
  relays: z.array(z.string().url()).optional(),
  adminPubkey: z.string().optional(),
  rootPrivkey: z.string().optional(),
});

export type DomainRegisterBody = z.infer<typeof DomainRegisterSchema>;
export type DomainUpdateBody = DomainRegisterBody;
