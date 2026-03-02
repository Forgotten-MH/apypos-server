import { z } from 'zod';
import { sessionIdSchema, questIdSchema, commonRequestFields } from '../../../schemas/common.schema.js';

export const TrainingListSchema = z
  .object({
    session_id: sessionIdSchema,
    ...commonRequestFields,
  })
  .loose();

export type TrainingListInput = z.infer<typeof TrainingListSchema>;

export const TrainingStartSchema = z
  .object({
    mst_quest_id: questIdSchema,
    ...commonRequestFields,
  })
  .loose();

export type TrainingStartInput = z.infer<typeof TrainingStartSchema>;

export const TrainingEndSchema = z
  .object({
    mst_quest_id: questIdSchema,
    clear_time: z.number().int(),
    session_id: sessionIdSchema,
    ...commonRequestFields,
  })
  .loose();

export type TrainingEndInput = z.infer<typeof TrainingEndSchema>;
