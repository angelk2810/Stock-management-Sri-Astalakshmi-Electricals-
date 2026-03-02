import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  ChevronRight, 
  ChevronDown, 
  Edit2, 
  Trash2, 
  Plus,
  Package,
  X,
  Save,
  CheckCircle,
  Loader2,
  ListFilter,
  Trash
} from 'lucide-react';
import { callBackend } from '../services/api';
import { Category, SpecType, SpecDefinition } from '../types';

const CategoryNode: React.FC<{ 
  node: Category; 
  depth?: number; 
  onEdit: (node: Category) => void;
  onAddChild: (node: Category) => void;
}> = ({ node, depth = 0, onEdit, onAddChild }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="space-y-1">
      <div 
        className={`
          flex items-center justify-between p-3 rounded-xl transition-colors group
          ${depth === 0 ? 'bg-white border border-slate-200 shadow-sm' : 'hover:bg-slate-100'}
        `}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        <div className="flex items-center gap-3">
          {hasChildren ? (
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-slate-900">
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : <div className="w-4 h-4" />}
          <div className={`p-1.5 rounded-lg ${depth === 0 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
             <Package className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className={`font-semibold ${depth === 0 ? 'text-slate-900' : 'text-slate-700'}`}>{node.name}</span>
            <span className="text-[10px] text-slate-400">
              {node.specifications?.length || 0} specs defined
            </span>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">{node.id}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onAddChild(node)} className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Add Subcategory"><Plus className="w-4 h-4" /></button>
          <button onClick={() => onEdit(node)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => alert('Delete logic placeholder')} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      {isOpen && hasChildren && (
        <div className="space-y-1">
          {node.children!.map(child => (
            <CategoryNode key={child.id} node={child} depth={depth + 1} onEdit={onEdit} onAddChild={onAddChild} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Fix: Changed state type to any to accommodate specifications[].options as string during form editing
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const raw = await callBackend<Category[]>('getCategories');
      const map: Record<string, Category> = {};
      raw.forEach(c => map[c.id] = { ...c, children: [] });
      const tree: Category[] = [];
      raw.forEach(c => {
        if (c.parentId && map[c.parentId]) map[c.parentId].children!.push(map[c.id]);
        else tree.push(map[c.id]);
      });
      setCategories(tree);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat: Partial<Category> | null = null) => {
    // FIXED: Prepare options as string for editing to allow spaces and commas while typing
    const preparedCat = cat ? {
      ...cat,
      specifications: cat.specifications?.map(spec => ({
        ...spec,
        options: Array.isArray(spec.options) ? spec.options.join(', ') : (spec.options || '')
      })) || []
    } : { name: '', parentId: null, specifications: [] };

    // Fix: Removed incorrect type cast to Partial<Category> since options is now a string
    setEditingCategory(preparedCat);
    setIsModalOpen(true);
  };

  const addSpecification = () => {
    const newSpec: any = {
      id: `s-${Date.now()}`,
      name: '',
      type: SpecType.TEXT,
      options: '' // FIXED: initialize as empty string for typing
    };
    setEditingCategory({
      ...editingCategory!,
      specifications: [...(editingCategory!.specifications || []), newSpec]
    });
  };

  const removeSpecification = (id: string) => {
    setEditingCategory({
      ...editingCategory!,
      specifications: editingCategory!.specifications?.filter((s: any) => s.id !== id)
    });
  };

  const updateSpecification = (id: string, updates: Partial<SpecDefinition> | { options: string }) => {
    // Fix: Using type any for s to avoid mismatch between SpecDefinition and form state
    setEditingCategory({
      ...editingCategory!,
      specifications: editingCategory!.specifications?.map((s: any) => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      // FIXED: Parse options ONLY on save: convert string to array, split by comma, trim, filter empty
      const finalCategory = {
        ...editingCategory,
        specifications: editingCategory?.specifications?.map((spec: any) => ({
          ...spec,
          options: typeof spec.options === 'string'
            ? spec.options.split(',').map((s: string) => s.trim()).filter(Boolean)
            : (spec.options || [])
        }))
      };

      await callBackend('saveCategory', finalCategory);
      setSuccessMsg('Category saved!');
      setTimeout(() => {
        setSuccessMsg('');
        setIsModalOpen(false);
        fetchCategories();
      }, 1500);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* category specs UI in Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">{editingCategory?.id ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700">Category Name</label>
                <input required autoFocus value={editingCategory?.name || ''} onChange={e => setEditingCategory({...editingCategory!, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" placeholder="e.g. Copper Wires" />
              </div>

              {/* Category Specifications definition section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <ListFilter className="w-4 h-4" /> Product Specifications
                  </h4>
                  <button type="button" onClick={addSpecification} className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Attribute
                  </button>
                </div>
                
                <div className="space-y-3">
                  {editingCategory?.specifications?.map((spec: any) => (
                    <div key={spec.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <input 
                          required
                          placeholder="Attribute Name (e.g. Color)" 
                          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-slate-900"
                          value={spec.name}
                          onChange={e => updateSpecification(spec.id, { name: e.target.value })}
                        />
                        <select 
                          className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none"
                          value={spec.type}
                          onChange={e => updateSpecification(spec.id, { type: e.target.value as SpecType })}
                        >
                          <option value={SpecType.TEXT}>Text</option>
                          <option value={SpecType.NUMBER}>Number</option>
                          <option value={SpecType.DROPDOWN}>Dropdown</option>
                        </select>
                        <button type="button" onClick={() => removeSpecification(spec.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>

                      {spec.type === SpecType.DROPDOWN && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Options (comma-separated)</label>
                          <input 
                            required
                            placeholder="Option 1, Option 2..." 
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none"
                            // FIXED: allow spaces and commas in options input while typing
                            value={spec.options as any || ''}
                            onChange={e => updateSpecification(spec.id, { options: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {(!editingCategory?.specifications || editingCategory.specifications.length === 0) && (
                    <p className="text-center text-xs text-slate-400 py-4 italic">No specifications defined for this category yet.</p>
                  )}
                </div>
              </div>

              {successMsg && <div className="flex items-center gap-2 text-green-700 text-sm font-bold"><CheckCircle className="w-4 h-4" /> {successMsg}</div>}
              
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button type="submit" disabled={formLoading} className="flex-1 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 flex items-center justify-center gap-2">
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Category</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Category Structure</h2>
          <p className="text-slate-500 text-sm">Organize your items into multi-level groups</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
          <FolderPlus className="w-4 h-4" />
          New Main Category
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 text-slate-400"><Loader2 className="animate-spin mx-auto mb-2" /> Loading hierarchy...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white border border-dashed border-slate-300 rounded-2xl">No categories.</div>
        ) : (
          categories.map(cat => (
            <CategoryNode key={cat.id} node={cat} onEdit={handleOpenModal} onAddChild={(parent) => handleOpenModal({ parentId: parent.id })} />
          ))
        )}
      </div>
    </div>
  );
};