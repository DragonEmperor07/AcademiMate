'use server';

/**
 * @fileOverview A personalized task suggestion AI agent.
 *
 * - getPersonalizedTaskSuggestions - A function that generates personalized task suggestions.
 * - PersonalizedTaskSuggestionsInput - The input type for the getPersonalizedTaskSuggestions function.
 * - PersonalizedTaskSuggestionsOutput - The return type for the getPersonalizedTaskSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedTaskSuggestionsInputSchema = z.object({
  studentInterests: z
    .string()
    .describe('The interests of the student.'),
  studentStrengths: z.string().describe('The strengths of the student.'),
  studentCareerGoals: z.string().describe('The career goals of the student.'),
  freePeriodDetails: z
    .string()
    .describe('Details about the free period, like the duration.'),
});
export type PersonalizedTaskSuggestionsInput =
  z.infer<typeof PersonalizedTaskSuggestionsInputSchema>;

const PersonalizedTaskSuggestionsOutputSchema = z.object({
  taskSuggestions: z
    .string()
    .describe(
      'A list of personalized academic task suggestions tailored to the student.'
    ),
});
export type PersonalizedTaskSuggestionsOutput =
  z.infer<typeof PersonalizedTaskSuggestionsOutputSchema>;

export async function getPersonalizedTaskSuggestions(
  input: PersonalizedTaskSuggestionsInput
): Promise<PersonalizedTaskSuggestionsOutput> {
  return personalizedTaskSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedTaskSuggestionsPrompt',
  input: {schema: PersonalizedTaskSuggestionsInputSchema},
  output: {schema: PersonalizedTaskSuggestionsOutputSchema},
  prompt: `You are an AI assistant that provides personalized academic task suggestions to students during their free periods.

  Consider the student's interests, strengths, career goals, and the details of the free period to generate relevant and engaging task suggestions.

  Student Interests: {{{studentInterests}}}
  Student Strengths: {{{studentStrengths}}}
  Student Career Goals: {{{studentCareerGoals}}}
  Free Period Details: {{{freePeriodDetails}}}

  Please provide a list of task suggestions that the student can do during their free period to make the most of their time and improve their learning outcomes.
  Format the response as a bulleted list.
  `,
});

const personalizedTaskSuggestionsFlow = ai.defineFlow(
  {
    name: 'personalizedTaskSuggestionsFlow',
    inputSchema: PersonalizedTaskSuggestionsInputSchema,
    outputSchema: PersonalizedTaskSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
