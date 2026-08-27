import Link from 'next/link';

const CATEGORIES = [
  { href: '/products/clothing', label: 'Clothing' },
  { href: '/products/accessories', label: 'Accessories' },
  { href: '/products/fabrics', label: 'Fabrics' },
];

export default function ProductsPage() {
  return (
    <section className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Products
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Admin mirror of vendor /products. Replace with admin product
            catalog.
          </p>
        </div>
        <Link
          href="/products/add-product"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          Add product
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CATEGORIES.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-lg border border-gray-200 bg-white p-5 hover:border-gray-300 dark:border-white/10 dark:bg-card dark:hover:border-white/20"
          >
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Category
            </div>
            <div className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
              {c.label}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
