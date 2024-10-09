import { z } from "zod";

export const WalletCreateSchema = z.object({
  id: z.string().optional(),
  lastEventId: z.string().optional(),
  config: z.record(z.unknown()),
  provider: z.string(),
  waliasId: z.string(),
  priority: z.number().optional(),
});

export const WalletUpdateSchema = z.object({
  lastEventId: z.string().optional(),
  config: z.record(z.unknown()).optional(),
  provider: z.string().optional(),
  priority: z.number().optional(),
});

export const WalletConfigSchema = z.object({
  id: z.string().optional(),
  lastEventId: z.string().optional(),
  config: z.record(z.unknown()),
  provider: z.string(),
  pubkey: z.string(),
  waliasId: z.string(),
  priority: z.number().optional(),
});

export type WalletConfig = z.infer<typeof WalletConfigSchema>;
export type WalletCreateBody = z.infer<typeof WalletCreateSchema>;
export type WalletUpdateBody = z.infer<typeof WalletUpdateSchema>;
