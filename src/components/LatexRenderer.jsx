import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

/**
 * LatexRenderer — render teks campuran LaTeX + plain text.
 *
 * Mendukung:
 *  - Inline math  : $...$  atau \(...\)
 *  - Block math   : $$...$$ atau \[...\]
 *  - Teks biasa   : sisanya
 *
 * Contoh input:
 *  "Nilai dari $\int_0^1 x^2\,dx$ adalah $\frac{1}{3}$"
 *  "Tentukan nilai $$x^2 + 5x + 6 = 0$$"
 */
export default function LatexRenderer({ text, className = '', style = {} }) {
  if (!text) return null;

  // Deteksi apakah ada LaTeX
  const hasLatex = /\$|\\\(|\\\[/.test(text);
  if (!hasLatex) {
    return <span className={className} style={style}>{text}</span>;
  }

  // Tokenize: pisahkan block ($$...$$  atau \[...\]) dan inline ($...$  atau \(...\))
  const tokens = tokenize(text);

  return (
    <span className={className} style={style}>
      {tokens.map((token, i) => {
        if (token.type === 'block') {
          return (
            <span key={i} className="block my-3">
              <BlockMath math={token.content} errorColor="#EF4444" />
            </span>
          );
        }
        if (token.type === 'inline') {
          return (
            <InlineMath key={i} math={token.content} errorColor="#EF4444" />
          );
        }
        // plain text — jaga newline
        return token.content.split('\n').map((line, j, arr) => (
          <React.Fragment key={`${i}-${j}`}>
            {line}
            {j < arr.length - 1 && <br />}
          </React.Fragment>
        ));
      })}
    </span>
  );
}

function tokenize(text) {
  const tokens = [];
  // Urutan penting: block dulu, baru inline
  // Pattern: $$...$$ | \[...\] | $...$ | \(...\)
  const pattern = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^$\n]+?\$|\\\([^)]+?\\\))/g;

  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Teks sebelum match
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }

    const raw = match[0];
    if (raw.startsWith('$$') && raw.endsWith('$$')) {
      tokens.push({ type: 'block', content: raw.slice(2, -2).trim() });
    } else if (raw.startsWith('\\[') && raw.endsWith('\\]')) {
      tokens.push({ type: 'block', content: raw.slice(2, -2).trim() });
    } else if (raw.startsWith('$') && raw.endsWith('$')) {
      tokens.push({ type: 'inline', content: raw.slice(1, -1).trim() });
    } else if (raw.startsWith('\\(') && raw.endsWith('\\)')) {
      tokens.push({ type: 'inline', content: raw.slice(2, -2).trim() });
    }

    lastIndex = match.index + raw.length;
  }

  // Sisa teks setelah match terakhir
  if (lastIndex < text.length) {
    tokens.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return tokens;
}
