"use server";

import {
  getPersonalizedTaskSuggestions,
  PersonalizedTaskSuggestionsInput,
} from "@/ai/flows/personalized-task-suggestions";
import {
  generatePersonalizedDailyRoutine,
  GeneratePersonalizedDailyRoutineInput,
} from "@/ai/flows/personalized-daily-routine";

export async function getSuggestions(
  input: PersonalizedTaskSuggestionsInput
) {
  const result = await getPersonalizedTaskSuggestions(input);
  return result;
}

export async function getRoutine(
  input: GeneratePersonalizedDailyRoutineInput
) {
  const result = await generatePersonalizedDailyRoutine(input);
  return result;
}
