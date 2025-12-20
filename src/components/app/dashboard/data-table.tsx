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
} from '@tabler/icons-react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'

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
        <Popover>
          <PopoverTrigger asChild>
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
          </PopoverTrigger>

          <PopoverContent className="mr-6 w-80 p-0" align="start">
            <Card className="gap-2 border-0 py-4! shadow-lg">
              <CardHeader className="px-4!">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Avatar className="bg-secondary">
                    <AvatarImage
                      src={row.original.photo || undefined}
                      alt={`${row.original.first_name} ${row.original.last_name}`}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {row.original.first_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  Membership Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4! text-sm">
                {/* Plan & Status */}
                <div className="flex items-center justify-between">
                  <span className="font-medium">Plan</span>
                  <Badge variant={isActive ? 'default' : 'secondary'}>
                    {membership.plan.replace('-', ' ')}
                  </Badge>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status</span>
                  <Badge
                    variant={
                      isActive
                        ? 'default'
                        : isExpired
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {membership.status}
                  </Badge>
                </div>

                {/* Amount */}
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 font-medium">
                    <CreditCard className="h-4 w-4" />
                    Amount Paid
                  </span>
                  <span className="font-semibold">
                    Rs. {membership.amount.toFixed(2)}
                  </span>
                </div>

                {/* Payment Method */}
                {membership.payment_method && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span className="capitalize">
                      {membership.payment_method.replace('_', ' ')}
                    </span>
                  </div>
                )}

                <Separator />
                {/* Dates */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Start Date
                    </span>
                    <span>
                      {new Date(membership.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      End Date
                    </span>
                    <span
                      className={isExpired ? 'font-medium text-red-600' : ''}
                    >
                      {new Date(membership.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Days Remaining
                    </span>
                    <span
                      className={
                        membership.days_remaining <= 7
                          ? 'font-bold text-orange-600'
                          : ''
                      }
                    >
                      {membership.days_remaining} days
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Issued Date */}
                <div className="flex justify-between">
                  <div className="text-muted-foreground text-xs">
                    Issued on{' '}
                    {new Date(membership.issued_date).toLocaleDateString()}
                  </div>
                  {/* <PDFDownloadLink
                    document={<MembershipCardPDF member={row.original} />}
                    fileName={`membership-card-${row.original.first_name}-${row.original.id}.pdf`}
                  >
                    {({ loading }) => (
                      <Button size="icon" className="" disabled={loading}>
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </PDFDownloadLink> */}
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
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
    cell: () => (
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
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuItem>Favorite</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function MembersDataTable() {
  // Live data from Zustand — updates instantly!
  const members = useMemberStore((state) => state.members)

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

        <div className="flex gap-2">
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
//                 <div className="flex gap-2 leading-none font-medium">
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
