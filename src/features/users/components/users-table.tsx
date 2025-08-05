"use client";

import { useState } from "react";
import { useUsers, useDeleteUser, usePrefetchUser } from "@/entities/user/hooks/use-users";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

export function UsersTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Используем хук для получения пользователей
  const { data, isLoading, error, isFetching } = useUsers({
    page,
    limit,
    search: search || undefined,
  });

  // Хук для удаления пользователя
  const deleteUser = useDeleteUser();
  
  // Хук для предзагрузки пользователя при наведении
  const prefetchUser = usePrefetchUser();

  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      deleteUser.mutate(id);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Ошибка: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Пользователи
          {isFetching && (
            <span className="text-sm text-muted-foreground">Обновление...</span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Поиск */}
        <div className="mb-4">
          <Input
            placeholder="Поиск пользователей..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Сброс страницы при поиске
            }}
            className="max-w-sm"
          />
        </div>

        {/* Таблица */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Дата создания</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((user) => (
                  <TableRow
                    key={user.id}
                    onMouseEnter={() => prefetchUser(user.id)} // Предзагрузка при наведении
                  >
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Редактировать
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          disabled={deleteUser.isPending}
                        >
                          {deleteUser.isPending ? "Удаление..." : "Удалить"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Пагинация */}
            {data && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Показано {data.data.length} из {data.meta.total} пользователей
                </p>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Предыдущая
                  </Button>
                  
                  <span className="px-3 py-1 text-sm">
                    Страница {page} из {data.meta.totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= data.meta.totalPages}
                  >
                    Следующая
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}