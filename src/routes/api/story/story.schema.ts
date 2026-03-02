import { z } from 'zod';
import { sessionIdSchema, commonRequestFields } from '../../../schemas/common.schema.js';

export const StoryEndSchema = z
  .object({
    session_id: sessionIdSchema,
    mst_node_id: z.number().int(),
    mst_note_content_id: z.number().int(),
    mst_ocean_id: z.number().int(),
    mst_part_id: z.number().int(),
    mst_story_id: z.number().int(),
    ...commonRequestFields,
  })
  .strict();

export type StoryEndInput = z.infer<typeof StoryEndSchema>;
