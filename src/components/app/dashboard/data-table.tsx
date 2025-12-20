'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  VisibilityState,
  useReactTable,
} from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Calendar,
  Clock,
  Columns,
  CreditCard,
  EllipsisVertical,
  Search,
} from 'lucide-react'
import { useMemberStore } from '@/zustand/members'
import { Member } from '@/zustand/members' // assuming you export the type
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDownload,
} from '@tabler/icons-react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import UpdateUserForm from '../users/updateUser/updateUserForm'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'

// Define columns using your actual Member type
const columns: ColumnDef<Member>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'photo',
    header: 'Photo',
    cell: ({ row }) => (
      <Avatar className="size-10">
        <AvatarImage
          src={
            `${process.env.API_URL_PREFIX}${row.original.photo}` || undefined
          }
          alt={`${row.original.first_name} ${row.original.last_name}`}
          className="object-cover"
        />
        <AvatarFallback>
          {row.original.first_name[0]}
          {row.original.last_name[0]}
        </AvatarFallback>
      </Avatar>
    ),
  },
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.first_name} {row.original.last_name}
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'age_group',
    header: 'Age Group',
  },
  {
    accessorKey: 'phone_no',
    header: 'Phone',
  },
  {
    accessorKey: 'city',
    header: 'City',
    cell: ({ row }) => {
      return row.original.city ? (
        <span>{row.original.city}</span>
      ) : (
        <span className="text-muted-foreground italic">N/A</span>
      )
    },
  },
  {
    accessorKey: 'country',
    header: 'Country',
  },
  {
    accessorKey: 'QR',
    header: 'QR Code',
    cell: ({ row }) => {
      const membership = row.original.membership
      const qrUrl = membership ? membership.qr_url : null
      return qrUrl ? (
        <Popover>
          <PopoverTrigger asChild>
            <Badge className="cursor-pointer!" variant="default">
              View QR
            </Badge>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-3!" align="start">
            <CardTitle className="mb-2 pt-0! text-sm">
              QR Code for {row.original.first_name} {row.original.last_name}
            </CardTitle>
            <Image
              src={process.env.API_URL_PREFIX + qrUrl}
              alt={`QR Code for ${row.original.first_name} ${row.original.last_name}`}
              className="h-40 w-40 object-contain"
              width={256}
              height={256}
            />
          </PopoverContent>
        </Popover>
      ) : (
        <Badge variant="secondary">No QR</Badge>
      )
    },
  },

  {
    accessorKey: 'membership',
    header: 'Membership',
    cell: ({ row }) => {
      const membership = row.original.membership

      if (
        !membership ||
        !membership.plan ||
        membership.plan === 'No Membership'
      ) {
        return (
          <Badge variant="secondary" className="cursor-default">
            <span className="text-muted-foreground">No Membership</span>
          </Badge>
        )
      }

      const isActive = membership.is_active && !membership.is_expired
      const isExpired = membership.is_expired

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Badge
              variant={
                isActive ? 'default' : isExpired ? 'destructive' : 'secondary'
              }
              className="cursor-pointer transition-opacity hover:opacity-90"
            >
              {isActive && <CheckCircle2 className="mr-1 h-3 w-3" />}
              {isExpired && <XCircle className="mr-1 h-3 w-3" />}
              {membership.plan.replace('-', ' ')}
            </Badge>
          </DialogTrigger>

          {/* Dialog Content */}
          <DialogContent className="w-[90vw] max-w-3xl p-4">
            <div className="h-[300px] w-full overflow-hidden rounded-2xl bg-white">
              {/* Header */}
              <div className="relative z-10 flex items-center justify-between bg-white p-2">
                <Image
                  src={'/govt-of-punjab-logo.png'}
                  alt="Logo"
                  width={100}
                  height={100}
                  className="size-16 scale-110"
                />
                <div className="text-center text-black">
                  <h1 className="font-serif text-base leading-tight font-bold md:text-lg lg:text-2xl!">
                    E-LIBRARY
                  </h1>
                  <p className="text-xs font-medium tracking-wider opacity-95">
                    GOVERNMENT OF Punjab
                  </p>
                </div>
                {row.original.membership.qr_url && (
                  <Image
                    src={`${process.env.API_URL_PREFIX}${row.original.membership.qr_url}`}
                    alt="QR"
                    width={100}
                    height={100}
                    className="size-16 scale-110"
                  />
                )}
              </div>

              {/* Content */}
              <div className="relative z-10 flex h-auto gap-2 bg-white p-2 text-black">
                {/* Member Table */}
                <div className="flex h-max flex-1 flex-col gap-3 p-2 text-lg">
                  <div className="flex">
                    ID: NWL-<span>{row.original.id}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-[100px]">Name</span>
                    <p className="flex-1 border-b-2 border-black">
                      {row.original.first_name} {row.original.last_name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-[100px]">CNIC</span>
                    <p className="flex-1 border-b-2 border-black">
                      {row.original.cnic}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-[100px]">Issue Date</span>
                    <p className="flex-1 border-b-2 border-black">
                      {row.original.membership.issued_date.split('T')[0]}
                    </p>
                  </div>
                </div>
                {/* Photo Section */}
                <div className="flex flex-shrink-0 flex-col items-center justify-start">
                  <Image
                    src={`${process.env.API_URL_PREFIX}${row.original.photo}`}
                    alt="Member Photo"
                    className="mb-1 h-[160px] w-[130px] rounded-md object-cover"
                    width={300}
                    height={300}
                  />
                </div>
              </div>

              <div className="w-full text-center text-xs text-black">
                www.elibrary.punjab.gov.pk
              </div>

              {/* Footer */}
            </div>

            <Button variant={'secondary'}>
              <IconDownload />
              Download
            </Button>
          </DialogContent>
        </Dialog>
      )
    },
  },
  {
    accessorKey: 'is_email_verified',
    header: 'Verified',
    cell: ({ row }) =>
      row.original.is_email_verified ? (
        <Badge className="bg-green-600 text-white">Yes</Badge>
      ) : (
        <Badge variant="secondary">No</Badge>
      ),
  },

  {
    id: 'actions',
    cell: ({ row }) => {
      const member = row.original
      return <Actions member={member} />
    },
  },
]

