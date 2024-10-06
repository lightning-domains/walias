import { z } from "zod";

export const WaliasRegisterSchema = z.object({
  pubkey: z.string(),
});

export const WaliasTransferSchema = z.object({
  pubkey: z.string(),
});

export type WaliasRegisterBody = z.infer<typeof WaliasRegisterSchema>;
export type WaliasTransferBody = z.infer<typeof WaliasTransferSchema>;
