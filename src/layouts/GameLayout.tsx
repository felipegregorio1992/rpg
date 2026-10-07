import { useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';

interface GameLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  topBar?: ReactNode;
}

/**
 * GameLayout — provides the main game interface structure.
 * - Responsive sidebar (collapsible on mobile)
 * - Top bar for quick stats
 * - Main content area
 */
export function GameLayout({ children, sidebar, topBar }: GameLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col bg-stone-950 overflow-hidden">
      {/* Top bar */}
      {topBar && (
        <div className="shrink-0 border-b border-stone-800 bg-stone-900">
          {topBar}
        </div>
      )}

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile sidebar toggle button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden absolute top-4 right-4 z-30 p-2 bg-stone-900 border border-stone-800
                   rounded text-parchment-100 hover:bg-stone-800 transition-colors
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-400/60"
          aria-label={isSidebarOpen ? 'Fechar painel lateral' : 'Abrir painel lateral'}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Main content */}
        <main className="flex-1 overflow-hidden p-4 lg:p-6">
          {children}
        </main>

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:relative inset-y-0 right-0 z-20
            w-80 lg:w-96 shrink-0
            border-l border-stone-800 bg-stone-950
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            overflow-y-auto
          `}
        >
          {sidebar}
        </aside>

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-stone-950/80 z-10"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
