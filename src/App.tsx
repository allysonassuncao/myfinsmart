import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Transactions from '@/pages/Transactions';
import Settings from '@/pages/Settings';
import CategoryReport from '@/pages/CategoryReport';
import Token from '@/pages/Token';
import Categories from '@/pages/Categories';
import Subcategories from '@/pages/Subcategories';
import CreditCards from '@/pages/CreditCards';
import Installments from '@/pages/Installments';
import Calendar from '@/pages/Calendar';
import LandingPage from '@/pages/LandingPage';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfUse from '@/pages/TermsOfUse';
import CustomTerms from '@/pages/CustomTerms';
import Wishlist from '@/pages/Wishlist';
import { Toaster } from '@/components/ui/sonner';
import FinanceChat from '@/components/FinanceChat';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/context/AuthContext';
import { App as CapApp } from '@capacitor/app';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LocalNotifications } from '@capacitor/local-notifications';

function HomeRoute() {
  const { user, loading } = useAuth();
  const isIOS = Capacitor.getPlatform() === 'ios';

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#11ab77]"></div>
      </div>
    );
  }

  if (isIOS) {
    if (!user) return <Login />;
    return <Navigate to="/dashboard" replace />;
  }

  if (user) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    CapApp.addListener('appUrlOpen', data => {
      // Example: myfinsmart://new-transaction -> /transactions?action=new
      const url = new URL(data.url);
      const path = url.host; // for myfinsmart://new-transaction, host is 'new-transaction'
      
      if (path === 'new-transaction') {
        navigate('/transactions?action=new');
      } else if (path === 'dashboard') {
        navigate('/dashboard');
      }
    });

    return () => {
      CapApp.removeAllListeners();
    };
  }, [navigate]);

  // Supabase Realtime Listener for new records (iOS only)
  useEffect(() => {
    const isIOS = Capacitor.getPlatform() === 'ios';
    if (!isIOS) return;

    const channel = supabase
      .channel('public:registros')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'registros'
        },
        async (payload) => {
          // Only notify if app is in background or we want to confirm the insert
          // Capacitor LocalNotifications works well here.
          const newRecord = payload.new;
          
          try {
            const formattedValue = new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(Math.abs(newRecord.valor));

            await LocalNotifications.schedule({
              notifications: [
                {
                  title: "Novo Registro Detectado",
                  body: `${newRecord.descricao}: ${formattedValue}`,
                  id: Date.now(),
                  schedule: { at: new Date(Date.now() + 500) },
                  sound: 'default'
                }
              ]
            });
          } catch (err) {
            console.error('Error triggering realtime notification:', err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-use" element={<TermsOfUse />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        }
      />
      <Route
        path="/category-report"
        element={
          <ProtectedRoute>
            <CategoryReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tokens"
        element={
          <ProtectedRoute>
            <Token />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subcategories"
        element={
          <ProtectedRoute>
            <Subcategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/credit-cards"
        element={
          <ProtectedRoute>
            <CreditCards />
          </ProtectedRoute>
        }
      />
      <Route
        path="/installments"
        element={
          <ProtectedRoute>
            <Installments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Calendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/custom-terms"
        element={
          <ProtectedRoute>
            <CustomTerms />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<HomeRoute />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
      <Toaster position="top-right" richColors />
      <FinanceChat />
    </AuthProvider>
  );
}

export default App;
