'use client';

import { useState, useRef } from 'react';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Trash2, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { StyleHotspotDto } from '@/redux/services/products/products.api-slice';
import type { CustomSection } from './customization-builder';

interface HotspotEditorProps {
  imageUrl: string;
  hotspots: StyleHotspotDto[];
  sections: CustomSection[];
}

export const HotspotEditorModal = NiceModal.create(({ imageUrl, hotspots: initialHotspots, sections }: HotspotEditorProps) => {
  const modal = useModal();
  const [hotspots, setHotspots] = useState<StyleHotspotDto[]>(initialHotspots || []);
  const [activeHotspotIndex, setActiveHotspotIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract targetable sections: non-style sections + unique categories from style items
  const availableSections = sections.flatMap(sec => {
    if (sec.key === 'style') {
      const uniqueCategories = new Set<string>();
      sec.items?.forEach(item => {
        // If it's loaded from backend, we might have category inside originalData or top level
        const cat = item.category || item.originalData?.categories?.[0] || item.originalData?.category;
        if (cat) uniqueCategories.add(cat);
      });
      return Array.from(uniqueCategories).map(cat => ({
        key: cat,
        title: `Style - ${cat}`,
      }));
    }
    return [{ key: sec.key, title: sec.title }];
  });

  if (!modal.visible) return null;

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If clicking on an existing pin, let its own event handler catch it
    if ((e.target as HTMLElement).closest('.hotspot-pin')) return;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newHotspot: StyleHotspotDto = {
      x,
      y,
      field_key: availableSections[0]?.key || '',
      label: 'New Hotspot',
      anchor: 'center',
    };

    setHotspots((prev) => [...prev, newHotspot]);
    setActiveHotspotIndex(hotspots.length); // The newly added one
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, index: number) => {
    e.stopPropagation();
    setActiveHotspotIndex(index);
    
    const pin = e.currentTarget;
    pin.setPointerCapture(e.pointerId);

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((moveEvent.clientY - rect.top) / rect.height) * 100));

      setHotspots((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], x, y };
        return next;
      });
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      pin.releasePointerCapture(upEvent.pointerId);
      pin.removeEventListener('pointermove', onPointerMove);
      pin.removeEventListener('pointerup', onPointerUp);
    };

    pin.addEventListener('pointermove', onPointerMove);
    pin.addEventListener('pointerup', onPointerUp);
  };

  const updateActiveHotspot = (changes: Partial<StyleHotspotDto>) => {
    if (activeHotspotIndex === null) return;
    setHotspots((prev) => {
      const next = [...prev];
      next[activeHotspotIndex] = { ...next[activeHotspotIndex], ...changes };
      return next;
    });
  };

  const deleteHotspot = (index: number) => {
    setHotspots((prev) => prev.filter((_, i) => i !== index));
    if (activeHotspotIndex === index) {
      setActiveHotspotIndex(null);
    } else if (activeHotspotIndex !== null && activeHotspotIndex > index) {
      setActiveHotspotIndex(activeHotspotIndex - 1);
    }
  };

  const save = () => {
    modal.resolve(hotspots);
    modal.remove();
  };

  const cancel = () => {
    modal.resolve(undefined);
    modal.remove();
  };

  const activeHotspot = activeHotspotIndex !== null ? hotspots[activeHotspotIndex] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={cancel}
    >
      <div
        className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-card shadow-xl sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side: Image Canvas */}
        <div className="flex flex-1 flex-col bg-accent/30 border-r border-border">
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <h2 className="font-semibold text-foreground">Edit Hotspots</h2>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Info className="size-4" /> Click to place, drag to move
            </div>
          </div>
          <div className="relative flex-1 overflow-auto p-4 flex items-center justify-center bg-[url('/checkered.png')]">
            <div 
              ref={containerRef}
              className="relative cursor-crosshair max-w-full max-h-full shadow-md select-none rounded-md overflow-hidden bg-background"
              onClick={handleContainerClick}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imageUrl} 
                alt="Style view" 
                className="max-w-full max-h-[75vh] object-contain pointer-events-none"
              />
              {hotspots.map((h, i) => (
                <div
                  key={i}
                  className={cn(
                    "hotspot-pin absolute flex items-center justify-center rounded-full size-6 -translate-x-1/2 -translate-y-1/2 cursor-move transition-shadow hover:scale-110",
                    activeHotspotIndex === i 
                      ? "bg-primary text-primary-foreground shadow-[0_0_0_4px_rgba(var(--primary),0.3)] z-20" 
                      : "bg-white text-black border-2 border-primary shadow-sm z-10"
                  )}
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  onPointerDown={(e) => handlePointerDown(e, i)}
                >
                  <span className="text-xs font-bold">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Properties Panel */}
        <div className="w-full sm:w-[340px] flex flex-col bg-card">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Properties</h3>
            <button
              type="button"
              onClick={cancel}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {!activeHotspot ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground opacity-70">
                <p className="text-sm">Select or place a hotspot on the image to edit its properties.</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {activeHotspotIndex! + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteHotspot(activeHotspotIndex!)}
                    className="text-destructive hover:bg-destructive/10 p-2 rounded-md transition-colors"
                    title="Delete Hotspot"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Label</label>
                  <Input 
                    value={activeHotspot.label || ''} 
                    onChange={(e) => updateActiveHotspot({ label: e.target.value })}
                    placeholder="e.g. Sleeves, Collar"
                  />
                  <p className="text-[10px] text-muted-foreground">Internal name to identify this hotspot.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Target Section (Field Key)</label>
                  {availableSections.length > 0 ? (
                    <Select
                      value={activeHotspot.field_key}
                      onValueChange={(val) => updateActiveHotspot({ field_key: val })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select target section" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSections.map(sec => (
                          <SelectItem key={sec.key} value={sec.key}>{sec.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                      No other customization sections available to target. Add more sections to your product first.
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground">The customization section this hotspot links to.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border mt-6">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">X Coordinate</label>
                    <div className="text-sm font-medium">{activeHotspot.x.toFixed(1)}%</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Y Coordinate</label>
                    <div className="text-sm font-medium">{activeHotspot.y.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/20">
            <Button variant="outline" onClick={cancel}>Cancel</Button>
            <Button onClick={save}>Save Hotspots</Button>
          </div>
        </div>
      </div>
    </div>
  );
});
