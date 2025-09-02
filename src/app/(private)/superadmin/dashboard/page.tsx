"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useAuth } from "@/entities/auth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">
              All services are working
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Online Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Active administrators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              System Version
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v1.0.0</div>
            <p className="text-xs text-muted-foreground">
              Latest stable version
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">
              Uptime
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Quick access to managing different data models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div 
                  onClick={() => router.push('/superadmin/dashboard/admins')}
                  className="group p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🛡️</span>
                    <h3 className="font-semibold group-hover:text-primary">Admins</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Manage admin accounts
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push('/superadmin/dashboard/admins')
                      }}
                      className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                    >
                      View
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push('/superadmin/dashboard/admins/create')
                      }}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                    >
                      Create
                    </button>
                  </div>
                </div>
            {/* Уведомления */}
            <div 
              onClick={() => router.push('/dashboard/notifications')}
              className="group p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📢</span>
                <h3 className="font-semibold group-hover:text-primary">Notifications</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Manage system notifications
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push('/dashboard/notifications')
                  }}
                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                >
                  View
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push('/dashboard/notifications/create')
                  }}
                  className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                >
                  Create
                </button>
              </div>
            </div>

            {/* Пользователи */}
            <div 
              onClick={() => router.push('/superadmin/dashboard/users')}
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
                    router.push('/superadmin/dashboard/users')
                  }}
                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                >
                  View
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push('/superadmin/dashboard/users?status=active')
                  }}
                  className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                >
                  Active
                </button>
              </div>
            </div>

            {/* App Wallet */}
            <div 
              onClick={() => router.push('/dashboard/appWallet')}
              className="group p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💰</span>
                <h3 className="font-semibold group-hover:text-primary">App Wallet</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Manage app wallet
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push('/dashboard/appWallet')
                  }}
                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                >
                  View
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push('/dashboard/appWallet/create')
                  }}
                  className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                >
                  Create
                </button>
              </div>
            </div>

            {/* Leaderboard Participants */}
            <div 
              onClick={() => router.push('/dashboard/leaderboardParticipants')}
              className="group p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🏆</span>
                <h3 className="font-semibold group-hover:text-primary">Leaderboard participants</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Manage manual leaderboard entries
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push('/dashboard/leaderboardParticipants')
                  }}
                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                >
                  View
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push('/dashboard/leaderboardParticipants/create')
                  }}
                  className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                >
                  Create
                </button>
              </div>
            </div>

            {/* Депозиты и операции */}
            <div 
              onClick={() => router.push('/dashboard/deposits')}
              className="group p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💰</span>
                <h3 className="font-semibold group-hover:text-primary">Deposits</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Manage deposits and user operations
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push('/dashboard/deposits')
                  }}
                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                >
                    View
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push('/dashboard/deposits?status=PENDING')
                  }}
                  className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded"
                >
                  Pending
                </button>
              </div>
            </div>

            {/* Выводы */}
            <div 
              onClick={() => window.location.href = '/dashboard/withdraws'}
              className="group p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💸</span>
                <h3 className="font-semibold group-hover:text-primary">Withdrawals</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Manage withdrawal requests
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    window.location.href = '/dashboard/withdraws'
                  }}
                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                >
                  View
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    window.location.href = '/dashboard/withdraws?status=PENDING'
                  }}
                  className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded"
                >
                  Pending
                </button>
              </div>
            </div>

            {/* Настройки приложения */}
            <div 
              onClick={() => window.location.href = '/dashboard/app-settings'}
              className="group p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">⚙️</span>
                <h3 className="font-semibold group-hover:text-primary">App Settings</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Manage app settings
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    window.location.href = '/dashboard/app-settings'
                  }}
                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}