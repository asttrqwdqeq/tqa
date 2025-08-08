"use client"

import { use, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Badge } from '@/shared/components/ui/badge'

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

  const { register, handleSubmit, reset } = useForm<Partial<DepositEntity>>()

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
              <select id="currency" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('currency')}>
                <option value="">Not change</option>
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
                <option value="TON">TON</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('status')}>
                <option value="">Not change</option>
                <option value="PENDING">PENDING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="userWallet">App wallet</Label>
              <Input id="userWallet" placeholder="Optional" {...register('userWallet')} />
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


