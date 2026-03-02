
import { 
  User, 
  Product, 
  Category, 
  DashboardStats, 
  StockStatus, 
  UserRole, 
  TransactionType,
  StockTransaction,
  SpecType
} from '../types';

// Helper to ensure consistent stock status logic
const calculateStockStatus = (stock: number, minStock: number): StockStatus => {
  if (stock <= 0) return StockStatus.OUT_OF_STOCK;
  if (stock < minStock) return StockStatus.LOW_STOCK;
  return StockStatus.IN_STOCK;
};

// In-memory data persistence for the session
let MOCK_USERS: User[] = [
  { id: '1', name: 'John Admin', email: 'admin@sae-electricals.com', role: UserRole.ADMIN, active: true },
  { id: '2', name: 'Sarah Manager', email: 'manager@sae-electricals.com', role: UserRole.MANAGER, active: true },
  { id: '3', name: 'Mike Staff', email: 'staff@sae-electricals.com', role: UserRole.STAFF, active: true },
];

let MOCK_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Wiring & Cables', parentId: null, specifications: [
    { id: 's1', name: 'Gauge', type: SpecType.NUMBER },
    { id: 's2', name: 'Color', type: SpecType.DROPDOWN, options: ['Red', 'Black', 'Green', 'Yellow', 'Blue', 'Pink'] }
  ]},
  { id: 'c2', name: 'Fans', parentId: null, specifications: [
    { id: 's3', name: 'Sweep size (mm)', type: SpecType.NUMBER },
    { id: 's4', name: 'Finish', type: SpecType.DROPDOWN, options: ['Metallic', 'Matte', 'Pearl'] }
  ]},
  { id: 'c3', name: 'Lighting', parentId: null, specifications: [
    { id: 's5', name: 'Wattage', type: SpecType.NUMBER },
    { id: 's6', name: 'Color Temp', type: SpecType.DROPDOWN, options: ['Cool White', 'Warm White', 'Natural White'] }
  ]}
];

const generateInitialProducts = (count: number): Product[] => {
  return Array.from({ length: count }, (_, i) => {
    const stock = Math.floor(Math.random() * 200);
    const minStock = 20;
    const status = calculateStockStatus(stock, minStock);

    const cat = MOCK_CATEGORIES[i % MOCK_CATEGORIES.length];

    return {
      id: `p${i + 1}`,
      sku: `SAE-${1000 + i}`,
      name: `${cat.name} Item ${i + 1}`,
      categoryId: cat.id,
      categoryName: cat.name,
      price: Math.floor(Math.random() * 500) + 10,
      stock,
      minStock,
      unit: 'pcs',
      status,
      active: true,
      specifications: {} // Initial empty specs
    };
  });
};

let MOCK_PRODUCTS = generateInitialProducts(25);

let MOCK_TRANSACTIONS: StockTransaction[] = Array.from({ length: 20 }, (_, i) => ({
  id: `t${i}`,
  productId: `p${i + 1}`,
  productName: `Electrical Item ${i + 1}`,
  type: i % 3 === 0 ? TransactionType.IN : TransactionType.OUT,
  quantity: Math.floor(Math.random() * 50) + 1,
  date: new Date(Date.now() - i * 3600000).toISOString(),
  notes: 'Regular stock movement',
  userName: 'John Admin'
}));

