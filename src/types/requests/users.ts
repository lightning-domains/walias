import { z } from "zod";

export const UserUpdateSchema = z.object({
  relays: z.array(z.string().url()),
});
