import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, FileText, CheckCircle2, XCircle, Search, Calendar, Link } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

type Activity = {
    id: number;
    student_id: number;
    student_name: string;
    activity_name: string;
    category: string;
    description: string;
    proof_link: string;
    status: string;
    points_awarded: number;
    submitted_at: string;
};

export default function Activities() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [formData, setFormData] = useState({ activity_name: '', category: '', description: '', proof_link: '' });

    const { data: activityData, isLoading, refetch } = useQuery({
        queryKey: ['activities'],
        queryFn: () => fetchApi('/api/v1/activity')
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetchApi('/api/v1/activity/submit', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            toast({ title: "Activity Submitted", description: "Your activity is pending review." });
            setFormData({ activity_name: '', category: '', description: '', proof_link: '' });
            refetch();
        } catch (e: any) {
            toast({ title: "Submission Failed", description: e.message, variant: "destructive" });
        }
    };

    const handleReview = async (id: number, status: string, points: number) => {
        try {
            await fetchApi('/api/v1/activity/review', {
                method: 'PUT',
                body: JSON.stringify({ activity_id: id, status, points_awarded: points })
            });
            toast({ title: "Review Complete", description: `Activity marked as ${status}.` });
            refetch();
        } catch (e: any) {
            toast({ title: "Update Failed", description: e.message, variant: "destructive" });
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            </DashboardLayout>
        );
    }

    const submissions = (activityData?.submissions || []) as Activity[];

    const studentView = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <Card className="p-5 glass-card">
                    <h3 className="font-semibold mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> Submit Activity</h3>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Activity Name</label>
                            <input required value={formData.activity_name} onChange={e => setFormData({ ...formData, activity_name: e.target.value })} className="w-full bg-background border rounded-md px-3 py-2 text-sm" placeholder="e.g. SIH 2026 Winner" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Category</label>
                            <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-background border rounded-md px-3 py-2 text-sm">
                                <option value="">Select Category</option>
                                <option value="Hackathon">Hackathon</option>
                                <option value="Certification">Certification</option>
                                <option value="Publication">Publication</option>
                                <option value="Sports">Sports</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Description</label>
                            <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-background border rounded-md px-3 py-2 text-sm h-24" placeholder="Brief details about your role and achievement..." />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Proof Link</label>
                            <input required type="url" value={formData.proof_link} onChange={e => setFormData({ ...formData, proof_link: e.target.value })} className="w-full bg-background border rounded-md px-3 py-2 text-sm" placeholder="https://..." />
                        </div>
                        <Button type="submit" className="w-full">Submit for Review</Button>
                    </form>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card className="p-5 glass-card h-full">
                    <h3 className="font-semibold mb-4">My Submissions</h3>
                    {submissions.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground border border-dashed rounded bg-muted/20">You haven't submitted any activities yet.</div>
                    ) : (
                        <div className="space-y-3">
                            {submissions.map(a => (
                                <div key={a.id} className="p-4 rounded-lg bg-muted/30 border border-muted flex flex-col md:flex-row gap-4 justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold">{a.activity_name}</h4>
                                            <Badge variant={a.status === 'Approved' ? 'default' : a.status === 'Rejected' ? 'destructive' : 'secondary'} className="text-xs">{a.status}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{a.category}</p>
                                        <p className="text-xs text-muted-foreground mt-2">{a.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(a.submitted_at).toLocaleDateString()}</span>
                                            <a href={a.proof_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline"><Link className="w-3.5 h-3.5" /> View Proof</a>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end justify-center min-w-[100px]">
                                        {a.status === 'Approved' ? (
                                            <div className="text-center">
                                                <span className="text-2xl font-bold text-success">+{a.points_awarded}</span>
                                                <p className="text-xs text-muted-foreground">Points</p>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground italic">Pending Review</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );

    const adminView = () => {
        const pending = submissions.filter(s => s.status === 'Pending');
        const reviewed = submissions.filter(s => s.status !== 'Pending');

        return (
            <div className="space-y-6">
                <Tabs defaultValue="pending">
                    <TabsList>
                        <TabsTrigger value="pending">Pending Review ({pending.length})</TabsTrigger>
                        <TabsTrigger value="reviewed">History ({reviewed.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="mt-4 space-y-4">
                        {pending.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground border border-dashed rounded bg-muted/20">No pending activities to review.</div>
                        ) : pending.map(a => (
                            <Card key={a.id} className="p-5 glass-card">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-lg">{a.activity_name}</h4>
                                            <Badge variant="secondary" className="text-xs">{a.category}</Badge>
                                        </div>
                                        <p className="text-sm font-medium">Student: <span className="text-primary">{a.student_name}</span></p>
                                        <p className="text-sm text-muted-foreground">{a.description}</p>
                                        <div className="flex items-center gap-4 text-xs mt-2">
                                            <span className="flex items-center gap-1 text-muted-foreground"><Calendar className="w-3.5 h-3.5" /> Submitted {new Date(a.submitted_at).toLocaleDateString()}</span>
                                            <a href={a.proof_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline"><Link className="w-3.5 h-3.5" /> View Proof</a>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                        <p className="text-sm font-medium text-center mb-1">Award Points</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            <Button size="sm" variant="outline" className="border-success text-success hover:bg-success hover:text-success-foreground" onClick={() => handleReview(a.id, 'Approved', 10)}>+10</Button>
                                            <Button size="sm" variant="outline" className="border-success text-success hover:bg-success hover:text-success-foreground" onClick={() => handleReview(a.id, 'Approved', 25)}>+25</Button>
                                            <Button size="sm" variant="outline" className="border-success text-success hover:bg-success hover:text-success-foreground" onClick={() => handleReview(a.id, 'Approved', 50)}>+50</Button>
                                        </div>
                                        <Button size="sm" variant="destructive" className="w-full mt-2" onClick={() => handleReview(a.id, 'Rejected', 0)}><XCircle className="w-4 h-4 mr-2" /> Reject</Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="reviewed" className="mt-4">
                        <Card className="p-5 glass-card">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 font-medium text-muted-foreground">Student</th>
                                            <th className="text-left py-3 font-medium text-muted-foreground">Activity</th>
                                            <th className="text-left py-3 font-medium text-muted-foreground">Category</th>
                                            <th className="text-left py-3 font-medium text-muted-foreground">Status</th>
                                            <th className="text-left py-3 font-medium text-muted-foreground">Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reviewed.length === 0 ? (
                                            <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No reviewed activities yet.</td></tr>
                                        ) : reviewed.map(a => (
                                            <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                                                <td className="py-3 font-medium">{a.student_name}</td>
                                                <td className="py-3">{a.activity_name}</td>
                                                <td className="py-3 text-muted-foreground">{a.category}</td>
                                                <td className="py-3">
                                                    <Badge variant={a.status === 'Approved' ? 'default' : 'destructive'} className="text-xs">{a.status}</Badge>
                                                </td>
                                                <td className="py-3 font-bold text-success">{a.points_awarded > 0 ? `+${a.points_awarded}` : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Activity & Rewards Hub</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {user?.role === 'student' ? 'Submit extracurriculars for faculty review to earn reward points.' : 'Review student activities and assign reward points based on achievements.'}
                    </p>
                </div>
                {user?.role === 'student' ? studentView() : adminView()}
            </div>
        </DashboardLayout>
    );
}
