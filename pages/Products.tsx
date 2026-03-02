
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Upload, 
  Edit3, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Save,
  CheckCircle,
  Tag,
  ClipboardList,
  Info
} from 'lucide-react';
import { callBackend } from '../services/api';
import { Product, StockStatus, Category, SpecType } from '../types';
import { useNotification } from '../context/NotificationContext';
import { ColorIndicator } from '../components/ColorIndicator';

const StockHealthBar: React.FC<{ stock: number; min: number }> = ({ stock, min }) => {
  const percentage = Math.min((stock / (min * 2 || 1)) * 100, 100);
  const isLow = stock < min;
  const isCritical = stock <= 0;
  
  return (
    <div className="w-full max-w-[100px] space-y-1">
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${isCritical ? 'bg-red-500' : isLow ? 'bg-orange-500' : 'bg-green-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { showNotification } = useNotification();
  const limit = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const selectedCategory = useMemo(() => categories.find(c => c.id === categoryFilter), [categoryFilter, categories]);
  
  const activeCategorySpecs = useMemo(() => selectedCategory?.specifications || [], [selectedCategory]);

  const currentCategorySpecs = useMemo(() => {
    if (!editingProduct?.categoryId) return [];
    const cat = categories.find(c => c.id === editingProduct.categoryId);
    return cat?.specifications || [];
  }, [editingProduct?.categoryId, categories]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        callBackend<{ data: Product[], total: number }>('getProducts', { page, limit, search, status: statusFilter, category: categoryFilter }),
        callBackend<Category[]>('getCategories')
      ]);
      setProducts(prodRes.data);
      setTotal(prodRes.total);
      setCategories(catRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search, statusFilter, categoryFilter]);

  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product || {
      name: '',
      sku: `SAE-${Date.now().toString().slice(-4)}`,
      categoryId: categories[0]?.id || '',
      price: 0,
      stock: 0,
      minStock: 10,
      unit: 'pcs',
      status: StockStatus.IN_STOCK,
      active: true,
      specifications: {}
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await callBackend('saveProduct', editingProduct);
      showNotification(editingProduct?.id ? 'Product updated successfully' : 'New product added to catalog', 'success');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save product', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await callBackend('deleteProduct', id);
      showNotification('Product removed from inventory', 'info');
      fetchData();
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-yellow-400 rounded-lg"><Info className="w-5 h-5 text-slate-900" /></span>
                <h3 className="text-xl font-bold">Product Details</h3>
              </div>
              <button onClick={() => setViewingProduct(null)} className="text-slate-400 hover:text-white transition-colors p-2"><X /></button>
            </div>
            
            <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Name</label>
                  <p className="text-lg font-bold text-slate-900">{viewingProduct.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing</label>
                  <p className="text-xl font-bold text-slate-900">₹{viewingProduct.price.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Status</label>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="font-bold text-slate-900">{viewingProduct.stock} {viewingProduct.unit}</p>
                    <StockHealthBar stock={viewingProduct.stock} min={viewingProduct.minStock} />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" /> Technical Specifications
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {categories.find(c => c.id === viewingProduct.categoryId)?.specifications.map(spec => {
                    const value = viewingProduct.specifications?.[spec.id];
                    const isColorSpec = spec.name.toLowerCase().includes('color') || spec.name.toLowerCase().includes('finish');
                    return (
                      <div key={spec.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{spec.name}</label>
                        <p className="text-sm font-semibold text-slate-800 flex items-center">
                          {isColorSpec && value && <ColorIndicator colorName={value} />}
                          <span>{value || '-'}</span>
                        </p>
                      </div>
                    );
                  }) || <p className="col-span-2 text-xs text-slate-400 italic">No specifications defined for this category.</p>}
                </div>
              </div>

              <button onClick={() => setViewingProduct(null)} className="w-full py-4 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all">Close Details</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">{editingProduct?.id ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 p-2"><X /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">Product Name</label>
                  <input required value={editingProduct?.name} onChange={e => setEditingProduct({...editingProduct!, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Category</label>
                  <select required value={editingProduct?.categoryId} onChange={e => setEditingProduct({...editingProduct!, categoryId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900">
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">SKU</label>
                  <input required value={editingProduct?.sku} onChange={e => setEditingProduct({...editingProduct!, sku: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 font-mono" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Stock</label>
                  <input type="number" required value={editingProduct?.stock} onChange={e => setEditingProduct({...editingProduct!, stock: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Minimum Stock</label>
                  <input type="number" required value={editingProduct?.minStock} onChange={e => setEditingProduct({...editingProduct!, minStock: parseInt(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">Price (₹)</label>
                  <input type="number" step="0.01" required value={editingProduct?.price} onChange={e => setEditingProduct({...editingProduct!, price: parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
              </div>

              {currentCategorySpecs.length > 0 && (
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <ClipboardList className="w-5 h-5 text-indigo-500" />
                    <h4 className="text-sm font-bold uppercase tracking-wider">Specifications for {categories.find(c => c.id === editingProduct?.categoryId)?.name}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    {currentCategorySpecs.map(spec => (
                      <div key={spec.id} className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">{spec.name}</label>
                        {spec.type === SpecType.DROPDOWN ? (
                          <select
                            required
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-sm"
                            value={editingProduct?.specifications?.[spec.id] || ''}
                            onChange={e => setEditingProduct({
                              ...editingProduct!,
                              specifications: { ...editingProduct?.specifications, [spec.id]: e.target.value }
                            })}
                          >
                            <option value="">Select {spec.name}</option>
                            {spec.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        ) : (
                          <input
                            type={spec.type === SpecType.NUMBER ? 'number' : 'text'}
                            required
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-sm"
                            placeholder={`Enter ${spec.name}`}
                            value={editingProduct?.specifications?.[spec.id] || ''}
                            onChange={e => setEditingProduct({
                              ...editingProduct!,
                              specifications: { ...editingProduct?.specifications, [spec.id]: e.target.value }
                            })}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={formLoading} className="flex-1 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Product</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header with Search & Enhanced Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row flex-1 gap-6 items-center w-full">
          {/* Search Box */}
          <div className="relative w-full md:max-w-xs shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search SKU or Name..." 
              className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all placeholder:text-slate-400 font-medium" 
              value={search} 
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
            />
          </div>

          {/* Filters Control Group */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto flex-1">
            {/* Divider (visible on larger screens) */}
            <div className="hidden md:block w-px h-8 bg-slate-200 mx-2 shrink-0" />
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg shrink-0 w-fit">
              <Filter className="w-4 h-4 text-slate-900" />
              <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Filters</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full flex-1">
              <select 
                className="w-full sm:w-auto flex-1 min-w-[140px] px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white cursor-pointer font-medium hover:border-slate-300 transition-all"
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select 
                className="w-full sm:w-auto flex-1 min-w-[140px] px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white cursor-pointer font-medium hover:border-slate-300 transition-all"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value={StockStatus.IN_STOCK}>In Stock</option>
                <option value={StockStatus.LOW_STOCK}>Low Stock</option>
                <option value={StockStatus.OUT_OF_STOCK}>Out of Stock</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Actions Group */}
        <div className="flex items-center justify-end gap-3 shrink-0 pt-4 xl:pt-0 border-t border-slate-100 xl:border-0 w-full xl:w-auto">
          <button onClick={() => showNotification('CSV Import functionality is being prepared.', 'info')} className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95">
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button onClick={() => handleOpenModal()} className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-black uppercase tracking-wider">
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">Category</th>
                {activeCategorySpecs.map(spec => (
                  <th key={spec.id} className="px-6 py-4">
                    {spec.name}
                  </th>
                ))}
                <th className="px-6 py-4 text-center">Stock Health</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={10} className="px-6 py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-slate-300" /><p className="text-slate-400 text-sm font-medium">Fetching catalog data...</p></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={10} className="px-6 py-20 text-center text-slate-400 italic font-medium">No products found matching your search or filters.</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <button onClick={() => setViewingProduct(p)} className="text-left outline-none group/item">
                      <p className="font-bold text-slate-900 line-clamp-1 group-hover/item:text-blue-600 transition-colors">{p.name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {p.sku}</p>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{p.categoryName}</td>
                  {activeCategorySpecs.map(spec => {
                    const value = p.specifications?.[spec.id];
                    const isColorSpec = spec.name.toLowerCase().includes('color') || spec.name.toLowerCase().includes('finish');
                    return (
                      <td key={spec.id} className="px-6 py-4 text-sm text-slate-500">
                        <div className="flex items-center font-medium">
                          {isColorSpec && value && <ColorIndicator colorName={value} />}
                          <span>{value || '-'}</span>
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-[11px] font-black text-slate-900">{p.stock} / {p.minStock}</span>
                      <StockHealthBar stock={p.stock} min={p.minStock} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${p.status === StockStatus.IN_STOCK ? 'bg-green-100 text-green-700' : p.status === StockStatus.LOW_STOCK ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">₹{p.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewingProduct(p)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="View Details"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleOpenModal(p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Product"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Product"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Showing <span className="text-slate-900">{products.length}</span> of <span className="text-slate-900">{total}</span> items
            </span>
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(page - 1)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1.5">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all active:scale-95 shadow-sm ${page === i + 1 ? 'bg-slate-900 text-white shadow-slate-900/10' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(page + 1)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
