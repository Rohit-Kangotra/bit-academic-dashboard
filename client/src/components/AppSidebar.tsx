import {
  LayoutDashboard,
  User,
  BookOpen,
  TrendingUp,
  ClipboardList,
  FolderKanban,
  CalendarOff,
  BarChart3,
  Users,
  GraduationCap,
  LogOut,
  CalendarCheck,
  School,
  Briefcase,
  Star,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["student", "faculty", "admin"] },
  { title: "Profile", url: "/profile", icon: User, roles: ["student"] },
  { title: "My Classroom", url: "/classroom", icon: School, roles: ["student"] },
  { title: "Attendance", url: "/attendance", icon: CalendarCheck, roles: ["student"] },
  { title: "Courses", url: "/courses", icon: BookOpen, roles: ["student", "faculty"] },
  { title: "Skills", url: "/skills", icon: TrendingUp, roles: ["student"] },
  { title: "Activity Hub", url: "/activities", icon: Star, roles: ["student", "faculty", "admin"] },
  { title: "Assignments", url: "/assignments", icon: ClipboardList, roles: ["student", "faculty"] },
  { title: "Projects", url: "/projects", icon: FolderKanban, roles: ["student", "faculty"] },
  { title: "Placements", url: "/placements", icon: Briefcase, roles: ["student", "faculty", "admin"] },
  { title: "Leave Requests", url: "/leaves", icon: CalendarOff, roles: ["student"] },
  { title: "Class View", url: "/class-view", icon: Users, roles: ["faculty"] },
  { title: "Analytics", url: "/analytics", icon: BarChart3, roles: ["admin"] },
  { title: "Students", url: "/students", icon: GraduationCap, roles: ["admin"] },
  { title: "Import Center", url: "/import-center", icon: ClipboardList, roles: ["admin"] },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  if (!user) return null;

  const filteredItems = navItems.filter((item) => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <div className="px-3 py-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg stat-gradient-blue flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-sidebar-foreground">BIT Academic</span>
                  <span className="text-xs text-sidebar-foreground/60">Management Portal</span>
                </div>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center py-4 mb-2">
              <div className="w-9 h-9 rounded-lg stat-gradient-blue flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
          )}
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="hover:bg-sidebar-accent/50">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
