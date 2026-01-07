import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface Option {
  label: string
  value: string
}

interface SearchableSelectProps {
  value?: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  disabled?: boolean
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selected = options.find((o) => o.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={`${selected ? 'text-foreground' : 'text-muted-foreground'} h-10! w-full justify-between`}
        >
          {selected ? selected.label : placeholder}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="w-[var(--radix-popover-trigger-width)] min-w-xs p-0"
      >
        {' '}
        {/* Optional: match trigger width */}
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No result found.</CommandEmpty>
            <CommandGroup className="overflow-y-auto">
              <div className="max-h-[260px] overflow-y-auto">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className="flex items-center justify-between"
                  >
                    {option.label}
                    <Check
                      className={cn(
                        'h-4 w-4',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>{' '}
    </Popover>
  )
}
