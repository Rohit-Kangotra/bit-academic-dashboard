import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const assignments = [
  { title: "Data Structures Lab 5", course: "CS301", due: "Mar 8, 2026", status: "pending", type: "Lab" },
  { title: "ML Project Report", course: "CS412", due: "Mar 12, 2026", status: "pending", type: "Project" },
  { title: "DBMS Assignment 3", course: "CS305", due: "Mar 15, 2026", status: "submitted", type: "Theory" },
  { title: "CN Lab 4", course: "CS310", due: "Mar 5, 2026", status: "graded", grade: "A", type: "Lab" },
  { title: "SE Case Study", course: "CS320", due: "Mar 3, 2026", status: "graded", grade: "A+", type: "Report" },
  { title: "Python Mini Project", course: "CS301", due: "Feb 28, 2026", status: "graded", grade: "B+", type: "Project" },
];

const statusColor: Record<string, string> = {
  pending: "bg-warning text-warning-foreground",
  submitted: "bg-info text-info-foreground",
  graded: "bg-success text-success-foreground",
};

export default function Assignments() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Assignments</h1>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="graded">Graded</TabsTrigger>
          </TabsList>

          {["all", "pending", "submitted", "graded"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-3 mt-4">
              {assignments
                .filter((a) => tab === "all" || a.status === tab)
                .map((a, i) => (
                  <Card key={i} className="p-4 glass-card flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{a.title}</span>
                        <Badge variant="outline" className="text-[10px]">{a.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{a.course} · Due {a.due}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.grade && <span className="text-sm font-bold">{a.grade}</span>}
                      <Badge className={`text-xs ${statusColor[a.status]}`}>{a.status}</Badge>
                    </div>
                  </Card>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
