import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, TrendingUp, Building2, Plus, Calendar as CalendarIcon, MapPin, Monitor } from "lucide-react";
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
} from "recharts";

const statusColor: Record<string, string> = {
  Active: "bg-success text-success-foreground",
  Upcoming: "bg-info text-info-foreground",
  Completed: "bg-muted text-muted-foreground",
};

export function AdminPlacementView() {
  const { data: driveData, isLoading: drivesLoading } = useQuery({
    queryKey: ['adminDrives'],
    queryFn: () => fetchApi('/api/v1/placements')
  });

  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['studentProgress'],
    queryFn: () => fetchApi('/api/v1/placements/student-progress')
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => fetchApi('/api/v1/admin/dashboard-stats')
  });

  if (drivesLoading || progressLoading || statsLoading) {
    return <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  const drives = driveData?.drives || [];
  const applications = progressData?.progress || [];
  const stats = statsData || {};

  // Native Counts from DB via API Requirements
  const activeDrives = stats.active_drives || 0;
  const totalApplications = stats.total_applications || 0;
  const totalOffers = stats.total_offers || 0;
  const successRate = stats.offer_rate || 0;

  const placedByCompany = applications.reduce((acc: any, app: any) => {
    if (!acc[app.company]) acc[app.company] = { company: app.company, applied: 0, placed: 0 };
    acc[app.company].applied++;
    if (app.status === 'Selected') acc[app.company].placed++;
    return acc;
  }, {});

  const companyStats = Object.values(placedByCompany).slice(0, 5); // top 5 companies

  const placementBreakdown = [
    { name: "Placed", value: totalOffers, color: "hsl(142, 76%, 36%)" },
    { name: "In Progress", value: applications.filter((a: any) => a.status === 'Applied' || a.status === 'Shortlisted').length, color: "hsl(221, 83%, 53%)" },
    { name: "Rejected", value: applications.filter((a: any) => a.status === 'Rejected').length, color: "hsl(0, 84%, 60%)" }
  ].filter(b => b.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Drives" value={activeDrives} subtitle="Registered events" icon={Building2} gradient="blue" />
        <StatCard title="Total Applications" value={totalApplications} subtitle="Across all drives" icon={TrendingUp} gradient="orange" />
        <StatCard title="Total Offers" value={totalOffers} subtitle="Students placed" icon={UserCheck} gradient="green" />
        <StatCard title="Offer Rate" value={`${successRate}%`} subtitle="Selected / Applied" icon={Users} gradient="purple" />
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Placement Operations</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage and track company recruitment processes across the campus.</p>
        </div>
        <Button className="gap-2 shadow-md">
          <Plus className="w-4 h-4" /> New Drive
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 glass-card">
          <h3 className="font-semibold mb-4">Top Companies Activity</h3>
          {companyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={companyStats as any[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="company" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="applied" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} name="Applied" />
                <Bar dataKey="placed" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} name="Offers" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md border-dashed border">No placement activity recorded yet.</div>
          )}
        </Card>

        <Card className="p-5 glass-card">
          <h3 className="font-semibold mb-4">Pipeline Breakdown</h3>
          {placementBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={placementBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {placementBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md border-dashed border">No pipeline data recorded yet.</div>
          )}
        </Card>
      </div>

      <Card className="p-5 glass-card">
        <h3 className="font-semibold mb-4">Registered Placement Drives</h3>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted border-b">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">CTC / Mode</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Deadline</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Eligibility</th>
              </tr>
            </thead>
            <tbody>
              {drives.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground bg-muted/10">No drives have been registered in the system.</td>
                </tr>
              )}
              {drives.map((d: any) => {
                const deadlinePassed = new Date(d.application_deadline) < new Date();
                return (
                  <tr key={d.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex flex-shrink-0 items-center justify-center"><Building2 className="w-4 h-4 text-primary" /></div>
                        <span className="font-medium whitespace-nowrap">{d.company}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{d.job_role}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col text-xs">
                        <span className="font-medium">{d.package} LPA</span>
                        <span className="text-muted-foreground flex items-center gap-1 mt-0.5"><Monitor className="w-3 h-3" /> {d.mode}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col text-xs">
                        <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3 text-muted-foreground" /> {new Date(d.application_deadline).toLocaleDateString()}</span>
                        {deadlinePassed ? (
                          <span className="text-destructive font-semibold mt-0.5">Closed</span>
                        ) : (
                          <span className="text-success font-semibold mt-0.5">Active</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col text-xs gap-1">
                        <span className="font-semibold bg-muted py-0.5 px-2 rounded w-fit">&gt;{d.eligibility_cgpa} CGPA</span>
                        <span className="text-muted-foreground truncate max-w-[120px]" title={d.eligible_departments}>{d.eligible_departments}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {applications.length > 0 && (
        <Card className="p-5 glass-card mt-6">
          <h3 className="font-semibold mb-y">Recent Student Applications</h3>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left font-medium text-muted-foreground py-2">Student</th>
                  <th className="text-left font-medium text-muted-foreground py-2">Roll No</th>
                  <th className="text-left font-medium text-muted-foreground py-2">Company</th>
                  <th className="text-left font-medium text-muted-foreground py-2">Date Applied</th>
                  <th className="text-left font-medium text-muted-foreground py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 10).map((app: any) => (
                  <tr key={app.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{app.student_name}</td>
                    <td className="py-3 text-muted-foreground">{app.roll_no}</td>
                    <td className="py-3 font-semibold text-primary">{app.company}</td>
                    <td className="py-3 text-muted-foreground">{new Date(app.applied_at).toLocaleDateString()}</td>
                    <td className="py-3"><Badge variant="outline">{app.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
