import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Calendar, MapPin, Monitor, FileText, CheckCircle2, Clock, Circle, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const roundStatusIcon = {
  completed: <CheckCircle2 className="w-4 h-4 text-success" />,
  scheduled: <Clock className="w-4 h-4 text-warning" />,
  pending: <Circle className="w-4 h-4 text-muted-foreground" />,
};

const statusColorMap: Record<string, string> = {
  Applied: "bg-blue-500/10 text-blue-500",
  Shortlisted: "bg-info/10 text-info",
  Rejected: "bg-destructive/10 text-destructive",
  Selected: "bg-success/10 text-success"
};

export function StudentPlacementView() {
  const { toast } = useToast();

  const { data: myApplications, isLoading: loadingApps, refetch: refetchApps } = useQuery({
    queryKey: ['myApplications'],
    queryFn: () => fetchApi('/api/v1/placements/my-applications')
  });

  const { data: upcomingDrives, isLoading: loadingDrives } = useQuery({
    queryKey: ['upcomingDrives'],
    queryFn: () => fetchApi('/api/v1/placements/upcoming')
  });

  const handleApply = async (driveId: number, company: string) => {
    try {
      await fetchApi('/api/v1/placements/apply', {
        method: 'POST',
        body: JSON.stringify({
          drive_id: driveId,
          resume_name: "Resume_primary.pdf"
        })
      });
      toast({ title: "Applied Successfully", description: `You have submitted your profile to ${company}.` });
      refetchApps();
    } catch (e: any) {
      toast({ title: "Application Failed", description: e.message, variant: "destructive" });
    }
  };

  if (loadingApps || loadingDrives) {
    return <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  const apps = myApplications?.applications || [];
  const drives = upcomingDrives?.drives || [];

  return (
    <Tabs defaultValue="applied" className="space-y-4">
      <TabsList>
        <TabsTrigger value="applied">Applied Companies ({apps.length})</TabsTrigger>
        <TabsTrigger value="upcoming">Upcoming Drives ({drives.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="applied" className="space-y-4">
        {apps.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20 border-dashed">
            You haven't applied to any companies yet.
          </div>
        ) : apps.map((a: any) => (
          <Card key={a.id} className="p-5 glass-card">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">{a.company}</h3>
                  <Badge className={`ml-2 hover:bg-transparent ${statusColorMap[a.status] || "bg-muted text-muted-foreground"}`} variant="outline">
                    {a.status}
                  </Badge>
                </div>
                <p className="text-sm font-medium">{a.job_role}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    CTC: {a.package} LPA
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Date: {new Date(a.interview_date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Resume: {a.resume_name}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="upcoming" className="space-y-4">
        {drives.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20 border-dashed">
            No upcoming drives scheduled yet.
          </div>
        ) : drives.map((d: any) => {
          const hasApplied = apps.some((app: any) => app.company === d.company);

          return (
            <Card key={d.id} className="p-5 glass-card relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">{d.company}</h3>
              </div>
              <p className="text-sm font-medium">{d.job_role} <span className="text-muted-foreground font-normal ml-2">({d.package} LPA)</span></p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 mt-4 text-xs">
                <div className="space-y-1.5">
                  <p className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="w-3.5 h-3.5" /> <span className="font-medium text-foreground w-[80px]">Eligibility:</span> {d.eligibility_cgpa} CGPA ({d.eligible_departments})</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-3.5 h-3.5" /> <span className="font-medium text-foreground w-[80px]">Deadline:</span> {new Date(d.application_deadline).toLocaleDateString()}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-3.5 h-3.5" /> <span className="font-medium text-foreground w-[80px]">Interview:</span> {new Date(d.interview_date).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-6 border-dashed">
                  <p className="flex items-center gap-2 text-muted-foreground"><Monitor className="w-3.5 h-3.5" /> <span className="font-medium text-foreground w-[60px]">Mode:</span> {d.mode}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> <span className="font-medium text-foreground w-[60px]">Location:</span> {d.location}</p>

                  <div className="pt-2">
                    <Button
                      size="sm"
                      className="w-full text-xs font-semibold h-8"
                      onClick={() => handleApply(d.id, d.company)}
                      disabled={hasApplied}
                    >
                      {hasApplied ? "Already Applied" : "Submit Profile"} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </TabsContent>
    </Tabs>
  );
}
