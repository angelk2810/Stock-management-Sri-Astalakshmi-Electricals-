
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

// ADDED: category specs types
export enum SpecType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DROPDOWN = 'DROPDOWN'
}

export interface SpecDefinition {
  id: string;
  name: string;
  type: SpecType;
  options?: string[];
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  specifications: SpecDefinition[]; // ADDED: category specs
  children?: Category[];
}

export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  status: StockStatus;
  active: boolean;
  specifications: Record<string, any>; // ADDED: dynamic product fields
}

export enum TransactionType {
  IN = 'STOCK_IN',
  OUT = 'STOCK_OUT',
  ADJUST = 'ADJUSTMENT'
}

export interface StockTransaction {
  id: string;
  productId: string;
  productName: string;
  type: TransactionType;
  quantity: number;
  date: string;
  notes: string;
  userName: string;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  todaySales: number;
  monthlySales: number;
  stockValue: number;
  recentTransactions: StockTransaction[];
  salesTrend: { date: string; amount: number }[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
