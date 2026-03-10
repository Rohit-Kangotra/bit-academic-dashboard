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

  // 2. Fetch Mentees from new API
  const { data: menteesData, isLoading: menteesLoading } = useQuery({
    queryKey: ['mentees'],
    queryFn: () => fetchApi('/api/v1/faculty/mentees')
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

  const mentees = menteesData?.mentees || [];
  const totalMentees = mentees.length;

  const avgCgpa = totalMentees > 0
    ? (mentees.reduce((acc: number, m: any) => acc + parseFloat(m.cgpa || 0), 0) / totalMentees).toFixed(2)
    : "0.00";

  const avgAttendance = totalMentees > 0
    ? (mentees.reduce((acc: number, m: any) => acc + parseFloat(m.attendance || 0), 0) / totalMentees).toFixed(0)
    : "0";

  // Students at risk: attendance < 75 or CGPA < 6
  const studentsAtRisk = mentees.filter((m: any) => parseFloat(m.attendance || 0) < 75 || parseFloat(m.cgpa || 0) < 6).length;

  if (dashboardLoading || menteesLoading) return <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

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

      {/* 2. Mentor Analytics Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Mentor Analytics</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Mentees" value={totalMentees.toString()} subtitle="Assigned students" icon={Users} gradient="blue" />
          <StatCard title="Average CGPA" value={avgCgpa} subtitle="Overall performance" icon={BookOpen} gradient="green" />
          <StatCard title="Average Attendance" value={`${avgAttendance}%`} subtitle="Current semester" icon={Calendar} gradient="purple" />
          <StatCard title="Students At Risk" value={studentsAtRisk.toString()} subtitle="Requires attention" icon={AlertTriangle} gradient={studentsAtRisk > 0 ? "orange" : "green"} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="p-5 glass-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChartIcon className="w-4 h-4" /> Attendance Chart
            </h3>
            <div className="w-full overflow-x-auto">
              <div className="min-w-[600px]">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mentees} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.4)' }} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="attendance" name="Attendance %" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                      {
                        mentees.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={parseFloat(entry.attendance) < 75 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>
      </section>

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

      {/* 4. My Mentees Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">My Mentees</h2>
        <Card className="p-5 glass-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-muted-foreground">Roll No</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Student Name</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Department</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Semester</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">CGPA</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Reward Points</th>
                </tr>
              </thead>
              <tbody>
                {mentees.length === 0 ? (
                  <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">No students currently assigned to you.</td></tr>
                ) : mentees.map((m: any) => (
                  <tr key={m.roll_no} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 text-muted-foreground font-mono text-xs">{m.roll_no}</td>
                    <td className="py-3 font-medium uppercase">{m.name}</td>
                    <td className="py-3">{m.department || 'B.Tech IT'}</td>
                    <td className="py-3">S{m.semester || '6'}</td>
                    <td className="py-3 text-center">
                      <Badge variant={parseFloat(m.cgpa) >= 7.0 ? "secondary" : "destructive"} className="text-xs font-bold">
                        {m.cgpa}
                      </Badge>
                    </td>
                    <td className="py-3 text-center">
                      <span className="font-semibold text-primary">{m.reward_points || 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

    </div>
  );
}
