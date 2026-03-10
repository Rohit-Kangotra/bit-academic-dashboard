import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, User, GraduationCap, Clock, CheckCircle2, ShieldAlert } from "lucide-react";
import { StatCard } from "@/components/StatCard";

export default function FacultyStudentProfile() {
    const { rollNo } = useParams();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['studentProfile', rollNo],
        queryFn: () => fetchApi(`/api/v1/faculty/student/${rollNo}`)
    });

    if (isLoading) return <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

    if (!data || !data.student) return <div className="py-12 text-center text-muted-foreground">Student not found.</div>;

    const { student, stats, learning, leaves } = data;

    const learningPercentage = learning.total_lessons > 0
        ? Math.round((learning.completed_lessons / learning.total_lessons) * 100)
        : 0;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/faculty/mentees')}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
                    <p className="text-muted-foreground mt-1 font-mono">{student.roll_no}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6 glass-card lg:col-span-1 space-y-6">
                    <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-12 h-12 text-primary" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Department</p>
                            <p className="font-medium">{student.department || 'B.Tech IT'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Semester</p>
                                <p className="font-medium">S{student.semester || '6'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Batch</p>
                                <p className="font-medium">{student.batch || '2023-2027'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">CGPA</p>
                                <Badge variant={parseFloat(student.cgpa) >= 7.0 ? "secondary" : "destructive"}>{student.cgpa || '0.00'}</Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Backlogs</p>
                                <span className={student.backlogs > 0 ? "text-destructive font-bold" : "text-success font-bold"}>{student.backlogs || 0}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Mentor</p>
                            <p className="font-medium">{student.mentor_name || 'Assigned Mentor'}</p>
                        </div>
                    </div>
                </Card>

                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard title="Attendance" value={`${stats.attendance}%`} subtitle="Current Sem" icon={Clock} gradient={stats.attendance >= 75 ? "green" : "orange"} />
                        <StatCard title="Reward Points" value={student.reward_points?.toString() || '0'} subtitle="Total Earned" icon={GraduationCap} gradient="purple" />
                        <StatCard title="Placements" value={stats.placements_applied?.toString() || '0'} subtitle="Applications" icon={CheckCircle2} gradient="blue" />
                    </div>

                    <Card className="p-6 glass-card">
                        <h3 className="font-semibold text-lg mb-4">Learning Progress</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Courses Completed</span>
                                    <span className="text-sm text-muted-foreground">{learning.completed_lessons} / {learning.total_lessons} Lessons</span>
                                </div>
                                <Progress value={learningPercentage} className="h-2" />
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                                <div className="w-12 h-12 rounded-full stat-gradient-orange flex items-center justify-center">
                                    <ShieldAlert className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Engagement Score</p>
                                    <p className="text-2xl font-bold">{learning.engagement_score || 0}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <Card className="p-6 glass-card">
                <h3 className="font-semibold text-lg mb-4">Leave History</h3>
                {leaves && leaves.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 font-medium text-muted-foreground">Type</th>
                                    <th className="text-left py-2 font-medium text-muted-foreground">From</th>
                                    <th className="text-left py-2 font-medium text-muted-foreground">To</th>
                                    <th className="text-left py-2 font-medium text-muted-foreground">Reason</th>
                                    <th className="text-right py-2 font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.map((l: any) => (
                                    <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="py-3 font-medium">{l.leave_type}</td>
                                        <td className="py-3">{new Date(l.from_date).toLocaleDateString()}</td>
                                        <td className="py-3">{new Date(l.to_date).toLocaleDateString()}</td>
                                        <td className="py-3 truncate max-w-[200px]" title={l.reason}>{l.reason}</td>
                                        <td className="py-3 text-right">
                                            <Badge variant={l.status === 'Approved' ? 'default' : l.status === 'Rejected' ? 'destructive' : 'outline'}
                                                className={l.status === 'Approved' ? 'bg-success text-success-foreground' : ''}>
                                                {l.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">No leave requests found for this student.</p>
                )}
            </Card>
        </div>
    );
}
