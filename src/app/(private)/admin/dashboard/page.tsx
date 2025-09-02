"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useCurrentUser } from "@/entities/auth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: user, isLoading } = useCurrentUser();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-muted-foreground">
        Failed to load user data.
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user.username}!
          </h1>
          <p className="text-muted-foreground">
            Manage the system from this admin panel
          </p>
        </div>
      </div>

      {/* Removed other blocks; keep only Users below */}

      <Card>
        <CardHeader>
            <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Quick access to managing different data models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {/* Users only */}
            <div 
              onClick={() => router.push('/admin/dashboard/users')}
              className="group p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">👥</span>
                <h3 className="font-semibold group-hover:text-primary">Users</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Manage system users
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push('/admin/dashboard/users')
                  }}
                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                >
                  View
                </button>
              </div>
            </div>
            {/* Active Users separate link */}
            <div 
              onClick={() => router.push('/admin/dashboard/users?status=active')}
              className="group p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">✅</span>
                <h3 className="font-semibold group-hover:text-primary">Active users</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                View only active users
              </p>
              <div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push('/admin/dashboard/users?status=active')
                  }}
                  className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


