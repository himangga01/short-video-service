import type { ReactNode } from 'react';

interface LayoutProps {
  leftPanel?: ReactNode;
  centerPanel?: ReactNode;
  rightPanel?: ReactNode;
}

export default function Layout({ leftPanel, centerPanel, rightPanel }: LayoutProps) {
  return (
    <div className="editor-dark h-screen flex flex-col bg-gray-50">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">SSUL MAKER</h1>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          {leftPanel}
        </aside>

        <main className="flex-1 overflow-y-auto bg-gray-50">{centerPanel}</main>

        <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          {rightPanel}
        </aside>
      </div>
    </div>
  );
}
