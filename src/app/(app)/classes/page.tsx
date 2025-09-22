"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, PlusCircle, Trash2 } from "lucide-react";
import { getClasses, subscribe, updateClassStatuses, addClass, removeClass } from "@/lib/class-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));
const meridiems = ["AM", "PM"];

export default function ClassesPage() {
  const [classes, setClasses] = useState(getClasses());
  const [userRole, setUserRole] = useState<string | null>(null);

  const [newClassSubject, setNewClassSubject] = useState("");
  const [newClassCode, setNewClassCode] = useState("");
  const [newClassRoom, setNewClassRoom] = useState("");
  const [newClassInstructor, setNewClassInstructor] = useState("");

  // State for new class time components
  const [startHour, setStartHour] = useState("");
  const [startMinute, setStartMinute] = useState("");
  const [startMeridiem, setStartMeridiem] = useState("");
  const [endHour, setEndHour] = useState("");
  const [endMinute, setEndMinute] = useState("");
  const [endMeridiem, setEndMeridiem] = useState("");


  useEffect(() => {
    const role = localStorage.getItem("loggedInUserRole");
    setUserRole(role);
  }, []);

  useEffect(() => {
    updateClassStatuses();
    setClasses([...getClasses()]);
    
    const unsubscribe = subscribe(() => {
      setClasses([...getClasses()]);
    });

    const intervalId = setInterval(() => {
        updateClassStatuses();
        setClasses([...getClasses()]);
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  const resetForm = () => {
    setNewClassSubject("");
    setNewClassCode("");
    setNewClassRoom("");
    setNewClassInstructor("");
    setStartHour("");
    setStartMinute("");
    setStartMeridiem("");
    setEndHour("");
    setEndMinute("");
    setEndMeridiem("");
  }

  const handleAddClass = () => {
    const startTime = `${startHour}:${startMinute} ${startMeridiem}`;
    const endTime = `${endHour}:${endMinute} ${endMeridiem}`;
    
    if (newClassSubject && newClassCode && startHour && startMinute && startMeridiem && endHour && endMinute && endMeridiem && newClassRoom && newClassInstructor) {
      addClass({
        subject: newClassSubject,
        code: newClassCode,
        time: `${startTime} - ${endTime}`,
        room: newClassRoom,
        instructor: newClassInstructor,
        status: "Upcoming",
      });
      resetForm();
    }
  };

  const handleRemoveClass = (classCode: string) => {
    removeClass(classCode);
  };
  
  const isStaff = userRole === 'staff';

  return (
    <div className="space-y-8">
      <PageHeader
        title="Today's Classes"
        description="Here is your schedule for the day."
      >
        {isStaff && (
           <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add a New Class</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject" className="text-right">
                    Subject
                  </Label>
                  <Input id="subject" value={newClassSubject} onChange={(e) => setNewClassSubject(e.target.value)} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">
                    Code
                  </Label>
                  <Input id="code" value={newClassCode} onChange={(e) => setNewClassCode(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                    Start Time
                  </Label>
                  <div className="col-span-3 grid grid-cols-3 gap-2">
                     <Select value={startHour} onValueChange={setStartHour}>
                        <SelectTrigger><SelectValue placeholder="Hour" /></SelectTrigger>
                        <SelectContent>
                          {hours.map(h => <SelectItem key={`start-h-${h}`} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={startMinute} onValueChange={setStartMinute}>
                        <SelectTrigger><SelectValue placeholder="Min" /></SelectTrigger>
                        <SelectContent>
                          {minutes.map(m => <SelectItem key={`start-m-${m}`} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={startMeridiem} onValueChange={setStartMeridiem}>
                        <SelectTrigger><SelectValue placeholder="AM/PM" /></SelectTrigger>
                        <SelectContent>
                          {meridiems.map(m => <SelectItem key={`start-p-${m}`} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                  </div>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                    End Time
                  </Label>
                   <div className="col-span-3 grid grid-cols-3 gap-2">
                     <Select value={endHour} onValueChange={setEndHour}>
                        <SelectTrigger><SelectValue placeholder="Hour" /></SelectTrigger>
                        <SelectContent>
                          {hours.map(h => <SelectItem key={`end-h-${h}`} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={endMinute} onValueChange={setEndMinute}>
                        <SelectTrigger><SelectValue placeholder="Min" /></SelectTrigger>
                        <SelectContent>
                          {minutes.map(m => <SelectItem key={`end-m-${m}`} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={endMeridiem} onValueChange={setEndMeridiem}>
                        <SelectTrigger><SelectValue placeholder="AM/PM" /></SelectTrigger>
                        <SelectContent>
                          {meridiems.map(m => <SelectItem key={`end-p-${m}`} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                  </div>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="room" className="text-right">
                    Room
                  </Label>
                  <Input id="room" value={newClassRoom} onChange={(e) => setNewClassRoom(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="instructor" className="text-right">
                    Instructor
                  </Label>
                  <Input id="instructor" value={newClassInstructor} onChange={(e) => setNewClassInstructor(e.target.value)} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleAddClass}>Add Class</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>
      <div className="space-y-6">
        {classes.map((classItem) => (
          <Card key={classItem.code}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-xl">{classItem.subject}</CardTitle>
                <p className="text-sm text-muted-foreground">{classItem.code} - {classItem.instructor}</p>
              </div>
               <div className="flex items-center gap-4">
                <Badge variant={getStatusVariant(classItem.status)}>
                  {classItem.status}
                </Badge>
                {isStaff && (
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveClass(classItem.code)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
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
