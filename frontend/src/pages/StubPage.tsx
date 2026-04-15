import React from 'react';
import { colors } from '../colors';
import type { PageDef } from '../engine/types';

interface Props {
  page: PageDef;
}

export const StubPage: React.FC<Props> = ({ page }) => {
  return (
    <div style={container}>
      <div style={{ ...badge, backgroundColor: page.color + '20', color: page.color }}>
        Stage {page.order}
      </div>
      <h2 style={heading}>{page.title}</h2>
      <p style={subtitle}>{page.subtitle}</p>
      <p style={description}>{page.description}</p>

      <div style={placeholder}>
        <div style={placeholderIcon}>
          <svg width="48" height="48" viewBox="0 0 48 48">
            <rect x="4" y="4" width="40" height="40" rx="8" stroke={page.color} strokeWidth="2" fill="none" opacity="0.3" />
            <circle cx="24" cy="20" r="6" stroke={page.color} strokeWidth="2" fill="none" opacity="0.5" />
            <path d="M12 36 L20 28 L28 32 L36 22" stroke={page.color} strokeWidth="2" fill="none" opacity="0.5" />
          </svg>
        </div>
        <p style={placeholderText}>Interactive visualization coming soon</p>
        <p style={placeholderSub}>
          This is where a step-by-step interactive breakdown of {page.title.toLowerCase()} will live.
        </p>
      </div>
    </div>
  );
};

const container: React.CSSProperties = {
  padding: '40px 32px',
  maxWidth: 800,
  margin: '0 auto',
};

const badge: React.CSSProperties = {
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 16,
};

const heading: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 600,
  color: colors.text.primary,
  marginBottom: 4,
};

const subtitle: React.CSSProperties = {
  fontSize: 16,
  color: colors.text.muted,
  marginBottom: 16,
};

const description: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.6,
  color: colors.text.secondary,
  marginBottom: 40,
};

const placeholder: React.CSSProperties = {
  background: colors.bg.panel,
  border: `2px dashed ${colors.border.subtle}`,
  borderRadius: 16,
  padding: '60px 32px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
};

const placeholderIcon: React.CSSProperties = {
  marginBottom: 8,
  opacity: 0.6,
};

const placeholderText: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: colors.text.secondary,
};

const placeholderSub: React.CSSProperties = {
  fontSize: 13,
  color: colors.text.muted,
  textAlign: 'center',
  maxWidth: 400,
};
