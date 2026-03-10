import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, CheckCircle2, Circle, Clock } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";

const leaveTypes = [
  "Sick Leave",
  "Emergency Leave",
  "OnDuty – Events",
  "OnDuty – Project Competition",
  "OnDuty – Internship",
  "OnDuty – Paper Presentation",
  "OnDuty – Technical Competition",
  "OnDuty – NSS/NCC",
  "OnDuty – Sports",
  "OnDuty – NPTEL Exam",
  "OnDuty – Offcampus Placement",
  "OnDuty – Training Course",
  "OnDuty – Government Exams",
  "GP Leave",
  "OnDuty – Clubs",
  "LEAVE",
];

// Removed static pastLeaves
const statusIcon = {
  approved: <CheckCircle2 className="w-4 h-4 text-success" />,
  pending: <Clock className="w-4 h-4 text-warning" />,
  rejected: <Circle className="w-4 h-4 text-destructive" />,
};

export default function Leaves() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ leaveType: "", fromDate: "", toDate: "", reason: "" });
  const queryClient = useQueryClient();

  const { data: leaveData, isLoading } = useQuery({
    queryKey: ['studentLeaves'],
    queryFn: () => fetchApi('/api/v1/leave/student')
  });

  const applyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/v1/leave/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to apply leave');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentLeaves'] });
      toast.success("Leave requested successfully!");
      setShowForm(false);
      setFormData({ leaveType: "", fromDate: "", toDate: "", reason: "" });
    },
    onError: () => toast.error("Failed to apply leave")
  });

  const handleSubmit = () => {
    if (!formData.leaveType || !formData.fromDate || !formData.toDate || !formData.reason) {
      toast.error("Please fill all fields");
      return;
    }
    applyMutation.mutate(formData);
  };

  const pastLeaves = leaveData?.leaves || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Leave Requests</h1>
          <Button size="sm" className="gap-2" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4" />
            Apply for Leave
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 glass-card">
            <h2 className="text-lg font-semibold mb-4">Apply for Leave</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select value={formData.leaveType} onValueChange={(v) => setFormData(p => ({ ...p, leaveType: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div />
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input type="date" value={formData.fromDate} onChange={(e) => setFormData(p => ({ ...p, fromDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input type="date" value={formData.toDate} onChange={(e) => setFormData(p => ({ ...p, toDate: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button onClick={handleSubmit} disabled={applyMutation.isPending}>{applyMutation.isPending ? 'Submitting...' : 'Submit Request'}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <p className="text-xs font-medium text-muted-foreground mb-2">Approval Workflow</p>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="secondary">Student</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="secondary">Mentor Approval</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge variant="secondary">Warden Approval</Badge>
                <span className="text-muted-foreground">→</span>
                <Badge className="bg-success text-success-foreground">Leave Approved</Badge>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Leave History</h2>
          {isLoading ? (
            <div className="text-center text-muted-foreground p-4">Loading leaves...</div>
          ) : pastLeaves.length === 0 ? (
            <Card className="p-8 text-center glass-card">
              <p className="text-muted-foreground">No leave history found.</p>
            </Card>
          ) : pastLeaves.map((l: any, i: number) => (
            <Card key={i} className="p-4 glass-card">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{l.leave_type}</span>
                    <Badge
                      className={`text-xs ${l.status?.toLowerCase() === "approved"
                        ? "bg-success text-success-foreground"
                        : l.status?.toLowerCase() === "rejected" ? "bg-destructive text-destructive-foreground" : "bg-warning text-warning-foreground"
                        }`}
                    >
                      {l.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(l.from_date).toLocaleDateString()} → {new Date(l.to_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{l.reason}</p>
                </div>
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    {statusIcon[(l.status?.toLowerCase() || 'pending') as keyof typeof statusIcon]}
                    <span>Status</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
