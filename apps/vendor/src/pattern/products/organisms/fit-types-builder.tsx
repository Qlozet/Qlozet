'use client'

// Fit Types Builder — accordion/expandable list where each fit type shows
// a label, description, and per-body-part ease allowances. Reactive to
// body_parts changes (adds missing, removes extra allowances).

import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'

const cardClass =
  'rounded-[10px] bg-card p-6 custom-card-shadow dark:border dark:border-white/10'

interface FitTypesBuilderProps {
  /** Currently selected body parts (drives allowance rows) */
  bodyParts: string[]
  /** The unit for display */
  unit: 'cm' | 'inch'
}

const humanizeBodyPart = (part: string): string =>
  part
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

const slugify = (label: string): string =>
  label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')

export const FitTypesBuilder = ({ bodyParts, unit }: FitTypesBuilderProps) => {
  const form = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'fit_types',
  })

  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(
    fields.length > 0 ? 0 : null
  )

  const handleAddFitType = () => {
    append({
      name: '',
      label: '',
      description: '',
      allowances: bodyParts.map((bp) => ({
        body_part: bp,
        value: 0,
      })),
    })
    setExpandedIndex(fields.length) // expand the newly added one
  }

  const handleToggle = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index))
  }

  return (
    <div className={cardClass}>
      <h3 className='text-base font-medium mb-2'>Fit Types</h3>
      <p className='text-sm text-muted-foreground mb-6'>
        Define ease allowances for different fits (e.g. Regular, Relaxed). Values are added to body measurements in {unit}.
      </p>

      {bodyParts.length === 0 && (
        <p className='text-sm text-muted-foreground italic'>
          Select body parts from the sidebar first.
        </p>
      )}

      {bodyParts.length > 0 && (
        <div className='space-y-3'>
          {fields.map((row, index) => {
            const isExpanded = expandedIndex === index
            const watchedLabel = form.watch(`fit_types.${index}.label`) || `Fit Type ${index + 1}`
            const allowances: { body_part: string; value: number }[] =
              form.watch(`fit_types.${index}.allowances`) ?? []

            return (
              <div
                key={row.id}
                className={cn(
                  'rounded-lg border transition-all duration-200',
                  isExpanded
                    ? 'border-primary/30 bg-primary/[0.02] dark:border-primary/20 dark:bg-white/[0.02]'
                    : 'border-border/60 dark:border-white/10 hover:border-border dark:hover:border-white/20'
                )}
              >
                {/* Header — click to expand/collapse */}
                <button
                  type='button'
                  onClick={() => handleToggle(index)}
                  className='w-full flex items-center justify-between px-4 py-3 cursor-pointer'
                >
                  <span className='text-sm font-medium text-grey-black dark:text-gray-200'>
                    {watchedLabel}
                  </span>
                  <div className='flex items-center gap-2'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={(e) => {
                        e.stopPropagation()
                        remove(index)
                        if (expandedIndex === index) setExpandedIndex(null)
                      }}
                      className='h-8 w-8 text-muted-foreground hover:text-red-600'
                    >
                      <Trash2 className='size-3.5' />
                    </Button>
                    <ChevronDown
                      className={cn(
                        'size-4 text-muted-foreground transition-transform duration-200',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </div>
                </button>

                {/* Expandable content */}
                {isExpanded && (
                  <div className='px-4 pb-4 space-y-4 border-t border-border/40 dark:border-white/5 pt-4'>
                    {/* Label */}
                    <FormField
                      control={form.control}
                      name={`fit_types.${index}.label`}
                      render={({ field }) => (
                        <FormItem>
                          <Label className='text-xs font-medium text-grey-black dark:text-gray-200'>
                            Fit Label
                          </Label>
                          <FormControl>
                            <Input
                              placeholder='e.g. Regular Fit'
                              className='h-10 bg-muted/40 dark:border-white/10'
                              {...field}
                              onChange={(e) => {
                                field.onChange(e.target.value)
                                // Auto-generate the name slug
                                form.setValue(
                                  `fit_types.${index}.name`,
                                  slugify(e.target.value)
                                )
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name={`fit_types.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <Label className='text-xs font-medium text-grey-black dark:text-gray-200'>
                            Description (optional)
                          </Label>
                          <FormControl>
                            <Textarea
                              placeholder='e.g. True to size, comfortable fit'
                              className='min-h-[60px] bg-muted/40 dark:border-white/10 resize-none'
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Allowances table */}
                    <div>
                      <Label className='text-xs font-medium text-grey-black dark:text-gray-200 mb-2 block'>
                        Ease Allowances ({unit})
                      </Label>
                      <div className='rounded-lg border border-border/40 dark:border-white/10 overflow-hidden'>
                        {/* Table header */}
                        <div className='flex items-center bg-muted/30 dark:bg-white/5 px-3 py-2'>
                          <span className='flex-1 text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                            Body Part
                          </span>
                          <span className='w-[100px] text-xs font-medium text-muted-foreground uppercase tracking-wide text-center'>
                            Ease ({unit})
                          </span>
                        </div>

                        {/* Allowance rows */}
                        {bodyParts.map((bp) => {
                          const allowanceIndex = allowances.findIndex(
                            (a) => a.body_part === bp
                          )
                          if (allowanceIndex === -1) return null

                          return (
                            <div
                              key={bp}
                              className='flex items-center px-3 py-2 border-t border-border/30 dark:border-white/5'
                            >
                              <span className='flex-1 text-sm text-grey-black dark:text-gray-200'>
                                {humanizeBodyPart(bp)}
                              </span>
                              <div className='w-[100px]'>
                                <FormField
                                  control={form.control}
                                  name={`fit_types.${index}.allowances.${allowanceIndex}.value`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type='number'
                                          placeholder='0'
                                          className='h-8 text-sm bg-muted/40 dark:border-white/10 text-center'
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(e.target.valueAsNumber || 0)
                                          }
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add fit type */}
      {bodyParts.length > 0 && (
        <button
          type='button'
          onClick={handleAddFitType}
          className='mt-4 flex items-center gap-2 text-sm font-medium text-grey-black dark:text-gray-200 transition-colors hover:text-primary cursor-pointer'
        >
          <Plus className='size-4 -mt-0.5' />
          Add Fit Type
        </button>
      )}
    </div>
  )
}
