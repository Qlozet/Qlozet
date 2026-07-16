'use client';

import { useMemo, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Edit3,
  Info,
  Plus,
  Search,
  Shirt,
  Trash2,
  Shield,
  Save,
  X,
  Loader2,
} from 'lucide-react';
import { AddStylesModal, type CreatedStyle } from './add-styles-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  useGetStyleLibraryQuery,
  useDeleteVendorStyleMutation,
  useUpdateVendorStyleMutation,
} from '@/redux/services/style-library/style-library.api-slice';

const CATEGORIES = [
  'All',
  'Neckline',
  'Sleeve',
  'Collar',
  'Skirt',
  'Trouser',
  'Full Body',
  'Bodice',
  'Hemline',
  'Back',
];

type StyleView = 'all' | 'platform' | 'custom';

// ─── Manage Styles Modal ───────────────────────────────────────────
// A full management modal for vendor styles. Platform styles (no business
// field) are read-only. Vendor styles can be renamed, re-priced, or deleted.
export const ManageStylesModal = NiceModal.create(() => {
  const modal = useModal();

  const [audience, setAudience] = useState<'men' | 'women'>('women');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [viewFilter, setViewFilter] = useState<StyleView>('all');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const { data: libraryData, isLoading, refetch } = useGetStyleLibraryQuery();
  const [deleteStyle, { isLoading: isDeleting }] =
    useDeleteVendorStyleMutation();
  const [updateStyle, { isLoading: isUpdating }] =
    useUpdateVendorStyleMutation();

  const styles = useMemo(() => {
    if (!libraryData?.styles) return [];
    return libraryData.styles.map((s) => ({
      id: s._id,
      name: s.name,
      gender: s.gender,
      category: s.category,
      type: s.type,
      imageUrl: s.image_url,
      business: s.business,
      priceSuggestion: s.price_suggestion,
      description: s.description,
      isActive: s.is_active,
      createdAt: s.createdAt,
    }));
  }, [libraryData]);

  const visibleStyles = useMemo(() => {
    const query = search.trim().toLowerCase();
    const targetGender = audience === 'men' ? 'male' : 'female';

    return styles.filter((s) => {
      // Gender filter
      if (s.gender !== targetGender && s.gender !== 'unisex') return false;

      // Category filter
      if (category !== 'All') {
        const targetCategory = category.toLowerCase().replace(' ', '_');
        if (s.category !== targetCategory) return false;
      }

      // View filter
      if (viewFilter === 'platform' && s.business) return false;
      if (viewFilter === 'custom' && !s.business) return false;

      // Search
      if (query && !s.name.toLowerCase().includes(query)) return false;

      return true;
    });
  }, [styles, audience, category, viewFilter, search]);

  const customCount = styles.filter((s) => Boolean(s.business)).length;
  const platformCount = styles.filter((s) => !s.business).length;

  const handleDelete = async (styleId: string, styleName: string) => {
    if (!confirm(`Delete "${styleName}"? This cannot be undone.`)) return;
    try {
      await deleteStyle(styleId).unwrap();
      toast.success(`"${styleName}" deleted`);
      if (editingId === styleId) setEditingId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete style');
    }
  };

  const startEdit = (style: (typeof styles)[0]) => {
    setEditingId(style.id);
    setEditName(style.name);
    setEditPrice(style.priceSuggestion?.toString() || '');
    setEditDescription(style.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditPrice('');
    setEditDescription('');
  };

  const handleSave = async () => {
    if (!editingId) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error('Style name cannot be empty');
      return;
    }
    try {
      await updateStyle({
        id: editingId,
        data: {
          name: trimmed,
          ...(editPrice ? { price_suggestion: parseFloat(editPrice) } : {}),
          description: editDescription.trim() || undefined,
        },
      }).unwrap();
      toast.success('Style updated');
      cancelEdit();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update style');
    }
  };

  const handleAddStyle = async () => {
    const created = (await NiceModal.show(AddStylesModal)) as
      | CreatedStyle
      | null;
    if (!created) return;
    toast.success(`"${created.name}" created`);
  };

  const close = () => {
    modal.resolve(null);
    modal.remove();
  };

  if (!modal.visible) return null;

  return (
    <Dialog open={modal.visible} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0 overflow-hidden sm:rounded-[16px] bg-card border-none sm:border-solid">
        <div className="flex max-h-[85vh] sm:max-h-[90vh] h-full w-full flex-col sm:rounded-[16px]">
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-border p-6 pr-12">
            <DialogTitle className="text-base font-semibold text-grey-black dark:text-white shrink-0 m-0">
              Manage Styles
            </DialogTitle>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search styles..."
                className="h-10 w-full rounded-lg border border-input bg-accent dark:bg-muted pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {/* Stats + Add */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 font-medium text-foreground">
                  <Shield className="size-3" />
                  {platformCount} Platform
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 font-medium text-primary">
                  <Edit3 className="size-3" />
                  {customCount} Custom
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddStyle}
                className="flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Add Style
                <Plus className="size-4" />
              </button>
            </div>

            {/* View filter */}
            <div className="flex w-fit gap-1 rounded-lg bg-accent p-1">
              {(
                [
                  { key: 'all', label: 'All' },
                  { key: 'custom', label: 'My Styles' },
                  { key: 'platform', label: 'Platform' },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setViewFilter(key)}
                  className={cn(
                    'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
                    viewFilter === key
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-background'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Audience toggle */}
            <div className="flex w-fit gap-1 rounded-lg bg-accent p-1">
              {(['men', 'women'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAudience(a)}
                  className={cn(
                    'rounded-md px-5 py-1.5 text-sm font-medium capitalize transition-colors',
                    audience === a
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-background'
                  )}
                >
                  {a}
                </button>
              ))}
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-4 border-b border-border">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    '-mb-px border-b-2 pb-2 text-sm transition-colors',
                    category === cat
                      ? 'border-foreground font-medium text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Style grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="space-y-2 rounded-lg border bg-card p-3"
                  >
                    <Skeleton className="aspect-square w-full rounded-md" />
                    <Skeleton className="mx-auto h-3 w-16" />
                    <Skeleton className="mx-auto h-2 w-10" />
                  </div>
                ))}
              </div>
            ) : visibleStyles.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {visibleStyles.map((style) => {
                  const isCustom = Boolean(style.business);
                  const isEditing = editingId === style.id;

                  return (
                    <div
                      key={style.id}
                      className={cn(
                        'group relative rounded-lg border bg-card transition-all',
                        isCustom
                          ? 'border-input hover:border-primary/50'
                          : 'border-input/50',
                        isEditing && 'ring-2 ring-primary border-primary'
                      )}
                    >
                      {/* Image */}
                      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-t-lg bg-accent text-muted-foreground">
                        {style.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={style.imageUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <Shirt className="size-8" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3 space-y-1.5">
                        {isEditing ? (
                          // Edit mode
                          <div className="space-y-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Style name"
                              className="h-8 text-xs bg-background"
                              autoFocus
                            />
                            <Input
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              placeholder="Price (₦)"
                              type="number"
                              min={0}
                              className="h-8 text-xs bg-background"
                            />
                            <textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              placeholder="Description (optional)"
                              rows={2}
                              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs outline-none resize-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={handleSave}
                                disabled={isUpdating}
                                className="flex-1 flex items-center justify-center gap-1 rounded-md bg-primary px-2 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                              >
                                {isUpdating ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <Save className="size-3" />
                                )}
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="flex items-center justify-center rounded-md border border-input px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent"
                              >
                                <X className="size-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <>
                            <p className="text-xs font-medium text-foreground truncate">
                              {style.name}
                            </p>
                            {style.description && (
                              <p className="text-[10px] text-muted-foreground line-clamp-2">
                                {style.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                                  isCustom
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-accent text-muted-foreground'
                                )}
                              >
                                {isCustom ? (
                                  <>
                                    <Edit3 className="size-2.5" /> Custom
                                  </>
                                ) : (
                                  <>
                                    <Shield className="size-2.5" /> Platform
                                  </>
                                )}
                              </span>
                              {style.priceSuggestion != null &&
                                style.priceSuggestion > 0 && (
                                  <span className="text-[10px] text-muted-foreground">
                                    ₦
                                    {style.priceSuggestion.toLocaleString()}
                                  </span>
                                )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Action buttons (custom only, hidden during edit) */}
                      {isCustom && !isEditing && (
                        <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => startEdit(style)}
                            className="flex size-7 items-center justify-center rounded-full bg-card/90 backdrop-blur text-foreground shadow-sm border border-input hover:bg-accent transition-colors"
                          >
                            <Edit3 className="size-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(style.id, style.name)
                            }
                            disabled={isDeleting}
                            className="flex size-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      )}

                      {/* Platform lock indicator */}
                      {!isCustom && (
                        <div className="absolute right-2 top-2">
                          <Shield className="size-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center">
                <Shirt className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {viewFilter === 'custom'
                    ? 'You haven\'t created any custom styles yet.'
                    : 'No styles found in this category.'}
                </p>
                {viewFilter === 'custom' && (
                  <button
                    type="button"
                    onClick={handleAddStyle}
                    className="mt-1 flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="size-3.5" />
                    Create your first style
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <p className="text-xs text-muted-foreground">
              {visibleStyles.length} style
              {visibleStyles.length !== 1 ? 's' : ''} shown
            </p>
            <button
              type="button"
              onClick={close}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Done
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
