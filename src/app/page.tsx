import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          {/* Hero Section */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Система управления с cookie-based авторизацией. 
              Войдите для доступа к панели управления.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/login">
                Войти в систему
              </Link>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="border-muted">
              <CardHeader>
                <CardTitle className="text-lg">🍪 Cookie авторизация</CardTitle>
                <CardDescription>
                  Безопасная система с httpOnly cookies и защитой от XSS
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-muted">
              <CardHeader>
                <CardTitle className="text-lg">⚡ TanStack Query</CardTitle>
                <CardDescription>
                  Умное кеширование и синхронизация состояния авторизации
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-muted">
              <CardHeader>
                <CardTitle className="text-lg">🎨 Современный UI</CardTitle>
                <CardDescription>
                  Интуитивный интерфейс с поддержкой темной темы
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* System Info */}
          <div className="mt-16 pt-8 border-t border-muted">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Версия системы: v1.0.0</p>
              <p>Авторизация: HttpOnly Cookies</p>
              <p>Статус: Готов к работе</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}