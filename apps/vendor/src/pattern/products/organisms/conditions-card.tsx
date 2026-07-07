import React, { useMemo, useState, useCallback } from 'react'
import { useFieldArray, useWatch } from 'react-hook-form'
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CONDITION_FIELD_OPTIONS,
  CONDITION_OPERATOR_OPTIONS,
  TAXONOMY_FIELD_CONFIG,
  STATIC_VALUE_OPTIONS,
  FREE_TEXT_FIELDS,
} from '../lib/collection-condition-options'

export interface ConditionsCardProps {
  /** The form control from useForm */
  control: any
  /** The form instance (to use setValue) */
  form: any
  /** The name of the field array (e.g. 'conditions') */
  name?: string
  /** The taxonomy tree response */
  taxonomyTree: any
}

export const ConditionsCard = ({
  control,
  form,
  name = 'conditions',
  taxonomyTree,
}: ConditionsCardProps) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name,
  })

  // ─── Drag-and-drop state ──────────────────────────────────────
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = useCallback((index: number) => { setDragIndex(index) }, [])
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])
  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (dragIndex !== null && dragIndex !== targetIndex) move(dragIndex, targetIndex)
    setDragIndex(null)
    setDragOverIndex(null)
  }, [dragIndex, move])
  const handleDragEnd = useCallback(() => { setDragIndex(null); setDragOverIndex(null) }, [])

  // ─── Taxonomy-driven value dropdowns ──────────────────────────
  const getTaxonomyValues = useMemo(() => {
    if (!taxonomyTree) return () => []
    return (fieldPath: string): { value: string; label: string }[] => {
      const config = TAXONOMY_FIELD_CONFIG[fieldPath]
      if (!config) return []
      const kindData = taxonomyTree[config.kind]
      if (!kindData?.product_types) return []
      switch (config.type) {
        case 'product_type': return kindData.product_types.map((pt: any) => ({ value: pt.name, label: pt.name }))
        case 'categories': {
          const all = new Set<string>()
          kindData.product_types.forEach((pt: any) => pt.categories?.forEach((c: string) => all.add(c)))
          return Array.from(all).sort().map((c) => ({ value: c, label: c }))
        }
        case 'audience': return [
          { value: 'men', label: 'Men' },
          { value: 'women', label: 'Women' },
          { value: 'unisex', label: 'Unisex' },
          { value: 'kids', label: 'Kids' },
        ]
        case 'attributes': {
          const all = new Set<string>()
          kindData.product_types.forEach((pt: any) => pt.attributes?.forEach((a: string) => all.add(a)))
          return Array.from(all).sort().map((a) => ({ value: a, label: a }))
        }
        default: return []
      }
    }
  }, [taxonomyTree])

  return (
    <div className='rounded-[10px] bg-card p-6 custom-card-shadow dark:border dark:border-white/10'>
      <h3 className='text-base font-medium mb-2'>Conditions</h3>
      <p className='text-sm text-muted-foreground mb-6'>
        Products must match these rules to be included.
      </p>

      <div className='space-y-6'>
        <FormField
          control={control}
          name='condition_match'
          render={({ field }) => (
            <FormItem>
              <div className='flex flex-wrap items-center gap-4'>
                <span className='text-sm font-medium text-grey-black dark:text-gray-200'>Products must match:</span>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className='flex items-center gap-4'
                >
                  <div className='flex items-center gap-1.5'>
                    <RadioGroupItem value='all' id='match-all' />
                    <Label htmlFor='match-all' className='cursor-pointer text-sm text-grey-black dark:text-gray-200'>All conditions</Label>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <RadioGroupItem value='any' id='match-any' />
                    <Label htmlFor='match-any' className='cursor-pointer text-sm text-grey-black dark:text-gray-200'>Any condition</Label>
                  </div>
                </RadioGroup>
              </div>
            </FormItem>
          )}
        />

        <div className='space-y-3'>
          {fields.map((row, index) => {
            const selectedField = form.watch(`${name}.${index}.field`)
            const isFreeText = FREE_TEXT_FIELDS.has(selectedField)
            const isTaxonomyField = selectedField in TAXONOMY_FIELD_CONFIG
            const isStaticField = selectedField in STATIC_VALUE_OPTIONS
            let valueOptions: { value: string; label: string }[] = []
            if (isTaxonomyField) valueOptions = getTaxonomyValues(selectedField)
            else if (isStaticField) valueOptions = STATIC_VALUE_OPTIONS[selectedField]

            return (
              <div
                key={row.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'flex flex-wrap items-start gap-2 sm:flex-nowrap rounded-xl p-2 -mx-2 transition-all duration-200',
                  dragIndex === index && 'opacity-40 scale-[0.98]',
                  dragOverIndex === index && dragIndex !== index && 'border-2 border-primary/40 bg-primary/5',
                  dragIndex !== null && dragOverIndex !== index && dragIndex !== index && 'opacity-80',
                )}
              >
                {/* Drag Handle */}
                <div
                  className={cn(
                    'flex h-12 w-10 shrink-0 cursor-grab items-center justify-center rounded-lg border transition-all duration-200 active:cursor-grabbing',
                    dragIndex === index
                      ? 'bg-primary border-primary text-white shadow-md'
                      : 'bg-muted/40 border-border/60 dark:border-white/10 text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary'
                  )}
                  title='Drag to reorder'
                >
                  <GripVertical className='size-4' />
                </div>

                {/* Field */}
                <FormField
                  control={control}
                  name={`${name}.${index}.field`}
                  render={({ field }) => (
                    <FormItem className='flex-1 min-w-[140px]'>
                      <Select
                        value={field.value}
                        onValueChange={(next) => {
                          field.onChange(next)
                          form.setValue(`${name}.${index}.value`, '')
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className='h-12 rounded-lg bg-muted/40 dark:border-white/10'>
                            <SelectValue placeholder='Select field...' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CONDITION_FIELD_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Operator */}
                <FormField
                  control={control}
                  name={`${name}.${index}.operator`}
                  render={({ field }) => (
                    <FormItem className='flex-1 min-w-[140px]'>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className='h-12 rounded-lg bg-muted/40 dark:border-white/10'>
                            <SelectValue placeholder='Operator...' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CONDITION_OPERATOR_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Value */}
                <FormField
                  control={control}
                  name={`${name}.${index}.value`}
                  render={({ field }) => (
                    <FormItem className='flex-1 min-w-[140px]'>
                      {isFreeText ? (
                        <FormControl>
                          <Input
                            placeholder={selectedField === 'base_price' ? 'Enter price (e.g. 5000)' : 'Enter value'}
                            className='h-12 rounded-lg bg-muted/40 dark:border-white/10'
                            {...field}
                          />
                        </FormControl>
                      ) : (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className='h-12 rounded-lg bg-muted/40 dark:border-white/10'>
                              <SelectValue placeholder='Select value...' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {valueOptions.length > 0 ? (
                              valueOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))
                            ) : (
                              <SelectItem value='__loading' disabled>
                                {isTaxonomyField ? 'Loading from taxonomy...' : 'Select a field first'}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </FormItem>
                  )}
                />

                {/* No Chevrons */}

                {/* Delete */}
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                  className='h-12 w-12 shrink-0 rounded-lg text-muted-foreground hover:text-red-600'
                >
                  <Trash2 className='size-4' />
                </Button>
              </div>
            )
          })}
        </div>

        <button
          type='button'
          onClick={() => append({ field: 'clothing.taxonomy.product_type', operator: 'is_equal_to', value: '' })}
          className='mt-4 flex items-center gap-2 text-sm font-medium text-grey-black dark:text-gray-200 transition-colors hover:text-primary cursor-pointer'
        >
          <Plus className='size-4 -mt-0.5' />
          Add Condition
        </button>
      </div>
    </div>
  )
}
