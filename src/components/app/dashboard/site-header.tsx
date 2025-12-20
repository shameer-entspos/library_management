'use client'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import AddUserForm from '../users/addUser/addUserForm'

export function SiteHeader() {
  const pathname = usePathname()

  if (pathname === '/checkin-checkout') {
    return null
  }

  return (
    <header className="flex h-[60px] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[60px]">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex md:hidden">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
        </div>
        <h1 className="text-base font-semibold capitalize md:text-lg">
          {pathname === '/' ? 'Dashboard' : pathname.split('/').pop()}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <AddUserForm />
        </div>
      </div>
    </header>
  )
}
