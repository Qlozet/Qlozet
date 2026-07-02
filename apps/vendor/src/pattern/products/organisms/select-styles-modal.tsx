'use client';

import { useMemo, useState } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Check, Info, Plus, Search, Shirt, X, Trash2 } from 'lucide-react';
import { AddStylesModal, type CreatedStyle } from './add-styles-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useGetStyleLibraryQuery, useDeleteVendorStyleMutation } from '@/redux/services/style-library/style-library.api-slice';

export interface SelectedStyle {
  id: string;
  name: string;
  category?: string;
  imageUrl?: string;
}

interface StyleDef {
  id: string;
  name: string;
  audience: 'men' | 'women';
  category: string;
  subTab?: string;
  imageUrl?: string;
}

const CATEGORIES = [
  'Neckline',
  'Sleeve',
  'Collar',
  'Skirt',
  'Trouser',
  'Full Body',
  'Bodice',
  'Hemline',
  'Back'
];

const SUBTABS: Record<string, string[]> = {
  Neckline: ['Round', 'V-shaped', 'High', 'Low', 'Collared', 'Strapped'],
};



// "Select Styles" picker. Resolves with the chosen styles (or null if cancelled).
export const SelectStylesModal = NiceModal.create(() => {
  const modal = useModal();

  const [audience, setAudience] = useState<'men' | 'women'>('women');
  const [category, setCategory] = useState('Neckline');
  const [subTab, setSubTab] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Record<string, any>>({});
  
  const { data: libraryData, isLoading } = useGetStyleLibraryQuery();
  const [deleteCustomStyle] = useDeleteVendorStyleMutation();
  
  const styles = useMemo(() => {
    if (!libraryData?.styles) return [];
    return libraryData.styles.map(s => ({
      id: s._id,
      name: s.name,
      gender: s.gender,
      category: s.category, // e.g. 'neckline'
      subTab: s.type, 
      imageUrl: s.image_url,
      business: s.business,
    }));
  }, [libraryData, audience]);

  const subTabs = SUBTABS[category] ?? [];

  const visibleStyles = useMemo(() => {
    const query = search.trim().toLowerCase();
    const targetGender = audience === 'men' ? 'male' : 'female';
    const targetCategory = category.toLowerCase().replace(' ', '_');

    return styles.filter(
      (s) =>
        (s.gender === targetGender || s.gender === 'unisex') &&
        s.category === targetCategory &&
        (subTabs.length === 0 || true) && // Simplified subTab logic for live data
        (!query || s.name.toLowerCase().includes(query))
    );
  }, [styles, audience, category, subTab, subTabs.length, search]);

  // Open the Add Styles modal; on success, add the new style to the current
  // view and auto-select it.
  const handleAddStyle = async () => {
    const created = (await NiceModal.show(AddStylesModal)) as
      | CreatedStyle
      | null;
    if (!created) return;
    
    // Find the exact UI category name that matches the created style's backend category
    const matchedCategory = CATEGORIES.find(
      (c) => c.toLowerCase().replace(' ', '_') === created.styleType
    ) || CATEGORIES[0];

    const def: any = {
      id: (created as any).id || `custom-${Date.now()}`,
      name: created.name,
      audience: created.audience,
      category: matchedCategory,
      subTab: undefined,
      imageUrl: created.imageUrl,
    };
    setSelected((prev) => ({ ...prev, [def.id]: def }));
    
    // Auto-switch to the newly created style's category so it becomes visible
    setAudience(created.audience);
    setCategory(matchedCategory);
    setSubTab(SUBTABS[matchedCategory]?.[0] ?? '');
  };

  if (!modal.visible) return null;

  const toggle = (style: any) =>
    setSelected((prev) => {
      const next = { ...prev };
      if (next[style.id]) delete next[style.id];
      else next[style.id] = style;
      return next;
    });

  const selectedList = Object.values(selected);

  const useStyles = () => {
    modal.resolve(
      selectedList.map<SelectedStyle>((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        imageUrl: s.imageUrl,
      }))
    );
    modal.remove();
  };

  const cancel = () => {
    modal.resolve(null);
    modal.remove();
  };

  const changeCategory = (cat: string) => {
    setCategory(cat);
    setSubTab(SUBTABS[cat]?.[0] ?? '');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={cancel}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-border p-6">
          <h2 className="text-base font-semibold text-grey-black dark:text-white">
            Select Styles
          </h2>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <button
            type="button"
            onClick={cancel}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddStyle}
              className="flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              Add Style
              <Plus className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-[hsla(27,97%,12%,0.06)] p-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Info className="size-4" />
            </span>
            <p className="text-sm text-grey-black dark:text-white">
              Choose the styles you would like to present to your customers
            </p>
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
                onClick={() => changeCategory(cat)}
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

          {/* Sub-tabs */}
          {subTabs.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded-lg bg-accent p-1">
              {subTabs.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSubTab(st)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm transition-colors',
                    subTab === st
                      ? 'bg-background font-medium text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {st}
                </button>
              ))}
            </div>
          )}

          {/* Style grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2 rounded-lg border bg-card p-3">
                  <Skeleton className="aspect-square w-full rounded-md" />
                  <Skeleton className="mx-auto h-3 w-16" />
                  <Skeleton className="mx-auto h-2 w-10" />
                </div>
              ))}
            </div>
          ) : visibleStyles.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {visibleStyles.map((style) => {
                const isSelected = Boolean(selected[style.id]);
                const isCustom = Boolean(style.business);
                return (
                  <div key={style.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => toggle(style)}
                      className={cn(
                        'relative flex w-full flex-col items-center gap-2 rounded-lg border bg-card p-3 transition-colors',
                      isSelected
                        ? 'border-primary ring-1 ring-primary'
                        : 'border-input hover:border-primary/50'
                    )}
                  >
                    {isSelected && (
                      <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    )}
                    <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-accent text-muted-foreground">
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
                    <span className="text-xs text-foreground font-medium">{style.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{isCustom ? 'Custom' : 'Global'}</span>
                    </button>

                    {isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this custom style?')) {
                            deleteCustomStyle(style.id);
                          }
                        }}
                        className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 shadow-sm z-10 hover:bg-destructive/90"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              No styles in this category yet.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6">
          <button
            type="button"
            onClick={useStyles}
            disabled={selectedList.length === 0}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Use Styles{selectedList.length > 0 ? ` (${selectedList.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
});
