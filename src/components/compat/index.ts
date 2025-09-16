// Compatibility layer exports
// This allows gradual migration from custom components to shadcn/ui

import env from '@/env'

export { default as Button } from './Button'
export { default as SearchInput } from './SearchInput'
export { default as Modal } from './Modal'  
export { default as Typography } from './Typography'

// Feature flags for gradual migration
export const USE_SHADCN_COMPONENTS = {
  Button: env.NEXT_PUBLIC_USE_SHADCN_BUTTON === 'true',
  SearchInput: env.NEXT_PUBLIC_USE_SHADCN_SEARCH === 'true', 
  Modal: env.NEXT_PUBLIC_USE_SHADCN_MODAL === 'true',
  Typography: env.NEXT_PUBLIC_USE_SHADCN_TYPOGRAPHY === 'true',
}

// Future compatibility components will be exported here:
// export { default as Input } from './Input'  
// export { default as Card } from './Card'