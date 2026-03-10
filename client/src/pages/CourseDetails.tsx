import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Video, CheckCircle2, Circle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";

export default function CourseDetails() {
    const { courseCode } = useParams<{ courseCode: string }>();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const isStudent = user?.role === 'student';

    const { data: courseData, isLoading: isCourseLoading } = useQuery({
        queryKey: ['course', courseCode],
        queryFn: () => fetchApi(`/api/v1/courses/${courseCode}`)
    });

    const { data: lessonsData, isLoading: isLessonsLoading } = useQuery({
        queryKey: ['courseLessons', courseCode],
        queryFn: () => fetchApi(`/api/v1/courses/${courseCode}/lessons`)
    });

    const completeMutation = useMutation({
        mutationFn: async (lessonId: number) => {
            const response = await fetch(`/api/v1/courses/${courseCode}/lessons/${lessonId}/complete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to mark complete');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseLessons', courseCode] });
            toast.success("Lesson marked as complete! 🎉");
        },
        onError: () => toast.error("Failed to update progress")
    });

    if (isCourseLoading || isLessonsLoading) {
        return (
            <DashboardLayout>
                <div className="py-20 flex justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    const course = courseData?.course;
    const lessons = lessonsData?.lessons || [];
    const progress = lessonsData?.progress || [];

    const completedLessonIds = progress.filter((p: any) => p.status === 'completed').map((p: any) => p.lesson_id);
    const completedCount = completedLessonIds.length;
    const totalCount = lessons.length;
    const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    if (!course) {
        return <DashboardLayout><div className="p-8 text-center bg-muted/20 rounded-lg border border-dashed border-border mt-10 max-w-lg mx-auto">Course not found</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in pb-10">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Link to="/courses" className="text-sm text-primary hover:underline">← Back to Courses</Link>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold tracking-tight">{course.name}</h1>
                                <Badge variant="outline" className="border-primary/50 text-primary">{course.course_code}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-muted-foreground mt-4">
                                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {course.credits} Credits</span>
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">{course.category}</span>
                            </div>
                        </div>

                        {isStudent && (
                            <Card className="p-5 flex flex-col gap-3 min-w-[280px] border-l-4 border-l-success shadow-sm">
                                <div className="flex justify-between items-center px-1">
                                    <span className="font-semibold text-sm">Your Progress</span>
                                    <span className="font-bold text-success">{progressPercent}%</span>
                                </div>
                                <Progress value={progressPercent} className="h-2.5 bg-muted" />
                                <div className="text-xs text-muted-foreground text-center mt-1">
                                    {completedCount} / {totalCount} Lessons Completed
                                </div>
                            </Card>
                        )}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        Course Plan
                        <Badge variant="secondary" className="font-normal">{totalCount} Lessons</Badge>
                    </h2>

                    <div className="grid gap-4 mt-6">
                        {lessons.length === 0 ? (
                            <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg bg-muted/10">No lessons available for this course yet.</div>
                        ) : lessons.map((lesson: any, i: number) => {
                            const isCompleted = completedLessonIds.includes(lesson.id);
                            return (
                                <Card key={lesson.id} className={`p-0 overflow-hidden transition-all duration-300 ${isCompleted ? 'border-success/50 bg-success/5' : 'hover:border-primary/40 hover:shadow-md'}`}>
                                    <div className="flex flex-col md:flex-row">
                                        <div className="p-5 flex-1 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <Badge variant="outline" className="mb-2 bg-background">Unit {lesson.unit_no}</Badge>
                                                    <h3 className="font-semibold text-lg">{lesson.topic}</h3>
                                                </div>
                                                {isStudent && (
                                                    <div className="flex items-center justify-center pt-1 md:hidden">
                                                        {isCompleted ? (
                                                            <Badge className="bg-success hover:bg-success text-success-foreground gap-1 py-1 px-3 shadow-sm">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /> Done
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-muted-foreground gap-1 py-1 px-3">
                                                                <Circle className="w-3.5 h-3.5" /> Pending
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-4 pt-2">
                                                {lesson.material_link && (
                                                    <a href={lesson.material_link} target="_blank" rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20">
                                                        <FileText className="w-4 h-4" /> Material
                                                    </a>
                                                )}
                                                {lesson.video_link && (
                                                    <a href={lesson.video_link} target="_blank" rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-sm text-rose-500 hover:text-rose-600 transition-colors px-3 py-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20">
                                                        <Video className="w-4 h-4" /> Watch Video
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div className={`p-5 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 md:w-48 border-t md:border-t-0 md:border-l ${isCompleted ? 'bg-success/10 border-success/20' : 'bg-muted/30 border-border'}`}>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/60">{lesson.hours_required}</div>
                                                <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mt-1">Hours</div>
                                            </div>

                                            {isStudent && (
                                                <div className="flex flex-col items-center">
                                                    {isCompleted ? (
                                                        <div className="flex items-center gap-1.5 text-success font-medium text-sm bg-success/10 px-3 py-1.5 rounded-full border border-success/20 shadow-sm">
                                                            <CheckCircle2 className="w-4 h-4" /> Completed
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            onClick={() => completeMutation.mutate(lesson.id)}
                                                            disabled={completeMutation.isPending}
                                                            size="sm"
                                                            className="w-full shadow-sm shadow-primary/20 hover:shadow-md hover:-translate-y-0.5 transition-all"
                                                        >
                                                            Take Assessment
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
