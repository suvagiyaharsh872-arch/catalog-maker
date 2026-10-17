import { z } from 'zod';

export const productSpecificationSchema = z.object({
  id: z.string().min(1),
  key: z.string().min(1, 'Specification name cannot be empty'),
  value: z.string().min(1, 'Specification value cannot be empty'),
});

export const productSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  title: z.string().trim().min(1, 'Product title is required'),
  sku: z.string().trim().min(1, 'SKU is required'),
  description: z.string().default(''),
  mainImage: z.string().optional(),
  additionalImages: z.array(z.string()).default([]),
  category: z.string().trim().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  specifications: z.array(productSpecificationSchema).default([]),
  price: z.union([z.number(), z.string()]).optional(),
  currency: z.string().default('USD'),
  availability: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'preorder', 'discontinued']).default('in_stock'),
  productUrl: z.string().url().optional().or(z.literal('')),
  customFields: z.record(z.string()).optional(),
  sortOrder: z.number().default(0),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
