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

// Removed hardcoded data per user constraints:
// - semesterData
// - skillsData
// - pendingAssignments

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
        <StatCard title="Submissions" value={dbData.pending_assignments || 0} subtitle="Pending review" icon={TrendingUp} gradient="purple" />
        <StatCard title="Placements" value={dbData.placements_applied || 0} subtitle="Applications" icon={Briefcase} gradient="blue" />
        <StatCard title="Course Progress" value={`${dbData.course_progress || 0}%`} subtitle="Completed lessons" icon={FolderKanban} gradient="green" />
      </div>

      {/* Removed SGPA Trend and Skill Progress as there is currently no backend data for them. */}

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
