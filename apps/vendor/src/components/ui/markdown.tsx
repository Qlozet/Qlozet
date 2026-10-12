'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Minimal, dependency-free Markdown renderer for the subset the assistant and
// help-center articles emit: headings, paragraphs, bullet / numbered lists, tables,
// [links](url), and inline **bold** / *italic* / _italic_. Not a full
// CommonMark parser — just enough to render cleanly without a library.

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Links first, then bold (so ** wins over *), then italic.
  const regex =
    /(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_[^_]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('[')) {
      const link = tok.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (link) {
        const external = /^https?:\/\//i.test(link[2]);
        nodes.push(
          <a
            key={`${keyPrefix}-a${i}`}
            href={link[2]}
            className="font-medium underline underline-offset-2"
            {...(external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
          >
            {link[1]}
          </a>
        );
      } else {
        nodes.push(tok);
      }
    } else if (tok.startsWith('**')) {
      nodes.push(
        <strong key={`${keyPrefix}-b${i}`}>{tok.slice(2, -2)}</strong>
      );
    } else {
      nodes.push(<em key={`${keyPrefix}-i${i}`}>{tok.slice(1, -1)}</em>);
    }
    last = m.index + tok.length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

// GitHub-flavoured tables: a `| a | b |` row followed by a `|---|---|` rule,
// then rows. The assistant lists records (orders, products, vendors) this way;
// without it the model fell back to dash-separated lines nobody could scan.
const isTableRow = (l: string) => /^\s*\|.*\|\s*$/.test(l);
const isTableRule = (l: string) =>
  /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(l);
const splitRow = (l: string) =>
  l
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());

export function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const lines = (content ?? '').split('\n');
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let key = 0;

  const flushList = () => {
    if (!list) return;
    const items = list.items;
    const ordered = list.ordered;
    const k = key++;
    blocks.push(
      ordered ? (
        <ol key={k} className="list-decimal space-y-1 pl-5">
          {items.map((it, j) => (
            <li key={j}>{renderInline(it, `o${k}-${j}`)}</li>
          ))}
        </ol>
      ) : (
        <ul key={k} className="list-disc space-y-1 pl-5">
          {items.map((it, j) => (
            <li key={j}>{renderInline(it, `u${k}-${j}`)}</li>
          ))}
        </ul>
      )
    );
    list = null;
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const raw = lines[idx];
    const line = raw.trimEnd();
    // A table: header row, rule, body rows - consumed as one block.
    if (
      isTableRow(line) &&
      idx + 1 < lines.length &&
      isTableRule(lines[idx + 1].trimEnd())
    ) {
      flushList();
      const header = splitRow(line);
      const rows: string[][] = [];
      let j = idx + 2;
      while (j < lines.length && isTableRow(lines[j].trimEnd())) {
        rows.push(splitRow(lines[j].trimEnd()));
        j++;
      }
      const k = key++;
      blocks.push(
        <div key={k} className="-mx-1 overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr>
                {header.map((h, c) => (
                  <th
                    key={c}
                    className="whitespace-nowrap border-b border-border px-2 py-1.5 text-xs font-semibold text-muted-foreground"
                  >
                    {renderInline(h, `th${k}-${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr
                  key={ri}
                  className="border-b border-border/60 last:border-0"
                >
                  {header.map((_, c) => (
                    <td key={c} className="px-2 py-1.5 align-top">
                      {renderInline(r[c] ?? '', `td${k}-${ri}-${c}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      idx = j - 1;
      continue;
    }
    const heading = line.match(/^\s*(#{1,4})\s+(.*)$/);
    if (heading) {
      flushList();
      const k = key++;
      const major = heading[1].length <= 2;
      blocks.push(
        <p
          key={k}
          className={cn(
            'mt-4 text-grey-black first:mt-0 dark:text-white',
            major ? 'text-sm font-bold' : 'text-[13px] font-semibold'
          )}
        >
          {renderInline(heading[2], `h${k}`)}
        </p>
      );
      continue;
    }
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (bullet) {
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1]);
    } else if (numbered) {
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(numbered[1]);
    } else if (line.trim() === '') {
      flushList();
    } else {
      flushList();
      const k = key++;
      blocks.push(
        <p key={k} className="leading-relaxed">
          {renderInline(line, `p${k}`)}
        </p>
      );
    }
  }
  flushList();

  return <div className={cn('space-y-2', className)}>{blocks}</div>;
}
