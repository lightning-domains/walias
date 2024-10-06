import { z } from "zod";

export const WaliasRegisterSchema = z.object({
  pubkey: z.string(),
});

export const WaliasUpdateSchema = z.object({
  pubkey: z.string(),
});

export type WaliasRegisterBody = z.infer<typeof WaliasRegisterSchema>;
export type WaliasUpdateBody = z.infer<typeof WaliasUpdateSchema>;
