'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a personalized daily routine for students.
 *
 * The routine combines the student's class schedule with free time activities aligned with their long-term goals.
 *
 * @exports {
 *   generatePersonalizedDailyRoutine: (input: GeneratePersonalizedDailyRoutineInput) => Promise<GeneratePersonalizedDailyRoutineOutput>;
 *   GeneratePersonalizedDailyRoutineInput: z.infer<typeof GeneratePersonalizedDailyRoutineInputSchema>;
 *   GeneratePersonalizedDailyRoutineOutput: z.infer<typeof GeneratePersonalizedDailyRoutineOutputSchema>;
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedDailyRoutineInputSchema = z.object({
  classSchedule: z
    .string()
    .describe("The student's class schedule for the day, including times and subjects."),
  freeTimeAvailable: z
    .string()
    .describe('The amount of free time the student has available during the day.'),
  studentInterests: z.string().describe("The student's interests, e.g., 'programming', 'sports', 'music'."),
  studentStrengths: z.string().describe("The student's strengths, e.g., 'problem-solving', 'communication', 'leadership'."),
  careerGoals: z.string().describe("The student's long-term career goals, e.g., 'software engineer', 'doctor', 'artist'."),
});

export type GeneratePersonalizedDailyRoutineInput = z.infer<typeof GeneratePersonalizedDailyRoutineInputSchema>;

const GeneratePersonalizedDailyRoutineOutputSchema = z.object({
  dailyRoutine: z.string().describe('A personalized daily routine for the student.'),
});

export type GeneratePersonalizedDailyRoutineOutput = z.infer<typeof GeneratePersonalizedDailyRoutineOutputSchema>;

export async function generatePersonalizedDailyRoutine(
  input: GeneratePersonalizedDailyRoutineInput
): Promise<GeneratePersonalizedDailyRoutineOutput> {
  return personalizedDailyRoutineFlow(input);
}

const personalizedDailyRoutinePrompt = ai.definePrompt({
  name: 'personalizedDailyRoutinePrompt',
  input: {schema: GeneratePersonalizedDailyRoutineInputSchema},
  output: {schema: GeneratePersonalizedDailyRoutineOutputSchema},
  prompt: `You are an AI assistant designed to create personalized daily routines for students.

  Given the student's class schedule, free time, interests, strengths, and career goals, generate a daily routine that effectively balances academic and personal pursuits.

  Class Schedule: {{{classSchedule}}}
  Free Time Available: {{{freeTimeAvailable}}}
  Student Interests: {{{studentInterests}}}
  Student Strengths: {{{studentStrengths}}}
  Career Goals: {{{careerGoals}}}

  Daily Routine:
  `,
});

const personalizedDailyRoutineFlow = ai.defineFlow(
  {
    name: 'personalizedDailyRoutineFlow',
    inputSchema: GeneratePersonalizedDailyRoutineInputSchema,
    outputSchema: GeneratePersonalizedDailyRoutineOutputSchema,
  },
  async input => {
    const {output} = await personalizedDailyRoutinePrompt(input);
    return output!;
  }
);
