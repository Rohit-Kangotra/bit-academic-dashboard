import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building, TrendingUp, FolderKanban, Briefcase, GraduationCap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

export function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => fetchApi('/api/v1/admin/dashboard-stats')
  });

  if (isLoading) {
    return <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  const s = data || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Students" value={s.totalStudents || 0} subtitle="Enrolled in system" icon={Users} gradient="blue" />
        <StatCard title="Total Faculty" value={s.totalFaculty || 0} subtitle="Registered staff" icon={GraduationCap} gradient="purple" />
        <StatCard title="Avg Attendance" value={`${s.averageAttendance || 0}%`} subtitle="Campus wide" icon={TrendingUp} gradient="green" />
        <StatCard title="Placement Drives" value={s.placementStats?.totalDrives || 0} subtitle="Active this year" icon={Building} gradient="orange" />
        <StatCard title="Placement Rate" value={`${s.placementStats?.overallPlacementRate || 0}%`} subtitle="Current batch" icon={Briefcase} gradient="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 glass-card">
          <h3 className="font-semibold mb-4">Department Performance (Avg CGPA)</h3>
          {s.departmentStats && s.departmentStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={s.departmentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis domain={[6, 10]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="avgCgpa" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} name="Average CGPA" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground bg-muted/20 border rounded-md border-dashed">No department data available.</div>
          )}
        </Card>

        <Card className="p-5 glass-card">
          <h3 className="font-semibold mb-4">Department Placement Rates</h3>
          {s.departmentStats && s.departmentStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={s.departmentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="placementRate" name="Placement Rate %" stroke="hsl(142, 76%, 36%)" fill="hsl(142, 76%, 36%)" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground bg-muted/20 border rounded-md border-dashed">No placement data available.</div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 glass-card">
          <h3 className="font-semibold mb-4">Total Students per Department</h3>
          {s.departmentStats && s.departmentStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={s.departmentStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  dataKey="totalStudents"
                  nameKey="department"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {s.departmentStats.map((entry: any, i: number) => {
                    const colors = ["hsl(142, 76%, 36%)", "hsl(221, 83%, 53%)", "hsl(38, 92%, 50%)", "hsl(262, 83%, 58%)", "hsl(0, 84%, 60%)", "hsl(316, 70%, 50%)"];
                    return <Cell key={i} fill={colors[i % colors.length]} />;
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground bg-muted/20 border rounded-md border-dashed">No department data available.</div>
          )}
        </Card>

        <Card className="p-5 glass-card">
          <h3 className="font-semibold mb-4">Top 5 Students by CGPA</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-muted-foreground">Student</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">Dept</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">CGPA</th>
                </tr>
              </thead>
              <tbody>
                {s.topStudents && s.topStudents.length > 0 ? s.topStudents.map((student: any) => (
                  <tr key={student.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 font-medium">{student.name}</td>
                    <td className="py-3 text-muted-foreground">{student.department}</td>
                    <td className="py-3"><Badge className="bg-primary">{student.cgpa}</Badge></td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card className="p-5 glass-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Company Applications Overview
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Applied</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Selected</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Selection Rate</th>
              </tr>
            </thead>
            <tbody>
              {s.placementStats?.applicationsByCompany && s.placementStats.applicationsByCompany.length > 0 ? s.placementStats.applicationsByCompany.map((c: any) => (
                <tr key={c.company} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="py-3 px-4 font-medium">{c.company}</td>
                  <td className="py-3 px-4">{c.applied}</td>
                  <td className="py-3 px-4">{c.selected}</td>
                  <td className="py-3 px-4">
                    <Badge variant={c.rate > 0 ? "default" : "secondary"}>{c.rate}%</Badge>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="py-6 text-center text-muted-foreground bg-muted/10">No applications data found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
