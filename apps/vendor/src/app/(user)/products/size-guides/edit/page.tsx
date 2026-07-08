import { SizeGuidesCreateTemplate } from '@/pattern/products/templates/size-guides-create-template'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Size Guide',
}

export default function SizeGuidesEditPage() {
  return <SizeGuidesCreateTemplate />
}
