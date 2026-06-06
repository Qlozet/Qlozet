'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Flag,
  Heart,
  MessageSquare,
  Monitor,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GoBackButton } from '@/pattern/admin/atoms/go-back-button';
import { APP_ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import {
  useGetProductQuery,
  useDeleteProductMutation,
} from '@/redux/services/products/products.api-slice';

// Defensive view over the clothing product shape (the catalogue Product carries
// these nested fields via its index signature).
interface ColorVariantView {
  name?: string;
  hex?: string;
  images?: { url?: string }[];
  variants?: { size?: string; stock?: number }[];
}
interface ComponentView {
  name?: string;
  images?: { url?: string }[];
  image?: string;
}
interface ClothingView {
  _id?: string;
  name?: string;
  status?: string;
  price?: number;
  type?: string;
  images?: { url?: string }[];
  business?: { name?: string };
  business_name?: string;
  rating?: number;
  likes?: number;
  reviews_count?: number;
  items_delivered?: number;
  discount?: string;
  kind?: string;
  taxonomy?: {
    product_type?: string;
    categories?: string[];
    attributes?: string[];
    audience?: string;
  };
  color_variants?: ColorVariantView[];
  styles?: ComponentView[];
  accessories?: ComponentView[];
  fabrics?: ComponentView[];
  // Accessory variants (kind === 'accessory').
  variants?: {
    size?: string;
    measurement?: string;
    stock?: number;
    color?: { name?: string; hex?: string };
  }[];
  // Fabric-specific fields (kind === 'fabric').
  material?: string;
  product_type?: string;
  colour?: string;
  swatch?: string;
  pattern?: string;
  width?: number;
  yard_length?: number;
  min_cut?: number;
  price_per_yard?: number;
}

const NGN = (value?: number) =>
  typeof value === 'number'
    ? `NGN ${value.toLocaleString()}`
    : '—';

const compImage = (c: ComponentView) => c.images?.[0]?.url ?? c.image;

const DetailRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start justify-between gap-4 border-t border-border py-3.5 first:border-t-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className="flex flex-1 flex-wrap items-center justify-end gap-2 text-sm font-medium text-grey-black dark:text-white">
      {children}
    </div>
  </div>
);

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-md bg-accent px-2.5 py-1 text-xs capitalize text-foreground">
    {children}
  </span>
);

// Chip with a small leading thumbnail (fabric Product Type / Pattern).
const ChipThumb = ({ url, label }: { url?: string; label: string }) => (
  <span className="flex items-center gap-1.5 rounded-md bg-accent px-2 py-1 text-xs capitalize text-foreground">
    {url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="size-4 rounded object-cover" />
    ) : null}
    {label}
  </span>
);

const Thumb = ({ url }: { url?: string }) => (
  <span className="flex size-9 items-center justify-center overflow-hidden rounded-md border border-input bg-accent">
    {url ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="size-full object-cover" />
    ) : null}
  </span>
);

interface ProductDetailsTemplateProps {
  productId: string;
}

