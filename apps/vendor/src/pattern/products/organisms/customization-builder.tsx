'use client';

import { useRef, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { ChevronDown, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FieldLabel } from '../atoms/field-label';
import {
  SelectStylesModal,
  type SelectedStyle,
} from './select-styles-modal';
import { cn } from '@/lib/utils';

export interface CustomComponentItem {
  id: string;
  productId?: string;
  imageUrl?: string;
  /** Display label for image-less tiles (e.g. a style name). */
  label?: string;
  category?: string;
  price: number;
  originalData?: any;
}

export interface CustomSubGroup {
  key: string;
  title: string;
  items: CustomComponentItem[];
}

export interface CustomSection {
  key: string;
  title: string;
  /** Style Options support per-image hotspot editing. */
  hasHotspots?: boolean;
  /** A section either holds items directly or splits into sub-groups. */
  items?: CustomComponentItem[];
  subGroups?: CustomSubGroup[];
}

interface CustomizationBuilderProps {
  sections: CustomSection[];
  onChange: (next: CustomSection[]) => void;
}

const ComponentTile = ({
  item,
  hasHotspots,
  onPriceChange,
  onRemove,
  onEditHotspots,
}: {
  item: CustomComponentItem;
  hasHotspots?: boolean;
  onPriceChange: (price: number) => void;
  onRemove: () => void;
}) => (
  <div className="w-24 shrink-0">
    <div className="group relative aspect-square overflow-hidden rounded-md border border-input bg-accent">
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt="" className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center p-1 text-center text-[11px] text-muted-foreground">
          {item.label ?? 'Image'}
        </div>
      )}

      {/* Per-tile menu (remove etc.) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="absolute right-1 top-1 rounded bg-background/80 p-0.5 text-muted-foreground hover:text-foreground"
            aria-label="Component options"
          >
            <MoreVertical className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={onRemove}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div className="relative mt-1">
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        $
      </span>
      <Input
        type="number"
        min={0}
        value={item.price === 0 ? '' : item.price}
        onChange={(e) =>
          onPriceChange(e.target.value === '' ? 0 : Number(e.target.value))
        }
        placeholder="0"
        className="h-8 bg-background pl-5 text-xs"
      />
    </div>
  </div>
);

const AddTile = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex aspect-square w-24 shrink-0 items-center justify-center rounded-md border border-dashed border-input text-muted-foreground transition-colors hover:border-primary hover:text-primary"
    aria-label="Add component"
  >
    <Plus className="size-5" />
  </button>
);

const ItemRow = ({
  items,
  hasHotspots,
  onAddItem,
  onRemoveItem,
  onPriceChange,
  onEditHotspots,
}: {
  items: CustomComponentItem[];
  hasHotspots?: boolean;
  onAddItem: () => void;
  onRemoveItem: (itemId: string) => void;
  onPriceChange: (itemId: string, price: number) => void;
}) => (
  <div className="flex items-start gap-3 overflow-x-auto pb-2">
    <AddTile onClick={onAddItem} />
    {items.map((item) => (
      <ComponentTile
        key={item.id}
        item={item}
        hasHotspots={hasHotspots}
        onPriceChange={(price) => onPriceChange(item.id, price)}
        onRemove={() => onRemoveItem(item.id)}
      />
    ))}
  </div>
);

// Customization builder: Style Options, Accessory Options and Add-Ons
// (Buttons / Threads). Each component tile carries an upcharge price and can be
// removed via its menu.
export const CustomizationBuilder = ({
  sections,
  onChange,
}: CustomizationBuilderProps) => {
  const idCounter = useRef(0);
  const newId = () => `item-${idCounter.current++}`;

  // Apply an items transform at a section (and optional sub-group) location.
  const updateItems = (
    sectionKey: string,
    subKey: string | undefined,
    transform: (items: CustomComponentItem[]) => CustomComponentItem[]
  ) =>
    onChange(
      sections.map((sec) => {
        if (sec.key !== sectionKey) return sec;
        if (subKey) {
          return {
            ...sec,
            subGroups: sec.subGroups?.map((sg) =>
              sg.key === subKey ? { ...sg, items: transform(sg.items) } : sg
            ),
          };
        }
        return { ...sec, items: transform(sec.items ?? []) };
      })
    );

  const addItem = async (sectionKey: string, subKey?: string) => {
    const section = sections.find((s) => s.key === sectionKey);
    // Style Options open the "Select Styles" picker; other sections add a tile.
    if (section?.hasHotspots && !subKey) {
      const picked = (await NiceModal.show(SelectStylesModal)) as
        | SelectedStyle[]
        | null;
      if (!picked?.length) return;
      updateItems(sectionKey, subKey, (items) => [
        ...items,
        ...picked.map((p) => ({
          id: newId(),
          productId: p.id,
          imageUrl: p.imageUrl,
          label: p.name,
          category: p.category,
          price: 0,
        })),
      ]);
      return;
    }
    updateItems(sectionKey, subKey, (items) => [
      ...items,
      { id: newId(), price: 0 },
    ]);
  };

  const removeItem = (sectionKey: string, subKey: string | undefined, itemId: string) =>
    updateItems(sectionKey, subKey, (items) =>
      items.filter((it) => it.id !== itemId)
    );

  const setPrice = (
    sectionKey: string,
    subKey: string | undefined,
    itemId: string,
    price: number
  ) =>
    updateItems(sectionKey, subKey, (items) =>
      items.map((it) => (it.id === itemId ? { ...it, price } : it))
    );

  const addComponentSection = () =>
    onChange([
      ...sections,
      {
        key: `component-${sections.length}`,
        title: `Component ${sections.length + 1}`,
        items: [],
      },
    ]);

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <Section
          key={section.key}
          section={section}
          onAddItem={addItem}
          onRemoveItem={(subKey, itemId) => removeItem(section.key, subKey, itemId)}
          onPriceChange={(subKey, itemId, price) => setPrice(section.key, subKey, itemId, price)}
        />
      ))}

      <button
        type="button"
        onClick={addComponentSection}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80"
      >
        <Plus className="size-4" />
        Add Component
      </button>
    </div>
  );
};

const Section = ({
  section,
  onAddItem,
  onRemoveItem,
  onPriceChange,
  onEditHotspots,
}: {
  section: CustomSection;
  onAddItem: (sectionKey: string, subKey?: string) => void;
  onRemoveItem: (subKey: string | undefined, itemId: string) => void;
  onPriceChange: (subKey: string | undefined, itemId: string, price: number) => void;
}) => {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mb-3 flex w-full items-center justify-between"
      >
        <FieldLabel
          tooltip={`Configure ${section.title.toLowerCase()}`}
          className="mb-0"
        >
          {section.title}
        </FieldLabel>
        <ChevronDown
          className={cn(
            'size-4 text-muted-foreground transition-transform',
            !open && '-rotate-90'
          )}
        />
      </button>

      {open && (
        <div className="space-y-4">
          {section.items && (
            <ItemRow
              items={section.items}
              hasHotspots={section.hasHotspots}
              onAddItem={() => onAddItem(section.key)}
              onRemoveItem={(itemId) =>
                onRemoveItem(undefined, itemId)
              }
              onPriceChange={(itemId, price) =>
                onPriceChange(undefined, itemId, price)
              }
            />
          )}

          {section.subGroups?.map((sg) => (
            <div key={sg.key}>
              <p className="mb-2 text-sm font-medium text-grey-black dark:text-white">
                {sg.title}
              </p>
              <ItemRow
                items={sg.items}
                onAddItem={() => onAddItem(section.key, sg.key)}
                onRemoveItem={(itemId) =>
                  onRemoveItem(sg.key, itemId)
                }
                onPriceChange={(itemId, price) =>
                  onPriceChange(sg.key, itemId, price)
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const DEFAULT_CUSTOMIZATION_SECTIONS: CustomSection[] = [
  { key: 'style', title: 'Style Options', hasHotspots: true, items: [] },
  { key: 'accessory', title: 'Accessory Options', items: [] },
  {
    key: 'addons',
    title: 'Add-Ons',
    subGroups: [
      { key: 'buttons', title: 'Buttons', items: [] },
      { key: 'threads', title: 'Threads', items: [] },
    ],
  },
];
