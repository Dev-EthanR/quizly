import { z } from "zod";

export const DASHBOARD_LIST_PAGE_SIZE = 10;

export const listGamesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});

export type ListGamesQuery = z.infer<typeof listGamesQuerySchema>;
