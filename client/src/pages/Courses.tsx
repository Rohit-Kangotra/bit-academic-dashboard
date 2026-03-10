import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Link } from "react-router-dom";

export default function Courses() {
  const { data, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => fetchApi('/api/v1/courses')
  });

  const courses = data?.courses || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Courses</h1>
        {isLoading ? (
          <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.map((c: any) => (
              <Link to={`/courses/${c.course_code}`} key={c.course_code}>
                <Card className="p-5 glass-card hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full border-l-4 border-l-primary">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">{c.course_code}</Badge>
                    <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 text-xs">
                      {c.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{c.name}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground mt-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span>{c.credits} Credits</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
