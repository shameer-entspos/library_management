'use client'

import { type Icon } from '@tabler/icons-react'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProfile } from '@/zustand/profile'

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const pathname = usePathname()
  const { profile } = useProfile()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            {/* <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground !h-10 min-w-8 duration-200 ease-linear"
            >
              <Plus />
              <span>Create Member</span>
            </SidebarMenuButton> */}
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) =>
            profile?.role === 'admin' && item.title === 'Libraries' ? null : (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url}>
                  <SidebarMenuButton
                    variant={pathname === item.url ? 'outline' : undefined}
                    tooltip={item.title}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
