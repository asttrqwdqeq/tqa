"use client"

import { use, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Badge } from '@/shared/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/components/ui'

import { useDeposit, useUpdateModel, type DepositEntity } from '@/shared/hooks'

type Currency = DepositEntity['currency']
type Status = DepositEntity['status']

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditDepositPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const { data: deposit, isLoading } = useDeposit(id, { enabled: !!id })
  const updateMutation = useUpdateModel<DepositEntity, Partial<DepositEntity>>('deposits', {
    onSuccess: () => router.push(`/dashboard/deposits/${id}`)
  })

  console.log(deposit)

  const { register, handleSubmit, reset, control } = useForm<Partial<DepositEntity>>()

  // Заполняем форму после загрузки
  useEffect(() => {
    if (deposit) {
      reset({
        txHash: deposit.txHash || '',
        value: deposit.value,
        equivalentValue: deposit.equivalentValue,
        currency: deposit.currency,
        status: deposit.status,
        userWallet: deposit.userWallet || '',
        appWallet: deposit.appWallet || '',
      })
    }
  }, [deposit, reset])

  const onSubmit = (data: Partial<DepositEntity>) => {
    // Приведение типов для select/number
    const payload: Partial<DepositEntity> = {
      ...data,
      value: data.value !== undefined ? Number(data.value) : undefined,
      equivalentValue: data.equivalentValue !== undefined ? Number(data.equivalentValue) : undefined,
      currency: data.currency as Currency | undefined,
      status: data.status as Status | undefined,
      txHash: data.txHash === '' ? undefined : data.txHash,
      userWallet: data.userWallet === '' ? undefined : data.userWallet,
      appWallet: data.appWallet === '' ? undefined : data.appWallet,
    }
    updateMutation.mutate({ id, data: payload })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push(`/dashboard/deposits/${id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit deposit</h1>
            <p className="text-muted-foreground">ID: {id}</p>
          </div>
        </div>
        {deposit && (
          <Badge variant="outline">{deposit.status}</Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit deposit</CardTitle>
          <CardDescription>Edit deposit</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="txHash">TX Hash</Label>
              <Input id="txHash" placeholder="Optional" {...register('txHash')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Amount (USD)</Label>
              <Input id="value" type="number" step="0.01" {...register('value')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equivalentValue">Equivalent (USD)</Label>
              <Input id="equivalentValue" type="number" step="0.01" {...register('equivalentValue')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <Select
                    key={String(field.value ?? deposit?.currency ?? '')}
                    value={(field.value ?? (deposit?.currency ?? '')) as string}
                    onValueChange={(v) => field.onChange(v === '' ? undefined : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Not change" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="TON">TON</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    key={String(field.value ?? deposit?.status ?? '')}
                    value={(field.value ?? (deposit?.status ?? '')) as string}
                    onValueChange={(v) => field.onChange(v === '' ? undefined : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Not change" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                      <SelectItem value="FAILED">FAILED</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="appWallet">App wallet</Label>
              <Input id="appWallet" placeholder="Optional" {...register('appWallet')} />
            </div>

            <div className="md:col-span-2 flex gap-2 pt-2">
              <Button type="submit" disabled={isLoading || updateMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/deposits/${id}`)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


