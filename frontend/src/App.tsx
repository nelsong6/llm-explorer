import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { TokenizationPage } from './pages/TokenizationPage';
import { StubPage } from './pages/StubPage';
import { PAGES } from './engine/pages';
import { colors } from './colors';
import type { PageId } from './engine/types';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<PageId>('overview');

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage onNavigate={setActivePage} />;
      case 'tokenization':
        return <TokenizationPage />;
      default: {
        const page = PAGES.find(p => p.id === activePage);
        return page ? <StubPage page={page} /> : null;
      }
    }
  };

  return (
    <div style={layout}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main style={content}>
        {renderPage()}
      </main>
    </div>
  );
};

const layout: React.CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: colors.bg.base,
};

const content: React.CSSProperties = {
  marginLeft: 220,
  flex: 1,
  minHeight: '100vh',
};

export default App;
