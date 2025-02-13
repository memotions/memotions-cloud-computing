import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { journalFeedbacks, journals } from '../db/schema/journals.schema';
import { EmotionAnalysisSchema } from './emotions.types';

const SelectJournalSchema = createSelectSchema(journals);
const InsertJournalSchema = createInsertSchema(journals);

export const JournalFeedbackSchema = createSelectSchema(journalFeedbacks).omit({
  id: true,
  journalId: true,
});

export const JournalSchema = SelectJournalSchema.extend({
  tags: z.array(z.string()).nullable(),
  emotionAnalysis: z
    .array(EmotionAnalysisSchema.pick({ emotion: true, confidence: true }))
    .nullable(),
  feedback: z.string().nullable(),
}).omit({
  userId: true,
});

export const AddJournalSchema = InsertJournalSchema.extend({
  datetime: z
    .string()
    .datetime()
    .optional()
    .transform(val => (val ? new Date(val) : undefined)),
  tags: z
    .array(
      z.string().transform(val =>
        val
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
      ),
    )
    .refine(tags => new Set(tags).size === tags.length, {
      message: 'Tags must be unique',
    })
    .optional(),
}).omit({
  userId: true,
  createdAt: true,
});

export const UpdateJournalSchema = AddJournalSchema.partial();

export const QueryJournalSchema = z.object({
  id: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : undefined))
    .refine(val => !val || !Number.isNaN(val)),
  emotions: z
    .string()
    .optional()
    .transform(val => val?.split(','))
    .refine(val => !val || new Set(val).size === val.length, {
      message: 'Emotions must be unique',
    }),
  tags: z
    .string()
    .optional()
    .transform(val => val?.split(','))
    .refine(val => !val || new Set(val).size === val.length, {
      message: 'Tags must be unique',
    }),
  createdAt: z
    .string()
    .datetime()
    .optional()
    .transform(val => {
      if (!val) return undefined;

      if (val.includes('T')) {
        return new Date(val);
      }

      const dateOnly = new Date(val);
      dateOnly.setHours(0, 0, 0, 0);
      return dateOnly;
    })
    .or(z.string().includes('today')),
  datetime: z
    .string()
    .datetime()
    .optional()
    .transform(val => {
      if (!val) return undefined;

      if (val.includes('T')) {
        return new Date(val);
      }

      const dateOnly = new Date(val);
      dateOnly.setHours(0, 0, 0, 0);
      return dateOnly;
    }),
  startDate: z
    .string()
    .date()
    .optional()
    .transform(val => {
      if (!val) return undefined;

      if (val.includes('T')) {
        return new Date(val);
      }

      const dateOnly = new Date(val);
      dateOnly.setHours(0, 0, 0, 0);
      return dateOnly;
    }),
  endDate: z
    .string()
    .date()
    .optional()
    .transform(val => {
      if (!val) return undefined;

      if (val.includes('T')) {
        return new Date(val);
      }

      const dateOnly = new Date(val);
      dateOnly.setHours(23, 59, 59, 999);
      return dateOnly;
    }),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : undefined))
    .refine(val => !val || !Number.isNaN(val)),
  title: z.string().optional(),
  search: z.string().optional(),
  starred: z
    .string()
    .optional()
    .transform(val => val?.toLowerCase() === 'true' || undefined),
  archived: z
    .string()
    .optional()
    .transform(val => val?.toLowerCase() === 'true' || undefined),
});

export const AddJournalFeedbackSchema = createInsertSchema(
  journalFeedbacks,
).omit({
  journalId: true,
});

export type Journal = z.infer<typeof JournalSchema>;
export type AddJournal = z.infer<typeof AddJournalSchema>;
export type UpdateJournal = z.infer<typeof UpdateJournalSchema>;
export type QueryJournal = z.infer<typeof QueryJournalSchema>;

export type JournalFeedback = z.infer<typeof JournalFeedbackSchema>;
export type AddJournalFeedback = z.infer<typeof AddJournalFeedbackSchema>;
