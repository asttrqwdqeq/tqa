"use client";
import { useAuth } from "@/entities/auth";
import { Button } from "@/shared/components/ui/button";
import { LogOut, User, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import Link from "next/link";

export function Header() {
  const { user, logout, isLoggingOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="border-b bg-card text-card-foreground shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-xl font-semibold">Админ панель</Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{user.username}</span>
            <span className="text-xs bg-secondary px-2 py-1 rounded">
              {user.role}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Настройки</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? 'Выход...' : 'Выйти'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}