"use client"

import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Modal } from "@/shared/components/ui/modal"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Label } from "@/shared/components/ui/label"
import { usersApi } from "@/shared/api/users"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface UserModerationDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentUsername?: string
  currentTgId: string
  type: 'username' | 'tgId'
  onSuccess?: () => void
}

export function UserModerationDialog({
  isOpen,
  onClose,
  userId,
  currentUsername,
  currentTgId,
  type,
  onSuccess,
}: UserModerationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [value, setValue] = useState(type === 'username' ? (currentUsername || "") : currentTgId)
  const [reason, setReason] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!value.trim()) {
      toast.error(`${type === 'username' ? 'Username' : 'Telegram ID'} is required`)
      return
    }

    setIsLoading(true)
    try {
      if (type === 'username') {
        await usersApi.updateUserUsername(userId, { username: value, reason })
        toast.success("Username updated successfully")
      } else {
        await usersApi.updateUserTgId(userId, { tgId: value, reason })
        toast.success("Telegram ID updated successfully")
      }
      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update user")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setValue(type === 'username' ? (currentUsername || "") : currentTgId)
    setReason("")
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Update User ${type === 'username' ? 'Username' : 'Telegram ID'}`}
      description={
        type === 'username' 
          ? `Change the username for user ${currentTgId}`
          : `Change the Telegram ID for user ${currentUsername || currentTgId}`
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="value">
            {type === 'username' ? 'Username' : 'Telegram ID'}
          </Label>
          <Input
            id="value"
            placeholder={type === 'username' ? 'Enter new username' : 'Enter new Telegram ID'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason (Optional)</Label>
          <Textarea
            id="reason"
            placeholder="Enter reason for this change..."
            className="resize-none"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update {type === 'username' ? 'Username' : 'Telegram ID'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
