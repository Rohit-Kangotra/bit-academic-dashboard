import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusColorMap: Record<string, string> = {
  Applied: "bg-blue-500/10 text-blue-500",
  Shortlisted: "bg-info/10 text-info",
  Rejected: "bg-destructive/10 text-destructive",
  Selected: "bg-success/10 text-success"
};

export function FacultyPlacementView() {
  const { data, isLoading } = useQuery({
    queryKey: ['studentProgress'],
    queryFn: () => fetchApi('/api/v1/placements/student-progress')
  });

  if (isLoading) {
    return <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  const applications = data?.progress || [];

  return (
    <div className="space-y-6">
      <Card className="p-5 glass-card">
        <h3 className="font-semibold mb-4">Department Placement Tracker</h3>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No active applications from students in your scope.
                  </TableCell>
                </TableRow>
              ) : applications.map((s: any) => (
                <TableRow key={s.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{s.student_name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.roll_no}</TableCell>
                  <TableCell className="text-muted-foreground">{s.department}</TableCell>
                  <TableCell className="font-medium text-foreground">{s.company}</TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]">{s.resume_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${statusColorMap[s.status] || "bg-muted text-muted-foreground"}`}>
                      {s.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
