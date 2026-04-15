import React, { useState, useMemo } from 'react';
import { colors } from '../colors';

/**
 * Simple BPE-style tokenizer demo.
 * This uses a naive whitespace + punctuation split with sub-word simulation.
 * Not a real BPE implementation — the point is to show the *concept*
 * of text becoming tokens, not to replicate tiktoken exactly.
 */

const TOKEN_COLORS = [
  colors.accent.blue,
  colors.accent.green,
  colors.accent.orange,
  colors.accent.purple,
  colors.accent.cyan,
  colors.accent.red,
];

function naiveTokenize(text: string): string[] {
  if (!text) return [];
  const tokens: string[] = [];
  // Split on word boundaries, keeping punctuation as separate tokens
  const parts = text.match(/[a-zA-Z]+|[0-9]+|[^\s]/g) || [];
  for (const part of parts) {
    if (part.length <= 3) {
      tokens.push(part);
    } else {
      // Simulate sub-word splitting for longer words
      // Common prefixes/suffixes get their own token
      const prefixes = ['un', 're', 'pre', 'dis', 'over', 'out'];
      const suffixes = ['ing', 'tion', 'sion', 'ment', 'ness', 'able', 'ible', 'ous', 'ive', 'ful', 'less', 'ly', 'er', 'est', 'ed', 'es', "'s", "'t"];
      let remaining = part;
      const subTokens: string[] = [];

      // Check prefix
      for (const prefix of prefixes) {
        if (remaining.toLowerCase().startsWith(prefix) && remaining.length > prefix.length + 2) {
          subTokens.push(remaining.slice(0, prefix.length));
          remaining = remaining.slice(prefix.length);
          break;
        }
      }

      // Check suffix
      let suffix = '';
      for (const s of suffixes) {
        if (remaining.toLowerCase().endsWith(s) && remaining.length > s.length + 1) {
          suffix = remaining.slice(remaining.length - s.length);
          remaining = remaining.slice(0, remaining.length - s.length);
          break;
        }
      }

      if (remaining.length > 0) subTokens.push(remaining);
      if (suffix) subTokens.push(suffix);

      tokens.push(...subTokens);
    }
  }
  return tokens;
}

const EXAMPLE_SENTENCES = [
  'The cat sat on the mat.',
  'Understanding tokenization is the first step.',
  'LLMs do not see words. They see tokens.',
  'Unbelievable transformations happening here!',
];

