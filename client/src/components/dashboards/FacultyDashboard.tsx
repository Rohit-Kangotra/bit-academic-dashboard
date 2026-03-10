import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, BookOpen, ClipboardList, FolderKanban, Clock, Calendar, DollarSign, Check, X, AlertTriangle, BarChart as BarChartIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const todaySchedule = [
  { time: "08:45 – 10:30", class: "CS-A", subject: "Data Structures", room: "SF 102", status: "Completed" },
  { time: "10:40 – 12:30", class: "CS-B", subject: "Data Structures", room: "SF 204", status: "Happening Now" },
  { time: "01:30 – 03:10", class: "Free Period", subject: "", room: "", status: "Free" },
  { time: "03:25 – 04:30", class: "IT-A", subject: "Algorithms", room: "SF 301", status: "Upcoming" },
];

const syllabusCoverage = [
  { course: "Data Structures (CS301)", covered: 68, total: 45, completed: 31 },
  { course: "Algorithms (CS302)", covered: 52, total: 40, completed: 21 },
  { course: "Computer Networks (CS303)", covered: 75, total: 38, completed: 29 },
];

const statusStyle: Record<string, string> = {
  "Completed": "bg-success text-success-foreground",
  "Happening Now": "bg-primary text-primary-foreground",
  "Upcoming": "bg-muted text-muted-foreground",
  "Free": "bg-warning text-warning-foreground",
};

export function FacultyDashboard() {
  const queryClient = useQueryClient();

  // 1. Fetch Faculty Dashboard basic stats & leaves
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['facultyDashboard'],
    queryFn: () => fetchApi('/api/v1/dashboard/faculty')
  });

  // 2. Fetch Learning Analytics from new API
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['learningAnalytics'],
    queryFn: () => fetchApi('/api/v1/learning/faculty/learning-analytics')
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await fetch(`/api/v1/leave/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update leave');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facultyDashboard'] });
      toast.success("Leave request updated");
    },
    onError: () => toast.error("Failed to update leave request")
  });

  const dbData = dashboardData || {};
  const pendingLeaves = dbData.pending_leaves || [];

  const analytics = analyticsData?.analytics || [];
  const totalMentees = analytics.length;

  const getEngagementStatus = (score: number) => {
    if (score >= 80) return { label: "Highly Engaged", color: "bg-success text-success-foreground" };
    if (score >= 50) return { label: "Moderate", color: "bg-warning text-warning-foreground" };
    return { label: "At Risk", color: "bg-destructive text-destructive-foreground" };
  };

  if (dashboardLoading || analyticsLoading) return <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-10">
      {/* 1. Faculty Dashboard Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Faculty Dashboard</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 glass-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Today's Classes
            </h3>
            <div className="space-y-2">
              {todaySchedule.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium w-32">{s.time}</span>
                    <span className="text-sm font-medium">{s.class}</span>
                    {s.subject && <span className="text-xs text-muted-foreground hidden sm:inline-block">· {s.subject}</span>}
                  </div>
                  <Badge className={`text-xs ${statusStyle[s.status]}`}>{s.status}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 glass-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Course Progress
            </h3>
            <div className="space-y-4">
              {syllabusCoverage.map((c) => (
                <div key={c.course}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{c.course}</span>
                    <span className="text-sm text-muted-foreground">{c.completed}/{c.total} topics · {c.covered}%</span>
                  </div>
                  <Progress value={c.covered} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Removed the original Mentor Analytics block that used mentees data (CGPA/Attendance) 
          as instructed to change architecture to "analytics only" for learning engagement or similar.
          However, keeping the basic dashboard layout clean as per constraints.
      */}

      {/* 3. Pending Leave Requests Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Pending Leave Requests</h2>
        <Card className="p-5 glass-card">
          {pendingLeaves.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground border border-dashed rounded-lg bg-muted/10">
              No pending leave requests to review.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-muted-foreground">Student</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Leave Type</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Dates</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Reason</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLeaves.map((l: any) => (
                    <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-3 font-medium">
                        {l.student_name} <br /><span className="text-xs text-muted-foreground">{l.student_roll_no}</span>
                      </td>
                      <td className="py-3">{l.leave_type}</td>
                      <td className="py-3 text-xs">
                        {new Date(l.from_date).toLocaleDateString()} to {new Date(l.to_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-xs truncate max-w-[200px]" title={l.reason}>{l.reason}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-success hover:text-success hover:bg-success/10 border-success/20"
                            onClick={() => approveMutation.mutate({ id: l.id, status: 'Approved' })}
                            disabled={approveMutation.isPending}
                            title="Approve Request"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                            onClick={() => approveMutation.mutate({ id: l.id, status: 'Rejected' })}
                            disabled={approveMutation.isPending}
                            title="Reject Request"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

      {/* 4. Learning Engagement Analytics Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Learning Engagement Analytics</h2>
        <Card className="p-5 glass-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-muted-foreground">Roll No</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Student Name</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Activity Count</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Engagement Score</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No engagement data available.</td></tr>
                ) : analytics.map((m: any) => {
                  const score = parseFloat(m.engagement_score || 0);
                  const status = getEngagementStatus(score);
                  return (
                    <tr key={m.roll_no} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-3 text-muted-foreground font-mono text-xs">{m.roll_no}</td>
                      <td className="py-3 font-medium uppercase">{m.name}</td>
                      <td className="py-3 text-center">{m.activity_count}</td>
                      <td className="py-3 text-center font-bold">{score}</td>
                      <td className="py-3 text-right">
                        <Badge className={`text-xs ${status.color}`}>{status.label}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

    </div>
  );
}
