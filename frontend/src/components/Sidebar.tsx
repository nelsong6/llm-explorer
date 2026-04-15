import React from 'react';
import { PAGES } from '../engine/pages';
import { colors } from '../colors';
import type { PageId } from '../engine/types';

interface Props {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export const Sidebar: React.FC<Props> = ({ activePage, onNavigate }) => {
  return (
    <nav style={container}>
      <div style={logoSection}>
        <div style={logoText}>LLM Explorer</div>
        <div style={logoSub}>Step by step</div>
      </div>

      <div style={navList}>
        {PAGES.map(page => {
          const isActive = activePage === page.id;
          return (
            <button
              key={page.id}
              className={`nav-link ${isActive ? 'active' : ''}`}
              style={{
                ...navItem,
                borderLeftColor: isActive ? page.color : 'transparent',
                backgroundColor: isActive ? colors.bg.panel : 'transparent',
                color: isActive ? colors.text.primary : colors.text.secondary,
              }}
              onClick={() => onNavigate(page.id)}
            >
              <div
                style={{
                  ...dot,
                  backgroundColor: isActive ? page.color : colors.border.subtle,
                }}
              />
              <div style={navLabel}>
                <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}>{page.title}</div>
                <div style={navSub}>{page.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

const container: React.CSSProperties = {
  width: 220,
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  background: colors.bg.raised,
  borderRight: `1px solid ${colors.border.subtle}`,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const logoSection: React.CSSProperties = {
  padding: '24px 20px 20px',
  borderBottom: `1px solid ${colors.border.subtle}`,
};

const logoText: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: colors.text.primary,
};

const logoSub: React.CSSProperties = {
  fontSize: 11,
  color: colors.text.muted,
  marginTop: 2,
};

const navList: React.CSSProperties = {
  padding: '12px 0',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  flex: 1,
  overflowY: 'auto',
};

const navItem: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 16px',
  borderLeft: '3px solid transparent',
  cursor: 'pointer',
  transition: 'background-color 0.1s',
  width: '100%',
  textAlign: 'left',
  WebkitAppearance: 'none',
  appearance: 'none',
  border: 'none',
  borderLeftWidth: 3,
  borderLeftStyle: 'solid',
  outline: 'none',
  font: 'inherit',
};

const dot: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  flexShrink: 0,
};

const navLabel: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
};

const navSub: React.CSSProperties = {
  fontSize: 11,
  color: colors.text.muted,
};