export const ProductDetailsTemplate = ({
  productId,
}: ProductDetailsTemplateProps) => {
  const router = useRouter();
  const { data, isLoading, isError } = useGetProductQuery(productId, {
    skip: !productId,
  });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [activeImage, setActiveImage] = useState(0);

  const product = (data?.data ?? {}) as ClothingView;
  const images = (product.images ?? [])
    .map((i) => i?.url)
    .filter((u): u is string => Boolean(u));

  const businessName = product.business?.name ?? product.business_name;
  const customisation = product.type
    ? product.type === 'customize'
      ? 'Yes'
      : 'No'
    : undefined;

  const colours = (product.color_variants ?? [])
    .map((c) => c.hex)
    .filter((h): h is string => Boolean(h));
  const sizes = Array.from(
    new Set(
      (product.color_variants ?? []).flatMap((c) =>
        (c.variants ?? []).map((v) => v.size).filter(Boolean)
      )
    )
  ) as string[];
  const totalStock = (product.color_variants ?? []).reduce(
    (sum, c) =>
      sum + (c.variants ?? []).reduce((s, v) => s + (v.stock ?? 0), 0),
    0
  );

  const tags = product.taxonomy?.attributes ?? [];
  const hasMetrics =
    product.rating !== undefined ||
    product.likes !== undefined ||
    product.reviews_count !== undefined;

  // Fabric products render a different detail set than clothing.
  const isFabric =
    product.kind === 'fabric' ||
    product.price_per_yard !== undefined ||
    product.min_cut !== undefined;
  const firstImage = images[0];
  const material =
    product.material ?? product.product_type ?? product.taxonomy?.product_type;

  const accVariants = product.variants ?? [];
  const isAccessory =
    !isFabric &&
    (product.kind === 'accessory' ||
      (accVariants.length > 0 && !product.color_variants?.length));
  const accColours = Array.from(
    new Set(accVariants.map((v) => v.color?.hex).filter(Boolean))
  ) as string[];
  const accSizes = accVariants
    .filter((v) => v.size)
    .map((v) => ({ size: v.size, measurement: v.measurement }));
  const accQuantity = accVariants.reduce((s, v) => s + (v.stock ?? 0), 0);

  const handleDelete = async () => {
    try {
      await deleteProduct(productId).unwrap();
      toast.success('Product deleted.');
      router.push(APP_ROUTES.productsCloth);
    } catch {
      toast.error('Failed to delete product.');
    }
  };

  const wip = () => toast.info('This action is coming soon.');

  if (isLoading) return <ProductDetailsSkeleton />;

  if (isError || !data?.data) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <GoBackButton />
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground">
          This product could not be loaded.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen h-fit pb-10">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <GoBackButton />
          <Button
            variant="outline"
            onClick={wip}
            className="gap-2"
          >
            <Monitor className="size-4" />
            Preview
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Image gallery */}
          <div className="relative overflow-hidden rounded-2xl bg-accent">
            <div className="relative aspect-[4/5] w-full">
              {images[activeImage] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[activeImage]}
                  alt={product.name ?? 'Product'}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImage((i) => (i - 1 + images.length) % images.length)
                  }
                  className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-grey-black shadow hover:bg-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-grey-black shadow hover:bg-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Info card */}
            <div className="rounded-2xl bg-card p-6 custom-card-shadow">
              <div className="flex items-start justify-between gap-4">
                {businessName ? (
                  <p className="text-sm font-medium uppercase text-[#2F80ED]">
                    {businessName}
                  </p>
                ) : (
                  <span />
                )}
                {product.status && (
                  <span className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium capitalize text-grey-black dark:text-white">
                    <span className="size-2 rounded-full bg-success" />
                    {product.status}
                  </span>
                )}
              </div>

              <h1 className="mt-2 text-3xl font-bold text-primary">
                {product.name ?? 'Untitled product'}
              </h1>

              {hasMetrics && (
                <div className="mt-3 flex flex-wrap items-center gap-6 text-sm font-semibold text-grey-black dark:text-white">
                  {product.rating !== undefined && (
                    <span className="flex items-center gap-1.5">
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      {product.rating}
                    </span>
                  )}
                  {product.likes !== undefined && (
                    <span className="flex items-center gap-1.5">
                      <Heart className="size-4 fill-red-500 text-red-500" />
                      {product.likes}
                    </span>
                  )}
                  {product.reviews_count !== undefined && (
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="size-4" />
                      {product.reviews_count}
                      <button
                        type="button"
                        onClick={wip}
                        className="ml-1 text-xs font-normal text-muted-foreground underline"
                      >
                        Read reviews
                      </button>
                    </span>
                  )}
                </div>
              )}

              <p className="mt-4 text-2xl font-bold text-grey-black dark:text-white">
                {NGN(product.price)}
              </p>

              {product.items_delivered !== undefined && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 text-xs text-grey-black dark:text-white">
                  Items delivered:{' '}
                  <span className="font-semibold">
                    {product.items_delivered.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={wip}
                  className="flex size-9 items-center justify-center rounded-md bg-accent text-grey-black hover:opacity-80 dark:text-white"
                  aria-label="Copy"
                >
                  <Clipboard className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={wip}
                  className="flex size-9 items-center justify-center rounded-md bg-accent text-destructive hover:opacity-80"
                  aria-label="Flag"
                >
                  <Flag className="size-4" />
                </button>
                <Button variant="outline" onClick={wip} className="text-destructive">
                  Escalate to support
                </Button>
              </div>
            </div>

            {/* Detail card */}
            <div className="rounded-2xl bg-card p-6 custom-card-shadow">
              {isFabric ? (
                <>
                  {material ? (
                    <DetailRow label="Product Type">
                      <ChipThumb url={firstImage} label={material} />
                    </DetailRow>
                  ) : null}
                  {product.swatch || product.colour ? (
                    <DetailRow label="Colour">
                      {product.swatch ? (
                        <span
                          style={{ backgroundColor: product.swatch }}
                          className="size-6 rounded-full border border-border"
                        />
                      ) : (
                        <Chip>{product.colour}</Chip>
                      )}
                    </DetailRow>
                  ) : null}
                  {product.pattern ? (
                    <DetailRow label="Pattern">
                      <ChipThumb url={firstImage} label={product.pattern} />
                    </DetailRow>
                  ) : null}
                  {product.width !== undefined ? (
                    <DetailRow label="Width">{product.width} Inches</DetailRow>
                  ) : null}
                  {product.yard_length !== undefined ? (
                    <DetailRow label="Available Length">
                      {product.yard_length} Yards
                    </DetailRow>
                  ) : null}
                  {product.min_cut !== undefined ? (
                    <DetailRow label="Minimum Cut">
                      {product.min_cut} Yards
                    </DetailRow>
                  ) : null}
                </>
              ) : isAccessory ? (
                <>
                  {tags.length ? (
                    <DetailRow label="Tags">
                      {tags.map((t) => (
                        <Chip key={t}>{t}</Chip>
                      ))}
                    </DetailRow>
                  ) : null}
                  {product.taxonomy?.categories?.length ? (
                    <DetailRow label="Category">
                      {product.taxonomy.categories.map((c) => (
                        <Chip key={c}>{c}</Chip>
                      ))}
                    </DetailRow>
                  ) : null}
                  {product.taxonomy?.product_type ? (
                    <DetailRow label="Product Type">
                      <Chip>{product.taxonomy.product_type}</Chip>
                    </DetailRow>
                  ) : null}
                  {accColours.length ? (
                    <DetailRow label="Available colours">
                      {accColours.map((hex, i) => (
                        <span
                          key={`${hex}-${i}`}
                          style={{ backgroundColor: hex }}
                          className="size-6 rounded-full border border-border"
                        />
                      ))}
                    </DetailRow>
                  ) : null}
                  {accSizes.length ? (
                    <DetailRow label="Available Sizes">
                      {accSizes.map((s, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 rounded-md border border-input px-2 py-1.5 text-xs text-foreground"
                        >
                          <span className="font-semibold">{s.size}</span>
                          {s.measurement ? (
                            <span className="text-muted-foreground">
                              {s.measurement}
                            </span>
                          ) : null}
                        </span>
                      ))}
                    </DetailRow>
                  ) : null}
                  <DetailRow label="Available quantity">
                    {accQuantity > 0 ? accQuantity : '—'}
                  </DetailRow>
                </>
              ) : (
                <>
              {customisation && (
                <DetailRow label="Customisation">
                  <Chip>{customisation}</Chip>
                </DetailRow>
              )}
              {product.taxonomy?.categories?.length ? (
                <DetailRow label="Category">
                  {product.taxonomy.categories.map((c) => (
                    <Chip key={c}>{c}</Chip>
                  ))}
                </DetailRow>
              ) : null}
              {product.taxonomy?.product_type ? (
                <DetailRow label="Product Type">
                  <Chip>{product.taxonomy.product_type}</Chip>
                </DetailRow>
              ) : null}
              {tags.length ? (
                <DetailRow label="Tags">
                  {tags.map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                </DetailRow>
              ) : null}
              {colours.length ? (
                <DetailRow label="Available colours">
                  {colours.map((hex, i) => (
                    <span
                      key={`${hex}-${i}`}
                      style={{ backgroundColor: hex }}
                      className="size-6 rounded-full border border-border"
                    />
                  ))}
                </DetailRow>
              ) : null}
              {sizes.length ? (
                <DetailRow label="Available Sizes">
                  {sizes.map((s) => (
                    <span
                      key={s}
                      className="flex min-w-9 items-center justify-center rounded-md bg-accent px-2 py-1 text-xs font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </DetailRow>
              ) : null}
              <DetailRow label="Stock">
                {totalStock > 0 ? `${totalStock} Units` : '—'}
              </DetailRow>
              {product.styles?.length ? (
                <DetailRow label="Style Options">
                  {product.styles.map((s, i) => (
                    <Thumb key={i} url={compImage(s)} />
                  ))}
                </DetailRow>
              ) : null}
              {product.fabrics?.length ? (
                <DetailRow label="Fabric Options">
                  {product.fabrics.map((f, i) => (
                    <Thumb key={i} url={compImage(f)} />
                  ))}
                </DetailRow>
              ) : null}
              {product.accessories?.length ? (
                <DetailRow label="Accessory Options">
                  {product.accessories.map((a, i) => (
                    <Thumb key={i} url={compImage(a)} />
                  ))}
                </DetailRow>
              ) : null}
                </>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-6">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-sm font-medium text-destructive hover:underline disabled:opacity-50"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
              <Button
                onClick={() => router.push(APP_ROUTES.productsAdd)}
                className="px-8"
              >
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductDetailsSkeleton = () => (
  <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-10 w-28" />
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
      <div className="space-y-6">
        <div className="space-y-3 rounded-2xl bg-card p-6 custom-card-shadow">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-7 w-32" />
        </div>
        <div className="space-y-3 rounded-2xl bg-card p-6 custom-card-shadow">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ProductDetailsTemplate;
