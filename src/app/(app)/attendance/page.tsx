import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const attendanceData = [
  { name: "Liam Johnson", id: "S001", status: "Present" },
  { name: "Olivia Smith", id: "S002", status: "Present" },
  { name: "Noah Williams", id: "S003", status: "Absent" },
  { name: "Emma Brown", id: "S004", status: "Present" },
  { name: "Oliver Jones", id: "S005", status: "Present" },
  { name: "Ava Garcia", id: "S006", status: "Present" },
  { name: "Elijah Miller", id: "S007", status: "Absent" },
  { name: "Charlotte Davis", id: "S008", status: "Present" },
  { name: "James Rodriguez", id: "S009", status: "Present" },
  { name: "Sophia Martinez", id: "S010", status: "Present" },
];

export default function AttendancePage() {
  const presentCount = attendanceData.filter(s => s.status === 'Present').length;
  const totalCount = attendanceData.length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Class Attendance"
        description="Real-time attendance for 'Grade 10 - Advanced Mathematics'"
      />
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{presentCount} / {totalCount}</div>
            <p className="text-sm text-muted-foreground">Students Present</p>
          </CardContent>
        </Card>
         <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Class Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium text-muted-foreground">Time:</span> 10:00 AM - 11:00 AM</div>
            <div><span className="font-medium text-muted-foreground">Room:</span> 301</div>
            <div><span className="font-medium text-muted-foreground">Instructor:</span> Dr. Alan Grant</div>
            <div><span className="font-medium text-muted-foreground">Subject Code:</span> MTH-302</div>
          </CardContent>
        </Card>
      </div>
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
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceData.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.id}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        student.status === "Present" ? "default" : "destructive"
                      }
                      className={student.status === "Present" ? "bg-green-500/80 text-white" : "bg-red-500/80"}
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
