'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  ColumnFiltersState,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CalendarDays, Columns, Loader2, Search } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
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
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useMemberStore } from '@/zustand/members'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from '@/components/ui/button-group'
import { CardDescription } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'

export type AttendanceRow = {
  id: number
  check_in: string
  check_out: string | null
  method: string
}

export type MemberRow = {
  id: number
  name: string
  email: string
  attendances: AttendanceRow[]
}

// Helper function moved outside component
const getFirstAttendance = (attendances: AttendanceRow[]) => {
  if (!attendances || attendances.length === 0) return null
  return [...attendances].sort(
    (a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime()
  )[0]
}

const getLatestAttendance = (attendances: AttendanceRow[]) => {
  if (!attendances?.length) return null

  return attendances.reduce((latest, curr) =>
    new Date(curr.check_in) > new Date(latest.check_in) ? curr : latest
  )
}

const dateKey = (iso: string) => new Date(iso).toISOString().split('T')[0]

const todayKey = () => dateKey(new Date().toISOString())

const yesterdayKey = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return dateKey(d.toISOString())
}

type DateFilter = 'all' | 'today' | 'yesterday' | 'custom'

// Columns now use useMemo and reference the helper safely
const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      if (row.original.isGroup) {
        const dateObj = new Date(row.original.date)
        const formattedDate = dateObj.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })

        return (
          <span className="text-primary font-semibold">{formattedDate}</span>
        )
      }

      return <span className="capitalize">{row.original.name}</span>
    },
  },
  {
    id: 'first_check_in',
    header: 'First Check In',
    cell: ({ row }) => {
      const first = getFirstAttendance(row.original.attendances)
      return first ? new Date(first.check_in).toLocaleTimeString() : '—'
    },
  },
  {
    id: 'first_check_out',
    header: 'First Check Out',
    cell: ({ row }) => {
      const first = getFirstAttendance(row.original.attendances)
      return first?.check_out
        ? new Date(first.check_out).toLocaleTimeString()
        : '—'
    },
  },
  {
    id: 'attendance_count',
    header: 'Attendances',
    cell: ({ row }) => row.original.attendances.length,
  },
  {
    id: 'actions',
    header: 'History',
    cell: ({ row }) => (
      <AttendanceDialog
        name={row.original.name}
        attendances={row.original.attendances}
      />
    ),
  },
]

