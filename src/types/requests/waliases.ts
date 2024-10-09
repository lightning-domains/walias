import { z } from "zod";

export const WaliasCreateSchema = z.object({
  pubkey: z
    .string()
    .refine((value) => /^[a-f0-9]{64}$/i.test(value), {
      message: "Invalid pubkey: must be a 32-byte hex string",
    }),
});

export const WaliasUpdateSchema = z.object({
  pubkey: z
    .string()
    .refine((value) => /^[a-f0-9]{64}$/i.test(value), {
      message: "Invalid pubkey: must be a 32-byte hex string",
    }),
});

export type WaliasCreateBody = z.infer<typeof WaliasCreateSchema>;
export type WaliasUpdateBody = z.infer<typeof WaliasUpdateSchema>;
