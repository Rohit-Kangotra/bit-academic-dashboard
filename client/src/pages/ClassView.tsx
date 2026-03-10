import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const students = [
  { name: "Arun Kumar", id: "CS2101", cgpa: 8.54, attendance: 87, skills: 342, projects: 2 },
  { name: "Divya Ramesh", id: "CS2102", cgpa: 9.12, attendance: 92, skills: 410, projects: 3 },
  { name: "Karthik S", id: "CS2103", cgpa: 7.89, attendance: 78, skills: 280, projects: 1 },
  { name: "Meera Patel", id: "CS2104", cgpa: 8.76, attendance: 95, skills: 365, projects: 2 },
  { name: "Ravi Verma", id: "CS2105", cgpa: 7.45, attendance: 72, skills: 210, projects: 1 },
  { name: "Lakshmi N", id: "CS2106", cgpa: 8.90, attendance: 88, skills: 390, projects: 3 },
];

export default function ClassView() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Class View</h1>

        <Tabs defaultValue="cs301">
          <TabsList>
            <TabsTrigger value="cs301">CS301 - DSA</TabsTrigger>
            <TabsTrigger value="cs305">CS305 - DBMS</TabsTrigger>
            <TabsTrigger value="cs412">CS412 - ML</TabsTrigger>
          </TabsList>

          {["cs301", "cs305", "cs412"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <Card className="p-4 glass-card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-muted-foreground">Student</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">ID</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">CGPA</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Attendance</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Skill Pts</th>
                      <th className="text-left py-2 font-medium text-muted-foreground">Projects</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-3 font-medium">{s.name}</td>
                        <td className="py-3 text-muted-foreground">{s.id}</td>
                        <td className="py-3">{s.cgpa}</td>
                        <td className="py-3">
                          <Badge className={`text-xs ${s.attendance >= 85 ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}`}>
                            {s.attendance}%
                          </Badge>
                        </td>
                        <td className="py-3">{s.skills}</td>
                        <td className="py-3">{s.projects}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
