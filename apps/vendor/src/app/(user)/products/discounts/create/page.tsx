import { DiscountsCreateTemplate } from '@/pattern/products/templates/discounts-create-template'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Discount',
}

export default function DiscountsCreatePage() {
  return <DiscountsCreateTemplate />
}
