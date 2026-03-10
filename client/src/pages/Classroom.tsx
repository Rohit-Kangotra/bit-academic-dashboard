import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User } from "lucide-react";

const sessions = [
  {
    session: "Session 1",
    time: "08:45 – 10:30",
    room: "SF 102",
    faculty: "Ms. Madhumitha",
    subject: "Data Structures",
    status: "Completed",
  },
  {
    session: "Session 2",
    time: "10:40 – 12:30",
    room: "SF 102",
    faculty: "Dr. Rajesh",
    subject: "Database Management",
    status: "Happening Now",
  },
  {
    session: "Session 3",
    time: "01:30 – 03:10",
    room: "SF 204",
    faculty: "Mr. Karthik",
    subject: "Machine Learning",
    status: "Upcoming",
  },
  {
    session: "Session 4",
    time: "03:25 – 04:30",
    room: "SF 102",
    faculty: "Dr. Priya Sharma",
    subject: "Computer Networks",
    status: "Upcoming",
  },
];

const statusStyles: Record<string, string> = {
  Completed: "bg-success text-success-foreground",
  "Happening Now": "bg-primary text-primary-foreground animate-pulse",
  Upcoming: "bg-muted text-muted-foreground",
};

export default function Classroom() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Classroom</h1>
          <p className="text-sm text-muted-foreground mt-1">Today's Schedule — March 6, 2026</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((s) => (
            <Card
              key={s.session}
              className={`p-5 glass-card relative overflow-hidden ${
                s.status === "Happening Now" ? "ring-2 ring-primary/50" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm">{s.session}</p>
                  <p className="text-lg font-bold mt-0.5">{s.subject}</p>
                </div>
                <Badge className={`text-xs ${statusStyles[s.status]}`}>{s.status}</Badge>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{s.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Room: {s.room}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  <span>{s.faculty}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
