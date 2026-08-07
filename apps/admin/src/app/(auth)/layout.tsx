import type { ReactNode } from 'react';

// The auth shell (split layout, brand mark, imagery) lives in
// pattern/auth/organisms/auth-layout.tsx and is applied per page, so each
// screen can set its own title/subtitle and choose whether to show the
// imagery. This segment is just a passthrough — matching the vendor app.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="w-full min-w-0">{children}</div>;
}
