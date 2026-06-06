import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

export default function LatexRenderer({ text }) {
  if (!text) return null;

  // Split by $$ (block) then $ (inline)
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const blockStart = remaining.indexOf('$$');
    if (blockStart !== -1) {
      if (blockStart > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, blockStart)}</span>);
      }
      const blockEnd = remaining.indexOf('$$', blockStart + 2);
      if (blockEnd !== -1) {
        const latex = remaining.slice(blockStart + 2, blockEnd);
        parts.push(
          <BlockMath key={key++} math={latex} renderError={() => <code>{latex}</code>} />
        );
        remaining = remaining.slice(blockEnd + 2);
        continue;
      }
    }

    const inlineStart = remaining.indexOf('$');
    if (inlineStart !== -1) {
      if (inlineStart > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, inlineStart)}</span>);
      }
      const inlineEnd = remaining.indexOf('$', inlineStart + 1);
      if (inlineEnd !== -1) {
        const latex = remaining.slice(inlineStart + 1, inlineEnd);
        parts.push(
          <InlineMath key={key++} math={latex} renderError={() => <code>{latex}</code>} />
        );
        remaining = remaining.slice(inlineEnd + 1);
        continue;
      }
    }

    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return <span className="latex-text">{parts}</span>;
}
