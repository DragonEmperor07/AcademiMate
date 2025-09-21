"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { students } from "@/lib/student-data";

const initialAttendanceData = students.map(({ name, id, status }) => ({
  name,
  id,
  status: status,
}));


export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState(initialAttendanceData);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentId, setNewStudentId] = useState("");

  const presentCount = attendanceData.filter(
    (s) => s.status === "Present"
  ).length;
  const totalCount = attendanceData.length;

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName && newStudentId) {
      setAttendanceData([
        ...attendanceData,
        {
          name: newStudentName,
          id: newStudentId,
          status: "Absent",
        },
      ]);
      setNewStudentName("");
      setNewStudentId("");
    }
  };

  const handleStatusChange = (studentId: string, newStatus: "Present" | "Absent") => {
    setAttendanceData(
      attendanceData.map((student) =>
        student.id === studentId ? { ...student, status: newStatus } : student
      )
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Class Attendance"
        description="Real-time attendance for 'Grade 10 - Advanced Mathematics'"
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {presentCount} / {totalCount}
            </div>
            <p className="text-sm text-muted-foreground">Students Present</p>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Class Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Time:</span>{" "}
              10:00 AM - 11:00 AM
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Room:</span>{" "}
              301
            </div>
            <div>
              <span className="font-medium text-muted-foreground">
                Instructor:
              </span>{" "}
              Dr. Alan Grant
            </div>
            <div>
              <span className="font-medium text-muted-foreground">
                Subject Code:
              </span>{" "}
              MTH-302
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Student List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceData.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>{student.id}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.status === "Present"
                              ? "default"
                              : "destructive"
                          }
                          className={
                            student.status === "Present"
                              ? "bg-green-500/80 text-white"
                              : "bg-red-500/80"
                          }
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(student.id, "Present")}
                              disabled={student.status === 'Present'}
                            >
                              Mark as Present
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(student.id, "Absent")}
                              disabled={student.status === 'Absent'}
                            >
                              Mark as Absent
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Student</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="student-name">Student Name</Label>
                  <Input
                    suppressHydrationWarning
                    id="student-name"
                    placeholder="e.g., John Doe"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-id">Student ID</Label>
                  <Input
                    suppressHydrationWarning
                    id="student-id"
                    placeholder="e.g., S011"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
