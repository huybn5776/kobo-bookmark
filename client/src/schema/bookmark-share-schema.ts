import { z } from 'zod';

import { koboBookSchema } from '@/schema/kobo-book-schema';

export const bookmarkShareSchema = z.object({
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  books: z.array(koboBookSchema),
  createdAt: z.string().pipe(z.coerce.date()),
});
