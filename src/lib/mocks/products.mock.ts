import { faker } from '@faker-js/faker'
import { Product } from '@/redux/services/products/products.api-slice'

/**
 * Generate a single mock product
 */
export const generateMockProduct = (overrides?: Partial<Product>): Product => {
  const categories = ['Dress', 'Jump suit', 'Skirt', 'Blouse', 'Pants']
  const statuses: Array<'active' | 'inactive' | 'draft'> = ['active', 'inactive', 'draft']
  const tags = ['women', 'men', 'unisex', 'formal', 'casual']
  const colors = ['Blue', 'Red', 'Green', 'Yellow', 'Black', 'White', 'Brown', 'Pink']
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  const stock = faker.number.int({ min: 0, max: 50 })
  const variantsCount = faker.number.int({ min: 1, max: 3 })
  const hasCustomization = faker.datatype.boolean()

  return {
    _id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    category: faker.helpers.arrayElement(categories),
    price: faker.number.int({ min: 50000, max: 500000 }),
    stock,
    status: faker.helpers.arrayElement(statuses),
    images: Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () =>
      faker.image.url({ width: 400, height: 600 })
    ),
    variants: Array.from({ length: variantsCount }, () => ({
      id: faker.string.uuid(),
      size: faker.helpers.arrayElement(sizes),
      color: faker.helpers.arrayElement(colors),
      material: faker.helpers.arrayElement(['Cotton', 'Silk', 'Polyester', 'Wool']),
      additionalPrice: faker.number.int({ min: 0, max: 20000 }),
      stock: faker.number.int({ min: 0, max: 20 }),
    })),
    customizations: hasCustomization
      ? Array.from({ length: faker.number.int({ min: 1, max: 2 }) }, () => ({
          id: faker.string.uuid(),
          name: faker.helpers.arrayElement(['Embroidery', 'Monogram', 'Custom Length', 'Extra Buttons']),
          options: faker.helpers.arrayElements(['Yes', 'No'], { min: 2, max: 2 }),
          additionalPrice: faker.number.int({ min: 5000, max: 20000 }),
        }))
      : undefined,
    tags: faker.helpers.arrayElements(tags, { min: 1, max: 3 }),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  }
}

/**
 * Generate multiple mock products
 */
export const generateMockProducts = (count: number = 10): Product[] => {
  return Array.from({ length: count }, () => generateMockProduct())
}

/**
 * Pre-defined mock products matching the design
 */
export const mockClothingProducts: Product[] = [
  {
    _id: '1',
    name: 'Amasi Queen Dress',
    description: 'Beautiful traditional dress with intricate details',
    category: 'Dress',
    price: 120000,
    stock: 10,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop',
    ],
    variants: [
      { id: '1-1', additionalPrice: 0, stock: 10, size: 'S', color: 'Teal' },
    ],
    customizations: [
      { id: 'c1', name: 'Embroidery', options: ['Yes', 'No'], additionalPrice: 5000 },
    ],
    tags: ['women', 'formal'],
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    _id: '2',
    name: 'Amasi Queen Dress',
    description: 'Elegant evening wear with modern cut',
    category: 'Dress',
    price: 120000,
    stock: 2,
    status: 'inactive',
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=600&fit=crop',
    ],
    variants: [
      { id: '2-1', additionalPrice: 0, stock: 2, size: 'M', color: 'Brown' },
      { id: '2-2', additionalPrice: 5000, stock: 0, size: 'L', color: 'Brown' },
    ],
    tags: ['women', 'casual'],
    createdAt: new Date('2024-01-14').toISOString(),
    updatedAt: new Date('2024-01-14').toISOString(),
  },
  {
    _id: '3',
    name: 'Amasi Queen Dress',
    description: 'Casual wear perfect for everyday style',
    category: 'Dress',
    price: 120000,
    stock: 10,
    status: 'draft',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
    ],
    variants: [
      { id: '3-1', additionalPrice: 0, stock: 10, size: 'L' },
    ],
    tags: ['women'],
    createdAt: new Date('2024-01-13').toISOString(),
    updatedAt: new Date('2024-01-13').toISOString(),
  },
  {
    _id: '4',
    name: 'Amasi Queen Dress',
    description: 'Traditional outfit with contemporary flair',
    category: 'Jump suit',
    price: 120000,
    stock: 0,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=600&fit=crop',
    ],
    variants: [
      { id: '4-1', additionalPrice: 0, stock: 0 },
    ],
    tags: ['women'],
    createdAt: new Date('2024-01-12').toISOString(),
    updatedAt: new Date('2024-01-12').toISOString(),
  },
  {
    _id: '5',
    name: 'Amasi Queen Dress',
    description: 'Modern design with timeless appeal',
    category: 'Dess',
    price: 120000,
    stock: 10,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=600&fit=crop',
    ],
    variants: [
      { id: '5-1', additionalPrice: 0, stock: 10, size: 'XL' },
    ],
    tags: ['women'],
    createdAt: new Date('2024-01-11').toISOString(),
    updatedAt: new Date('2024-01-11').toISOString(),
  },
  {
    _id: '6',
    name: 'Amasi Queen Dress',
    description: 'Stunning evening dress',
    category: 'Dess',
    price: 120000,
    stock: 10,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=600&fit=crop',
    ],
    variants: [
      { id: '6-1', additionalPrice: 0, stock: 10, size: 'M' },
    ],
    tags: ['women'],
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
  },
]

/**
 * Get mock products with pagination
 */
export const getMockProductsPaginated = (
  page: number = 1,
  limit: number = 10,
  totalCount: number = 50
) => {
  const start = (page - 1) * limit
  const end = start + limit

  // Generate or use pre-defined products
  const allProducts = totalCount <= mockClothingProducts?.length
    ? mockClothingProducts.slice(0, totalCount)
    : [...mockClothingProducts, ...generateMockProducts(totalCount - mockClothingProducts?.length)]

  const products = allProducts.slice(start, end)

  return {
    products,
    total: totalCount,
    totalCount,
    page,
    currentPage: page,
    limit,
    pageSize: limit,
    totalPages: Math.ceil(totalCount / limit),
    success: true,
    message: 'Products fetched successfully',
  }
}
