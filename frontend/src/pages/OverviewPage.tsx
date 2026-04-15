import React from 'react';
import { PAGES } from '../engine/pages';
import { colors } from '../colors';
import type { PageId } from '../engine/types';

interface Props {
  onNavigate: (page: PageId) => void;
}

const stages = PAGES.filter(p => p.id !== 'overview');

export const OverviewPage: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div style={container}>
      <h2 style={heading}>How an LLM Generates Text</h2>
      <p style={intro}>
        A prompt goes in. A response comes out. Between those two moments, the text passes through
        a pipeline of transformations — each one building on the last. Click any stage to explore it.
      </p>

      <div style={pipeline}>
        {stages.map((stage, i) => (
          <React.Fragment key={stage.id}>
            <button
              style={{ ...stageCard, borderColor: stage.color }}
              className="nav-link"
              onClick={() => onNavigate(stage.id)}
            >
              <div style={{ ...stageNumber, backgroundColor: stage.color }}>{i + 1}</div>
              <div style={stageTitle}>{stage.title}</div>
              <div style={stageSub}>{stage.subtitle}</div>
            </button>
            {i < stages.length - 1 && (
              <div style={arrow}>
                <svg width="32" height="24" viewBox="0 0 32 24">
                  <path d="M0 12 L24 12 M18 6 L24 12 L18 18" stroke={colors.text.muted} strokeWidth="2" fill="none" />
                </svg>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div style={footerNote}>
        <p style={noteText}>
          This is a simplified view. Real models repeat the Attention + Feed-Forward stages many times
          (GPT-4 has ~120 layers). But the core loop is the same: gather context, transform, repeat.
        </p>
      </div>
    </div>
  );
};

const container: React.CSSProperties = {
  padding: '40px 32px',
  maxWidth: 900,
  margin: '0 auto',
};

const heading: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 600,
  color: colors.text.primary,
  marginBottom: 12,
};

const intro: React.CSSProperties = {
  fontSize: 16,
  lineHeight: 1.6,
  color: colors.text.secondary,
  marginBottom: 48,
  maxWidth: 700,
};

const pipeline: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 48,
};

const stageCard: React.CSSProperties = {
  background: colors.bg.panel,
  border: '2px solid',
  borderRadius: 12,
  padding: '20px 16px',
  width: 130,
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
  transition: 'background-color 0.15s, border-color 0.15s',
  WebkitAppearance: 'none',
  appearance: 'none',
  outline: 'none',
  color: 'inherit',
  font: 'inherit',
};

const stageNumber: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  fontWeight: 700,
  color: colors.bg.base,
};

const stageTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: colors.text.primary,
  textAlign: 'center',
};

const stageSub: React.CSSProperties = {
  fontSize: 11,
  color: colors.text.muted,
  textAlign: 'center',
};

const arrow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
};

const footerNote: React.CSSProperties = {
  background: colors.bg.panel,
  border: `1px solid ${colors.border.subtle}`,
  borderRadius: 8,
  padding: '16px 20px',
};

const noteText: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.6,
  color: colors.text.muted,
};
