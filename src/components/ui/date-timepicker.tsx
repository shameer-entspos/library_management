'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { IconClock } from '@tabler/icons-react'

type TimePickerProps = {
  value?: string
  onChange?: (value: string) => void
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // convert string → Date
  const date = React.useMemo(() => {
    if (!value) return undefined
    const [h, m] = value.split(':').map(Number)
    const d = new Date()
    d.setHours(h, m, 0, 0)
    return d
  }, [value])

  const setTime = (newDate: Date) => {
    const formatted = format(newDate, 'HH:mm') // 24h string for backend
    onChange?.(formatted)
  }

  const handleTimeChange = (
    type: 'hour' | 'minute' | 'ampm',
    value: string
  ) => {
    const baseDate = date ?? new Date()
    const newDate = new Date(baseDate)

    if (type === 'hour') {
      const hour = parseInt(value)
      const isPM = newDate.getHours() >= 12
      newDate.setHours((hour % 12) + (isPM ? 12 : 0))
    }

    if (type === 'minute') {
      newDate.setMinutes(parseInt(value))
    }

    if (type === 'ampm') {
      const h = newDate.getHours()
      if (value === 'AM' && h >= 12) newDate.setHours(h - 12)
      if (value === 'PM' && h < 12) newDate.setHours(h + 12)
    }

    setTime(newDate)
  }

  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-10! w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <IconClock className="size-4" />
          {value ? format(date!, 'hh:mm aa') : 'hh:mm AM'}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <div className="flex divide-x">
          {/* HOURS */}
          <ScrollArea className="w-20">
            <div className="flex flex-col p-2">
              {hours.map((h) => (
                <Button
                  key={h}
                  size="icon"
                  variant={
                    date && date.getHours() % 12 === h % 12
                      ? 'default'
                      : 'ghost'
                  }
                  onClick={() => handleTimeChange('hour', h.toString())}
                >
                  {h}
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* MINUTES */}
          <ScrollArea className="w-20">
            <div className="flex flex-col p-2">
              {minutes.map((m) => (
                <Button
                  key={m}
                  size="icon"
                  variant={
                    date && date.getMinutes() === m ? 'default' : 'ghost'
                  }
                  onClick={() => handleTimeChange('minute', m.toString())}
                >
                  {m.toString().padStart(2, '0')}
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* AM / PM */}
          <ScrollArea className="w-20">
            <div className="flex flex-col p-2">
              {['AM', 'PM'].map((ampm) => (
                <Button
                  key={ampm}
                  size="icon"
                  variant={
                    date &&
                    ((ampm === 'AM' && date.getHours() < 12) ||
                      (ampm === 'PM' && date.getHours() >= 12))
                      ? 'default'
                      : 'ghost'
                  }
                  onClick={() => handleTimeChange('ampm', ampm)}
                >
                  {ampm}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
