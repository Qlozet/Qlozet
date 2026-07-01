// Sample collections data — a fallback so the Collections table shows the
// populated design while the real GET /collections/vendor/with-products endpoint
// is unavailable in this environment (needs vendor auth). Mirrors the Orders /
// wallet sample-data approach. Remove (or let the real response win) once the
// backend is wired.

import type {
  Collection,
  CollectionCondition,
} from '@/redux/services/collections/collections.api-slice'

const category = (value: string): CollectionCondition => ({
  field: 'product_category',
  operator: 'is_equal_to',
  value,
})
const tag = (value: string): CollectionCondition => ({
  field: 'product_tags',
  operator: 'is_equal_to',
  value,
})
const type = (value: string): CollectionCondition => ({
  field: 'product_type',
  operator: 'is_equal_to',
  value,
})
const audience = (value: string): CollectionCondition => ({
  field: 'audience',
  operator: 'is_equal_to',
  value,
})

interface SampleSeed {
  title: string
  conditions: CollectionCondition[]
  products: number
  isActive?: boolean
}

const SEEDS: SampleSeed[] = [
  {
    title: 'Agbaya',
    conditions: [
      category('Shirts and Tops'),
      tag('Man'),
      type('Customizable'),
      audience('Adult'),
    ],
    products: 21,
  },
  {
    title: 'Corporate',
    conditions: [category('Shirts and Tops'), tag('Man')],
    products: 21,
  },
  {
    title: 'Ankara',
    conditions: [
      category('Shirts and Tops'),
      tag('Man'),
      type('Customizable'),
      audience('Adult'),
    ],
    products: 21,
  },
  {
    title: 'Polo',
    conditions: [category('Shirts and Tops'), type('Customizable')],
    products: 21,
  },
  {
    title: 'Street Wear',
    conditions: [
      category('Shirts and Tops'),
      tag('Man'),
      type('Customizable'),
      audience('Teen'),
    ],
    products: 21,
  },
  {
    title: 'Dress',
    conditions: [
      category('Shirts and Tops'),
      tag('Woman'),
      type('Customizable'),
      audience('Adult'),
    ],
    products: 21,
  },
  {
    title: 'Kaftan',
    conditions: [category('Native Wear'), tag('Man'), type('Customizable')],
    products: 18,
  },
  {
    title: 'Aso Ebi',
    conditions: [category('Native Wear'), tag('Woman'), audience('Adult')],
    products: 34,
  },
  {
    title: 'Casual',
    conditions: [category('Shirts and Tops'), type('Non-customizable')],
    products: 12,
  },
  {
    title: 'Wedding',
    conditions: [
      category('Native Wear'),
      tag('Woman'),
      type('Customizable'),
      audience('Adult'),
    ],
    products: 27,
  },
  {
    title: 'Kids',
    conditions: [category('Shirts and Tops'), audience('Kids')],
    products: 9,
    isActive: false,
  },
  {
    title: 'Denim',
    conditions: [category('Trousers'), tag('Unisex')],
    products: 15,
  },
  {
    title: 'Ankara Deluxe',
    conditions: [category('Native Wear'), tag('Woman'), type('Customizable')],
    products: 22,
  },
  {
    title: 'Office Basics',
    conditions: [category('Shirts and Tops'), tag('Woman'), audience('Adult')],
    products: 19,
    isActive: false,
  },
  {
    title: 'Summer Collection',
    conditions: [
      category('Shirts and Tops'),
      tag('Unisex'),
      type('Non-customizable'),
      audience('Adult'),
    ],
    products: 31,
  },
]

export const SAMPLE_COLLECTIONS: Collection[] = SEEDS.map((seed, index) => ({
  _id: `sample-collection-${index + 1}`,
  title: seed.title,
  condition_match: 'all',
  conditions: seed.conditions,
  is_active: seed.isActive ?? true,
  product_count: seed.products,
  products: [],
}))
