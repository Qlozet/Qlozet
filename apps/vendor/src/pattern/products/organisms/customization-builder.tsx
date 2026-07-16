'use client';

import { useRef, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { ChevronDown, MoreVertical, Palette, Image as ImageIcon, Pencil, Plus, Trash2, X } from 'lucide-react';
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
import {
  SelectAccessoriesModal,
  type SelectedAccessory,
} from './select-accessories-modal';
import {
  SelectFabricModal,
  type SelectedFabric,
} from './select-fabric-modal';
import { AddAddonModal, type AddonDefinition } from './add-addon-modal';
import { AddAddonVariantModal, type AddonVariantResult } from './add-addon-variant-modal';
import { cn } from '@/lib/utils';

export interface CustomComponentItem {
  id: string;
  productId?: string;
  imageUrl?: string;
  /** Display label for image-less tiles (e.g. a style name). */
  label?: string;
  category?: string;
  price: number;
  /** Colour hex for addon colour display type */
  colorHex?: string;
  originalData?: any;
}

export interface CustomSubGroup {
  key: string;
  title: string;
  /** Display type for add-on variants: 'colour' shows swatches, 'picture' shows images */
  displayType?: 'colour' | 'picture';
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

// ─── Addon Variant Tile ────────────────────────────────────────────
// Renders a colour swatch or image tile for addon variants.
const AddonVariantTile = ({
  item,
  displayType,
  onRemove,
}: {
  item: CustomComponentItem;
  displayType?: 'colour' | 'picture';
  onRemove: () => void;
}) => (
  <div className="w-24 shrink-0">
    <div className="group relative aspect-square overflow-hidden rounded-md border border-input bg-accent">
      {displayType === 'colour' && item.colorHex ? (
        <div className="flex size-full flex-col items-center justify-center gap-1.5">
          <div
            className="size-12 rounded-full border-2 border-input shadow-sm"
            style={{ backgroundColor: item.colorHex }}
          />
          <span className="text-[9px] font-mono text-muted-foreground">
            {item.colorHex}
          </span>
        </div>
      ) : item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt="" className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center p-1 text-center text-[11px] text-muted-foreground">
          {item.label ?? 'Image'}
        </div>
      )}

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 shadow-sm"
        aria-label="Remove variant"
      >
        <X className="size-3" />
      </button>
    </div>

    {/* Label + Price */}
    <p className="mt-1 truncate text-[11px] font-medium text-foreground">
      {item.label ?? 'Variant'}
    </p>
    <p className="text-[10px] text-muted-foreground">
      ₦{(item.price ?? 0).toLocaleString()}
    </p>
  </div>
);

// ─── Standard Component Tile ───────────────────────────────────────
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
  onEditHotspots?: (item: CustomComponentItem) => void;
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
  onEditHotspots?: (item: CustomComponentItem) => void;
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

// ─── Addon Variant Row ─────────────────────────────────────────────
// Renders add-on variants as colour swatches or image tiles.
const AddonVariantRow = ({
  items,
  displayType,
  onAddItem,
  onRemoveItem,
}: {
  items: CustomComponentItem[];
  displayType?: 'colour' | 'picture';
  onAddItem: () => void;
  onRemoveItem: (itemId: string) => void;
}) => (
  <div className="flex items-start gap-3 overflow-x-auto pb-2">
    <AddTile onClick={onAddItem} />
    {items.map((item) => (
      <AddonVariantTile
        key={item.id}
        item={item}
        displayType={displayType}
        onRemove={() => onRemoveItem(item.id)}
      />
    ))}
  </div>
);

// ─── Customization Builder ─────────────────────────────────────────
// Style Options, Accessory Options, and dynamic Add-Ons.
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
    // Style Options open the "Select Styles" picker.
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
    // Accessory Options open the "Select Accessories" picker.
    if (sectionKey === 'accessory' && !subKey) {
      const picked = (await NiceModal.show(SelectAccessoriesModal)) as
        | SelectedAccessory[]
        | null;
      if (!picked?.length) return;
      updateItems(sectionKey, subKey, (items) => [
        ...items,
        ...picked.map((p) => ({
          id: newId(),
          productId: p.id,
          imageUrl: p.imageUrl,
          label: p.name,
          price: p.price ?? 0,
        })),
      ]);
      return;
    }
    // Fabric Options open the "Select Fabric" picker.
    if (sectionKey === 'fabric' && !subKey) {
      const picked = (await NiceModal.show(SelectFabricModal)) as
        | SelectedFabric[]
        | null;
      if (!picked?.length) return;
      updateItems(sectionKey, subKey, (items) => [
        ...items,
        ...picked.map((p) => ({
          id: newId(),
          productId: p.id,
          imageUrl: p.imageUrl,
          label: p.name,
          price: 0,
        })),
      ]);
      return;
    }
    // Add-Ons section top-level "+" → create a new add-on sub-group
    if (sectionKey === 'addons' && !subKey) {
      const definition = (await NiceModal.show(AddAddonModal)) as
        | AddonDefinition
        | null;
      if (!definition) return;
      const sgKey = `addon-${definition.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      onChange(
        sections.map((sec) => {
          if (sec.key !== 'addons') return sec;
          return {
            ...sec,
            subGroups: [
              ...(sec.subGroups ?? []),
              {
                key: sgKey,
                title: definition.name,
                displayType: definition.displayType,
                items: [],
              },
            ],
          };
        })
      );
      return;
    }
    // Add-On sub-group "+" → add a variant via the variant modal
    if (sectionKey === 'addons' && subKey) {
      const section = sections.find((s) => s.key === 'addons');
      const subGroup = section?.subGroups?.find((sg) => sg.key === subKey);
      const displayType = subGroup?.displayType ?? 'colour';
      const variant = (await NiceModal.show(AddAddonVariantModal, {
        displayType,
      })) as AddonVariantResult | null;
      if (!variant) return;
      updateItems(sectionKey, subKey, (items) => [
        ...items,
        {
          id: newId(),
          label: variant.name,
          price: variant.price,
          colorHex: variant.colorHex,
          imageUrl: variant.imageUrl,
        },
      ]);
      return;
    }
    // Default: add a blank tile.
    updateItems(sectionKey, subKey, (items) => [
      ...items,
      { id: newId(), price: 0 },
    ]);
  };

  const removeItem = (sectionKey: string, subKey: string | undefined, itemId: string) =>
    updateItems(sectionKey, subKey, (items) =>
      items.filter((it) => it.id !== itemId)
    );

  const removeSubGroup = (sectionKey: string, subKey: string) =>
    onChange(
      sections.map((sec) => {
        if (sec.key !== sectionKey) return sec;
        return {
          ...sec,
          subGroups: sec.subGroups?.filter((sg) => sg.key !== subKey),
        };
      })
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

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <Section
          key={section.key}
          section={section}
          onAddItem={addItem}
          onRemoveItem={(subKey, itemId) => removeItem(section.key, subKey, itemId)}
          onPriceChange={(subKey, itemId, price) => setPrice(section.key, subKey, itemId, price)}
          onRemoveSubGroup={(subKey) => removeSubGroup(section.key, subKey)}
        />
      ))}
    </div>
  );
};

// ─── Section Component ─────────────────────────────────────────────
const Section = ({
  section,
  onAddItem,
  onRemoveItem,
  onPriceChange,
  onEditHotspots,
  onRemoveSubGroup,
}: {
  section: CustomSection;
  onAddItem: (sectionKey: string, subKey?: string) => void;
  onRemoveItem: (subKey: string | undefined, itemId: string) => void;
  onPriceChange: (subKey: string | undefined, itemId: string, price: number) => void;
  onEditHotspots?: (item: CustomComponentItem) => void;
  onRemoveSubGroup?: (subKey: string) => void;
}) => {
  const [open, setOpen] = useState(true);
  const isAddons = section.key === 'addons';

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
          {/* Regular items (Style Options, Accessory Options) */}
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

          {/* Add-on sub-groups */}
          {section.subGroups?.map((sg) => (
            <div key={sg.key} className="rounded-lg border border-input bg-accent/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {sg.displayType === 'colour' ? (
                    <Palette className="size-3.5 text-muted-foreground" />
                  ) : sg.displayType === 'picture' ? (
                    <ImageIcon className="size-3.5 text-muted-foreground" />
                  ) : null}
                  <p className="text-sm font-medium text-grey-black dark:text-white">
                    {sg.title}
                  </p>
                  {sg.displayType && (
                    <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground capitalize">
                      {sg.displayType}
                    </span>
                  )}
                </div>
                {isAddons && onRemoveSubGroup && (
                  <button
                    type="button"
                    onClick={() => onRemoveSubGroup(sg.key)}
                    className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label={`Remove ${sg.title}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Addon variants use the special AddonVariantRow */}
              {isAddons && sg.displayType ? (
                <AddonVariantRow
                  items={sg.items}
                  displayType={sg.displayType}
                  onAddItem={() => onAddItem(section.key, sg.key)}
                  onRemoveItem={(itemId) =>
                    onRemoveItem(sg.key, itemId)
                  }
                />
              ) : (
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
              )}
            </div>
          ))}

          {/* "Add Add-On" button for the addons section */}
          {isAddons && (
            <button
              type="button"
              onClick={() => onAddItem(section.key)}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80"
            >
              <Plus className="size-4" />
              Add Add-On
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const DEFAULT_CUSTOMIZATION_SECTIONS: CustomSection[] = [
  { key: 'style', title: 'Style Options', hasHotspots: true, items: [] },
  { key: 'fabric', title: 'Fabric Options', items: [] },
  { key: 'accessory', title: 'Accessory Options', items: [] },
  {
    key: 'addons',
    title: 'Add-Ons',
    subGroups: [],
  },
];
