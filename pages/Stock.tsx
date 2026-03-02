
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCcw, 
  CheckCircle2, 
  Package, 
  History, 
  Info, 
  List,
  Layers,
  Tag
} from 'lucide-react';
import { callBackend } from '../services/api';
import { Product, TransactionType, Category } from '../types';
import { useNotification } from '../context/NotificationContext';
import { ColorIndicator } from '../components/ColorIndicator'; // ADDED: Color indicator for color attributes

export const Stock: React.FC = () => {
  const [type, setType] = useState<TransactionType>(TransactionType.IN);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    Promise.all([
      callBackend<{ data: Product[] }>('getProducts', { limit: 1000 }),
      callBackend<Category[]>('getCategories')
    ]).then(([prodRes, catRes]) => {
      setProducts(prodRes.data);
      setCategories(catRes);
    });
  }, []);

  const selectedProduct = useMemo(() => 
    products.find(p => p.id === selectedProductId), 
    [selectedProductId, products]
  );
  
  const currentCategory = useMemo(() => 
    categories.find(c => c.id === selectedProduct?.categoryId), 
    [selectedProduct, categories]
  );

  const activeAttributes = useMemo(() => {
    if (!currentCategory || !selectedProduct) return [];
    return currentCategory.specifications.filter(spec => {
      const val = selectedProduct.specifications?.[spec.id];
      return val !== undefined && val !== null && val !== '';
    });
  }, [currentCategory, selectedProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0) return;

    if (currentCategory?.specifications.length > 0 && activeAttributes.length === 0) {
      showNotification('Product attributes could not be resolved. Please verify product data.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await callBackend('processStock', { productId: selectedProductId, type, quantity, notes });
      showNotification(`${type.replace('STOCK_', '')} of ${quantity} units recorded for ${selectedProduct?.name}`, 'success');
      setQuantity(0);
      setNotes('');
      setSelectedProductId('');
    } catch (err: any) {
      showNotification(err.message || 'Transaction failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
      <div className="lg:col-span-7 xl:col-span-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-400 rounded-lg shrink-0">
               <ArrowDownLeft className="w-6 h-6 text-slate-900" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Record Stock Movement</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl font-bold text-xs">
              <button type="button" onClick={() => setType(TransactionType.IN)} className={`py-3 rounded-lg transition-all ${type === TransactionType.IN ? 'bg-white shadow-sm text-green-600' : 'text-slate-500'}`}>STOCK IN</button>
              <button type="button" onClick={() => setType(TransactionType.OUT)} className={`py-3 rounded-lg transition-all ${type === TransactionType.OUT ? 'bg-white shadow-sm text-red-600' : 'text-slate-500'}`}>STOCK OUT</button>
              <button type="button" onClick={() => setType(TransactionType.ADJUST)} className={`py-3 rounded-lg transition-all ${type === TransactionType.ADJUST ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>ADJUST</button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Variant (Name | Category)</label>
                <select 
                  required 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all" 
                  value={selectedProductId} 
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">Search by Name or Category...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} | {p.categoryName} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 mb-3 text-slate-900">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Identified Variant Attributes</h4>
                  </div>
                  
                  {activeAttributes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeAttributes.map(spec => {
                        const value = selectedProduct.specifications?.[spec.id];
                        const isColorSpec = spec.name.toLowerCase().includes('color') || spec.name.toLowerCase().includes('finish');
                        return (
                          <div key={spec.id} className="flex flex-col p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{spec.name}</span>
                            {/* ADDED: Color indicator for color attributes */}
                            <div className="text-sm font-bold text-slate-800 flex items-center">
                              {isColorSpec && value && <ColorIndicator colorName={value} />}
                              <span>{value}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 italic text-xs">
                       <Tag className="w-3.5 h-3.5" />
                       <span>Standard Item (No Category Attributes)</span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Quantity</label>
                  <input type="number" required min="1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all" value={quantity || ''} onChange={(e) => setQuantity(parseInt(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Reference #</label>
                  <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all" placeholder="Invoice / Order ID" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Notes (Optional)</label>
                <textarea 
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 transition-all resize-none"
                  placeholder="Reason for adjustment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={submitting || !selectedProductId} className={`w-full py-4 rounded-xl text-white font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${type === TransactionType.IN ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' : type === TransactionType.OUT ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}>
              {submitting ? 'Processing Transaction...' : `Confirm ${type.replace('STOCK_', '')}`}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        {selectedProduct ? (
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl lg:sticky lg:top-6">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
              <Package className="w-6 h-6 text-yellow-400" />
              <h3 className="font-bold">Current Product Details</h3>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Product Identity</p>
                <p className="font-bold text-lg leading-tight">{selectedProduct.name}</p>
                <p className="text-sm text-slate-400 font-mono mt-1">SKU: {selectedProduct.sku}</p>
                
                <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400">
                  {currentCategory?.name || selectedProduct.categoryName}
                </div>
              </div>

              {activeAttributes.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Specifications</p>
                  <div className="space-y-2">
                    {activeAttributes.map(spec => {
                      const value = selectedProduct.specifications?.[spec.id];
                      const isColorSpec = spec.name.toLowerCase().includes('color') || spec.name.toLowerCase().includes('finish');
                      return (
                        <div key={spec.id} className="flex justify-between items-center text-xs border-b border-slate-800/40 pb-1.5 last:border-0">
                          <span className="text-slate-400">{spec.name}</span>
                          {/* ADDED: Color indicator for color attributes */}
                          <div className="font-bold text-slate-200 flex items-center gap-2">
                            {isColorSpec && value && <ColorIndicator colorName={value} />}
                            <span>{value}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
                <div className="p-3 bg-slate-800 rounded-xl">
                  <p className="text-[9px] text-slate-500 font-bold uppercase">In Stock</p>
                  <p className="text-xl font-bold">{selectedProduct.stock} <span className="text-[10px] text-slate-400">{selectedProduct.unit}</span></p>
                </div>
                <div className="p-3 bg-slate-800 rounded-xl">
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Predicted</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {type === TransactionType.IN ? selectedProduct.stock + (quantity || 0) : 
                     type === TransactionType.OUT ? selectedProduct.stock - (quantity || 0) : 
                     (quantity || 0)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-xl flex items-start gap-3 border border-slate-800">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                  Changes will be attributed to this specific variant combination in the audit trail.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center">
             <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <p className="text-sm font-bold text-slate-400">Select an item to view live context</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 mb-4">
              <History className="w-5 h-5 text-slate-500" />
              <h3 className="font-bold text-slate-800">Operational Policy</h3>
           </div>
           <ul className="space-y-3">
             <li className="flex items-start gap-2 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 shrink-0" />
                Variant-level tracking ensures attribute-specific accuracy.
             </li>
             <li className="flex items-start gap-2 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 shrink-0" />
                Verify physical counts before performing adjustments.
             </li>
           </ul>
        </div>
      </div>
    </div>
  );
};
