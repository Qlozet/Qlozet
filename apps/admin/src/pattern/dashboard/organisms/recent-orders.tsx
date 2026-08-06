"use client"

import { ChevronRight, Package, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { APP_ROUTES } from '@/lib/routes';
import { useGetVendorOrdersQuery } from '@/redux/services/dashboard/dashboard.api-slice';

/* ── Helpers (tolerant of the loosely-typed order payload) ── */

const naira = (v: unknown): string =>
    typeof v === 'number' && !Number.isNaN(v) ? `₦${v.toLocaleString()}` : '—';

const timeAgo = (dateStr?: string): string => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '—';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const bespokeDesign = (o: any): any | null =>
    o?.bespoke_design && typeof o.bespoke_design === 'object' ? o.bespoke_design : null;

const pickImg = (arr: any): string | null => {
    if (Array.isArray(arr) && arr.length) {
        const first = arr[0];
        if (typeof first === 'string') return first;
        if (first && typeof first === 'object' && first.url) return first.url;
    }
    return null;
};

const productImage = (item: any): string | null => {
    const p = item?.product;
    if (!p || typeof p !== 'object') return null;
    const kind = p.clothing?.images ?? p.fabric?.images ?? p.accessory?.images;
    return pickImg(kind) ?? pickImg(p.images);
};

// Up to `max` item thumbnails; falls back to the bespoke design image for
// custom orders. Used for the overlapping stack on multi-item orders.
const readImages = (o: any, max = 3): string[] => {
    const imgs: string[] = [];
    for (const item of Array.isArray(o?.items) ? o.items : []) {
        const img = productImage(item);
        if (img) imgs.push(img);
        if (imgs.length >= max) break;
    }
    if (imgs.length === 0) {
        const d = bespokeDesign(o);
        if (d) {
            const img = pickImg(d.design_images) ?? pickImg(d.reference_images);
            if (img) imgs.push(img);
        }
    }
    return imgs;
};

const readName = (o: any): string => {
    const p = o?.items?.[0]?.product;
    const n =
        p && typeof p === 'object'
            ? p.clothing?.name ?? p.fabric?.name ?? p.accessory?.name ?? p.name
            : null;
    if (n) return n;
    const d = bespokeDesign(o);
    if (d) return d.name ?? 'Custom design';
    return 'Order';
};

const readCustomer = (o: any): string => {
    const c = o?.customer;
    if (!c || typeof c !== 'object') return '—';
    if (c.username) return c.username;
    const parts = [c.firstName ?? c.first_name, c.lastName ?? c.last_name].filter(Boolean);
    return parts.length ? parts.join(' ') : c.email ?? '—';
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-[#FEF6E7] text-[#DD900D]' },
    in_review: { label: 'In Review', className: 'bg-[#E7F0FA] text-[#3387CC]' },
    processing: { label: 'Processing', className: 'bg-[#F4EBFF] text-[#7E22CE]' },
    in_transit: { label: 'In Transit', className: 'bg-[#EAECF0] text-[#475467]' },
    completed: { label: 'Completed', className: 'bg-[#E7F6EC] text-[#0F973D]' },
    cancelled: { label: 'Cancelled', className: 'bg-[#FBEAE9] text-[#D42620]' },
    returned: { label: 'Returned', className: 'bg-[#FEECEB] text-[#D42620]' },
};

const readStatusBadge = (status?: string) =>
    STATUS_BADGE[(status ?? 'pending').toLowerCase()] ?? {
        label: status ?? 'Pending',
        className: 'bg-[#EAECF0] text-[#475467]',
    };

/* ── Component ── */

export const RecentOrders = () => {
    const { data, isLoading } = useGetVendorOrdersQuery();

    const raw = data as any;
    const allOrders: any[] = Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.data?.data)
            ? raw.data.data
            : [];
    const orders = allOrders.slice(0, 6);
    const isEmpty = orders.length === 0;

    return (
        <Card className="w-full h-[443px] overflow-hidden rounded-[12px] custom-card-shadow flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4 shrink-0">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="size-4 text-muted-foreground" />
                    <CardTitle className="text-sm font-medium text-[hsla(210,9%,31%,1)] m-0">
                        Recent orders
                    </CardTitle>
                </div>
                <Link href={APP_ROUTES.orders} className="flex items-center gap-1 text-xs text-foreground">
                    View all <ChevronRight size={16} />
                </Link>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-3">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                            <div className="size-11 rounded-md bg-gray-200" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-32 rounded bg-gray-200" />
                                <div className="h-2.5 w-20 rounded bg-gray-100" />
                            </div>
                        </div>
                    ))
                ) : isEmpty ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                        <Package className="size-8 text-gray-300" />
                        <p className="text-sm text-muted-foreground">No orders yet.</p>
                    </div>
                ) : (
                    orders.map((order: any, idx: number) => {
                        const images = readImages(order, 3);
                        const name = readName(order);
                        const itemsCount = Array.isArray(order?.items) ? order.items.length : 0;
                        const badge = readStatusBadge(order?.status);
                        return (
                            <div
                                key={order?._id || order?.id || idx}
                                className="group flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* Overlapping thumbnail stack for multi-item orders */}
                                    <div className="flex shrink-0 items-center">
                                        {images.length > 0 ? (
                                            images.map((src, i) => (
                                                <div
                                                    key={i}
                                                    className={`size-11 rounded-md overflow-hidden bg-gray-200 ring-2 ring-gray-50 transition-all duration-200 ease-out ${i !== 0 ? '-ml-8 group-hover:-ml-4' : ''}`}
                                                    style={{ zIndex: images.length - i }}
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={src} alt={name} className="size-full object-cover" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="size-11 rounded-md overflow-hidden bg-gray-200 flex items-center justify-center">
                                                <Package className="size-4 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate max-w-[130px]">{name}</p>
                                            {itemsCount > 1 && (
                                                <span className="text-[10px] text-gray-400 shrink-0">+{itemsCount - 1} more</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 truncate max-w-[160px]">{readCustomer(order)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="flex flex-col items-end gap-0.5">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {naira(order?.total ?? order?.subtotal)}
                                        </p>
                                        <span className="text-xs text-gray-500">{timeAgo(order?.createdAt)}</span>
                                    </div>
                                    <span
                                        className={`inline-flex h-[22px] items-center justify-center whitespace-nowrap rounded-md px-2 text-[10px] font-medium ${badge.className}`}
                                    >
                                        {badge.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}
