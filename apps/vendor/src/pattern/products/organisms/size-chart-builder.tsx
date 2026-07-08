'use client'

// Size Chart Builder — dynamic table where columns are body parts (min/max)
// and rows are size entries (S, M, L, etc.). Reactive to body_parts changes.

import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

const cardClass =
  'rounded-[10px] bg-card p-6 custom-card-shadow dark:border dark:border-white/10'

interface SizeChartBuilderProps {
  /** Currently selected body parts (drives columns) */
  bodyParts: string[]
  /** The unit for display in the column header */
  unit: 'cm' | 'inch'
}

const humanizeBodyPart = (part: string): string =>
  part
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

export const SizeChartBuilder = ({ bodyParts, unit }: SizeChartBuilderProps) => {
  const form = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'sizes',
  })

  const handleAddSize = () => {
    append({
      label: '',
      sort_order: fields.length,
      measurements: bodyParts.map((bp) => ({
        body_part: bp,
        min: 0,
        max: 0,
      })),
    })
  }

  // Ensure measurements stay in sync with body parts when they change.
  // This is handled reactively via the parent template's useEffect,
  // but we render based on whatever is in the form state.

  if (bodyParts.length === 0) {
    return (
      <div className={cardClass}>
        <h3 className='text-base font-medium mb-2'>Size Chart</h3>
        <p className='text-sm text-muted-foreground'>
          Select at least one body part from the sidebar to start building your size chart.
        </p>
      </div>
    )
  }

  return (
    <div className={cardClass}>
      <h3 className='text-base font-medium mb-2'>Size Chart</h3>
      <p className='text-sm text-muted-foreground mb-6'>
        Define measurement ranges for each size. Values are in {unit}.
      </p>

      <ScrollArea className='w-full'>
        <div className='min-w-fit'>
          {/* Table Header */}
          <div className='flex items-end gap-0 border-b border-border/60 dark:border-white/10 pb-3 mb-1'>
            {/* Size label column */}
            <div className='w-[80px] shrink-0 pr-2'>
              <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                Size
              </span>
            </div>

            {/* Body part columns */}
            {bodyParts.map((bp) => (
              <div key={bp} className='flex-1 min-w-[160px] px-1 text-center'>
                <span className='text-xs font-medium text-grey-black dark:text-gray-200 uppercase tracking-wide'>
                  {humanizeBodyPart(bp)} ({unit})
                </span>
                <div className='flex gap-1 mt-1'>
                  <span className='flex-1 text-[10px] text-muted-foreground text-center'>Min</span>
                  <span className='flex-1 text-[10px] text-muted-foreground text-center'>Max</span>
                </div>
              </div>
            ))}

            {/* Delete column spacer */}
            <div className='w-[44px] shrink-0' />
          </div>

          {/* Rows */}
          {fields.map((row, rowIndex) => {
            // Get the current measurements for this row
            const rowMeasurements: { body_part: string; min: number; max: number }[] =
              form.watch(`sizes.${rowIndex}.measurements`) ?? []

            return (
              <div
                key={row.id}
                className={cn(
                  'flex items-center gap-0 py-2 border-b border-border/30 dark:border-white/5 transition-colors hover:bg-muted/20',
                  rowIndex % 2 === 0 && 'bg-muted/10'
                )}
              >
                {/* Size Label */}
                <div className='w-[80px] shrink-0 pr-2'>
                  <FormField
                    control={form.control}
                    name={`sizes.${rowIndex}.label`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder='e.g. M'
                            className='h-9 text-sm font-medium bg-muted/40 dark:border-white/10 text-center'
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Measurement cells — one min/max pair per body part */}
                {bodyParts.map((bp) => {
                  // Find the measurement index for this body part
                  const measIndex = rowMeasurements.findIndex(
                    (m) => m.body_part === bp
                  )
                  // If the body part isn't in measurements yet, skip rendering
                  // (the parent sync effect will add it)
                  if (measIndex === -1) {
                    return (
                      <div key={bp} className='flex-1 min-w-[160px] px-1'>
                        <div className='flex gap-1'>
                          <Input disabled className='h-9 flex-1 text-sm bg-muted/20' placeholder='—' />
                          <Input disabled className='h-9 flex-1 text-sm bg-muted/20' placeholder='—' />
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={bp} className='flex-1 min-w-[160px] px-1'>
                      <div className='flex gap-1'>
                        <FormField
                          control={form.control}
                          name={`sizes.${rowIndex}.measurements.${measIndex}.min`}
                          render={({ field }) => (
                            <FormItem className='flex-1'>
                              <FormControl>
                                <Input
                                  type='number'
                                  placeholder='0'
                                  className='h-9 text-sm bg-muted/40 dark:border-white/10 text-center'
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`sizes.${rowIndex}.measurements.${measIndex}.max`}
                          render={({ field }) => (
                            <FormItem className='flex-1'>
                              <FormControl>
                                <Input
                                  type='number'
                                  placeholder='0'
                                  className='h-9 text-sm bg-muted/40 dark:border-white/10 text-center'
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )
                })}

                {/* Delete row */}
                <div className='w-[44px] shrink-0 flex justify-center'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    disabled={fields.length === 1}
                    onClick={() => remove(rowIndex)}
                    className='h-9 w-9 text-muted-foreground hover:text-red-600'
                  >
                    <Trash2 className='size-4' />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        <ScrollBar orientation='horizontal' />
      </ScrollArea>

      {/* Add size */}
      <button
        type='button'
        onClick={handleAddSize}
        className='mt-4 flex items-center gap-2 text-sm font-medium text-grey-black dark:text-gray-200 transition-colors hover:text-primary cursor-pointer'
      >
        <Plus className='size-4 -mt-0.5' />
        Add Size
      </button>
    </div>
  )
}
