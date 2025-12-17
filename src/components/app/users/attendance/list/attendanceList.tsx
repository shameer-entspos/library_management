'use client'

import React, { useEffect, useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import axios from 'axios'
import { EllipsisVertical } from 'lucide-react'

/* ================= TYPES ================= */

export type AttendanceRow = {
  id: number
  user_name: string
  check_in: string
  check_out: string | null
  time_spent: string
  method: string
}

/* ================= COLUMNS ================= */

export const columns: ColumnDef<AttendanceRow>[] = [
  {
    accessorKey: 'user_name',
    header: 'Name',
    cell: ({ row }) => (
      <span className="capitalize">{row.original.user_name}</span>
    ),
  },
  {
    accessorKey: 'check_in',
    header: 'Check In',
  },
  {
    accessorKey: 'check_out',
    header: 'Check Out',
    cell: ({ row }) => row.original.check_out ?? '—',
  },
  {
    accessorKey: 'time_spent',
    header: 'Time Spent',
    cell: ({ row }) => row.original.time_spent || '—',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <Button
        size="icon"
        variant="ghost"
        onClick={() => console.log('Attendance ID:', row.original.id)}
      >
        <EllipsisVertical />
      </Button>
    ),
  },
]

/* ================= COMPONENT ================= */

const AttendanceList = () => {
  const [data, setData] = useState<AttendanceRow[]>([])
  const [loading, setLoading] = useState(true)

  /* ===== Fetch attendances ===== */
  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const res = await axios.get('/api/attendance/all/') // <-- your API
        setData(res.data)
      } catch (error) {
        console.error('Failed to load attendances', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendances()
  }, [])

  /* ===== Create table ===== */
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (loading) {
    return <div className="p-4 text-center">Loading attendances...</div>
  }

  return (
    <div className="bg-background rounded-xl border">
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No attendances found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default AttendanceList
