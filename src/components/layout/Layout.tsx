import React from 'react';
import { Sidebar, type ActiveTab } from './Sidebar';
import { Topbar } from './Topbar';
import type { Project, Product, CatalogTemplate, ValidationIssue } from '../../types';

interface LayoutProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  project?: Project;
  products: Product[];
  template: CatalogTemplate;
  hasUnsavedChanges: boolean;
  validationIssues: ValidationIssue[];
  onSave: () => void;
  onOpenExport: () => void;
  onLoadDemo: () => void;
  onOpenValidation: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  activeTab,
  onSelectTab,
  project,
  products,
  template,
  hasUnsavedChanges,
  validationIssues,
  onSave,
  onOpenExport,
  onLoadDemo,
  onOpenValidation,
  children,
}) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        productCount={products.length}
        catalogName={project?.name}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar
          project={project}
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={onSave}
          onOpenExport={onOpenExport}
          onLoadDemo={onLoadDemo}
          validationIssues={validationIssues}
          onOpenValidation={onOpenValidation}
        />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
