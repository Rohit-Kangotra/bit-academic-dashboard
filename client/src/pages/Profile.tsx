import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Phone, MapPin, Calendar, BookOpen } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";

export default function Profile() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['profile', user?.role],
    queryFn: () => fetchApi(user?.role === 'student' ? '/api/v1/students/profile' : '/api/v1/faculty/students')
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="py-12 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      </DashboardLayout>
    );
  }

  const profile = user?.role === 'student' ? data?.student || {} : data?.faculty || {};
  const isStudent = user?.role === 'student';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{isStudent ? 'Academic Profile' : 'Faculty Profile'}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 glass-card col-span-1">
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {profile.name?.substring(0, 2).toUpperCase() || 'UN'}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-bold uppercase">{profile.name}</h2>
              {isStudent && <p className="text-sm text-muted-foreground">Roll No: {profile.roll_no}</p>}
              {!isStudent && <p className="text-sm text-muted-foreground">{profile.title} {profile.name} ({profile.faculty_id})</p>}
              <Badge className="mt-2 bg-primary text-primary-foreground">{profile.department}</Badge>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>+91 98765 43210</span>
              </div>

              {isStudent && (
                <>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Batch {profile.batch || '2023 - 2027'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span>Semester {profile.semester || 6}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm pt-4 border-t">
                    <span className="font-semibold text-muted-foreground w-16">Mentor:</span>
                    <span className="font-medium text-primary">{profile.mentor_name || 'Unassigned'}</span>
                  </div>
                </>
              )}
            </div>
          </Card>

          <div className="col-span-1 lg:col-span-2 space-y-6">
            <Card className="p-6 glass-card">
              <h3 className="font-semibold mb-4">Academic Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "CGPA", value: isStudent ? profile.cgpa : "N/A" },
                  { label: "Reward Points", value: isStudent ? profile.reward_points : "N/A" },
                  { label: "Backlogs", value: isStudent ? profile.backlogs : "N/A" },
                  { label: "Rank", value: isStudent ? "12/156" : "N/A" },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{item.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </Card>

            {isStudent && (
              <Card className="p-6 glass-card">
                <h3 className="font-semibold mb-4">Top Skills</h3>
                <div className="space-y-4">
                  {[
                    { skill: "Python", level: 85 },
                    { skill: "React.js", level: 72 },
                    { skill: "Machine Learning", level: 60 },
                    { skill: "SQL & Databases", level: 78 },
                    { skill: "Data Structures", level: 90 },
                  ].map((s) => (
                    <div key={s.skill} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-36">{s.skill}</span>
                      <Progress value={s.level} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground w-10 text-right">{s.level}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
