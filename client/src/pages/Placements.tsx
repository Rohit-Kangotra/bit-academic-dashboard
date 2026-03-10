import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { StudentPlacementView } from "@/components/placements/StudentPlacementView";
import { FacultyPlacementView } from "@/components/placements/FacultyPlacementView";
import { AdminPlacementView } from "@/components/placements/AdminPlacementView";

export default function Placements() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Placement Drives</h1>
        {user?.role === "student" && <StudentPlacementView />}
        {user?.role === "faculty" && <FacultyPlacementView />}
        {user?.role === "admin" && <AdminPlacementView />}
      </div>
    </DashboardLayout>
  );
}
