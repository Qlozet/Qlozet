import DOMPurify from 'dompurify';

/**
 * Product descriptions as HTML: the same allow-list the backend keeps on
 * save (common/utils/description-html.ts) and the shop shows
 * (lib/description-html.ts): paragraphs, bold, italics, underline, strike,
 * lists, headings, quotes and safe links. Keep the three in step.
 */
const TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'h4',
  'blockquote',
  'a',
];

const looksLikeHtml = (s: string) => /<\/?[a-z][\s\S]*?>/i.test(s);

const escapeText = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Plain text to paragraphs: blank lines split paragraphs, single breaks stay. */
export const textToParagraphs = (text: string): string =>
  text
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => `<p>${escapeText(b).replace(/\n/g, '<br>')}</p>`)
    .join('');

/**
 * What the editor should load: HTML as is, plain text (older fabric and
 * accessory descriptions) as paragraphs so its line breaks survive.
 */
export const toEditorHtml = (value: string | null | undefined): string => {
  const v = value ?? '';
  if (!v.trim()) return '';
  return looksLikeHtml(v) ? v : textToParagraphs(v);
};

/** Safe to put on the page. Browser only; '' on the server. */
export function safeDescriptionHtml(raw: string | null | undefined): string {
  if (!raw || !raw.trim() || typeof window === 'undefined') return '';
  const clean = DOMPurify.sanitize(toEditorHtml(raw), {
    ALLOWED_TAGS: TAGS,
    ALLOWED_ATTR: ['href', 'title'],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i,
  });
  return clean.replace(
    /<a /g,
    '<a target="_blank" rel="nofollow noopener noreferrer" '
  );
}

/**
 * Tailwind classes that give a description its list markers, heading sizes
 * and spacing (the CSS reset strips them).
 */
export const DESCRIPTION_CLASSES =
  'text-sm leading-relaxed text-grey-black dark:text-gray-200 [&>*+*]:mt-3 [&_strong]:font-semibold [&_b]:font-semibold [&_em]:italic [&_u]:underline [&_s]:line-through [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li+li]:mt-1 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-[15px] [&_h3]:font-semibold [&_h4]:font-semibold [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_a]:underline';
