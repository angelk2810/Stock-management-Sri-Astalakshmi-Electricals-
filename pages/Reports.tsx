
import React, { useState } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  FileText, 
  Download,
  Calendar,
  Filter,
  ArrowUpRight
} from 'lucide-react';

const ReportCard: React.FC<{ 
  title: string; 
  description: string; 
  icon: any; 
  color: string;
  onGenerate: (type: 'csv' | 'pdf') => void;
}> = ({ title, description, icon: Icon, color, onGenerate }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all group cursor-pointer flex flex-col">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-2">{description}</p>
    </div>
    <div className="mt-6 flex gap-2">
      <button 
        onClick={(e) => { e.stopPropagation(); onGenerate('csv'); }} // FIXED: Attached handler
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-colors"
      >
        <FileSpreadsheet className="w-3.5 h-3.5" />
        CSV
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onGenerate('pdf'); }} // FIXED: Attached handler
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-colors"
      >
        <FileText className="w-3.5 h-3.5" />
        PDF
      </button>
    </div>
  </div>
);

export const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState('current_month');

  const handleGenerate = (reportTitle: string, format: string) => {
    alert(`Generating ${reportTitle} in ${format.toUpperCase()} format...`);
  };

  const handleGenerateAll = () => {
    alert(`Compiling all reports for ${dateRange.replace('_', ' ').toUpperCase()}...`);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Date Filter Bar - FIXED: Responsive stacking */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 self-start sm:self-auto">
            <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
            Period:
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto scrollbar-hide">
             {['today', 'current_month', 'last_month', 'custom'].map((period) => (
               <button 
                 key={period}
                 onClick={() => setDateRange(period)}
                 className={`flex-1 sm:flex-none px-4 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all whitespace-nowrap ${dateRange === period ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 {period.replace('_', ' ').toUpperCase()}
               </button>
             ))}
          </div>
        </div>
        <button 
          onClick={handleGenerateAll} // FIXED: Attached handler
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Generate All Reports
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard 
          title="Low Stock Alert" 
          description="List of all products that have reached or fallen below their minimum required stock levels." 
          icon={BarChart3} 
          color="bg-orange-500"
          onGenerate={(format) => handleGenerate("Low Stock Alert", format)}
        />
        <ReportCard 
          title="Inventory Valuation" 
          description="A detailed financial report calculating the total asset value based on current stock levels and unit prices." 
          icon={BarChart3} 
          color="bg-blue-500" 
          onGenerate={(format) => handleGenerate("Inventory Valuation", format)}
        />
        <ReportCard 
          title="Movement Summary" 
          description="Detailed log of all stock IN and OUT transactions for the selected period, grouped by category." 
          icon={BarChart3} 
          color="bg-green-500" 
          onGenerate={(format) => handleGenerate("Movement Summary", format)}
        />
        <ReportCard 
          title="Top Moving Items" 
          description="Identify your best-selling electrical items and see turnover rates for better procurement planning." 
          icon={BarChart3} 
          color="bg-purple-500" 
          onGenerate={(format) => handleGenerate("Top Moving Items", format)}
        />
        <ReportCard 
          title="Dormant Inventory" 
          description="Items that haven't moved in over 90 days. Useful for identifying dead stock that occupies shelf space." 
          icon={BarChart3} 
          color="bg-slate-500" 
          onGenerate={(format) => handleGenerate("Dormant Inventory", format)}
        />
        <ReportCard 
          title="Audit Trail" 
          description="Complete history of all adjustments and changes made to stock counts by staff and managers." 
          icon={BarChart3} 
          color="bg-red-500" 
          onGenerate={(format) => handleGenerate("Audit Trail", format)}
        />
      </div>

      {/* Visual Analytics Placeholder */}
      <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Advanced Analytics</h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Unlock deeper insights with automated trend analysis. Connect your actual sales data to see demand forecasting and seasonal peaks.
            </p>
          </div>
          <button 
            onClick={() => alert('Subscription feature: Coming soon!')} // FIXED: Attached handler
            className="w-full sm:w-auto px-8 py-3 bg-yellow-400 text-slate-900 font-bold rounded-2xl hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/20 active:scale-95 shrink-0"
          >
            Activate Pro Features
          </button>
        </div>
      </div>
    </div>
  );
};
