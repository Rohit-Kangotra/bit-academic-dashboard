import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useState } from "react";

const attendanceRecords = [
  { date: "05-03-2026", room: "SF 102", hour: "Hour 1", time: "08:45 – 10:30", status: "PRESENT" },
  { date: "05-03-2026", room: "SF 102", hour: "Hour 2", time: "10:40 – 12:30", status: "PRESENT" },
  { date: "05-03-2026", room: "SF 204", hour: "Hour 3", time: "01:30 – 03:10", status: "ABSENT" },
  { date: "05-03-2026", room: "SF 102", hour: "Hour 4", time: "03:25 – 04:30", status: "PRESENT" },
  { date: "04-03-2026", room: "SF 102", hour: "Hour 1", time: "08:45 – 10:30", status: "PRESENT" },
  { date: "04-03-2026", room: "SF 301", hour: "Hour 2", time: "10:40 – 12:30", status: "ABSENT" },
  { date: "04-03-2026", room: "SF 204", hour: "Hour 3", time: "01:30 – 03:10", status: "PRESENT" },
  { date: "04-03-2026", room: "SF 102", hour: "Hour 4", time: "03:25 – 04:30", status: "ABSENT" },
  { date: "03-03-2026", room: "SF 102", hour: "Hour 1", time: "08:45 – 10:30", status: "PRESENT" },
  { date: "03-03-2026", room: "SF 301", hour: "Hour 2", time: "10:40 – 12:30", status: "PRESENT" },
  { date: "03-03-2026", room: "SF 204", hour: "Hour 3", time: "01:30 – 03:10", status: "PRESENT" },
  { date: "03-03-2026", room: "SF 102", hour: "Hour 4", time: "03:25 – 04:30", status: "ABSENT" },
  { date: "02-03-2026", room: "SF 102", hour: "Hour 1", time: "08:45 – 10:30", status: "PRESENT" },
  { date: "02-03-2026", room: "SF 301", hour: "Hour 2", time: "10:40 – 12:30", status: "ABSENT" },
  { date: "02-03-2026", room: "SF 204", hour: "Hour 3", time: "01:30 – 03:10", status: "PRESENT" },
  { date: "02-03-2026", room: "SF 102", hour: "Hour 4", time: "03:25 – 04:30", status: "PRESENT" },
];

const ITEMS_PER_PAGE = 8;

const totalClasses = 44;
const present = 24;
const absent = 20;
const overallPercent = Math.round((present / totalClasses) * 100);

export default function Attendance() {
  const [page, setPage] = useState(1);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = attendanceRecords.filter((r) => {
    if (filterDate && !r.date.includes(filterDate)) return false;
    if (filterStatus !== "all" && r.status !== filterStatus.toUpperCase()) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Attendance</h1>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 glass-card text-center">
            <p className="text-3xl font-bold text-primary">{overallPercent}%</p>
            <p className="text-sm font-medium">Overall Attendance</p>
          </Card>
          <Card className="p-4 glass-card text-center">
            <p className="text-3xl font-bold">{totalClasses}</p>
            <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
          </Card>
          <Card className="p-4 glass-card text-center">
            <p className="text-3xl font-bold text-success">{present}</p>
            <p className="text-sm font-medium text-muted-foreground">Present</p>
          </Card>
          <Card className="p-4 glass-card text-center">
            <p className="text-3xl font-bold text-destructive">{absent}</p>
            <p className="text-sm font-medium text-muted-foreground">Absent</p>
          </Card>
        </div>

        <Card className="p-4 glass-card">
          <Progress value={overallPercent} className="h-3" />
        </Card>

        <Card className="p-5 glass-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h3 className="font-semibold">Attendance Records</h3>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Filter by date (e.g. 05-03)"
                className="w-48 h-9 text-sm"
                value={filterDate}
                onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
              />
              <select
                className="h-9 px-3 rounded-md border bg-background text-sm"
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Hour</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{r.date}</TableCell>
                  <TableCell>{r.room}</TableCell>
                  <TableCell>{r.hour}</TableCell>
                  <TableCell>{r.time}</TableCell>
                  <TableCell>
                    <Badge
                      className={`text-xs ${
                        r.status === "PRESENT"
                          ? "bg-success text-success-foreground"
                          : "bg-destructive text-destructive-foreground"
                      }`}
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
