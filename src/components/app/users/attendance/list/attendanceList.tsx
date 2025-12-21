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
import { Columns, Loader2, Search } from 'lucide-react'
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

// Columns now use useMemo and reference the helper safely
const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <span className="capitalize">{row.original.name}</span>,
  },
  {
    id: 'first_check_in',
    header: 'First Check In',
    cell: ({ row }) => {
      const first = getFirstAttendance(row.original.attendances)
      return first ? new Date(first.check_in).toLocaleString() : '—'
    },
  },
  {
    id: 'first_check_out',
    header: 'First Check Out',
    cell: ({ row }) => {
      const first = getFirstAttendance(row.original.attendances)
      return first?.check_out ? new Date(first.check_out).toLocaleString() : '—'
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

  const { members } = useMemberStore()
  console.log(members)

  // Transform data once using useMemo
  const data = useMemo(() => {
    return members.map((m) => ({
      id: m.id,
      name: m.first_name + ' ' + m.last_name,
      email: m.email,
      attendances: m.attendances || [],
    }))
  }, [members])

  // Simulate loading or remove if data is instantly available
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If you're fetching data, set loading true initially
    // For now, since data comes from Zustand, we assume it's ready
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
    <div className="w-full space-y-4 p-4 pt-0 lg:p-6">
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
                    {column.columnDef.header?.toString() || column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
