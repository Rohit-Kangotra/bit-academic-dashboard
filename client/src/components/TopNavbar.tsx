import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Search, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Button } from "./ui/button";

export function TopNavbar() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchApi('/api/v1/notifications'),
    enabled: !!user,
    refetchInterval: 30000 // Refetch every 30s
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2) || "U";

  const roleBadgeClass =
    user?.role === "admin"
      ? "bg-accent text-accent-foreground"
      : user?.role === "faculty"
        ? "bg-success text-success-foreground"
        : "bg-primary text-primary-foreground";

  return (
    <header className="h-14 flex items-center justify-between border-b bg-card px-4 gap-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="hidden sm:flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-48 placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">

        {/* Notifications Popover */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 mr-4 mt-2" align="end">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications yet.
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((n: any) => (
                    <div
                      key={n.id}
                      className={`flex gap-3 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex-1 space-y-1">
                        <p className={`text-sm ${!n.is_read ? 'font-semibold' : 'font-medium'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground pt-1">
                          {new Date(n.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!n.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsReadMutation.mutate(n.id);
                          }}
                          disabled={markAsReadMutation.isPending}
                          title="Mark as read"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium">{user?.name}</span>
            <Badge className={`text-[10px] px-1.5 py-0 h-4 ${roleBadgeClass}`}>
              {user?.role}
            </Badge>
          </div>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
