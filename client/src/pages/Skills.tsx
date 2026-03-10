import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const radarData = [
  { skill: "Coding", value: 85 },
  { skill: "Communication", value: 70 },
  { skill: "Leadership", value: 65 },
  { skill: "Teamwork", value: 80 },
  { skill: "Problem Solving", value: 90 },
  { skill: "Research", value: 60 },
];

const skillCategories = [
  {
    category: "Technical Skills",
    skills: [
      { name: "Python", points: 85, level: "Advanced" },
      { name: "React.js", points: 72, level: "Intermediate" },
      { name: "Machine Learning", points: 60, level: "Intermediate" },
      { name: "SQL", points: 78, level: "Advanced" },
      { name: "Java", points: 68, level: "Intermediate" },
    ],
  },
  {
    category: "Certifications",
    skills: [
      { name: "AWS Cloud Practitioner", points: 100, level: "Completed" },
      { name: "Google Data Analytics", points: 100, level: "Completed" },
      { name: "TensorFlow Developer", points: 45, level: "In Progress" },
    ],
  },
];

export default function Skills() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Skill Progress</h1>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">342</p>
            <p className="text-xs text-muted-foreground">Total Skill Points</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 glass-card">
            <h3 className="font-semibold mb-4">Skill Radar</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220, 13%, 91%)" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar dataKey="value" stroke="hsl(221, 83%, 53%)" fill="hsl(221, 83%, 53%)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {skillCategories.map((cat) => (
            <Card key={cat.category} className="p-5 glass-card">
              <h3 className="font-semibold mb-4">{cat.category}</h3>
              <div className="space-y-4">
                {cat.skills.map((s) => (
                  <div key={s.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{s.name}</span>
                      <Badge variant="secondary" className="text-xs">{s.level}</Badge>
                    </div>
                    <Progress value={s.points} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
