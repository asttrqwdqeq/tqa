/**
 * Примеры использования универсальных хуков для работы с моделями
 * Демонстрирует различные сценарии использования API хуков
 */

import React from 'react'
import { 
  // Универсальные хуки
  useModelList,
  useCreateModel,
  useDeleteModel,
  useModelPagination,
  usePrefetchModel,
  
  // Типизированные хуки
  useNotifications,
  useCreateNotification,
  useToggleNotificationAlert,
  
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useToggleUserStatus,
  
  useOrders,
  useCreateOrder,
  useUpdateOrderStatus,
  
  // Типы
  type NotificationEntity,
  type UserEntity,
  type OrderEntity,
  type CreateNotificationData,
  type CreateUserData,
  type CreateOrderData,
} from '@/shared/hooks'

// =============================================================================
// Пример 1: Универсальные хуки - работа с любой моделью
// =============================================================================

export function UniversalModelExample() {
  const { page, paginationConfig, params } = useModelPagination(1, 10)
  
  // Универсальный хук - может работать с любой моделью
  const { data: notifications, isLoading: notificationsLoading } = useModelList(
    'notifications', 
    params
  )
  
  const { data: users, isLoading: usersLoading } = useModelList(
    'users',
    { ...params, role: 'user' } // Дополнительные фильтры
  )
  
  const createNotificationMutation = useCreateModel('notifications')
  const deleteUserMutation = useDeleteModel('users')
  
  const handleCreateNotification = () => {
    createNotificationMutation.mutate({
      title: 'Новое уведомление',
      message: 'Создано через универсальный хук',
      type: 'info',
      isActive: true
    } as any) // Временное решение для примера
  }
  
  const handleDeleteUser = (userId: string) => {
    if (confirm('Удалить пользователя?')) {
      deleteUserMutation.mutate(userId)
    }
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Универсальные хуки</h2>
      
      {/* Уведомления */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Уведомления</h3>
        {notificationsLoading ? (
          <div>Загрузка уведомлений...</div>
        ) : (
          <div>
            <p>Найдено: {notifications?.total} уведомлений</p>
            <button onClick={handleCreateNotification}>
              Создать уведомление
            </button>
          </div>
        )}
      </div>
      
      {/* Пользователи */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Пользователи</h3>
        {usersLoading ? (
          <div>Загрузка пользователей...</div>
        ) : (
          <div>
            <p>Найдено: {users?.total} пользователей</p>
            {users?.data.map((user: any) => (
              <div key={user.id} className="flex justify-between items-center py-2">
                <span>{user.name} ({user.email})</span>
                <button onClick={() => handleDeleteUser(user.id)}>
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Пагинация */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => paginationConfig(100).onPageChange(page - 1)}
          disabled={page === 1}
        >
          Предыдущая
        </button>
        <span>Страница {page}</span>
        <button 
          onClick={() => paginationConfig(100).onPageChange(page + 1)}
        >
          Следующая
        </button>
      </div>
    </div>
  )
}

// =============================================================================
// Пример 2: Типизированные хуки - полная типобезопасность
// =============================================================================

export function TypedModelExample() {
  // Типизированные хуки с автокомплитом и проверкой типов
  const { data: notifications, isLoading } = useNotifications({
    page: 1,
    limit: 5,
    isAlert: true // Фильтр по важным уведомлениям
  })
  
  const createNotificationMutation = useCreateNotification({
    onSuccess: (notification) => {
      console.log('Создано уведомление:', notification.title)
    },
    onError: (error: any) => {
      console.error('Ошибка создания:', error.message)
    }
  })
  
  const toggleAlertMutation = useToggleNotificationAlert()
  
  const handleCreateNotification = () => {
    const data: CreateNotificationData = {
      title: 'Типизированное уведомление',
      message: 'Создано с полной типизацией',
      isAlert: true // TypeScript проверит корректность типа
    }
    
    createNotificationMutation.mutate(data)
  }
  
  const handleToggleAlert = (notification: NotificationEntity) => {
    toggleAlertMutation.toggle(notification.id, !notification.isAlert)
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Типизированные хуки</h2>
      
      <button onClick={handleCreateNotification}>
        Создать типизированное уведомление
      </button>
      
      {isLoading ? (
        <div>Загрузка...</div>
      ) : (
        <div className="space-y-2">
          {notifications?.data.map((notification) => (
            <div key={notification.id} className="border p-3 rounded">
              <h4 className="font-semibold">{notification.title}</h4>
              <p className="text-sm text-gray-600">{notification.message}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  notification.isAlert 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {notification.isAlert ? 'Важное' : 'Обычное'}
                </span>
                <button 
                  onClick={() => handleToggleAlert(notification)}
                  disabled={toggleAlertMutation.isLoading}
                >
                  {notification.isAlert ? 'Сделать обычным' : 'Сделать важным'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Пример 3: CRUD операции с разными моделями
// =============================================================================

export function CrudOperationsExample() {
  // Хуки для пользователей
  const { data: users } = useUsers({ page: 1, limit: 3 })
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()
  const toggleUserMutation = useToggleUserStatus()
  
  // Хуки для заказов
  const { data: orders } = useOrders({ page: 1, limit: 3 })
  const createOrderMutation = useCreateOrder()
  const updateOrderStatusMutation = useUpdateOrderStatus()
  
  const handleCreateUser = () => {
    const userData: CreateUserData = {
      name: 'Новый пользователь',
      email: `user${Date.now()}@example.com`,
      password: 'password123',
      role: 'user',
      isActive: true
    }
    
    createUserMutation.mutate(userData, {
      onSuccess: (user) => {
        console.log('Пользователь создан:', user.name)
      }
    })
  }
  
  const handleUpdateUser = (user: UserEntity) => {
    updateUserMutation.mutate({
      id: user.id,
      data: {
        name: `${user.name} (обновлен)`,
        role: user.role === 'user' ? 'moderator' : 'user'
      }
    })
  }
  
  const handleCreateOrder = () => {
    const orderData: CreateOrderData = {
      orderNumber: `ORD-${Date.now()}`,
      customerName: 'Тестовый клиент',
      customerEmail: 'test@example.com',
      total: 15000,
      status: 'pending',
      items: [
        { name: 'Товар 1', quantity: 2, price: 5000, total: 10000 },
        { name: 'Товар 2', quantity: 1, price: 5000, total: 5000 }
      ]
    }
    
    createOrderMutation.mutate(orderData)
  }
  
  const handleUpdateOrderStatus = (order: OrderEntity) => {
    const nextStatus = order.status === 'pending' ? 'paid' : 
                      order.status === 'paid' ? 'shipped' : 
                      order.status === 'shipped' ? 'delivered' : 'pending'
    
    updateOrderStatusMutation.updateStatus(order.id, nextStatus)
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">CRUD операции</h2>
      
      {/* Управление пользователями */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Пользователи</h3>
        <button onClick={handleCreateUser} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
          Создать пользователя
        </button>
        
        <div className="space-y-2">
          {users?.data.map((user) => (
            <div key={user.id} className="border p-3 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">{user.name}</span>
                  <span className="text-sm text-gray-600 ml-2">({user.email})</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.role}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdateUser(user)}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                  >
                    Обновить
                  </button>
                  <button 
                    onClick={() => toggleUserMutation.toggle(user.id, !user.isActive)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                  >
                    {user.isActive ? 'Заблокировать' : 'Разблокировать'}
                  </button>
                  <button 
                    onClick={() => deleteUserMutation.mutate(user.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Управление заказами */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Заказы</h3>
        <button onClick={handleCreateOrder} className="mb-4 px-4 py-2 bg-green-500 text-white rounded">
          Создать заказ
        </button>
        
        <div className="space-y-2">
          {orders?.data.map((order) => (
            <div key={order.id} className="border p-3 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">{order.orderNumber}</span>
                  <span className="text-sm text-gray-600 ml-2">{order.customerName}</span>
                  <span className="ml-2 font-medium">{order.total.toLocaleString()} ₽</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'paid' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <button 
                  onClick={() => handleUpdateOrderStatus(order)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  Изменить статус
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Пример 4: Предзагрузка и оптимизация производительности
// =============================================================================

export function PerformanceOptimizationExample() {
  const { prefetchList, prefetchItem } = usePrefetchModel()
  const [selectedUserId, setSelectedUserId] = React.useState<string>('')
  
  // Основные данные
  const { data: users } = useUsers({ page: 1, limit: 10 })
  const { data: selectedUser } = useUser(selectedUserId)
  
  // Предзагрузка при наведении
  const handleUserHover = (userId: string) => {
    prefetchItem('users', userId)
  }
  
  // Предзагрузка следующей страницы
  const handlePrefetchNextPage = () => {
    prefetchList('users', { page: 2, limit: 10 })
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Оптимизация производительности</h2>
      
      <button onClick={handlePrefetchNextPage} className="px-4 py-2 bg-purple-500 text-white rounded">
        Предзагрузить следующую страницу
      </button>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Список пользователей */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Пользователи</h3>
          <div className="space-y-2">
            {users?.data.map((user) => (
              <div 
                key={user.id}
                className="border p-2 rounded cursor-pointer hover:bg-gray-50"
                onMouseEnter={() => handleUserHover(user.id)}
                onClick={() => setSelectedUserId(user.id)}
              >
                <span className="font-medium">{user.name}</span>
                <span className="text-sm text-gray-600 ml-2">{user.email}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Детали выбранного пользователя */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Детали пользователя</h3>
          {selectedUser ? (
            <div className="border p-4 rounded">
              <h4 className="font-semibold">{selectedUser.name}</h4>
              <p>Email: {selectedUser.email}</p>
              <p>Роль: {selectedUser.role}</p>
              <p>Статус: {selectedUser.isActive ? 'Активен' : 'Заблокирован'}</p>
              <p>Создан: {new Date(selectedUser.createdAt).toLocaleString()}</p>
              {selectedUser.lastLogin && (
                <p>Последний вход: {new Date(selectedUser.lastLogin).toLocaleString()}</p>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Выберите пользователя для просмотра деталей</div>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Пример 5: Объединенный компонент со всеми возможностями
// =============================================================================

export function CompleteModelManagementExample() {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Универсальные хуки для моделей - Примеры</h1>
      
      <UniversalModelExample />
      <TypedModelExample />
      <CrudOperationsExample />
      <PerformanceOptimizationExample />
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Возможности хуков:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ Универсальная работа с любыми моделями</li>
          <li>✅ Полная типизация и автокомплит</li>
          <li>✅ Автоматическое кэширование и инвалидация</li>
          <li>✅ Обработка ошибок и состояний загрузки</li>
          <li>✅ Предзагрузка для оптимизации UX</li>
          <li>✅ Toast уведомления</li>
          <li>✅ Серверная пагинация</li>
          <li>✅ Пакетные операции</li>
        </ul>
      </div>
    </div>
  )
}