export const TokenizationPage: React.FC = () => {
  const [text, setText] = useState(EXAMPLE_SENTENCES[0]);
  const tokens = useMemo(() => naiveTokenize(text), [text]);

  return (
    <div style={container}>
      <h2 style={heading}>Tokenization</h2>
      <p style={description}>
        Before an LLM processes any text, it breaks it into <strong>tokens</strong> — chunks
        that are usually smaller than words but bigger than single characters. Common words might
        be a single token. Uncommon words get split into pieces. Type below and watch how text
        becomes tokens in real time.
      </p>

      <div style={inputSection}>
        <label style={label}>Input text</label>
        <textarea
          style={textarea}
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          placeholder="Type something..."
        />
        <div style={exampleRow}>
          {EXAMPLE_SENTENCES.map((s, i) => (
            <button
              key={i}
              style={exampleBtn}
              className="nav-link"
              onClick={() => setText(s)}
            >
              Example {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div style={resultSection}>
        <div style={resultHeader}>
          <span style={resultLabel}>Tokens</span>
          <span style={tokenCount}>{tokens.length} token{tokens.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={tokenRow}>
          {tokens.map((token, i) => (
            <div key={`${i}-${token}`} style={tokenWrapper}>
              <span
                style={{
                  ...tokenChip,
                  backgroundColor: TOKEN_COLORS[i % TOKEN_COLORS.length] + '20',
                  borderColor: TOKEN_COLORS[i % TOKEN_COLORS.length] + '60',
                  color: TOKEN_COLORS[i % TOKEN_COLORS.length],
                }}
              >
                {token}
              </span>
              <span style={tokenIndex}>{i}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={explainerSection}>
        <h3 style={explainerTitle}>What's happening here?</h3>
        <div style={stepList}>
          <Step n={1} title="The model doesn't see text">
            It sees a sequence of integer IDs. Each token maps to a number in a vocabulary
            of ~50,000–100,000 entries. The word "the" might be token #1820.
          </Step>
          <Step n={2} title="Tokens aren't words">
            Common words are single tokens. Rare words get split: "unbelievable" might become
            ["un", "believ", "able"]. This is learned during training via Byte Pair Encoding (BPE).
          </Step>
          <Step n={3} title="Context window = token budget">
            When people say a model has a "128K context window", they mean 128,000 tokens —
            not characters, not words. This is why long documents cost more to process.
          </Step>
          <Step n={4} title="This demo is simplified">
            Real tokenizers (like tiktoken or SentencePiece) use learned merge rules from training data.
            The splits above are approximations to show the concept.
          </Step>
        </div>
      </div>
    </div>
  );
};

const Step: React.FC<{ n: number; title: string; children: React.ReactNode }> = ({ n, title, children }) => (
  <div style={stepItem}>
    <div style={{ ...stepNumber, backgroundColor: colors.accent.blue + '30', color: colors.accent.blue }}>{n}</div>
    <div>
      <div style={stepTitle}>{title}</div>
      <div style={stepBody}>{children}</div>
    </div>
  </div>
);

const container: React.CSSProperties = {
  padding: '40px 32px',
  maxWidth: 800,
  margin: '0 auto',
};

const heading: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 600,
  color: colors.text.primary,
  marginBottom: 12,
};

const description: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.6,
  color: colors.text.secondary,
  marginBottom: 32,
};

const inputSection: React.CSSProperties = {
  marginBottom: 32,
};

const label: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: colors.text.muted,
  textTransform: 'uppercase',
  letterSpacing: 1,
  display: 'block',
  marginBottom: 8,
};

const textarea: React.CSSProperties = {
  width: '100%',
  background: colors.bg.input,
  border: `1px solid ${colors.border.strong}`,
  borderRadius: 8,
  padding: '12px 16px',
  color: colors.text.primary,
  fontSize: 15,
  fontFamily: 'inherit',
  resize: 'vertical',
  outline: 'none',
};

const exampleRow: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  marginTop: 8,
  flexWrap: 'wrap',
};

const exampleBtn: React.CSSProperties = {
  background: colors.bg.panel,
  border: `1px solid ${colors.border.subtle}`,
  borderRadius: 6,
  padding: '4px 12px',
  fontSize: 12,
  color: colors.text.muted,
  cursor: 'pointer',
  WebkitAppearance: 'none',
  appearance: 'none',
  font: 'inherit',
};

const resultSection: React.CSSProperties = {
  background: colors.bg.panel,
  border: `1px solid ${colors.border.subtle}`,
  borderRadius: 12,
  padding: '20px 24px',
  marginBottom: 32,
};

const resultHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
};

const resultLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: colors.text.muted,
  textTransform: 'uppercase',
  letterSpacing: 1,
};

const tokenCount: React.CSSProperties = {
  fontSize: 13,
  color: colors.text.secondary,
  fontVariantNumeric: 'tabular-nums',
};

const tokenRow: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  minHeight: 40,
};

const tokenWrapper: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
};

const tokenChip: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 6,
  border: '1px solid',
  fontSize: 14,
  fontFamily: "'Courier New', Courier, monospace",
  fontWeight: 600,
};

const tokenIndex: React.CSSProperties = {
  fontSize: 10,
  color: colors.text.muted,
  fontVariantNumeric: 'tabular-nums',
};

const explainerSection: React.CSSProperties = {
  background: colors.bg.panel,
  border: `1px solid ${colors.border.subtle}`,
  borderRadius: 12,
  padding: '24px',
};

const explainerTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: colors.text.primary,
  marginBottom: 20,
};

const stepList: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
};

const stepItem: React.CSSProperties = {
  display: 'flex',
  gap: 14,
  alignItems: 'flex-start',
};

const stepNumber: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  fontWeight: 700,
  flexShrink: 0,
};

const stepTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: colors.text.primary,
  marginBottom: 4,
};

const stepBody: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.6,
  color: colors.text.secondary,
};
