import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Upload, 
  Image as ImageIcon, 
  X,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Product, ProductSpecification, ProductAvailability } from '../../types';
import { readFileAsDataUrl } from '../../utils/imageUtils';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  projectId: string;
  onSave: (product: Product) => void;
  existingCategories: string[];
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  projectId,
  onSave,
  existingCategories,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'images'>('details');

  // Form State
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState('USD');
  const [availability, setAvailability] = useState<ProductAvailability>('in_stock');
  const [description, setDescription] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([]);
  const [mainImage, setMainImage] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setTitle(product.title || '');
      setSku(product.sku || '');
      setCategory(product.category || '');
      setSubcategory(product.subcategory || '');
      setBrand(product.brand || '');
      setPrice(product.price !== undefined ? String(product.price) : '');
      setCurrency(product.currency || 'USD');
      setAvailability(product.availability || 'in_stock');
      setDescription(product.description || '');
      setProductUrl(product.productUrl || '');
      setSpecifications(product.specifications ? [...product.specifications] : []);
      setMainImage(product.mainImage);
    } else {
      // New product defaults
      setTitle('');
      setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setCategory(existingCategories[0] || 'General');
      setSubcategory('');
      setBrand('');
      setPrice('');
      setCurrency('USD');
      setAvailability('in_stock');
      setDescription('');
      setProductUrl('');
      setSpecifications([
        { id: '1', key: 'Material', value: '' },
        { id: '2', key: 'Dimensions', value: '' },
      ]);
      setMainImage(undefined);
    }
    setErrors({});
    setActiveTab('details');
  }, [product, isOpen, existingCategories]);

  // Specification helpers
  const handleAddSpec = () => {
    setSpecifications([
      ...specifications,
      { id: `spec_${Date.now()}`, key: '', value: '' },
    ]);
  };

  const handleUpdateSpec = (index: number, key: string, value: string) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], key, value };
    setSpecifications(updated);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setMainImage(dataUrl);
    } catch (err) {
      console.error('Failed to load image', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Product title is required';
    if (!sku.trim()) newErrors.sku = 'SKU is required';
    if (!category.trim()) newErrors.category = 'Category is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setActiveTab('details');
      return;
    }

    // Filter out completely empty specs
    const validSpecs = specifications.filter(s => s.key.trim() !== '' || s.value.trim() !== '');

    const now = Date.now();
    const savedProduct: Product = {
      id: product?.id || `prod_${now}_${Math.random().toString(36).substr(2, 6)}`,
      projectId,
      title: title.trim(),
      sku: sku.trim(),
      description: description.trim(),
      category: category.trim(),
      subcategory: subcategory.trim() || undefined,
      brand: brand.trim() || undefined,
      price: price.trim() !== '' ? (isNaN(Number(price)) ? price : Number(price)) : undefined,
      currency,
      availability,
      productUrl: productUrl.trim() || undefined,
      specifications: validSpecs,
      mainImage,
      sortOrder: product?.sortOrder ?? 0,
      createdAt: product?.createdAt ?? now,
      updatedAt: now,
    };

    onSave(savedProduct);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add New Product'}
      description="Configure product details, technical specifications, and imagery."
      maxWidth="2xl"
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'details'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Product Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('specs')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'specs'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Specifications ({specifications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('images')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'images'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Product Image {mainImage && '✓'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* TAB 1: PRODUCT DETAILS */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Product Title *"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Apex Architectural Suspended Luminaire"
                  error={errors.title}
                />
              </div>

              <div>
                <Input
                  label="SKU / Item Code *"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. LX-APX-48L"
                  error={errors.sku}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <input
                  list="category-suggestions"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Select or enter category"
                  className="block w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <datalist id="category-suggestions">
                  {existingCategories.map((c, i) => (
                    <option key={i} value={c} />
                  ))}
                </datalist>
                {errors.category && <p className="mt-1 text-xs text-rose-600">{errors.category}</p>}
              </div>

              <div>
                <Input
                  label="Brand / Manufacturer"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. LuxeAero Systems"
                />
              </div>

              <div>
                <Input
                  label="Subcategory (Optional)"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="e.g. Linear Pendant"
                />
              </div>

              <div>
                <Input
                  label="Price (Optional)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 299.00 (leave blank if unlisted)"
                  prefixText="$"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Availability Status
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as ProductAvailability)}
                  className="block w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="preorder">Pre-Order</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Product Web Link"
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://example.com/products/item"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide comprehensive product narrative, design features, and applications..."
                  className="block w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TECHNICAL SPECIFICATIONS */}
        {activeTab === 'specs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Key-value parameters (e.g. Dimensions, Material, Certifications, Power, Lumens).
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSpec}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Specification
              </Button>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {specifications.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500">No specifications added yet.</p>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddSpec} className="mt-2">
                    Add First Row
                  </Button>
                </div>
              ) : (
                specifications.map((spec, index) => (
                  <div key={spec.id || index} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-xs text-slate-400 font-mono w-5 text-center">#{index + 1}</span>
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => handleUpdateSpec(index, e.target.value, spec.value)}
                      placeholder="Parameter Name (e.g. Input Voltage)"
                      className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleUpdateSpec(index, spec.key, e.target.value)}
                      placeholder="Rating / Value (e.g. 120-277V AC)"
                      className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200 cursor-pointer transition-colors"
                      title="Remove specification row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCT IMAGES */}
        {activeTab === 'images' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-brand-500 transition-colors">
              <input
                type="file"
                id="modal-image-upload"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="modal-image-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {mainImage ? 'Click to Replace Image' : 'Upload Product Photo'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">JPG, PNG, or WebP</p>
              </label>
            </div>

            {mainImage && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={mainImage}
                    alt="Preview"
                    className="w-20 h-20 object-contain rounded-lg border border-slate-200 bg-white p-1"
                  />
                  <div className="text-xs text-slate-600">
                    <p className="font-bold text-slate-900">Current Main Image</p>
                    <p className="text-[11px] text-slate-500">Ready for catalog preview & PDF render</p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMainImage(undefined)}
                  icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save Product
          </Button>
        </div>
      </form>
    </Modal>
  );
};
