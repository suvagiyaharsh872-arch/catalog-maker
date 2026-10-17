import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/layout/Layout';
import type { ActiveTab } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { MyCatalogsView } from './components/projects/MyCatalogsView';
import { ProductListView } from './components/products/ProductListView';
import { ReferenceAnalyzerView } from './components/reference-pdf/ReferenceAnalyzerView';
import { TemplateEditorView } from './components/template-editor/TemplateEditorView';
import { CatalogEditorView } from './components/catalog-editor/CatalogEditorView';
import { DataImportView } from './components/imports/DataImportView';
import { ExportHistoryView } from './components/export/ExportHistoryView';
import { SettingsView } from './components/settings/SettingsView';
import { ExportModal } from './components/export/ExportModal';
import { ValidationSummaryModal } from './components/export/ValidationSummaryAlert';

import { 
  getProjects, 
  getProject, 
  saveProject, 
  deleteProject,
  getProductsByProject, 
  saveProduct, 
  saveProductsBatch, 
  deleteProduct, 
  deleteProductsBatch,
  getTemplatesByProject, 
  saveTemplate,
  getExportRecords, 
  saveExportRecord, 
  deleteExportRecord,
  exportProjectBackup
} from './storage/db';

import { DEFAULT_TEMPLATES } from './features/templates/defaultTemplates';
import { createDemoProject } from './features/demo/demoProjectGenerator';
import { validateCatalogProducts } from './services/validation';
import { exportProductsToCsv, exportProductsToExcel } from './services/exportService';
import type { 
  Project, 
  Product, 
  CatalogTemplate, 
  ExportRecord, 
  ReferencePdfData,
  ProjectSettings 
} from './types';
import { saveAs } from 'file-saver';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<CatalogTemplate[]>(DEFAULT_TEMPLATES);
  const [recentExports, setRecentExports] = useState<ExportRecord[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);

  // Initialize and load local database
  const loadDatabase = async () => {
    try {
      let loadedProjects = await getProjects();
      
      // If DB is fresh and completely empty, initialize with Demo project
      if (loadedProjects.length === 0) {
        const demo = createDemoProject();
        await saveProject(demo.project);
        await saveProductsBatch(demo.products);
        for (const tmpl of DEFAULT_TEMPLATES) {
          await saveTemplate(tmpl);
        }
        loadedProjects = [demo.project];
      }

      setProjects(loadedProjects);
      const currentProj = loadedProjects[0];
      setActiveProject(currentProj);

      if (currentProj) {
        const prods = await getProductsByProject(currentProj.id);
        setProducts(prods);

        const tmpls = await getTemplatesByProject(currentProj.id);
        if (tmpls.length > 0) {
          setTemplates(tmpls);
        } else {
          setTemplates(DEFAULT_TEMPLATES);
        }

        const exps = await getExportRecords(currentProj.id);
        setRecentExports(exps);
      }
    } catch (e) {
      console.error('Error loading CatalogStudio database', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  // Compute active template
  const activeTemplate = useMemo(() => {
    if (!activeProject) return DEFAULT_TEMPLATES[0];
    return templates.find(t => t.id === activeProject.activeTemplateId) || templates[0] || DEFAULT_TEMPLATES[0];
  }, [activeProject, templates]);

  // Compute catalog validation report
  const validationSummary = useMemo(() => {
    return validateCatalogProducts(products, activeProject?.settings);
  }, [products, activeProject?.settings]);

  // Handle switching active project
  const handleSelectProject = async (projectId: string) => {
    const proj = projects.find(p => p.id === projectId) || await getProject(projectId);
    if (!proj) return;

    setActiveProject(proj);
    const prods = await getProductsByProject(proj.id);
    setProducts(prods);

    const tmpls = await getTemplatesByProject(proj.id);
    setTemplates(tmpls.length > 0 ? tmpls : DEFAULT_TEMPLATES);

    const exps = await getExportRecords(proj.id);
    setRecentExports(exps);

    setHasUnsavedChanges(false);
  };

  // Handle saving current project
  const handleSaveProject = async () => {
    if (!activeProject) return;
    await saveProject(activeProject);
    setHasUnsavedChanges(false);
  };

  // Handle loading demo project explicitly
  const handleLoadDemo = async () => {
    const demo = createDemoProject();
    await saveProject(demo.project);
    await saveProductsBatch(demo.products);
    for (const tmpl of DEFAULT_TEMPLATES) {
      await saveTemplate(tmpl);
    }
    const all = await getProjects();
    setProjects(all);
    await handleSelectProject(demo.project.id);
    alert('Architectural Lighting Demo Catalog loaded successfully!');
  };

  // Product CRUD
  const handleSaveProduct = async (product: Product) => {
    await saveProduct(product);
    const updated = await getProductsByProject(product.projectId);
    setProducts(updated);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!activeProject) return;
    await deleteProduct(productId, activeProject.id);
    const updated = await getProductsByProject(activeProject.id);
    setProducts(updated);
  };

  const handleDeleteProductsBatch = async (productIds: string[]) => {
    if (!activeProject) return;
    await deleteProductsBatch(productIds, activeProject.id);
    const updated = await getProductsByProject(activeProject.id);
    setProducts(updated);
  };

  // Project CRUD
  const handleSaveNewProject = async (project: Project) => {
    await saveProject(project);
    const all = await getProjects();
    setProjects(all);
    await handleSelectProject(project.id);
  };

  const handleDeleteProject = async (projectId: string) => {
    await deleteProject(projectId);
    const all = await getProjects();
    setProjects(all);
    if (all.length > 0) {
      await handleSelectProject(all[0].id);
    } else {
      setActiveProject(undefined);
      setProducts([]);
    }
  };

  const handleDuplicateProject = async (project: Project) => {
    const newId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const clonedProj: Project = {
      ...project,
      id: newId,
      name: `${project.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const currentProds = await getProductsByProject(project.id);
    const clonedProds = currentProds.map(p => ({
      ...p,
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      projectId: newId,
    }));

    await saveProject(clonedProj);
    if (clonedProds.length > 0) {
      await saveProductsBatch(clonedProds);
    }

    const all = await getProjects();
    setProjects(all);
    await handleSelectProject(newId);
  };

  // Template Update
  const handleSaveTemplate = async (templateToSave: CatalogTemplate) => {
    await saveTemplate(templateToSave);
    if (activeProject) {
      const updatedProj: Project = { ...activeProject, activeTemplateId: templateToSave.id };
      await saveProject(updatedProj);
      setActiveProject(updatedProj);
    }
    const tmpls = await getTemplatesByProject(activeProject?.id);
    setTemplates(tmpls.length > 0 ? tmpls : DEFAULT_TEMPLATES);
  };

  // Reference PDF Applied as Template
  const handleApplyReferenceAsTemplate = async (partialTemplate: Partial<CatalogTemplate>) => {
    if (!activeProject) return;
    const newTemplate: CatalogTemplate = {
      ...DEFAULT_TEMPLATES[0],
      ...partialTemplate,
      id: `tmpl_ref_${Date.now()}`,
      projectId: activeProject.id,
    } as CatalogTemplate;

    await saveTemplate(newTemplate);
    const updatedProj: Project = { ...activeProject, activeTemplateId: newTemplate.id };
    await saveProject(updatedProj);
    setActiveProject(updatedProj);

    const tmpls = await getTemplatesByProject(activeProject.id);
    setTemplates(tmpls);
    alert('Reference PDF layout successfully applied as your active Catalog Studio template!');
    setActiveTab('editor');
  };

  // Record export in audit log
  const handleExportRecorded = async (filename: string, format: any, pageCount: number, sizeBytes: number) => {
    if (!activeProject) return;
    const record: ExportRecord = {
      id: `exp_${Date.now()}`,
      projectId: activeProject.id,
      projectName: activeProject.name,
      filename,
      format,
      productCount: products.length,
      pageCount,
      fileSize: sizeBytes,
      exportedAt: Date.now(),
    };
    await saveExportRecord(record);
    const exps = await getExportRecords(activeProject.id);
    setRecentExports(exps);
  };

  // Full backup
  const handleExportFullBackup = async () => {
    if (!activeProject) return;
    try {
      const json = await exportProjectBackup(activeProject.id);
      const blob = new Blob([json], { type: 'application/json' });
      saveAs(blob, `${activeProject.name.replace(/[^a-z0-9]/gi, '_')}-full-backup.json`);
    } catch (e: any) {
      alert(`Export backup failed: ${e?.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-lg font-bold tracking-tight">Catalog Studio</h2>
          <p className="text-xs text-slate-400">Initializing Local Database & Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      project={activeProject}
      products={products}
      template={activeTemplate}
      hasUnsavedChanges={hasUnsavedChanges}
      validationIssues={validationSummary.issues}
      onSave={handleSaveProject}
      onOpenExport={() => setIsExportModalOpen(true)}
      onLoadDemo={handleLoadDemo}
      onOpenValidation={() => setIsValidationModalOpen(true)}
    >
      {/* 1. DASHBOARD */}
      {activeTab === 'dashboard' && (
        <DashboardView
          projects={projects}
          activeProject={activeProject}
          products={products}
          recentExports={recentExports}
          onCreateProject={() => setActiveTab('catalogs')}
          onSelectProject={handleSelectProject}
          onNavigate={(tab) => setActiveTab(tab)}
          onLoadDemo={handleLoadDemo}
        />
      )}

      {/* 2. MY CATALOGS */}
      {activeTab === 'catalogs' && (
        <MyCatalogsView
          projects={projects}
          activeProject={activeProject}
          products={products}
          onSelectProject={handleSelectProject}
          onSaveProject={handleSaveNewProject}
          onDeleteProject={handleDeleteProject}
          onDuplicateProject={handleDuplicateProject}
          onLoadDemo={handleLoadDemo}
          onRefreshData={loadDatabase}
        />
      )}

      {/* 3. LIVE CATALOG EDITOR */}
      {activeTab === 'editor' && activeProject && (
        <CatalogEditorView
          project={activeProject}
          products={products}
          template={activeTemplate}
          onUpdateProduct={(p) => {
            handleSaveProduct(p);
            setHasUnsavedChanges(true);
          }}
          onUpdateTemplate={(t) => {
            handleSaveTemplate(t);
            setHasUnsavedChanges(true);
          }}
          onOpenExport={() => setIsExportModalOpen(true)}
        />
      )}

      {/* 4. PRODUCTS MANAGER */}
      {activeTab === 'products' && activeProject && (
        <ProductListView
          products={products}
          projectId={activeProject.id}
          onSaveProduct={handleSaveProduct}
          onDeleteProduct={handleDeleteProduct}
          onDeleteProductsBatch={handleDeleteProductsBatch}
          onNavigateImport={() => setActiveTab('import')}
          onExportCsv={() => exportProductsToCsv(products, `${activeProject.name}.csv`)}
          onExportExcel={() => exportProductsToExcel(products, `${activeProject.name}.xlsx`)}
        />
      )}

      {/* 5. REFERENCE PDF ANALYZER */}
      {activeTab === 'analyzer' && (
        <ReferenceAnalyzerView
          referenceData={activeProject?.referencePdf}
          onSaveReferenceData={async (data) => {
            if (activeProject) {
              const updated = { ...activeProject, referencePdf: data };
              await saveProject(updated);
              setActiveProject(updated);
            }
          }}
          onApplyAsTemplate={handleApplyReferenceAsTemplate}
        />
      )}

      {/* 6. TEMPLATE EDITOR */}
      {activeTab === 'templates' && activeProject && (
        <TemplateEditorView
          currentTemplate={activeTemplate}
          availableTemplates={templates}
          brand={activeProject.brand}
          sampleProduct={products[0]}
          onSaveTemplate={handleSaveTemplate}
          onSelectTemplate={(id) => {
            if (activeProject) {
              const updated = { ...activeProject, activeTemplateId: id };
              saveProject(updated);
              setActiveProject(updated);
            }
          }}
        />
      )}

      {/* 7. DATA IMPORT */}
      {activeTab === 'import' && activeProject && (
        <DataImportView
          projectId={activeProject.id}
          onImportComplete={async (newProducts) => {
            await saveProductsBatch(newProducts);
            const updated = await getProductsByProject(activeProject.id);
            setProducts(updated);
            alert(`Successfully imported ${newProducts.length} product records into ${activeProject.name}!`);
            setActiveTab('products');
          }}
          onCancel={() => setActiveTab('products')}
        />
      )}

      {/* 8. EXPORT HISTORY */}
      {activeTab === 'exports' && (
        <ExportHistoryView
          exports={recentExports}
          onDeleteExport={async (id) => {
            await deleteExportRecord(id);
            if (activeProject) {
              const exps = await getExportRecords(activeProject.id);
              setRecentExports(exps);
            }
          }}
          onNavigateEditor={() => setActiveTab('editor')}
        />
      )}

      {/* 9. SETTINGS */}
      {activeTab === 'settings' && (
        <SettingsView
          project={activeProject}
          onUpdateSettings={async (newSettings) => {
            if (activeProject) {
              const updated = { ...activeProject, settings: newSettings };
              await saveProject(updated);
              setActiveProject(updated);
            }
          }}
          onExportFullBackup={handleExportFullBackup}
        />
      )}

      {/* EXPORT MODAL */}
      {activeProject && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          project={activeProject}
          template={activeTemplate}
          products={products}
          validationIssues={validationSummary.issues}
          onExportRecorded={handleExportRecorded}
        />
      )}

      {/* VALIDATION MODAL */}
      <ValidationSummaryModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        issues={validationSummary.issues}
        productCount={products.length}
      />
    </Layout>
  );
};
