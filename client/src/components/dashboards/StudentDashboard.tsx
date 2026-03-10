import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  ClipboardList,
  FolderKanban,
  Briefcase,
  Star,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";

const semesterData = [
  { sem: "S1", gpa: 8.2 },
  { sem: "S2", gpa: 8.5 },
  { sem: "S3", gpa: 7.9 },
  { sem: "S4", gpa: 8.8 },
  { sem: "S5", gpa: 9.1 },
  { sem: "S6", gpa: 8.7 },
];

const skillsData = [
  { name: "Python", value: 85, fill: "hsl(221, 83%, 53%)" },
  { name: "React", value: 72, fill: "hsl(262, 83%, 58%)" },
  { name: "ML", value: 60, fill: "hsl(142, 76%, 36%)" },
  { name: "SQL", value: 78, fill: "hsl(38, 92%, 50%)" },
];

const pendingAssignments = [
  { title: "Data Structures Lab 5", course: "CS301", due: "Mar 8, 2026", status: "pending" },
  { title: "ML Project Report", course: "CS412", due: "Mar 12, 2026", status: "pending" },
  { title: "DBMS Assignment 3", course: "CS305", due: "Mar 15, 2026", status: "submitted" },
];

export function StudentDashboard() {
  const { user } = useAuth();

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['studentActivities'],
    queryFn: () => fetchApi('/api/v1/activity')
  });

  const { data: placementData, isLoading: placementLoading } = useQuery({
    queryKey: ['myApplications'],
    queryFn: () => fetchApi('/api/v1/placements/my-applications')
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: () => fetchApi('/api/v1/dashboard/student')
  });

  if (activityLoading || placementLoading || dashboardLoading) {
    return <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  const applications = placementData?.applications || [];
  const submissions = activityData?.submissions || [];

  const totalPoints = submissions
    .filter((s: any) => s.status === 'Approved')
    .reduce((sum: number, s: any) => sum + (s.points_awarded || 0), 0);

  const activePlacements = applications.filter((a: any) => a.status === 'Applied' || a.status === 'Shortlisted').length;

  const dbData = dashboardData || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard title="CGPA" value={dbData.cgpa || "0.0"} subtitle="Out of 10.0" icon={GraduationCap} gradient="blue" />
        <StatCard title="Attendance" value={`${dbData.attendance || 0}%`} subtitle="This semester" icon={CalendarCheck} gradient="green" />
        <StatCard title="Reward Points" value={dbData.reward_points || 0} subtitle="Points" icon={Star} gradient="orange" />
        <StatCard title="Submissions" value={submissions.length} subtitle="Activity reports" icon={TrendingUp} gradient="purple" />
        <StatCard title="Placements" value={dbData.placements_applied || 0} subtitle="Applications" icon={Briefcase} gradient="purple" />
        <StatCard title="Course Progress" value={`${dbData.course_progress || 0}%`} subtitle="Completed lessons" icon={FolderKanban} gradient="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 glass-card">
          <h3 className="font-semibold mb-4">SGPA Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={semesterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="sem" tick={{ fontSize: 12 }} />
              <YAxis domain={[6, 10]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="gpa" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 glass-card">
          <h3 className="font-semibold mb-4">Skill Progress</h3>
          <div className="space-y-4">
            {skillsData.map((skill) => (
              <div key={skill.name} className="flex items-center gap-3">
                <span className="text-sm font-medium w-16">{skill.name}</span>
                <Progress value={skill.value} className="flex-1 h-2" />
                <span className="text-sm text-muted-foreground w-10 text-right">{skill.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 glass-card">
        <h3 className="font-semibold mb-4">Recent Activity Submissions</h3>
        <div className="space-y-3">
          {submissions.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground border border-dashed rounded bg-muted/20">No activities submitted.</div>
          ) : submissions.slice(0, 3).map((a: any) => (
            <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
              <div>
                <p className="text-sm font-medium">{a.activity_name}</p>
                <p className="text-xs text-muted-foreground">{a.category} · Submitted {new Date(a.submitted_at).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={a.status === "Approved" ? "default" : a.status === "Rejected" ? "destructive" : "secondary"} className="text-xs">
                  {a.status}
                </Badge>
                {a.status === 'Approved' && (
                  <span className="text-xs font-semibold text-success">+{a.points_awarded} pts</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
