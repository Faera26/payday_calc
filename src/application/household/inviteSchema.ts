import { z } from "zod";

export const inviteSchema = z.object({
  email: z.string().email("Введите корректный email"),
});

export type InviteFormValues = z.infer<typeof inviteSchema>;