const AttendanceList = () => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [customDate, setCustomDate] = useState<string | null>(null)

  const { members } = useMemberStore()

  const data = useMemo(() => {
    const mapped = members
      .map((m) => {
        const latestAttendance = getLatestAttendance(m.attendances || [])

        return {
          id: m.id,
          name: `${m.first_name} ${m.last_name}`,
          email: m.email,
          attendances: m.attendances || [],
          latestAttendance,
        }
      })
      .filter((user) => user.latestAttendance)

    // 2. Sort users by latest attendance (DESC)
    mapped.sort((a, b) => {
      if (!a.latestAttendance) return 1
      if (!b.latestAttendance) return -1

      return (
        new Date(b.latestAttendance.check_in).getTime() -
        new Date(a.latestAttendance.check_in).getTime()
      )
    })

    // 3. Apply date filter
    const filtered = mapped.filter((user) => {
      if (!user.latestAttendance) return dateFilter === 'all'

      const userDate = dateKey(user.latestAttendance.check_in)

      if (dateFilter === 'today') return userDate === todayKey()
      if (dateFilter === 'yesterday') return userDate === yesterdayKey()
      if (dateFilter === 'custom') return userDate === customDate

      return true // all
    })

    const grouped: Record<string, typeof filtered> = {}

    filtered.forEach((user) => {
      const key = user.latestAttendance
        ? dateKey(user.latestAttendance.check_in)
        : ''

      if (!grouped[key]) grouped[key] = []
      grouped[key].push(user)
    })

    const rows: any[] = []

    Object.entries(grouped).forEach(([date, users]) => {
      rows.push({
        id: `date-${date}`,
        isGroup: true,
        date,
      })

      users.forEach((u) =>
        rows.push({
          ...u,
          isGroup: false,
        })
      )
    })

    return rows
  }, [members, dateFilter, customDate])

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(false)
  }, [])

  const table = useReactTable({
    data,
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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center gap-2">
        <Loader2 className="size-6 animate-spin" />
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4 p-4 pt-0! lg:p-6">
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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="size-10 gap-2">
                <CalendarDays className="size-4" />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              className="ml-3 w-[90vw] p-3! sm:w-max sm:p-4!"
              align="end"
            >
              <CardDescription className="mb-2 text-xs sm:text-sm">
                {' '}
                Filter by date
              </CardDescription>
              <ButtonGroup className="flex flex-row flex-wrap! gap-2">
                <Button
                  size={'sm'}
                  className="h-7! rounded-sm! border! text-xs sm:h-8 sm:text-sm"
                  variant={dateFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setDateFilter('all')}
                >
                  {' '}
                  All
                </Button>
                <Button
                  size={'sm'}
                  className="h-7! rounded-sm! border! text-xs sm:h-8 sm:text-sm"
                  variant={dateFilter === 'today' ? 'default' : 'outline'}
                  onClick={() => setDateFilter('today')}
                >
                  {' '}
                  Today
                </Button>
                <Button
                  size={'sm'}
                  className="h-7! rounded-sm! border! text-xs sm:h-8 sm:text-sm"
                  variant={dateFilter === 'yesterday' ? 'default' : 'outline'}
                  onClick={() => setDateFilter('yesterday')}
                >
                  Yesterday
                </Button>
                <Button
                  size={'sm'}
                  className="h-7! rounded-sm! border! text-xs sm:h-8 sm:text-sm"
                  variant={dateFilter === 'custom' ? 'default' : 'outline'}
                  onClick={() => setDateFilter('custom')}
                >
                  {' '}
                  Custom{' '}
                </Button>
              </ButtonGroup>

              {dateFilter === 'custom' && (
                <Calendar
                  mode="single"
                  className="bg-muted! mt-2 w-full rounded-md"
                  selected={customDate ? new Date(customDate) : undefined}
                  onSelect={(date) =>
                    date && setCustomDate(format(date, 'yyyy-MM-dd'))
                  }
                />
              )}
            </PopoverContent>
          </Popover>
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
                    {column.columnDef.header?.toString() || column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="dark:bg-input/20 rounded-md">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="" key={headerGroup.id}>
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
            {table.getRowModel().rows.map((row) => {
              const isDateRow = row.original.isGroup

              return (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell, index) => {
                    // Skip borders for date rows
                    if (isDateRow) {
                      return (
                        <TableCell key={cell.id} className="bg-muted/60">
                          {cell.column.id === 'name'
                            ? flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )
                            : null}
                        </TableCell>
                      )
                    }

                    // Normal rows
                    return (
                      <TableCell
                        key={cell.id}
                        className={`bg-background ${[
                          'border-b',
                          index === 0 && 'border-l',
                          'border-r',
                        ]
                          .filter(Boolean)
                          .join(' ')}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
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
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue />
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
              <IconChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <IconChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <IconChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <IconChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

type Props = {
  name: string
  attendances: AttendanceRow[]
}

const AttendanceDialog = ({ name, attendances }: Props) => {
  // Sort attendances by check_in descending (latest first)
  const sortedAttendances = [...attendances].sort(
    (a, b) => new Date(b.check_in).getTime() - new Date(a.check_in).getTime()
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{name} — Attendance History</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-background sticky top-0">
              <tr className="border-b">
                <th className="p-3 text-left font-medium">Check In</th>
                <th className="p-3 text-left font-medium">Check Out</th>
                <th className="p-3 text-left font-medium">Method</th>
              </tr>
            </thead>
            <tbody>
              {sortedAttendances.length > 0 ? (
                sortedAttendances.map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="p-3">
                      {new Date(a.check_in).toLocaleString()}
                    </td>
                    <td className="p-3">
                      {a.check_out
                        ? new Date(a.check_out).toLocaleString()
                        : '—'}
                    </td>
                    <td className="p-3 capitalize">{a.method}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="text-muted-foreground p-8 text-center"
                  >
                    No attendance history
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AttendanceList
