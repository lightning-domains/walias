import { z } from "zod";

export const WalletCreateSchema = z.object({
  id: z.string().optional(),
  lastEventId: z.string().optional(),
  config: z.string(),
  provider: z.string(),
  waliasId: z.string(),
  priority: z.number().optional(),
});

export const WalletUpdateSchema = z.object({
  lastEventId: z.string().optional(),
  config: z.string().optional(),
  provider: z.string().optional(),
  priority: z.number().optional(),
});

export type WalletCreateBody = z.infer<typeof WalletCreateSchema>;
export type WalletUpdateBody = z.infer<typeof WalletUpdateSchema>;
