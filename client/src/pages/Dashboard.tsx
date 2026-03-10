import { useAuth } from "@/contexts/AuthContext";
import { StudentDashboard } from "@/components/dashboards/StudentDashboard";
import { FacultyDashboard } from "@/components/dashboards/FacultyDashboard";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's your academic overview for today.
          </p>
        </div>
        {user?.role === "student" && <StudentDashboard />}
        {user?.role === "faculty" && <FacultyDashboard />}
        {user?.role === "admin" && <AdminDashboard />}
      </div>
    </DashboardLayout>
  );
}
