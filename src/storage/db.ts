import Dexie, { type Table } from 'dexie';
import type { 
  Project, 
  Product, 
  CatalogTemplate, 
  ExportRecord, 
  ProjectSettings 
} from '../types';

export interface StoredImage {
  id: string;
  projectId: string;
  productId?: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  dataUrl: string; // Base64 representation for instant rendering and offline portability
  createdAt: number;
}

export interface AppSettingRecord {
  key: string;
  value: any;
}

export class CatalogStudioDatabase extends Dexie {
  projects!: Table<Project, string>;
  products!: Table<Product, string>;
  templates!: Table<CatalogTemplate, string>;
  images!: Table<StoredImage, string>;
  exports!: Table<ExportRecord, string>;
  settings!: Table<AppSettingRecord, string>;

  constructor() {
    super('CatalogStudioDB');
    this.version(1).stores({
      projects: 'id, name, createdAt, updatedAt',
      products: 'id, projectId, sku, title, category, sortOrder',
      templates: 'id, projectId, name',
      images: 'id, projectId, productId',
      exports: 'id, projectId, exportedAt',
      settings: 'key',
    });
  }
}

export const db = new CatalogStudioDatabase();

// Project Management APIs
export async function getProjects(): Promise<Project[]> {
  return await db.projects.orderBy('updatedAt').reverse().toArray();
}

export async function getProject(id: string): Promise<Project | undefined> {
  return await db.projects.get(id);
}

export async function saveProject(project: Project): Promise<void> {
  project.updatedAt = Date.now();
  await db.projects.put(project);
}

export async function deleteProject(id: string): Promise<void> {
  await db.transaction('rw', db.projects, db.products, db.templates, db.images, db.exports, async () => {
    await db.projects.delete(id);
    await db.products.where('projectId').equals(id).delete();
    await db.templates.where('projectId').equals(id).delete();
    await db.images.where('projectId').equals(id).delete();
    await db.exports.where('projectId').equals(id).delete();
  });
}

// Product Management APIs
export async function getProductsByProject(projectId: string): Promise<Product[]> {
  return await db.products.where('projectId').equals(projectId).sortBy('sortOrder');
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return await db.products.get(id);
}

export async function saveProduct(product: Product): Promise<void> {
  product.updatedAt = Date.now();
  await db.products.put(product);
  // Also bump project's updatedAt
  await db.projects.update(product.projectId, { updatedAt: Date.now() });
}

export async function saveProductsBatch(products: Product[]): Promise<void> {
  if (products.length === 0) return;
  const now = Date.now();
  products.forEach(p => { p.updatedAt = now; });
  await db.products.bulkPut(products);
  await db.projects.update(products[0].projectId, { updatedAt: now });
}

export async function deleteProduct(id: string, projectId: string): Promise<void> {
  await db.products.delete(id);
  await db.projects.update(projectId, { updatedAt: Date.now() });
}

export async function deleteProductsBatch(ids: string[], projectId: string): Promise<void> {
  await db.products.bulkDelete(ids);
  await db.projects.update(projectId, { updatedAt: Date.now() });
}

// Template Management APIs
export async function getTemplatesByProject(projectId?: string): Promise<CatalogTemplate[]> {
  if (!projectId) {
    return await db.templates.toArray();
  }
  return await db.templates.filter(t => !t.projectId || t.projectId === projectId).toArray();
}

export async function saveTemplate(template: CatalogTemplate): Promise<void> {
  await db.templates.put(template);
}

export async function deleteTemplate(id: string): Promise<void> {
  await db.templates.delete(id);
}

// Image Storage APIs
export async function saveImage(image: StoredImage): Promise<void> {
  await db.images.put(image);
}

export async function getImage(id: string): Promise<StoredImage | undefined> {
  return await db.images.get(id);
}

export async function getImagesByProject(projectId: string): Promise<StoredImage[]> {
  return await db.images.where('projectId').equals(projectId).toArray();
}

export async function deleteImage(id: string): Promise<void> {
  await db.images.delete(id);
}

// Exports History APIs
export async function saveExportRecord(record: ExportRecord): Promise<void> {
  await db.exports.put(record);
}

export async function getExportRecords(projectId?: string): Promise<ExportRecord[]> {
  if (projectId) {
    return await db.exports.where('projectId').equals(projectId).reverse().sortBy('exportedAt');
  }
  return await db.exports.orderBy('exportedAt').reverse().toArray();
}

export async function deleteExportRecord(id: string): Promise<void> {
  await db.exports.delete(id);
}

// Full Backup & Restore
export interface ProjectBackupPayload {
  version: string;
  exportedAt: number;
  project: Project;
  products: Product[];
  templates: CatalogTemplate[];
  images: StoredImage[];
}

export async function exportProjectBackup(projectId: string): Promise<string> {
  const project = await db.projects.get(projectId);
  if (!project) throw new Error('Project not found');

  const products = await db.products.where('projectId').equals(projectId).toArray();
  const templates = await db.templates.where('projectId').equals(projectId).toArray();
  const images = await db.images.where('projectId').equals(projectId).toArray();

  const payload: ProjectBackupPayload = {
    version: '1.0',
    exportedAt: Date.now(),
    project,
    products,
    templates,
    images,
  };

  return JSON.stringify(payload, null, 2);
}

export async function importProjectBackup(jsonString: string): Promise<string> {
  const data = JSON.parse(jsonString) as ProjectBackupPayload;
  if (!data.project || !data.project.id || !Array.isArray(data.products)) {
    throw new Error('Invalid project backup file format');
  }

  // To prevent collision or allow restoring as new, check if project already exists
  const existing = await db.projects.get(data.project.id);
  let targetProjectId = data.project.id;
  if (existing) {
    targetProjectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    data.project.id = targetProjectId;
    data.project.name = `${data.project.name} (Restored)`;
  }

  data.products.forEach(p => { p.projectId = targetProjectId; });
  data.templates.forEach(t => { t.projectId = targetProjectId; });
  data.images.forEach(i => { i.projectId = targetProjectId; });

  await db.transaction('rw', db.projects, db.products, db.templates, db.images, async () => {
    await db.projects.put(data.project);
    if (data.products.length > 0) await db.products.bulkPut(data.products);
    if (data.templates.length > 0) await db.templates.bulkPut(data.templates);
    if (data.images.length > 0) await db.images.bulkPut(data.images);
  });

  return targetProjectId;
}
