import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  Filter, 
  ArrowUpDown, 
  Download, 
  UploadCloud,
  Package,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProductFormModal } from './ProductFormModal';
import { formatCurrency } from '../../utils/formatters';
import type { Product } from '../../types';

interface ProductListViewProps {
  products: Product[];
  projectId: string;
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onDeleteProductsBatch: (productIds: string[]) => void;
  onNavigateImport: () => void;
  onExportCsv: () => void;
  onExportExcel: () => void;
}

export const ProductListView: React.FC<ProductListViewProps> = ({
  products,
  projectId,
  onSaveProduct,
  onDeleteProduct,
  onDeleteProductsBatch,
  onNavigateImport,
  onExportCsv,
  onExportExcel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'sku' | 'category' | 'price'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Categories list
  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  }, [products]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesQuery = 
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
        return matchesQuery && matchesCat;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
        else if (sortBy === 'sku') cmp = a.sku.localeCompare(b.sku);
        else if (sortBy === 'category') cmp = a.category.localeCompare(b.category);
        else if (sortBy === 'price') {
          const pa = typeof a.price === 'number' ? a.price : parseFloat(String(a.price) || '0');
          const pb = typeof b.price === 'number' ? b.price : parseFloat(String(b.price) || '0');
          cmp = pa - pb;
        }
        return sortOrder === 'desc' ? -cmp : cmp;
      });
  }, [products, searchQuery, selectedCategory, sortBy, sortOrder]);

  // Bulk handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) updated.delete(id);
    else updated.add(id);
    setSelectedIds(updated);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} products?`)) {
      onDeleteProductsBatch(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleDuplicateProduct = (product: Product) => {
    const copy: Product = {
      ...product,
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: `${product.title} (Copy)`,
      sku: `${product.sku}-COPY`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onSaveProduct(copy);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Products Manager</h1>
            <Badge variant="brand">{products.length} Products</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain catalog inventory, manage technical parameters, and assign product photos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateImport}
            icon={<UploadCloud className="w-3.5 h-3.5" />}
          >
            Import File
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="title">Sort by Title</option>
              <option value="sku">Sort by SKU</option>
              <option value="category">Sort by Category</option>
              <option value="price">Sort by Price</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 border border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs text-indigo-900">
          <span className="font-semibold">{selectedIds.size} product(s) selected</span>
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No products match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add products manually, import from an Excel / CSV sheet, or reset search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size > 0 && selectedIds.size === filteredProducts.length}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3 w-16">Preview</th>
                  <th className="py-3 px-4">Title & Description</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Specifications</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredProducts.map((p) => {
                  const isSelected = selectedIds.has(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p.id)}
                          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-3">
                        {p.mainImage ? (
                          <img
                            src={p.mainImage}
                            alt={p.title}
                            className="w-10 h-10 object-contain rounded border border-slate-200 bg-slate-50 p-0.5"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 truncate" title={p.title}>
                          {p.title}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {p.description || 'No description provided.'}
                        </p>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {p.sku}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-600 font-medium">
                          {p.specifications.length} parameters
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCurrency(p.price, p.currency, '—')}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          p.availability === 'in_stock' ? 'bg-emerald-100 text-emerald-800' :
                          p.availability === 'low_stock' ? 'bg-amber-100 text-amber-800' :
                          p.availability === 'out_of_stock' ? 'bg-rose-100 text-rose-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {p.availability === 'in_stock' ? 'In Stock' :
                           p.availability === 'low_stock' ? 'Low Stock' :
                           p.availability === 'out_of_stock' ? 'Out of Stock' :
                           p.availability === 'preorder' ? 'Pre-Order' : 'Discontinued'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-brand-600 rounded hover:bg-slate-100 cursor-pointer"
                            title="Edit product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(p)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 cursor-pointer"
                            title="Duplicate product"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete product "${p.title}"?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-slate-100 cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        projectId={projectId}
        onSave={onSaveProduct}
        existingCategories={categories}
      />
    </div>
  );
};
