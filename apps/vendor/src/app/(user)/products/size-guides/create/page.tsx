import { SizeGuidesCreateTemplate } from '@/pattern/products/templates/size-guides-create-template'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Size Guide',
}

export default function SizeGuidesCreatePage() {
  return <SizeGuidesCreateTemplate />
}
