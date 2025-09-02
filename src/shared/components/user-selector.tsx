"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import { usersApi } from "@/shared/api/users"
import { SimpleUser } from "@/shared/api/types"
import { Loader2 } from "lucide-react"

interface UserSelectorProps {
  value?: string
  onValueChange: (userId: string, user: SimpleUser) => void
  placeholder?: string
  className?: string
}

export function UserSelector({
  value,
  onValueChange,
  placeholder = "Select user...",
  className,
}: UserSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const { data, isLoading, error } = useQuery({
    queryKey: ['simpleUsers', { search, limit: 50 }],
    queryFn: () => usersApi.getSimpleUsers({ 
      search: search || undefined,
      limit: 50,
      page: 1 
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const selectedUser = data?.data.find(user => user.id === value)

  const handleSelect = (user: SimpleUser) => {
    onValueChange(user.id, user)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedUser ? (
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {selectedUser.username || 'No username'}
              </span>
              <span className="text-muted-foreground text-sm">
                ({selectedUser.tgId})
              </span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading users...</span>
              </div>
            ) : error ? (
              <CommandEmpty>Failed to load users</CommandEmpty>
            ) : !data?.data.length ? (
              <CommandEmpty>No users found</CommandEmpty>
            ) : (
              <CommandGroup>
                {data.data.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={`${user.username || ''} ${user.tgId} ${user.id}`}
                    onSelect={() => handleSelect(user)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === user.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {user.username || 'No username'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ID: {user.id} • TG: {user.tgId}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
