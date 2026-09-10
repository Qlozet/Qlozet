// The shop studio's embellishment catalogue, verbatim (ids must match —
// templates store enriched {id,name,emoji} and the shop restores by id).
// Finishing work the TAILOR applies; priced by the vendor in their quote.

export interface Embellishment {
  id: string;
  name: string;
  emoji: string;
  description: string;
  appliesTo?: ('top' | 'bottom' | 'full_body')[];
  genders?: ('male' | 'female')[];
}

export const EMBELLISHMENTS: Embellishment[] = [
  {
    id: 'a3',
    name: 'Embroidery',
    emoji: '🧵',
    description:
      'Handcrafted embroidery patterns that bring intricate detail and cultural richness to the garment.',
  },
  {
    id: 'a4',
    name: 'Beadwork',
    emoji: '📿',
    description:
      'Hand-sewn beadwork accents that add texture, color, and a premium artisanal feel.',
  },
  {
    id: 'a7',
    name: 'Aso-Oke Trim',
    emoji: '🪡',
    description:
      'Woven aso-oke strips along collars, cuffs or hems for a rich traditional finish.',
  },
  {
    id: 'a8',
    name: 'Contrast Piping',
    emoji: '➰',
    description:
      'A slim contrast-colour edge along seams, plackets and pockets for a sharp, tailored look.',
  },
  {
    id: 'a1',
    name: 'Statement Buttons',
    emoji: '🔘',
    appliesTo: ['top', 'full_body'],
    description:
      'Premium gold-toned or covered buttons that finish collars, cuffs, and front closures.',
  },
  {
    id: 'a2',
    name: 'Waist Belt / Sash',
    emoji: '🪢',
    appliesTo: ['full_body'],
    description:
      'A matching structured belt or soft sash to cinch the silhouette and add definition.',
  },
  {
    id: 'a5',
    name: 'Sequin Detail',
    emoji: '✨',
    appliesTo: ['top', 'full_body'],
    genders: ['female'],
    description:
      'Sparkling sequin detailing for evening and event wear — adds glamour and light-catching movement.',
  },
  {
    id: 'a6',
    name: 'Lace Trim',
    emoji: '🎀',
    appliesTo: ['top', 'full_body'],
    genders: ['female'],
    description:
      'Delicate lace trim along hems, necklines, or sleeves for a feminine and elegant finish.',
  },
  {
    id: 'a9',
    name: 'Side Pockets',
    emoji: '🫙',
    description:
      'Discreet in-seam pockets — practical without breaking the garment’s line.',
  },
];

export function filterEmbellishments(
  scope: 'top' | 'bottom' | 'full_body',
  gender: 'male' | 'female'
): Embellishment[] {
  return EMBELLISHMENTS.filter((a) => {
    if (a.appliesTo && !a.appliesTo.includes(scope)) return false;
    if (a.genders && !a.genders.includes(gender)) return false;
    return true;
  });
}
