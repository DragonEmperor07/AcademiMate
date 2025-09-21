"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import { getClasses, subscribe } from "@/lib/class-data";

const getStatusVariant = (status: string) => {
  switch (status) {
    case "Completed":
      return "secondary";
    case "In Progress":
      return "default";
    case "Upcoming":
      return "outline";
    default:
      return "outline";
  }
};

export default function ClassesPage() {
  const [classes, setClasses] = useState(getClasses());

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setClasses([...getClasses()]);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Today's Classes"
        description="Here is your schedule for the day."
      />
      <div className="space-y-6">
        {classes.map((classItem, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-xl">{classItem.subject}</CardTitle>
                <p className="text-sm text-muted-foreground">{classItem.code} - {classItem.instructor}</p>
              </div>
               <Badge variant={getStatusVariant(classItem.status)}>
                {classItem.status}
              </Badge>
            </CardHeader>
            <CardContent className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4"/>
                    <span>{classItem.time}</span>
                </div>
                 <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4"/>
                    <span>Room {classItem.room}</span>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
