"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
  interests: z.string().min(3, "Please list at least one interest."),
  strengths: z.string().min(3, "Please list at least one strength."),
  careerGoals: z.string().min(3, "Please list at least one career goal."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileFormValues>({
    interests: "Programming, AI, Space Exploration",
    strengths: "Problem-solving, Creative Thinking, Mathematics",
    careerGoals: "Software Engineer at a top tech company, focusing on AI development.",
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileData,
    mode: "onChange",
  });

  function onSubmit(data: ProfileFormValues) {
    setProfileData(data);
    toast({
      title: "Profile Updated!",
      description: "Your information has been saved successfully.",
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Profile"
        description="Manage your personal information and preferences."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
           <Card>
            <CardHeader className="items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="https://picsum.photos/seed/1/200/200" data-ai-hint="student avatar"/>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">Jane Doe</CardTitle>
              <CardDescription>Student ID: S010</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm">
                <p><span className="font-semibold">Email:</span> jane.doe@university.edu</p>
                <p><span className="font-semibold">Major:</span> Computer Science</p>
                <p><span className="font-semibold">Year:</span> 3rd Year</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Update Your Preferences</CardTitle>
              <CardDescription>
                This information helps us personalize your academic suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Interests</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Programming, Sports, Music" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="strengths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Strengths</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Problem-solving, Communication" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="careerGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Long-term Career Goals</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Become a Software Engineer"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