const mockResponses: Record<string, (payload: any) => any> = {
  login: ({ email, password }) => {
    const user = MOCK_USERS.find(u => u.email === email);
    if (user && password === 'password') return { success: true, user };
    throw new Error('Invalid credentials');
  },
  
  getDashboard: () => ({
    totalProducts: MOCK_PRODUCTS.length,
    lowStockCount: MOCK_PRODUCTS.filter(p => p.status === StockStatus.LOW_STOCK).length,
    todaySales: 1240.50,
    monthlySales: 45200.00,
    stockValue: MOCK_PRODUCTS.reduce((acc, p) => acc + (p.stock * p.price), 0),
    recentTransactions: MOCK_TRANSACTIONS.slice(0, 5),
    salesTrend: [
      { date: '2023-10-01', amount: 4000 },
      { date: '2023-10-02', amount: 3000 },
      { date: '2023-10-03', amount: 2000 },
      { date: '2023-10-04', amount: 2780 },
      { date: '2023-10-05', amount: 1890 },
      { date: '2023-10-06', amount: 2390 },
      { date: '2023-10-07', amount: 3490 },
    ]
  }),

  getProducts: ({ page = 1, limit = 50, search = '', category = '', status = '' }) => {
    let filtered = MOCK_PRODUCTS.filter(p => 
      (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())) &&
      (!category || p.categoryId === category) &&
      (!status || p.status === status)
    );
    const total = filtered.length;
    const start = (page - 1) * limit;
    return {
      data: filtered.slice(start, start + limit),
      total,
      page,
      limit
    };
  },

  getCategories: () => MOCK_CATEGORIES,
  
  getUsers: () => MOCK_USERS,

  saveProduct: (product: Product) => {
    const index = MOCK_PRODUCTS.findIndex(p => p.id === product.id);
    const cat = MOCK_CATEGORIES.find(c => c.id === product.categoryId);
    // Force status recalculation on save to fix mismatch issues
    const enrichedProduct = { 
      ...product, 
      categoryName: cat?.name || 'Uncategorized',
      status: calculateStockStatus(product.stock, product.minStock)
    };
    
    if (index > -1) {
      MOCK_PRODUCTS[index] = enrichedProduct;
    } else {
      MOCK_PRODUCTS.unshift({ ...enrichedProduct, id: `p${Date.now()}` });
    }
    return { success: true };
  },

  deleteProduct: (id: string) => {
    MOCK_PRODUCTS = MOCK_PRODUCTS.filter(p => p.id !== id);
    return { success: true };
  },

  saveCategory: (category: Category) => {
    const index = MOCK_CATEGORIES.findIndex(c => c.id === category.id);
    if (index > -1) {
      MOCK_CATEGORIES[index] = category;
    } else {
      MOCK_CATEGORIES.push({ 
        ...category, 
        id: `c${Date.now()}`,
        specifications: category.specifications || []
      });
    }
    return { success: true };
  },

  saveUser: (user: User) => {
    const index = MOCK_USERS.findIndex(u => u.id === user.id);
    if (index > -1) {
      MOCK_USERS[index] = user;
    } else {
      MOCK_USERS.push({ ...user, id: `u${Date.now()}` });
    }
    return { success: true };
  },

  processStock: (transaction: any) => {
    const product = MOCK_PRODUCTS.find(p => p.id === transaction.productId);
    if (product) {
      if (transaction.type === TransactionType.IN) product.stock += transaction.quantity;
      if (transaction.type === TransactionType.OUT) product.stock -= transaction.quantity;
      if (transaction.type === TransactionType.ADJUST) product.stock = transaction.quantity;
      
      product.status = calculateStockStatus(product.stock, product.minStock);

      MOCK_TRANSACTIONS.unshift({
        id: `t${Date.now()}`,
        productId: product.id,
        productName: product.name,
        type: transaction.type,
        quantity: transaction.quantity,
        date: new Date().toISOString(),
        notes: transaction.notes,
        userName: 'Admin User'
      });
    }
    return { success: true };
  },

  getReports: ({ type }: any) => {
    if (type === 'LOW_STOCK') return MOCK_PRODUCTS.filter(p => p.status === StockStatus.LOW_STOCK || p.status === StockStatus.OUT_OF_STOCK);
    return MOCK_PRODUCTS;
  }
};

export async function callBackend<T>(fn: string, payload: any = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (mockResponses[fn]) resolve(mockResponses[fn](payload));
        else reject(new Error(`Method ${fn} not implemented.`));
      } catch (err: any) {
        reject(err);
      }
    }, 400);
  });
}
