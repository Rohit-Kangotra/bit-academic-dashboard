import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Mentees() {
    const navigate = useNavigate();

    const { data: menteesData, isLoading } = useQuery({
        queryKey: ['mentees'],
        queryFn: () => fetchApi('/api/v1/faculty/mentees')
    });

    const mentees = menteesData?.mentees || [];

    if (isLoading) return <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Mentees</h1>
                    <p className="text-muted-foreground mt-1">Manage and track your assigned students</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full font-medium">
                    <Users className="w-4 h-4" />
                    <span>{mentees.length} Students</span>
                </div>
            </div>

            <Card className="p-5 glass-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Roll No</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student Name</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Department</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Semester</th>
                                <th className="text-center py-3 px-4 font-medium text-muted-foreground">CGPA</th>
                                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Reward Points</th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mentees.length === 0 ? (
                                <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No students currently assigned to you.</td></tr>
                            ) : mentees.map((m: any) => (
                                <tr key={m.roll_no} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="py-4 px-4 text-muted-foreground font-mono text-xs">{m.roll_no}</td>
                                    <td className="py-4 px-4 font-medium uppercase">{m.name}</td>
                                    <td className="py-4 px-4">{m.department || 'B.Tech IT'}</td>
                                    <td className="py-4 px-4">S{m.semester || '6'}</td>
                                    <td className="py-4 px-4 text-center">
                                        <Badge variant={parseFloat(m.cgpa) >= 7.0 ? "secondary" : "destructive"} className="text-xs font-bold">
                                            {m.cgpa}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <span className="font-semibold text-primary">{m.reward_points || 0}</span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate(`/faculty/student/${m.roll_no}`)}
                                            className="gap-1 text-primary hover:text-primary hover:bg-primary/10"
                                        >
                                            View Profile <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
