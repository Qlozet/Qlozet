'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Minimal, dependency-free Markdown renderer for the subset the assistant emits:
// paragraphs, bullet / numbered lists, and inline **bold** / *italic* / _italic_.
// Not a full CommonMark parser — just enough to render chat answers and digests
// cleanly without pulling in a library.

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Bold first (so ** wins over *), then italic.
  const regex = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_[^_]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) {
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

  for (const raw of lines) {
    const line = raw.trimEnd();
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
