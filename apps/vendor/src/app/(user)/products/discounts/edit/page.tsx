import { DiscountsCreateTemplate } from '@/pattern/products/templates/discounts-create-template'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Discount',
}

export default function DiscountsEditPage() {
  return <DiscountsCreateTemplate />
}