const Actions = ({ member }: { member: any }) => {
  const [open, setOpen] = React.useState(false)
  const [deleteModel, setOpenDeleteModal] = React.useState(false)
  const { data: session }: any = useSession()
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    const token = session?.user?.access
    try {
      const res = await axios.delete(`/api/user/update/${member.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.status === 200) {
        toast.success('Member deleted successfully!')
        setOpenDeleteModal(false)
      }
    } catch (error) {
      console.error('Proxy error (user delete):', error)
    } finally {
      queryClient.refetchQueries({ queryKey: ['members'] })
    }
  }

  return (
    <>
      <UpdateUserForm member={member} open={open} setOpen={setOpen} />

      <AlertDialog open={deleteModel} onOpenChange={setOpenDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              row.original.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <EllipsisVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onSelect={() => setOpen(true)}>
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setOpenDeleteModal(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export function MembersDataTable() {
  // Live data from Zustand — updates instantly!
  const members = useMemberStore((state) => state.members)
  const [editingMember, setEditingMember] = React.useState<Member | null>(null)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')

  const table = useReactTable({
    data: members,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  return (
    <div className="w-full space-y-4 p-4 pt-0! lg:p-6">
      {/* Search + Actions */}
      <div className="flex flex-col gap-4 sm:items-center sm:justify-between lg:flex-row">
        <div className="flex items-center gap-3">
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search members..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 sm:w-96"
            />
          </div>
        </div>

        <div className="grid grid-cols-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns className="mr-2 size-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                    className="capitalize"
                  >
                    {column.id === 'name'
                      ? 'Name'
                      : column.id === 'is_email_verified'
                        ? 'Email Verification'
                        : column.id.replace(/_/g, ' ')}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="dark:bg-input/20 rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
//   const isMobile = useIsMobile()

//   return (
//     <Drawer direction={isMobile ? 'bottom' : 'right'}>
//       <DrawerTrigger asChild>
//         <Button variant="link" className="text-foreground w-fit px-0 text-left">
//           {item.header}
//         </Button>
//       </DrawerTrigger>
//       <DrawerContent>
//         <DrawerHeader className="gap-1">
//           <DrawerTitle>{item.header}</DrawerTitle>
//           <DrawerDescription>
//             Showing total visitors for the last 6 months
//           </DrawerDescription>
//         </DrawerHeader>
//         <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
//           {!isMobile && (
//             <>
//               <ChartContainer config={chartConfig}>
//                 <AreaChart
//                   accessibilityLayer
//                   data={chartData}
//                   margin={{
//                     left: 0,
//                     right: 10,
//                   }}
//                 >
//                   <CartesianGrid vertical={false} />
//                   <XAxis
//                     dataKey="month"
//                     tickLine={false}
//                     axisLine={false}
//                     tickMargin={8}
//                     tickFormatter={(value) => value.slice(0, 3)}
//                     hide
//                   />
//                   <ChartTooltip
//                     cursor={false}
//                     content={<ChartTooltipContent indicator="dot" />}
//                   />
//                   <Area
//                     dataKey="mobile"
//                     type="natural"
//                     fill="var(--color-mobile)"
//                     fillOpacity={0.6}
//                     stroke="var(--color-mobile)"
//                     stackId="a"
//                   />
//                   <Area
//                     dataKey="desktop"
//                     type="natural"
//                     fill="var(--color-desktop)"
//                     fillOpacity={0.4}
//                     stroke="var(--color-desktop)"
//                     stackId="a"
//                   />
//                 </AreaChart>
//               </ChartContainer>
//               <Separator />
//               <div className="grid gap-2">
//                 <div className="grid grid-cols-2 leading-none font-medium">
//                   Trending up by 5.2% this month{' '}
//                   <IconTrendingUp className="size-4" />
//                 </div>
//                 <div className="text-muted-foreground">
//                   Showing total visitors for the last 6 months. This is just
//                   some random text to test the layout. It spans multiple lines
//                   and should wrap around.
//                 </div>
//               </div>
//               <Separator />
//             </>
//           )}
//           <form className="flex flex-col gap-4">
//             <div className="flex flex-col gap-3">
//               <Label htmlFor="header">Header</Label>
//               <Input id="header" defaultValue={item.header} />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex flex-col gap-3">
//                 <Label htmlFor="type">Type</Label>
//                 <Select defaultValue={item.type}>
//                   <SelectTrigger id="type" className="w-full">
//                     <SelectValue placeholder="Select a type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Table of Contents">
//                       Table of Contents
//                     </SelectItem>
//                     <SelectItem value="Executive Summary">
//                       Executive Summary
//                     </SelectItem>
//                     <SelectItem value="Technical Approach">
//                       Technical Approach
//                     </SelectItem>
//                     <SelectItem value="Design">Design</SelectItem>
//                     <SelectItem value="Capabilities">Capabilities</SelectItem>
//                     <SelectItem value="Focus Documents">
//                       Focus Documents
//                     </SelectItem>
//                     <SelectItem value="Narrative">Narrative</SelectItem>
//                     <SelectItem value="Cover Page">Cover Page</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="flex flex-col gap-3">
//                 <Label htmlFor="status">Status</Label>
//                 <Select defaultValue={item.status}>
//                   <SelectTrigger id="status" className="w-full">
//                     <SelectValue placeholder="Select a status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="Done">Done</SelectItem>
//                     <SelectItem value="In Progress">In Progress</SelectItem>
//                     <SelectItem value="Not Started">Not Started</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex flex-col gap-3">
//                 <Label htmlFor="target">Target</Label>
//                 <Input id="target" defaultValue={item.target} />
//               </div>
//               <div className="flex flex-col gap-3">
//                 <Label htmlFor="limit">Limit</Label>
//                 <Input id="limit" defaultValue={item.limit} />
//               </div>
//             </div>
//             <div className="flex flex-col gap-3">
//               <Label htmlFor="reviewer">Reviewer</Label>
//               <Select defaultValue={item.reviewer}>
//                 <SelectTrigger id="reviewer" className="w-full">
//                   <SelectValue placeholder="Select a reviewer" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
//                   <SelectItem value="Jamik Tashpulatov">
//                     Jamik Tashpulatov
//                   </SelectItem>
//                   <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </form>
//         </div>
//         <DrawerFooter>
//           <Button>Submit</Button>
//           <DrawerClose asChild>
//             <Button variant="outline">Done</Button>
//           </DrawerClose>
//         </DrawerFooter>
//       </DrawerContent>
//     </Drawer>
//   )
// }
