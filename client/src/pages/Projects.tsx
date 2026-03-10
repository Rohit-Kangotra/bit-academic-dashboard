import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Calendar } from "lucide-react";

const projects = [
  {
    title: "AI-Powered Attendance System",
    description: "Face recognition based attendance using OpenCV and deep learning.",
    team: ["Arun K", "Divya R", "Karthik S"],
    phase: 3,
    totalPhases: 5,
    status: "in-progress",
    deadline: "Apr 15, 2026",
    mentor: "Dr. Priya Sharma",
  },
  {
    title: "Campus Navigation App",
    description: "AR-based indoor navigation system for campus buildings.",
    team: ["Meera P", "Arun K"],
    phase: 4,
    totalPhases: 5,
    status: "in-progress",
    deadline: "Mar 30, 2026",
    mentor: "Prof. Suresh R",
  },
  {
    title: "Student Performance Predictor",
    description: "ML model to predict student academic outcomes based on historical data.",
    team: ["Arun K", "Ravi V", "Lakshmi N"],
    phase: 5,
    totalPhases: 5,
    status: "completed",
    deadline: "Feb 28, 2026",
    mentor: "Dr. Meena Iyer",
  },
];

const statusBadge: Record<string, string> = {
  "in-progress": "bg-info text-info-foreground",
  completed: "bg-success text-success-foreground",
  overdue: "bg-destructive text-destructive-foreground",
};

export default function Projects() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Project Tracker</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <Card key={i} className="p-5 glass-card">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-sm">{p.title}</h3>
                <Badge className={`text-xs ${statusBadge[p.status]}`}>{p.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{p.description}</p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Phase {p.phase}/{p.totalPhases}</span>
                    <span className="font-medium">{Math.round((p.phase / p.totalPhases) * 100)}%</span>
                  </div>
                  <Progress value={(p.phase / p.totalPhases) * 100} className="h-2" />
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>{p.team.join(", ")}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>Deadline: {p.deadline}</span>
                </div>
                <p className="text-xs text-muted-foreground">Mentor: {p.mentor}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
