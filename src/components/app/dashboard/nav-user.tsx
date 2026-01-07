/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconMoonStars,
  IconNotification,
  IconSunHigh,
  IconUserCircle,
} from '@tabler/icons-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useTheme } from 'next-themes'
import useCustomSession from '@/hooks/use-session'
import { signOut } from 'next-auth/react'
import { useProfile } from '@/zustand/profile'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const { session } = useCustomSession()
  const { theme, setTheme } = useTheme()
  const { clearProfile } = useProfile()
  const router = useRouter()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const logout = () => {
    clearProfile()

    router.push('/login')
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton className="bg-muted" onClick={logout}>
          <IconLogout className="size-5" />
          Log out
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
