import Link from "next/link";
import type { ReactNode } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/orders", label: "Orders" },
  { href: "/customers", label: "Customers" },
  { href: "/wallet", label: "Wallet" },
  { href: "/notification", label: "Notification" },
  { href: "/support", label: "Support" },
  { href: "/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <aside className="hidden w-60 shrink-0 border-r border-gray-200 bg-white p-4 md:block">
        <div className="mb-6 px-2 text-lg font-semibold">Qlozet Admin</div>
        <nav className="flex flex-col gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="text-sm text-gray-500">Admin Panel</div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
