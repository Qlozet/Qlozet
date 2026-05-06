import { faker } from '@faker-js/faker'
import { Warehouse } from '@/pattern/settings/molecules/warehouse-table-columns'

/**
 * Generate a single mock warehouse
 */
export const generateMockWarehouse = (overrides?: Partial<Warehouse>): Warehouse => {
  const statuses: Array<'default' | 'alternate'> = ['default', 'alternate']
  const warehouseNames = [
    'Mouka warehouse',
    'Central Distribution Center',
    'North Side Warehouse',
    'South Side Storage',
    'East Bay Fulfillment',
    'West Coast Depot',
  ]
  const vendorNames = [
    'Miskay Boutique',
    'Fashion Forward Ltd',
    'Style Central Inc',
    'Trendy Warehouse Co',
    'Elite Storage Solutions',
  ]

  return {
    _id: faker.string.uuid(),
    warehouseName: faker.helpers.arrayElement(warehouseNames),
    vendorName: faker.helpers.arrayElement(vendorNames),
    warehouseAddress: `${faker.location.buildingNumber()}, ${faker.location.street()}, ${faker.location.city()}, ${faker.location.state()}`,
    contactName: faker.person.fullName(),
    phoneNumber: faker.phone.number('+234 ##########'),
    email: faker.internet.email(),
    status: faker.helpers.arrayElement(statuses),
    ...overrides,
  }
}

/**
 * Generate multiple mock warehouses
 */
export const generateMockWarehouses = (count: number = 10): Warehouse[] => {
  // Ensure at least one is default
  const warehouses = Array.from({ length: count }, (_, index) =>
    generateMockWarehouse({
      status: index === 0 ? 'default' : 'alternate'
    })
  )
  return warehouses
}

/**
 * Pre-defined mock warehouses matching the design
 */
export const mockWarehouses: Warehouse[] = [
  {
    _id: '1',
    warehouseName: 'Mouka warehouse',
    vendorName: 'Miskay Boutique',
    warehouseAddress: '14, Jones street, Lagos Nigeria',
    contactName: 'Shola James',
    phoneNumber: '+234 8123456789',
    email: 'shola@mail.com',
    status: 'default',
  },
  {
    _id: '2',
    warehouseName: 'Mouka warehouse',
    vendorName: 'Miskay Boutique',
    warehouseAddress: '14, Jones street, Lagos Nigeria',
    contactName: 'Shola James',
    phoneNumber: '+234 8123456789',
    email: 'shola@mail.com',
    status: 'alternate',
  },
  {
    _id: '3',
    warehouseName: 'Mouka warehouse',
    vendorName: 'Miskay Boutique',
    warehouseAddress: '14, Jones street, Lagos Nigeria',
    contactName: 'Shola James',
    phoneNumber: '+234 8123456789',
    email: 'shola@mail.com',
    status: 'alternate',
  },
  {
    _id: '4',
    warehouseName: 'Mouka warehouse',
    vendorName: 'Miskay Boutique',
    warehouseAddress: '14, Jones street, Lagos Nigeria',
    contactName: 'Shola James',
    phoneNumber: '+234 8123456789',
    email: 'shola@mail.com',
    status: 'alternate',
  },
  {
    _id: '5',
    warehouseName: 'Central Distribution Center',
    vendorName: 'Fashion Forward Ltd',
    warehouseAddress: '25, Victoria Island, Lagos Nigeria',
    contactName: 'John Doe',
    phoneNumber: '+234 8134567890',
    email: 'john.doe@mail.com',
    status: 'alternate',
  },
]

/**
 * Get mock warehouses with pagination
 */
export const getMockWarehousesPaginated = (
  page: number = 1,
  limit: number = 10,
  totalCount: number = 20
) => {
  const start = (page - 1) * limit
  const end = start + limit

  // Generate or use pre-defined warehouses
  const allWarehouses = totalCount <= mockWarehouses?.length
    ? mockWarehouses.slice(0, totalCount)
    : [...mockWarehouses, ...generateMockWarehouses(totalCount - mockWarehouses?.length)]

  const warehouses = allWarehouses.slice(start, end)

  return {
    data: {
      data: {
        formattedWarehouses: warehouses?.map(w => ({
          _id: w._id,
          warehouseName: w.warehouseName,
          vendorName: w.vendorName,
          warehouseAddress: w.warehouseAddress,
          contactName: w.contactName,
          contactPhoneNumber: w.phoneNumber,
          contactEmail: w.email,
          warehouseStatus: w.status,
        })),
      },
      total: totalCount,
      totalCount,
      page,
      currentPage: page,
      limit,
      pageSize: limit,
      totalPages: Math.ceil(totalCount / limit),
    },
    success: true,
    message: 'Warehouses fetched successfully',
  }
}
