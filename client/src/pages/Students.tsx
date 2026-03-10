import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

const allStudents = [
  { name: "Arun Kumar", id: "CS2101", dept: "CSE", cgpa: 8.54, semester: 6, placement: "Ready" },
  { name: "Divya Ramesh", id: "CS2102", dept: "CSE", cgpa: 9.12, semester: 6, placement: "Ready" },
  { name: "Karthik S", id: "IT2101", dept: "IT", cgpa: 7.89, semester: 6, placement: "Preparing" },
  { name: "Meera Patel", id: "EC2101", dept: "ECE", cgpa: 8.76, semester: 6, placement: "Ready" },
  { name: "Ravi Verma", id: "EE2101", dept: "EEE", cgpa: 7.45, semester: 4, placement: "Not Ready" },
  { name: "Lakshmi N", id: "CS2106", dept: "CSE", cgpa: 8.90, semester: 6, placement: "Ready" },
  { name: "Suresh M", id: "ME2101", dept: "MECH", cgpa: 7.10, semester: 6, placement: "Preparing" },
  { name: "Priya K", id: "CE2101", dept: "CIVIL", cgpa: 7.60, semester: 4, placement: "Not Ready" },
];

const placementColor: Record<string, string> = {
  Ready: "bg-success text-success-foreground",
  Preparing: "bg-warning text-warning-foreground",
  "Not Ready": "bg-destructive text-destructive-foreground",
};

export default function Students() {
  const [search, setSearch] = useState("");
  const filtered = allStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">All Students</h1>
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-48 placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <Card className="p-4 glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-muted-foreground">Name</th>
                <th className="text-left py-2 font-medium text-muted-foreground">ID</th>
                <th className="text-left py-2 font-medium text-muted-foreground">Dept</th>
                <th className="text-left py-2 font-medium text-muted-foreground">CGPA</th>
                <th className="text-left py-2 font-medium text-muted-foreground">Semester</th>
                <th className="text-left py-2 font-medium text-muted-foreground">Placement</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-3 font-medium">{s.name}</td>
                  <td className="py-3 text-muted-foreground">{s.id}</td>
                  <td className="py-3"><Badge variant="secondary" className="text-xs">{s.dept}</Badge></td>
                  <td className="py-3">{s.cgpa}</td>
                  <td className="py-3">{s.semester}</td>
                  <td className="py-3">
                    <Badge className={`text-xs ${placementColor[s.placement]}`}>{s.placement}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </DashboardLayout>
  );
}
