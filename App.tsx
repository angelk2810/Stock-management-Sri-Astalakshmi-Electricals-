
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { Stock } from './pages/Stock';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading application...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
