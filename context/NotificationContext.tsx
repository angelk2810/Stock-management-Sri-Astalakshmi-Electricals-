
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {notifications.map((n) => (
          <div 
            key={n.id}
            className={`
              pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-right-10 duration-300
              ${n.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-800' : 
                n.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800' : 
                n.type === 'warning' ? 'bg-orange-50/90 border-orange-200 text-orange-800' : 
                'bg-slate-900/90 border-slate-700 text-white'}
            `}
          >
            <div className="shrink-0 mt-0.5">
              {n.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {n.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {n.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {n.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
            </div>
            <div className="flex-1 text-sm font-semibold">{n.message}</div>
            <button onClick={() => removeNotification(n.id)} className="shrink-0 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};
