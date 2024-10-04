import { z } from "zod";

export const DomainRegisterSchema = z.object({
  relays: z.array(z.string()),
  adminPubkey: z.string(),
  rootPrivkey: z.string().nullable().optional(),
});

export type DomainRegisterBody = z.infer<typeof DomainRegisterSchema>;
