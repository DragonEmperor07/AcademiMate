"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Wand2 } from "lucide-react";
import { getSuggestions } from "@/lib/actions";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const suggestionsSchema = z.object({
  freePeriodDetails: z.string().min(10, "Please provide some details about your free period."),
});

type SuggestionsFormValues = z.infer<typeof suggestionsSchema>;

export default function SuggestionsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const form = useForm<SuggestionsFormValues>({
    resolver: zodResolver(suggestionsSchema),
    defaultValues: {
      freePeriodDetails: "I have a 90-minute free period between my Math and Physics classes.",
    },
  });

  async function onSubmit(data: SuggestionsFormValues) {
    setLoading(true);
    setResult("");
    try {
      const response = await getSuggestions({
        // These values would typically come from the user's profile
        studentInterests: "Programming, AI, Space Exploration",
        studentStrengths: "Problem-solving, Creative Thinking, Mathematics",
        studentCareerGoals: "Software Engineer at a top tech company, focusing on AI development.",
        freePeriodDetails: data.freePeriodDetails,
      });
      setResult(response.taskSuggestions);
    } catch (error) {
      console.error(error);
      setResult("Sorry, we couldn't generate suggestions at this time. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Personalized Task Suggestions"
        description="Make the most of your free time with AI-powered recommendations."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Generate Suggestions</CardTitle>
              <CardDescription>
                Tell us about your free period, and we'll suggest some productive tasks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="freePeriodDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Free Period Details</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 60 minutes before lunch" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Generate
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="min-h-[300px]">
            <CardHeader>
              <CardTitle>Your Suggested Tasks</CardTitle>
              <CardDescription>Here are some ideas based on your profile and free time.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {result && (
                <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-bullets:marker:text-primary">
                  {result.split('\n').map((line, index) => {
                     if (line.startsWith('* ')) {
                        return <p key={index} className="ml-4">{line}</p>;
                     }
                     return <p key={index}>{line}</p>;
                  })}
                </div>
              )}
              {!loading && !result && (
                 <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                    <Wand2 className="h-10 w-10 mb-2"/>
                    <p>Your task suggestions will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
