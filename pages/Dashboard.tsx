
import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Banknote,
  PlusCircle,
  Download,
  ArrowRight
} from 'lucide-react';
import { callBackend } from '../services/api';
import { DashboardStats } from '../types';
import { Link } from 'react-router-dom';

const KPICard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: any; 
  color: string;
  trend?: string;
}> = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <p className="text-slate-500 text-sm font-medium">{title}</p>
    <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
  </div>
);

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await callBackend<DashboardStats>('getDashboard');
        setStats(data);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExport = () => {
    alert('Generating report for download...');
  };

  if (loading || !stats) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Quick Actions - FIXED: Ensured accessibility and horizontal scrolling */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        <div className="flex gap-4 shrink-0">
          <Link to="/products" className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
            <PlusCircle className="w-4 h-4" />
            Add Product
          </Link>
          <Link to="/stock" className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
            <TrendingUp className="w-4 h-4" />
            Record Movement
          </Link>
        </div>
        <button 
          onClick={handleExport} // FIXED: Attached handler
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium shrink-0"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard 
          title="Total Products" 
          value={stats.totalProducts} 
          icon={Package} 
          color="bg-blue-500"
          trend="+5.2%"
        />
        <KPICard 
          title="Low Stock Items" 
          value={stats.lowStockCount} 
          icon={AlertTriangle} 
          color="bg-orange-500"
        />
        <KPICard 
          title="Today's Revenue" 
          value={`₹${stats.todaySales.toLocaleString()}`} 
          icon={Banknote} 
          color="bg-green-500"
          trend="+12%"
        />
        <KPICard 
          title="Stock Valuation" 
          value={`₹${(stats.stockValue / 1000).toFixed(1)}K`} 
          icon={TrendingUp} 
          color="bg-purple-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Trend</h3>
          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.salesTrend}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
            <Link to="/stock" className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0">
                <div className={`p-2 rounded-lg shrink-0 ${tx.type === 'STOCK_IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                   {tx.type === 'STOCK_IN' ? <PlusCircle className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{tx.productName}</p>
                  <p className="text-xs text-slate-500">{tx.type.replace('_', ' ')} • {tx.quantity} units</p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium uppercase shrink-0">
                  {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
